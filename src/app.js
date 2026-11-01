// Fatoora server: clients, invoices and quotes, payments, share links, reports.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { amountInWords } from './words.js';
import { hashPassword, verifyPassword, createSession, checkSession, parseCookies, RateLimiter } from './auth.js';
import { send, readJson, clientIp, serveStatic, cookie, VERSION } from './http.js';

export function defaultData() {
  return {
    version: 1,
    meta: { secret: crypto.randomBytes(32).toString('hex'), createdAt: new Date().toISOString() },
    admin: null,
    business: {
      name: '', address: '', phone: '', email: '', taxId: '', logo: '', // logo: data URL (small)
      currency: 'EGP', currencyName: 'جنيه مصري', currencyNameEn: 'Egyptian pounds',
      taxRate: 0, taxLabel: 'ضريبة القيمة المضافة', paymentInfo: '', footer: '', lang: 'ar',
      invoicePrefix: 'INV-', quotePrefix: 'Q-', nextInvoice: 1, nextQuote: 1, dueDays: 14, color: '#0F766E',
    },
    clients: [],
    docs: [], // invoices and quotes
    timezone: '',
  };
}

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

export function totals(doc) {
  const subtotal = round2(doc.items.reduce((s, i) => s + round2(Number(i.qty) * Number(i.price)), 0));
  const discount = Math.min(subtotal, round2(doc.discount));
  const taxable = subtotal - discount;
  const tax = round2((taxable * (Number(doc.taxRate) || 0)) / 100);
  const total = round2(taxable + tax);
  const paid = round2((doc.payments || []).reduce((s, p) => s + Number(p.amount), 0));
  return { subtotal, discount, tax, total, paid, balance: round2(total - paid) };
}

export function statusOf(doc, today = new Date().toISOString().slice(0, 10)) {
  if (doc.type === 'quote') return doc.status; // draft | sent | accepted | declined | invoiced
  if (doc.status === 'draft' || doc.status === 'cancelled') return doc.status;
  const t = totals(doc);
  if (t.total > 0 && t.balance <= 0) return 'paid';
  if (doc.dueDate && doc.dueDate < today) return 'overdue';
  return t.paid > 0 ? 'partial' : 'sent';
}

