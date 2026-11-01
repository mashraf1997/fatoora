import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp, totals, statusOf } from '../src/app.js';
import { arabicWords, amountInWords } from '../src/words.js';

let app, base, jar, dataDir, client;

before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fatoora-'));
  app = createApp({ dataDir });
  base = `http://127.0.0.1:${await app.start(0)}`;
});
after(async () => {
  await app.stop();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

async function call(p, { method = 'GET', body, auth = true } = {}) {
  const res = await fetch(base + p, { method, headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(auth && jar ? { cookie: jar } : {}) }, body: body !== undefined ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json, headers: res.headers };
}

test('Arabic amount in words', () => {
  assert.equal(arabicWords(1500), 'ألف وخمسمائة');
  assert.equal(arabicWords(3250), 'ثلاثة آلاف ومائتان وخمسون');
  assert.equal(arabicWords(2000000), 'مليونان');
  assert.equal(amountInWords(1234.5, 'جنيه', 'ar'), 'فقط ألف ومائتان وأربعة وثلاثون جنيه و 50/100 لا غير');
  assert.equal(amountInWords(21, 'dollars', 'en'), 'Twenty-one dollars only');
});

test('totals and status rules', () => {
  const doc = { type: 'invoice', status: 'sent', items: [{ qty: 3, price: 100 }, { qty: 1, price: 50.5 }], discount: 50.5, taxRate: 14, payments: [{ amount: 100 }], dueDate: '2026-01-01' };
  assert.deepEqual(totals(doc), { subtotal: 350.5, discount: 50.5, tax: 42, total: 342, paid: 100, balance: 242 });
  assert.equal(statusOf(doc, '2026-02-01'), 'overdue');
  assert.equal(statusOf({ ...doc, payments: [{ amount: 342 }] }, '2026-02-01'), 'paid');
  assert.equal(statusOf(doc, '2025-12-01'), 'partial');
});

test('setup, business details and a client', async () => {
  let r = await call('/api/setup', { method: 'POST', body: { name: 'استوديو نيل', password: 'owner-pass-1', timezone: 'UTC' } });
  jar = r.headers.get('set-cookie').split(';')[0];
  r = await call('/api/business', { method: 'PUT', body: { business: { phone: '+201000000000', taxRate: 14, paymentInfo: 'InstaPay: nile@instapay', logo: 'javascript:alert(1)' } } });
  assert.equal(r.status, 400, 'logo must be an image data URL');
  r = await call('/api/business', { method: 'PUT', body: { business: { phone: '+201000000000', taxRate: 14, paymentInfo: 'InstaPay: nile@instapay' } } });
  assert.equal(r.body.business.taxRate, 14);
  r = await call('/api/clients', { method: 'POST', body: { name: 'شركة الأمل', phone: '+20 111 222 3333' } });
  client = r.body.client;
});

let quote;
test('quote: client link, accept, convert to a numbered invoice', async () => {
  let r = await call('/api/docs', { method: 'POST', body: { type: 'quote', clientId: client.id, items: [{ desc: 'تصميم لوجو', qty: 1, price: 3000 }, { desc: 'هوية بصرية', qty: 1, price: 4500 }] } });
  quote = r.body.doc;
  assert.equal(quote.number, 'Q-0001');
  assert.equal(quote.taxRate, 14, 'default tax applied');
  const token = quote.link.split('/').pop();
  r = await call('/api/public/doc/' + token, { auth: false });
  assert.equal(r.status, 404, 'drafts are not visible to clients');
  await call('/api/docs/' + quote.id, { method: 'PUT', body: { status: 'sent' } });
  r = await call('/api/public/doc/' + token, { auth: false });
  assert.equal(r.body.doc.totals.total, 8550);
  assert.equal(r.body.doc.words, 'فقط ثمانية آلاف وخمسمائة وخمسون جنيه مصري لا غير');
  assert.equal(r.body.doc.id, undefined, 'internal id is not exposed');
  assert.equal(r.body.business.paymentInfo, 'InstaPay: nile@instapay');
  r = await call(`/api/public/doc/${token}/accept`, { method: 'POST', body: { name: 'أ. سمير' }, auth: false });
  assert.equal(r.body.status, 'accepted');
  r = await call('/api/overview');
  assert.equal(r.body.accepted.length, 1);
  r = await call(`/api/docs/${quote.id}/convert`, { method: 'POST', body: {} });
  assert.equal(r.body.doc.number, 'INV-0001');
  assert.equal(r.body.doc.type, 'invoice');
  assert.equal(r.body.doc.fromQuote, 'Q-0001');
  assert.equal(r.body.doc.totals.total, 8550);
  assert.equal(app.data.docs.find((d) => d.id === quote.id).status, 'invoiced');
});

test('invoice payments: partial, paid, lines lock, overdue and reports', async () => {
  const inv = app.data.docs.find((d) => d.number === 'INV-0001');
  await call('/api/docs/' + inv.id, { method: 'PUT', body: { status: 'sent', dueDate: '2020-01-01' } });
  let r = await call('/api/overview');
  assert.equal(r.body.overdueCount, 1);
  assert.equal(r.body.outstanding, 8550);
  r = await call(`/api/docs/${inv.id}/payments`, { method: 'POST', body: { amount: 5000, method: 'تحويل' } });
  assert.equal(r.body.doc.totals.balance, 3550);
  r = await call('/api/docs/' + inv.id, { method: 'PUT', body: { items: [{ desc: 'x', qty: 1, price: 1 }] } });
  assert.equal(r.body.locked, true);
  assert.equal(r.body.doc.totals.total, 8550, 'lines cannot change after a payment');
  r = await call(`/api/docs/${inv.id}/payments`, { method: 'POST', body: { amount: 3550 } });
  assert.equal(r.body.doc.state, 'paid');
  r = await call('/api/docs/' + inv.id, { method: 'DELETE', body: {} });
  assert.equal(r.status, 409, 'sent invoices are cancelled, not deleted');
  r = await call('/api/overview');
  assert.equal(r.body.collectedMonth, 8550);
  assert.equal(r.body.top[0].name, 'شركة الأمل');
  const csv = await fetch(base + '/api/export.csv', { headers: { cookie: jar } }).then((x) => x.text());
  assert.match(csv, /"invoice","INV-0001","شركة الأمل"/);
});

test('deleting a client keeps old invoices readable', async () => {
  await call('/api/clients/' + client.id, { method: 'DELETE', body: {} });
  const inv = app.data.docs.find((d) => d.number === 'INV-0001');
  const r = await call('/api/public/doc/' + inv.token, { auth: false });
  assert.equal(r.body.doc.client.name, 'شركة الأمل');
});

test('pages are served and the API needs a session', async () => {
  assert.equal((await fetch(base + '/d/whatever')).status, 200);
  assert.equal((await call('/api/docs', { auth: false })).status, 401);
});