export function createApp({ dataDir, setupToken = process.env.SETUP_TOKEN || '' } = {}) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, 'fatoora.json');
  const def = defaultData();
  const loaded = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  const data = loaded ? { ...def, ...loaded, business: { ...def.business, ...loaded.business } } : def;
  let timer;
  const flush = () => { clearTimeout(timer); fs.writeFileSync(file + '.tmp', JSON.stringify(data)); fs.renameSync(file + '.tmp', file); };
  const save = () => { clearTimeout(timer); timer = setTimeout(flush, 200); };
  if (!loaded) flush();

  const loginLimiter = new RateLimiter(10, 15 * 60_000);
  const hashFor = (uid) => (uid === 'owner' ? data.admin?.hash : null);
  const isAuthed = (req) => Boolean(checkSession(data.meta.secret, parseCookies(req.headers.cookie).fatoora_session, hashFor));
  const session = (req) => cookie(req, 'fatoora_session', createSession(data.meta.secret, data.admin.hash), 30 * 86400);
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' }).format(new Date());
  const addDays = (date, n) => new Date(Date.parse(date + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);

  const docView = (d) => {
    const t = totals(d);
    const b = data.business;
    return {
      ...d,
      client: data.clients.find((c) => c.id === d.clientId) || d.clientSnapshot || null,
      totals: t,
      state: statusOf(d, today()),
      words: amountInWords(t.total, d.lang === 'en' ? b.currencyNameEn : b.currencyName, d.lang),
      link: `/d/${d.token}`,
    };
  };

  function cleanItems(items) {
    return (Array.isArray(items) ? items : [])
      .map((i) => ({ desc: String(i.desc || '').slice(0, 300), qty: Math.max(0, Number(i.qty) || 0), price: round2(i.price), unit: String(i.unit || '').slice(0, 20) }))
      .filter((i) => i.desc || i.price)
      .slice(0, 200);
  }

  function newDoc(type, body) {
    const b = data.business;
    const number = type === 'invoice' ? `${b.invoicePrefix}${String(b.nextInvoice++).padStart(4, '0')}` : `${b.quotePrefix}${String(b.nextQuote++).padStart(4, '0')}`;
    const issueDate = /^\d{4}-\d{2}-\d{2}$/.test(body.issueDate || '') ? body.issueDate : today();
    return {
      id: crypto.randomUUID(),
      token: crypto.randomBytes(16).toString('base64url'),
      type,
      number,
      clientId: data.clients.some((c) => c.id === body.clientId) ? body.clientId : '',
      issueDate,
      dueDate: type === 'invoice' ? (/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate || '') ? body.dueDate : addDays(issueDate, Number(b.dueDays) || 0)) : '',
      validUntil: type === 'quote' ? addDays(issueDate, 30) : '',
      items: cleanItems(body.items),
      discount: round2(body.discount),
      taxRate: body.taxRate != null ? Number(body.taxRate) : Number(b.taxRate) || 0,
      notes: String(body.notes || '').slice(0, 2000),
      lang: body.lang === 'en' ? 'en' : body.lang === 'ar' ? 'ar' : b.lang,
      status: 'draft',
      payments: [],
      createdAt: new Date().toISOString(),
      fromQuote: body.fromQuote || null,
    };
  }

  async function route(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const p = url.pathname;
    const method = req.method;
    let m;
    if (p === '/health') return send(res, 200, { ok: true, version: VERSION });

    // ----- client-facing document link -----
    if (method === 'GET' && /^\/d\/[\w-]+$/.test(p)) return serveStatic(res, 'doc.html');
    if ((m = p.match(/^\/api\/public\/doc\/([\w-]+)$/)) && method === 'GET') {
      const d = data.docs.find((x) => x.token === m[1] && x.status !== 'draft');
      if (!d) return send(res, 404, { error: 'not_found' });
      if (!d.viewedAt) { d.viewedAt = new Date().toISOString(); save(); }
      const { logo, name, address, phone, email, taxId, taxLabel, paymentInfo, footer, color } = data.business;
      return send(res, 200, { doc: { ...docView(d), token: undefined, id: undefined }, business: { logo, name, address, phone, email, taxId, taxLabel, paymentInfo, footer, color } });
    }
    if ((m = p.match(/^\/api\/public\/doc\/([\w-]+)\/(accept|decline)$/)) && method === 'POST') {
      const d = data.docs.find((x) => x.token === m[1] && x.type === 'quote');
      if (!d || !['sent', 'accepted', 'declined'].includes(d.status)) return send(res, 404, { error: 'not_found' });
      const body = await readJson(req);
      d.status = m[2] === 'accept' ? 'accepted' : 'declined';
      d.respondedAt = new Date().toISOString();
      d.responseBy = String(body.name || '').slice(0, 80);
      save();
      return send(res, 200, { ok: true, status: d.status });
    }

    // ----- owner auth -----
    if (p === '/api/session' && method === 'GET') return send(res, 200, { needsSetup: !data.admin, authed: isAuthed(req), setupTokenRequired: Boolean(setupToken), version: VERSION });
    if (p === '/api/setup' && method === 'POST') {
      if (data.admin) return send(res, 409, { error: 'Already set up' });
      const body = await readJson(req);
      if (setupToken && body.setupToken !== setupToken) return send(res, 403, { error: 'Wrong setup token' });
      if (String(body.password || '').length < 8) return send(res, 400, { error: 'Password must be at least 8 characters' });
      data.admin = hashPassword(String(body.password));
      data.business.name = String(body.name || '').slice(0, 120);
      if (body.lang === 'en') Object.assign(data.business, { lang: 'en', currency: 'USD', currencyName: 'دولار أمريكي', currencyNameEn: 'US dollars', taxLabel: 'Tax' });
      data.timezone = String(body.timezone || '');
      flush();
      return send(res, 200, { ok: true }, { 'set-cookie': session(req) });
    }
    if (p === '/api/login' && method === 'POST') {
      if (!loginLimiter.allow(clientIp(req))) return send(res, 429, { error: 'Too many attempts. Try again in 15 minutes.' });
      const body = await readJson(req);
      if (!verifyPassword(String(body.password || ''), data.admin)) return send(res, 401, { error: 'Wrong password' });
      return send(res, 200, { ok: true }, { 'set-cookie': session(req) });
    }
    if (p === '/api/logout' && method === 'POST') return send(res, 200, { ok: true }, { 'set-cookie': cookie(req, 'fatoora_session', '', 0) });

    if (p.startsWith('/api/')) {
      if (!isAuthed(req)) return send(res, 401, { error: 'Not signed in' });
      if (method !== 'GET' && !(req.headers['content-type'] || '').includes('application/json')) return send(res, 415, { error: 'Send JSON' });
      return api(req, res, url, p, method);
    }

    if (method === 'GET') {
      if (p === '/' || p === '/index.html') return serveStatic(res, 'index.html');
      if (/^\/[\w.-]+\.(js|css|svg|png|ico)$/.test(p)) return serveStatic(res, p.slice(1));
    }
    return send(res, 404, 'Not found');
  }

  async function api(req, res, url, p, method) {
    let m;
    if (p === '/api/overview' && method === 'GET') {
      const t = today();
      const year = t.slice(0, 4), month = t.slice(0, 7);
      const invoices = data.docs.filter((d) => d.type === 'invoice' && d.status !== 'draft' && d.status !== 'cancelled');
      let outstanding = 0, overdue = 0, overdueCount = 0, invoicedMonth = 0, invoicedYear = 0, collectedMonth = 0;
      const byClient = {};
      const perMonth = Object.fromEntries([...Array(12)].map((_, i) => { const d = new Date(Date.parse(t)); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - (11 - i)); return [d.toISOString().slice(0, 7), 0]; }));
      for (const d of invoices) {
        const tt = totals(d);
        const st = statusOf(d, t);
        outstanding += Math.max(0, tt.balance);
        if (st === 'overdue') { overdue += tt.balance; overdueCount += 1; }
        if (d.issueDate.startsWith(month)) invoicedMonth += tt.total;
        if (d.issueDate.startsWith(year)) invoicedYear += tt.total;
        for (const pay of d.payments) {
          if (pay.date.startsWith(month)) collectedMonth += Number(pay.amount);
          if (pay.date.slice(0, 7) in perMonth) perMonth[pay.date.slice(0, 7)] += Number(pay.amount);
        }
        byClient[d.clientId] = (byClient[d.clientId] || 0) + tt.total;
      }
      const top = Object.entries(byClient).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, total]) => ({ name: data.clients.find((c) => c.id === id)?.name || '—', total: round2(total) }));
      return send(res, 200, {
        currency: data.business.currency, outstanding: round2(outstanding), overdue: round2(overdue), overdueCount,
        invoicedMonth: round2(invoicedMonth), invoicedYear: round2(invoicedYear), collectedMonth: round2(collectedMonth),
        perMonth: Object.entries(perMonth).map(([mo, v]) => ({ month: mo, collected: round2(v) })), top,
        openQuotes: data.docs.filter((d) => d.type === 'quote' && d.status === 'sent').length,
        accepted: data.docs.filter((d) => d.type === 'quote' && d.status === 'accepted').map(docView),
        overdueList: invoices.filter((d) => statusOf(d, t) === 'overdue').map(docView),
        setup: Boolean(data.business.name && (data.business.phone || data.business.email)),
      });
    }

    // ----- clients -----
    if (p === '/api/clients' && method === 'GET') {
      return send(res, 200, { clients: data.clients.map((c) => {
        const docs = data.docs.filter((d) => d.clientId === c.id && d.type === 'invoice' && !['draft', 'cancelled'].includes(d.status));
        return { ...c, invoices: docs.length, balance: round2(docs.reduce((s, d) => s + Math.max(0, totals(d).balance), 0)) };
      }) });
    }
    if (p === '/api/clients' && method === 'POST') {
      const body = await readJson(req);
      const c = { id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      applyClient(c, body);
      if (!c.name) return send(res, 400, { error: 'Client name is required' });
      data.clients.push(c);
      save();
      return send(res, 200, { client: c });
    }
    if ((m = p.match(/^\/api\/clients\/([\w-]+)$/))) {
      const c = data.clients.find((x) => x.id === m[1]);
      if (!c) return send(res, 404, { error: 'Client not found' });
      if (method === 'PUT') { applyClient(c, await readJson(req)); save(); return send(res, 200, { client: c }); }
      if (method === 'DELETE') {
        // keep a snapshot on documents so old invoices still show the client
        for (const d of data.docs) if (d.clientId === c.id) d.clientSnapshot = { ...c };
        data.clients = data.clients.filter((x) => x.id !== c.id);
        save();
        return send(res, 200, { ok: true });
      }
    }

    // ----- documents -----
    if (p === '/api/docs' && method === 'GET') {
      const type = url.searchParams.get('type') === 'quote' ? 'quote' : 'invoice';
      return send(res, 200, { docs: data.docs.filter((d) => d.type === type).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(docView) });
    }
    if (p === '/api/docs' && method === 'POST') {
      const body = await readJson(req);
      const d = newDoc(body.type === 'quote' ? 'quote' : 'invoice', body);
      data.docs.push(d);
      save();
      return send(res, 200, { doc: docView(d) });
    }
    if ((m = p.match(/^\/api\/docs\/([\w-]+)$/))) {
      const d = data.docs.find((x) => x.id === m[1]);
      if (!d) return send(res, 404, { error: 'Not found' });
      if (method === 'GET') return send(res, 200, { doc: docView(d) });
      if (method === 'PUT') {
        const body = await readJson(req);
        const locked = d.type === 'invoice' && d.payments.length > 0;
        if (!locked) {
          if (body.items) d.items = cleanItems(body.items);
          if (body.discount != null) d.discount = round2(body.discount);
          if (body.taxRate != null) d.taxRate = Math.max(0, Number(body.taxRate) || 0);
        }
        if (body.clientId !== undefined) d.clientId = data.clients.some((c) => c.id === body.clientId) ? body.clientId : '';
        for (const k of ['issueDate', 'dueDate', 'validUntil']) if (/^\d{4}-\d{2}-\d{2}$/.test(body[k] || '')) d[k] = body[k];
        if (typeof body.notes === 'string') d.notes = body.notes.slice(0, 2000);
        if (body.lang === 'ar' || body.lang === 'en') d.lang = body.lang;
        const allowed = d.type === 'invoice' ? ['draft', 'sent', 'cancelled'] : ['draft', 'sent', 'accepted', 'declined'];
        if (allowed.includes(body.status)) d.status = body.status;
        if (d.status === 'sent' && !d.sentAt) d.sentAt = new Date().toISOString();
        save();
        return send(res, 200, { doc: docView(d), locked });
      }
      if (method === 'DELETE') {
        if (d.type === 'invoice' && d.status !== 'draft') return send(res, 409, { error: 'Cancel sent invoices instead of deleting them, to keep numbering intact' });
        data.docs = data.docs.filter((x) => x.id !== d.id);
        save();
        return send(res, 200, { ok: true });
      }
    }
    if ((m = p.match(/^\/api\/docs\/([\w-]+)\/payments$/)) && method === 'POST') {
      const d = data.docs.find((x) => x.id === m[1] && x.type === 'invoice');
      if (!d) return send(res, 404, { error: 'Invoice not found' });
      const body = await readJson(req);
      const amount = round2(body.amount);
      if (!(amount > 0)) return send(res, 400, { error: 'Enter an amount' });
      if (d.status === 'draft') d.status = 'sent';
      d.payments.push({ id: crypto.randomUUID(), amount, date: /^\d{4}-\d{2}-\d{2}$/.test(body.date || '') ? body.date : today(), method: String(body.method || '').slice(0, 30), note: String(body.note || '').slice(0, 200) });
      save();
      return send(res, 200, { doc: docView(d) });
    }
    if ((m = p.match(/^\/api\/docs\/([\w-]+)\/payments\/([\w-]+)$/)) && method === 'DELETE') {
      const d = data.docs.find((x) => x.id === m[1]);
      if (!d) return send(res, 404, { error: 'Not found' });
      d.payments = d.payments.filter((x) => x.id !== m[2]);
      save();
      return send(res, 200, { doc: docView(d) });
    }
    if ((m = p.match(/^\/api\/docs\/([\w-]+)\/(convert|duplicate)$/)) && method === 'POST') {
      const src = data.docs.find((x) => x.id === m[1]);
      if (!src) return send(res, 404, { error: 'Not found' });
      const type = m[2] === 'convert' ? 'invoice' : src.type;
      if (m[2] === 'convert' && src.type !== 'quote') return send(res, 400, { error: 'Only quotes can be converted' });
      const d = newDoc(type, { clientId: src.clientId, items: src.items, discount: src.discount, taxRate: src.taxRate, notes: src.notes, lang: src.lang, fromQuote: m[2] === 'convert' ? src.number : null });
      data.docs.push(d);
      if (m[2] === 'convert') src.status = 'invoiced';
      save();
      return send(res, 200, { doc: docView(d) });
    }
    if (p === '/api/export.csv' && method === 'GET') {
      const rows = [['type', 'number', 'client', 'issue_date', 'due_date', 'status', 'subtotal', 'discount', 'tax', 'total', 'paid', 'balance', 'currency']];
      for (const d of data.docs) {
        const v = docView(d);
        rows.push([d.type, d.number, v.client?.name || '', d.issueDate, d.dueDate, v.state, v.totals.subtotal, v.totals.discount, v.totals.tax, v.totals.total, v.totals.paid, v.totals.balance, data.business.currency]);
      }
      const csv = '﻿' + rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
      return send(res, 200, csv, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="fatoora.csv"' });
    }

    // ----- business settings -----
    if (p === '/api/business' && method === 'GET') return send(res, 200, { business: data.business, timezone: data.timezone });
    if (p === '/api/business' && method === 'PUT') {
      const body = await readJson(req);
      const b = data.business;
      const x = body.business || {};
      for (const k of ['name', 'address', 'phone', 'email', 'taxId', 'currency', 'currencyName', 'currencyNameEn', 'taxLabel', 'paymentInfo', 'footer', 'invoicePrefix', 'quotePrefix']) if (typeof x[k] === 'string') b[k] = x[k].slice(0, k === 'paymentInfo' || k === 'footer' || k === 'address' ? 600 : 120);
      if (x.lang === 'ar' || x.lang === 'en') b.lang = x.lang;
      if (x.taxRate != null) b.taxRate = Math.min(100, Math.max(0, Number(x.taxRate) || 0));
      if (x.dueDays != null) b.dueDays = Math.min(365, Math.max(0, Number(x.dueDays) || 0));
      if (x.nextInvoice != null && Number(x.nextInvoice) >= 1) b.nextInvoice = Math.floor(Number(x.nextInvoice));
      if (/^#[0-9a-f]{6}$/i.test(x.color || '')) b.color = x.color;
      if (typeof x.logo === 'string') {
        if (x.logo === '') b.logo = '';
        else if (/^data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(x.logo) && x.logo.length < 400_000) b.logo = x.logo;
        else return send(res, 400, { error: 'Logo must be a PNG, JPG, WebP or SVG under 300 KB' });
      }
      if (typeof body.timezone === 'string') data.timezone = body.timezone.slice(0, 60);
      save();
      return send(res, 200, { business: b });
    }
    if (p === '/api/password' && method === 'POST') {
      const body = await readJson(req);
      if (!verifyPassword(String(body.current || ''), data.admin)) return send(res, 401, { error: 'Current password is wrong' });
      if (String(body.next || '').length < 8) return send(res, 400, { error: 'New password must be at least 8 characters' });
      data.admin = hashPassword(String(body.next));
      flush();
      return send(res, 200, { ok: true }, { 'set-cookie': session(req) });
    }
    return send(res, 404, { error: 'Not found' });
  }

  function applyClient(c, b) {
    for (const k of ['name', 'company', 'phone', 'email', 'address', 'taxId', 'notes']) if (typeof b[k] === 'string') c[k] = b[k].trim().slice(0, k === 'address' || k === 'notes' ? 500 : 120);
    for (const k of ['name', 'company', 'phone', 'email', 'address', 'taxId', 'notes']) c[k] ??= '';
  }

  const server = http.createServer((req, res) => {
    route(req, res).catch((err) => {
      const status = err.status || 500;
      if (status === 500) console.error('[http]', err);
      if (!res.headersSent) send(res, status, { error: status === 500 ? 'Internal error' : err.message });
    });
  });
  return {
    server, data,
    async start(port) { await new Promise((r) => server.listen(port, r)); return server.address().port; },
    async stop() { flush(); await new Promise((r) => server.close(r)); },
  };
}
