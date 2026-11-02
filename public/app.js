/* Fatoora dashboard — plain JavaScript, no build step. */
(function () {
  'use strict';
  const STR = {
    ar: {
      overview: 'الرئيسية', invoices: 'الفواتير', quotes: 'عروض الأسعار', clients: 'العملاء', settings: 'الإعدادات', logout: 'خروج', lang: 'English',
      setupTitle: 'أهلاً بيك في فاتورة', setupLead: 'فواتير وعروض أسعار احترافية بالعربي والإنجليزي.', bizName: 'اسم النشاط', password: 'كلمة السر', pwHint: '8 حروف على الأقل', start: 'ابدأ', loginTitle: 'تسجيل الدخول', login: 'دخول',
      outstanding: 'فلوس ليك برّه', overdue: 'متأخرة', invoicedMonth: 'فواتير الشهر ده', collectedMonth: 'اتحصّل الشهر ده', perMonth: 'التحصيل آخر 12 شهر', top: 'أكبر العملاء', overdueList: 'فواتير متأخرة', acceptedList: 'عروض اتقبلت، حوّلها لفاتورة', setupHint: 'كمّل بيانات نشاطك (التليفون أو الإيميل وطريقة الدفع) من الإعدادات.',
      newInvoice: '+ فاتورة جديدة', newQuote: '+ عرض سعر جديد', number: 'الرقم', client: 'العميل', date: 'التاريخ', due: 'الاستحقاق', total: 'الإجمالي', balance: 'المتبقي', status: 'الحالة', none: 'لسه مفيش.', export: 'تصدير CSV',
      st_draft: 'مسودة', st_sent: 'اتبعتت', st_partial: 'مدفوعة جزئياً', st_paid: 'مدفوعة', st_overdue: 'متأخرة', st_cancelled: 'ملغية', st_accepted: 'اتقبل', st_declined: 'اترفض', st_invoiced: 'اتحوّل لفاتورة',
      invoice: 'فاتورة', quote: 'عرض سعر', pickClient: '— اختار عميل —', addClient: '+ عميل جديد', issue: 'تاريخ الإصدار', validUntil: 'صالح حتى', docLang: 'لغة المستند', desc: 'البيان', qty: 'الكمية', price: 'السعر', amount: 'المبلغ', addLine: '+ بند', subtotal: 'المجموع', discount: 'خصم', tax: 'الضريبة %', notes: 'ملاحظات للعميل',
      save: 'حفظ', saved: 'اتحفظ ✓', markSent: 'علّمها اتبعتت', openLink: 'افتح الرابط', copyLink: 'انسخ رابط العميل', copied: 'اتنسخ ✓', whatsapp: 'ابعت على واتساب', cancelInv: 'إلغاء الفاتورة', del: 'حذف', convert: 'حوّل لفاتورة', duplicate: 'نسخة', back: '← رجوع', locked: 'الفاتورة دي عليها مدفوعات، فالبنود مقفولة. لو محتاج تعديل، ألغيها واعمل نسخة.',
      payments: 'المدفوعات', addPayment: 'سجّل دفعة', method: 'الطريقة', remove: 'شيل', cash: 'كاش', transfer: 'تحويل', wallet: 'محفظة', card: 'كارت',
      waInvoice: 'أهلاً {name}، دي فاتورة {number} بمبلغ {total}:\n{link}', waReminder: 'أهلاً {name}، تذكير لطيف بفاتورة {number} (المتبقي {balance}) اللي كان ميعادها {due}:\n{link}\nشكراً 🙏', waQuote: 'أهلاً {name}، ده عرض السعر {number} بمبلغ {total}:\n{link}', remind: 'ذكّر على واتساب',
      cName: 'الاسم', company: 'الشركة', phone: 'الموبايل (بكود الدولة للواتساب)', email: 'الإيميل', address: 'العنوان', taxId: 'الرقم الضريبي', cNotes: 'ملاحظات', invoicesN: 'فواتير', edit: 'تعديل', close: 'إغلاق',
      biz: 'بيانات النشاط', logo: 'اللوجو', removeLogo: 'شيل اللوجو', currency: 'كود العملة', currencyName: 'اسم العملة بالعربي', currencyNameEn: 'اسم العملة بالإنجليزي', taxLabel: 'اسم الضريبة', defTax: 'الضريبة الافتراضية %', dueDays: 'مهلة الدفع (يوم)', payInfo: 'طريقة الدفع (حساب بنكي، إنستاباي…)', footer: 'سطر أسفل الفاتورة', prefixInv: 'بادئة الفواتير', prefixQ: 'بادئة العروض', nextInv: 'رقم الفاتورة الجاية', color: 'اللون', defLang: 'لغة المستندات الافتراضية', tz: 'المنطقة الزمنية',
      hookTitle: 'فاتورة تلقائية لكل طلب', hookLead: 'حط الرابط ده في إشعارات Wakeel (Webhook) أو في Dukkan، وكل طلب هيتعمله فاتورة لوحده.', hookAuto: 'اعتبر الفواتير دي «اتبعتت» على طول (بدل مسودة)',
      pwTitle: 'تغيير كلمة السر', current: 'الحالية', next: 'الجديدة', change: 'تغيير', note: 'فاتورة مش نظام فاتورة إلكترونية رسمي (زي ZATCA أو ETA).',
    },
    en: {
      overview: 'Home', invoices: 'Invoices', quotes: 'Quotes', clients: 'Clients', settings: 'Settings', logout: 'Sign out', lang: 'العربية',
      setupTitle: 'Welcome to Fatoora', setupLead: 'Professional invoices and quotes in Arabic and English.', bizName: 'Business name', password: 'Password', pwHint: 'At least 8 characters', start: 'Get started', loginTitle: 'Sign in', login: 'Sign in',
      outstanding: 'Owed to you', overdue: 'Overdue', invoicedMonth: 'Invoiced this month', collectedMonth: 'Collected this month', perMonth: 'Collected, last 12 months', top: 'Top clients', overdueList: 'Overdue invoices', acceptedList: 'Accepted quotes, ready to invoice', setupHint: 'Finish your business details (phone or email and payment details) in Settings.',
      newInvoice: '+ New invoice', newQuote: '+ New quote', number: 'Number', client: 'Client', date: 'Date', due: 'Due', total: 'Total', balance: 'Balance', status: 'Status', none: 'Nothing yet.', export: 'Export CSV',
      st_draft: 'Draft', st_sent: 'Sent', st_partial: 'Partly paid', st_paid: 'Paid', st_overdue: 'Overdue', st_cancelled: 'Cancelled', st_accepted: 'Accepted', st_declined: 'Declined', st_invoiced: 'Invoiced',
      invoice: 'Invoice', quote: 'Quote', pickClient: '— Pick a client —', addClient: '+ New client', issue: 'Issue date', validUntil: 'Valid until', docLang: 'Document language', desc: 'Description', qty: 'Qty', price: 'Price', amount: 'Amount', addLine: '+ Line', subtotal: 'Subtotal', discount: 'Discount', tax: 'Tax %', notes: 'Notes for the client',
      save: 'Save', saved: 'Saved ✓', markSent: 'Mark as sent', openLink: 'Open link', copyLink: 'Copy client link', copied: 'Copied ✓', whatsapp: 'Send on WhatsApp', cancelInv: 'Cancel invoice', del: 'Delete', convert: 'Convert to invoice', duplicate: 'Duplicate', back: '← Back', locked: 'This invoice has payments, so its lines are locked. To change it, cancel it and duplicate.',
      payments: 'Payments', addPayment: 'Record payment', method: 'Method', remove: 'Remove', cash: 'Cash', transfer: 'Transfer', wallet: 'Wallet', card: 'Card',
      waInvoice: 'Hi {name}, here is invoice {number} for {total}:\n{link}', waReminder: 'Hi {name}, a friendly reminder about invoice {number} ({balance} left), due {due}:\n{link}\nThank you 🙏', waQuote: 'Hi {name}, here is quote {number} for {total}:\n{link}', remind: 'Remind on WhatsApp',
      cName: 'Name', company: 'Company', phone: 'Phone (with country code for WhatsApp)', email: 'Email', address: 'Address', taxId: 'Tax ID', cNotes: 'Notes', invoicesN: 'invoices', edit: 'Edit', close: 'Close',
      biz: 'Business details', logo: 'Logo', removeLogo: 'Remove logo', currency: 'Currency code', currencyName: 'Currency name (Arabic)', currencyNameEn: 'Currency name (English)', taxLabel: 'Tax name', defTax: 'Default tax %', dueDays: 'Payment terms (days)', payInfo: 'Payment details (bank account, InstaPay…)', footer: 'Footer line', prefixInv: 'Invoice prefix', prefixQ: 'Quote prefix', nextInv: 'Next invoice number', color: 'Color', defLang: 'Default document language', tz: 'Time zone',
      hookTitle: 'An invoice for every order', hookLead: 'Paste this URL in Wakeel notifications (webhook) or in Dukkan. Each order becomes an invoice automatically.', hookAuto: 'Mark these invoices as sent right away (instead of draft)',
      pwTitle: 'Change password', current: 'Current', next: 'New', change: 'Change', note: 'Fatoora is not an official e-invoicing system (such as ZATCA or ETA).',
    },
  };
  const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
  let lang = get('fatoora_lang') || 'ar';
  const t = (k) => STR[lang][k] ?? k;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const app = $('#app');
  const S = { session: null, business: null, clients: [] };
  async function api(p, o = {}) {
    const res = await fetch(p, { method: o.method || 'GET', headers: o.body !== undefined ? { 'content-type': 'application/json' } : {}, body: o.body !== undefined ? JSON.stringify(o.body) : undefined });
    const d = await res.json().catch(() => ({}));
    if (res.status === 401 && p !== '/api/login' && p !== '/api/password') { boot(); throw new Error(d.error); }
    if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
    return d;
  }
  const toast = (m) => { const el = $('#toast'); el.textContent = m; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); };
  const pill = (st) => `<span class="pill st-${st}">${t('st_' + st)}</span>`;
  const cur = () => S.business?.currency || '';
  const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
  const waLink = (phone, text) => `https://wa.me/${String(phone || '').replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`;
  function dialog(html) { const d = document.createElement('dialog'); d.className = 'ed'; d.innerHTML = html; document.body.appendChild(d); d.showModal(); d.addEventListener('close', () => d.remove()); return d; }

  async function boot() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    S.session = await api('/api/session').catch(() => ({}));
    if (S.session.needsSetup) return auth(true);
    if (!S.session.authed) return auth(false);
    S.business = (await api('/api/business')).business;
    shell(); route();
  }
  function auth(setup) {
    app.innerHTML = `<div class="auth"><form class="card" id="f"><div class="brand"><img src="favicon.svg" alt="">Fatoora <span class="muted small">فاتورة</span></div><h1>${setup ? t('setupTitle') : t('loginTitle')}</h1>
      ${setup ? `<p class="muted">${t('setupLead')}</p><label class="field" for="bn">${t('bizName')}<input type="text" id="bn"></label>` : ''}
      <label class="field" for="pw">${t('password')} ${setup ? `<span class="hint">${t('pwHint')}</span>` : ''}<input type="password" id="pw"></label>
      ${setup && S.session.setupTokenRequired ? `<label class="field" for="st">Setup token<input type="password" id="st" class="ltr"></label>` : ''}
      <div class="err" id="err"></div><div class="row"><button class="btn primary" type="submit">${setup ? t('start') : t('login')}</button><span class="spacer"></span><button class="btn sm" type="button" id="lb">${t('lang')}</button></div></form></div>`;
    $('#lb').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; put('fatoora_lang', lang); boot(); };
    $('#f').onsubmit = async (e) => {
      e.preventDefault();
      try {
        if (setup) await api('/api/setup', { method: 'POST', body: { name: $('#bn').value, password: $('#pw').value, lang, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, setupToken: $('#st')?.value } });
        else await api('/api/login', { method: 'POST', body: { password: $('#pw').value } });
        location.hash = '#overview'; boot();
      } catch (err) { $('#err').textContent = err.message; }
    };
  }
  const PAGES = ['overview', 'invoices', 'quotes', 'clients', 'settings'];
  function shell() {
    const nav = PAGES.map((p) => `<a class="nav" href="#${p}" data-page="${p}">${t(p)}</a>`).join('');
    app.innerHTML = `<div class="shell"><nav class="rail"><div class="brand"><img src="favicon.svg" alt="">Fatoora</div>${nav}<div class="rail-foot"><button class="nav" id="lb" type="button">${t('lang')}</button><button class="nav" id="lo" type="button">${t('logout')}</button></div></nav><nav class="mobile-nav">${nav}</nav><main class="main" id="main"></main></div>`;
    $('#lb').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; put('fatoora_lang', lang); boot(); };
    $('#lo').onclick = async () => { await api('/api/logout', { method: 'POST', body: {} }); boot(); };
  }
  async function route() {
    const h = location.hash.slice(1);
    const [pg, id] = h.split(':');
    const page = PAGES.includes(pg) ? pg : pg === 'doc' ? 'doc' : 'overview';
    $$('.nav[data-page]').forEach((a) => a.setAttribute('aria-current', a.dataset.page === page ? 'page' : 'false'));
    S.clients = (await api('/api/clients')).clients;
    const main = $('#main');
    main.scrollTop = 0;
    if (page === 'doc') return pDoc(main, id);
    ({ overview: pOverview, invoices: (m) => pList(m, 'invoice'), quotes: (m) => pList(m, 'quote'), clients: pClients, settings: pSettings }[page])(main);
  }
  window.addEventListener('hashchange', () => S.session?.authed && route());

  async function create(type, extra = {}) {
    const { doc } = await api('/api/docs', { method: 'POST', body: { type, ...extra } });
    location.hash = '#doc:' + doc.id;
  }

  // ---------------- overview ----------------
  async function pOverview(main) {
    const o = await api('/api/overview');
    const max = Math.max(1, ...o.perMonth.map((x) => x.collected));
    const rows = (list) => list.map((d) => `<div class="row"><a href="#doc:${d.id}" class="mono">${esc(d.number)}</a><span>${esc(d.client?.name || '—')}</span><span class="spacer"></span><b class="money">${money(d.totals.balance || d.totals.total)}</b>
      ${d.client?.phone && d.state === 'overdue' ? `<a class="btn sm" target="_blank" rel="noopener" href="${esc(waLink(d.client.phone, fill(t('waReminder'), { name: d.client.name, number: d.number, balance: money(d.totals.balance) + ' ' + cur(), due: d.dueDate, link: location.origin + d.link })))}">${t('remind')}</a>` : ''}</div>`).join('');
    main.innerHTML = `<div class="page">
      <div class="page-head"><h1>${esc(S.business.name || 'Fatoora')}</h1><div class="row"><button class="btn" id="nq" type="button">${t('newQuote')}</button><button class="btn primary" id="ni" type="button">${t('newInvoice')}</button></div></div>
      ${o.setup ? '' : `<a class="card" href="#settings" style="text-decoration:none;color:inherit">${t('setupHint')}</a>`}
      <div class="grid4">
        <div class="card stat"><b class="money">${money(o.outstanding)}</b><span>${t('outstanding')} · ${esc(o.currency)}</span></div>
        <div class="card stat ${o.overdueCount ? 'alert' : ''}"><b class="money">${money(o.overdue)}</b><span>${t('overdue')} (${o.overdueCount})</span></div>
        <div class="card stat"><b class="money">${money(o.invoicedMonth)}</b><span>${t('invoicedMonth')}</span></div>
        <div class="card stat"><b class="money">${money(o.collectedMonth)}</b><span>${t('collectedMonth')}</span></div>
      </div>
      ${o.overdueList.length ? `<section class="card"><h2>${t('overdueList')}</h2><div class="stack">${rows(o.overdueList)}</div></section>` : ''}
      ${o.accepted.length ? `<section class="card"><h2>${t('acceptedList')}</h2><div class="stack">${o.accepted.map((d) => `<div class="row"><a href="#doc:${d.id}" class="mono">${esc(d.number)}</a><span>${esc(d.client?.name || '—')}</span><span class="spacer"></span><b class="money">${money(d.totals.total)}</b><button class="btn sm primary" data-conv="${d.id}" type="button">${t('convert')}</button></div>`).join('')}</div></section>` : ''}
      <div class="grid2">
        <section class="card"><h2>${t('perMonth')}</h2>
          <div class="bars" style="grid-template-columns:repeat(12,1fr)">${o.perMonth.map((x, i) => `<div class="bar ${i === 11 ? 'today' : ''}"><small>${x.collected ? Math.round(x.collected / 1000) + 'k' : ''}</small><i style="height:${Math.max(2, Math.round((x.collected / max) * 110))}px" title="${x.month}: ${money(x.collected)}"></i></div>`).join('')}</div>
          <div class="bar-labels" style="grid-template-columns:repeat(12,1fr)">${o.perMonth.map((x) => `<span>${x.month.slice(5)}</span>`).join('')}</div></section>
        <section class="card"><h2>${t('top')}</h2>${o.top.length ? o.top.map((c) => `<div class="row"><span>${esc(c.name)}</span><span class="spacer"></span><b class="money">${money(c.total)}</b></div>`).join('') : `<p class="muted">${t('none')}</p>`}</section>
      </div>
      <p class="muted small">${t('note')}</p>
    </div>`;
    $('#ni').onclick = () => create('invoice');
    $('#nq').onclick = () => create('quote');
    $$('[data-conv]', main).forEach((b) => (b.onclick = async () => { const { doc } = await api(`/api/docs/${b.dataset.conv}/convert`, { method: 'POST', body: {} }); location.hash = '#doc:' + doc.id; }));
  }

  // ---------------- lists ----------------
  async function pList(main, type) {
    const { docs } = await api('/api/docs?type=' + type);
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t(type === 'invoice' ? 'invoices' : 'quotes')}</h1><div class="row"><a class="btn" href="/api/export.csv">${t('export')}</a><button class="btn primary" id="new" type="button">${t(type === 'invoice' ? 'newInvoice' : 'newQuote')}</button></div></div>
      ${docs.length ? `<div class="table-wrap"><table><thead><tr><th>${t('number')}</th><th>${t('client')}</th><th>${t('date')}</th>${type === 'invoice' ? `<th>${t('due')}</th>` : ''}<th>${t('total')}</th>${type === 'invoice' ? `<th>${t('balance')}</th>` : ''}<th>${t('status')}</th></tr></thead><tbody>
      ${docs.map((d) => `<tr style="cursor:pointer" data-open="${d.id}"><td class="mono"><a href="#doc:${d.id}">${esc(d.number)}</a></td><td>${esc(d.client?.name || '—')}</td><td class="num">${d.issueDate}</td>${type === 'invoice' ? `<td class="num">${d.dueDate}</td>` : ''}<td class="money">${money(d.totals.total)}</td>${type === 'invoice' ? `<td class="money">${money(d.totals.balance)}</td>` : ''}<td>${pill(d.state)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="card empty">${t('none')}</div>`}</div>`;
    $('#new').onclick = () => create(type);
    $$('[data-open]', main).forEach((r) => (r.onclick = (e) => { if (e.target.tagName !== 'A') location.hash = '#doc:' + r.dataset.open; }));
  }

  // ---------------- document editor ----------------
  async function pDoc(main, id) {
    let d;
    try { ({ doc: d } = await api('/api/docs/' + id)); } catch { location.hash = '#invoices'; return; }
    const locked = d.type === 'invoice' && d.payments.length > 0;
    const linkUrl = location.origin + d.link;
    const c = d.client;
    const wa = c?.phone ? waLink(c.phone, fill(t(d.type === 'quote' ? 'waQuote' : d.state === 'overdue' ? 'waReminder' : 'waInvoice'), { name: c.name, number: d.number, total: money(d.totals.total) + ' ' + cur(), balance: money(d.totals.balance) + ' ' + cur(), due: d.dueDate, link: linkUrl })) : '';
    const line = (i) => `<tr><td><input type="text" class="d" value="${esc(i.desc)}" aria-label="${t('desc')}" ${locked ? 'disabled' : ''}></td><td><input type="number" class="q" step="any" min="0" value="${i.qty}" aria-label="${t('qty')}" ${locked ? 'disabled' : ''}></td><td><input type="number" class="p" step="0.01" min="0" value="${i.price}" aria-label="${t('price')}" ${locked ? 'disabled' : ''}></td><td class="a">0.00</td><td>${locked ? '' : '<button class="btn sm" type="button" data-rm>✕</button>'}</td></tr>`;
    main.innerHTML = `<div class="page">
      <div class="page-head"><div class="row"><a href="#${d.type === 'invoice' ? 'invoices' : 'quotes'}" class="btn sm">${t('back')}</a><h1>${t(d.type)} <span class="mono">${esc(d.number)}</span></h1>${pill(d.state)}</div>
        <div class="row">${d.status !== 'draft' ? `<a class="btn" href="${esc(d.link)}" target="_blank" rel="noopener">${t('openLink')}</a><button class="btn" id="cp" type="button">${t('copyLink')}</button>` : ''}${wa && d.status !== 'draft' ? `<a class="btn primary" href="${esc(wa)}" target="_blank" rel="noopener">${t('whatsapp')}</a>` : ''}</div></div>
      ${locked ? `<p class="muted small">${t('locked')}</p>` : ''}
      <form class="card" id="df">
        <div class="grid4">
          <label class="field" for="cl">${t('client')}<select id="cl"><option value="">${t('pickClient')}</option>${S.clients.map((x) => `<option value="${x.id}" ${x.id === d.clientId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}<option value="__new">${t('addClient')}</option></select></label>
          <label class="field" for="is">${t('issue')}<input type="date" id="is" value="${d.issueDate}"></label>
          ${d.type === 'invoice' ? `<label class="field" for="du">${t('due')}<input type="date" id="du" value="${d.dueDate}"></label>` : `<label class="field" for="vu">${t('validUntil')}<input type="date" id="vu" value="${d.validUntil}"></label>`}
          <label class="field" for="lg">${t('docLang')}<select id="lg"><option value="ar" ${d.lang === 'ar' ? 'selected' : ''}>العربية</option><option value="en" ${d.lang === 'en' ? 'selected' : ''}>English</option></select></label>
        </div>
        <div class="table-wrap" style="border:0"><table class="items"><thead><tr><th>${t('desc')}</th><th>${t('qty')}</th><th>${t('price')}</th><th style="text-align:end">${t('amount')}</th><th></th></tr></thead><tbody id="lines">${(d.items.length ? d.items : [{ desc: '', qty: 1, price: 0 }]).map(line).join('')}</tbody></table></div>
        ${locked ? '' : `<button class="btn sm" type="button" id="add" style="justify-self:start">${t('addLine')}</button>`}
        <div class="sumbox"><div><span>${t('subtotal')}</span><b class="money" id="sub">0</b></div>
          <div><span>${t('discount')}</span><input type="number" id="dc" step="0.01" min="0" value="${d.discount}" ${locked ? 'disabled' : ''}></div>
          <div><span>${t('tax')}</span><input type="number" id="tx" step="0.01" min="0" value="${d.taxRate}" ${locked ? 'disabled' : ''}></div>
          <div class="grand"><span>${t('total')}</span><span class="money" id="tot">0</span></div></div>
        <label class="field" for="nt">${t('notes')}<textarea id="nt">${esc(d.notes)}</textarea></label>
        <div class="row"><button class="btn primary" type="submit">${t('save')}</button>
          ${d.status === 'draft' ? `<button class="btn" type="button" data-status="sent">${t('markSent')}</button>` : ''}
          ${d.type === 'quote' && d.status !== 'invoiced' ? `<button class="btn" type="button" id="cv">${t('convert')}</button>` : ''}
          <button class="btn" type="button" id="dup">${t('duplicate')}</button><span class="spacer"></span>
          ${d.type === 'invoice' && d.status !== 'draft' && d.status !== 'cancelled' ? `<button class="btn danger" type="button" data-status="cancelled">${t('cancelInv')}</button>` : ''}
          ${d.type === 'quote' || d.status === 'draft' ? `<button class="btn danger" type="button" id="del">${t('del')}</button>` : ''}</div>
      </form>
      ${d.type === 'invoice' ? `<section class="card"><div class="card-head"><h2>${t('payments')}</h2><span>${t('balance')}: <b class="money">${money(d.totals.balance)}</b> ${esc(cur())}</span></div>
        ${d.payments.map((p) => `<div class="row"><span class="num">${p.date}</span><b class="money">${money(p.amount)}</b><span class="muted">${esc(p.method)}</span><span class="spacer"></span><button class="btn sm" data-rmpay="${p.id}" type="button">${t('remove')}</button></div>`).join('')}
        ${d.state !== 'paid' && d.status !== 'cancelled' ? `<form class="row" id="pf"><input type="number" id="pa" step="0.01" min="0.01" value="${d.totals.balance > 0 ? d.totals.balance : ''}" style="width:140px" aria-label="${t('amount')}"><input type="date" id="pd" value="${new Date().toISOString().slice(0, 10)}" style="width:auto" aria-label="${t('date')}"><select id="pm" style="width:auto" aria-label="${t('method')}">${['cash', 'transfer', 'wallet', 'card'].map((k) => `<option value="${t(k)}">${t(k)}</option>`).join('')}</select><button class="btn primary" type="submit">${t('addPayment')}</button></form>` : ''}</section>` : ''}
    </div>`;
    const recalc = () => {
      let sub = 0;
      $$('#lines tr', main).forEach((tr) => { const a = (Number($('.q', tr).value) || 0) * (Number($('.p', tr).value) || 0); sub += a; $('.a', tr).textContent = money(a); });
      const disc = Math.min(sub, Number($('#dc').value) || 0);
      const tax = ((sub - disc) * (Number($('#tx').value) || 0)) / 100;
      $('#sub').textContent = money(sub); $('#tot').textContent = money(sub - disc + tax);
    };
    const bindLines = () => { $$('#lines input', main).forEach((i) => (i.oninput = recalc)); $$('[data-rm]', main).forEach((b) => (b.onclick = () => { b.closest('tr').remove(); recalc(); })); };
    bindLines(); recalc();
    $('#dc').oninput = recalc; $('#tx').oninput = recalc;
    if ($('#add')) $('#add').onclick = () => { $('#lines').insertAdjacentHTML('beforeend', line({ desc: '', qty: 1, price: 0 })); bindLines(); recalc(); $$('#lines .d', main).at(-1).focus(); };
    const body = () => ({ clientId: $('#cl').value === '__new' ? '' : $('#cl').value, issueDate: $('#is').value, dueDate: $('#du')?.value, validUntil: $('#vu')?.value, lang: $('#lg').value, notes: $('#nt').value, discount: Number($('#dc').value), taxRate: Number($('#tx').value), items: $$('#lines tr', main).map((tr) => ({ desc: $('.d', tr).value, qty: Number($('.q', tr).value), price: Number($('.p', tr).value) })) });
    const saveDoc = async (extra = {}) => { await api('/api/docs/' + d.id, { method: 'PUT', body: { ...body(), ...extra } }); };
    $('#cl').onchange = () => { if ($('#cl').value === '__new') clientDialog(null, async (nc) => { S.clients = (await api('/api/clients')).clients; await saveDoc({ clientId: nc.id }); pDoc(main, id); }); };
    $('#df').onsubmit = async (e) => { e.preventDefault(); try { await saveDoc(); toast(t('saved')); pDoc(main, id); } catch (err) { toast(err.message); } };
    $$('[data-status]', main).forEach((b) => (b.onclick = async () => { try { await saveDoc({ status: b.dataset.status }); pDoc(main, id); } catch (err) { toast(err.message); } }));
    if ($('#cp')) $('#cp').onclick = async () => { try { await navigator.clipboard.writeText(linkUrl); toast(t('copied')); } catch { toast(linkUrl); } };
    if ($('#cv')) $('#cv').onclick = async () => { await saveDoc(); const r = await api(`/api/docs/${d.id}/convert`, { method: 'POST', body: {} }); location.hash = '#doc:' + r.doc.id; };
    $('#dup').onclick = async () => { const r = await api(`/api/docs/${d.id}/duplicate`, { method: 'POST', body: {} }); location.hash = '#doc:' + r.doc.id; };
    if ($('#del')) $('#del').onclick = async () => { try { await api('/api/docs/' + d.id, { method: 'DELETE', body: {} }); location.hash = d.type === 'invoice' ? '#invoices' : '#quotes'; } catch (err) { toast(err.message); } };
    if ($('#pf')) $('#pf').onsubmit = async (e) => { e.preventDefault(); try { await api(`/api/docs/${d.id}/payments`, { method: 'POST', body: { amount: Number($('#pa').value), date: $('#pd').value, method: $('#pm').value } }); pDoc(main, id); } catch (err) { toast(err.message); } };
    $$('[data-rmpay]', main).forEach((b) => (b.onclick = async () => { await api(`/api/docs/${d.id}/payments/${b.dataset.rmpay}`, { method: 'DELETE', body: {} }); pDoc(main, id); }));
  }

  // ---------------- clients ----------------
  function pClients(main) {
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('clients')}</h1><button class="btn primary" id="add" type="button">${t('addClient')}</button></div>
      ${S.clients.length ? `<div class="table-wrap"><table><thead><tr><th>${t('cName')}</th><th>${t('phone')}</th><th>${t('invoicesN')}</th><th>${t('balance')}</th><th></th></tr></thead><tbody>
      ${S.clients.map((c) => `<tr><td><b>${esc(c.name)}</b>${c.company ? `<br><span class="muted small">${esc(c.company)}</span>` : ''}</td><td class="mono small" dir="ltr">${esc(c.phone)}</td><td class="num">${c.invoices}</td><td class="money">${money(c.balance)}</td>
        <td><div class="row" style="gap:6px"><button class="btn sm" data-inv="${c.id}" type="button">${t('newInvoice')}</button><button class="btn sm" data-edit="${c.id}" type="button">${t('edit')}</button></div></td></tr>`).join('')}</tbody></table></div>` : `<div class="card empty">${t('none')}</div>`}</div>`;
    $('#add').onclick = () => clientDialog(null, () => route());
    $$('[data-edit]', main).forEach((b) => (b.onclick = () => clientDialog(S.clients.find((c) => c.id === b.dataset.edit), () => route())));
    $$('[data-inv]', main).forEach((b) => (b.onclick = () => create('invoice', { clientId: b.dataset.inv })));
  }
  function clientDialog(c, done) {
    const v = c || {};
    const f = (id, k, cls = '') => `<label class="field" for="${id}">${t(k)}<input type="text" id="${id}" class="${cls}" value="${esc(v[k === 'cName' ? 'name' : k === 'cNotes' ? 'notes' : k] || '')}"></label>`;
    const d = dialog(`<form class="stack" id="cf"><h2>${c ? esc(c.name) : t('addClient')}</h2>
      <div class="grid2">${f('c-n', 'cName')}${f('c-c', 'company')}</div><div class="grid2">${f('c-p', 'phone', 'ltr')}${f('c-e', 'email', 'ltr')}</div>${f('c-a', 'address')}<div class="grid2">${f('c-t', 'taxId', 'ltr')}${f('c-no', 'cNotes')}</div>
      <div class="err" id="c-er"></div><div class="row"><button class="btn primary" type="submit">${t('save')}</button><button class="btn" type="button" id="c-x">${t('close')}</button><span class="spacer"></span>${c ? `<button class="btn danger" type="button" id="c-d">${t('del')}</button>` : ''}</div></form>`);
    $('#c-x', d).onclick = () => d.close();
    if ($('#c-d', d)) $('#c-d', d).onclick = async () => { await api('/api/clients/' + c.id, { method: 'DELETE', body: {} }); d.close(); done(); };
    $('#cf', d).onsubmit = async (e) => {
      e.preventDefault();
      const body = { name: $('#c-n', d).value, company: $('#c-c', d).value, phone: $('#c-p', d).value, email: $('#c-e', d).value, address: $('#c-a', d).value, taxId: $('#c-t', d).value, notes: $('#c-no', d).value };
      try { const r = await api(c ? '/api/clients/' + c.id : '/api/clients', { method: c ? 'PUT' : 'POST', body }); d.close(); done(r.client); } catch (err) { $('#c-er', d).textContent = err.message; }
    };
  }

  // ---------------- settings ----------------
  async function pSettings(main) {
    const { business: b, timezone } = await api('/api/business');
    const f = (id, k, val, type = 'text', cls = '') => `<label class="field" for="${id}">${t(k)}<input type="${type}" id="${id}" class="${cls}" value="${esc(val)}"></label>`;
    main.innerHTML = `<div class="page"><div class="page-head"><h1>${t('settings')}</h1></div>
      <form class="card" id="bf" style="max-width:820px"><h2>${t('biz')}</h2>
        <div class="row">${b.logo ? `<img class="logo-prev" src="${esc(b.logo)}" alt="">` : ''}<button class="btn sm" type="button" id="lu">${t('logo')}</button>${b.logo ? `<button class="btn sm" type="button" id="lr">${t('removeLogo')}</button>` : ''}<input type="file" id="lf" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden></div>
        <div class="grid2">${f('b-n', 'bizName', b.name)}${f('b-t', 'taxId', b.taxId, 'text', 'ltr')}</div>
        <div class="grid2">${f('b-p', 'phone', b.phone, 'text', 'ltr')}${f('b-e', 'email', b.email, 'text', 'ltr')}</div>
        <label class="field" for="b-a">${t('address')}<textarea id="b-a" style="min-height:60px">${esc(b.address)}</textarea></label>
        <label class="field" for="b-pi">${t('payInfo')}<textarea id="b-pi" style="min-height:70px">${esc(b.paymentInfo)}</textarea></label>
        ${f('b-f', 'footer', b.footer)}
        <div class="grid4">${f('b-c', 'currency', b.currency, 'text', 'ltr')}${f('b-cn', 'currencyName', b.currencyName)}${f('b-ce', 'currencyNameEn', b.currencyNameEn)}${f('b-tl', 'taxLabel', b.taxLabel)}</div>
        <div class="grid4">${f('b-tr', 'defTax', b.taxRate, 'number')}${f('b-dd', 'dueDays', b.dueDays, 'number')}${f('b-pf', 'prefixInv', b.invoicePrefix, 'text', 'ltr')}${f('b-qf', 'prefixQ', b.quotePrefix, 'text', 'ltr')}</div>
        <div class="grid4">${f('b-ni', 'nextInv', b.nextInvoice, 'number')}<label class="field" for="b-l">${t('defLang')}<select id="b-l"><option value="ar" ${b.lang === 'ar' ? 'selected' : ''}>العربية</option><option value="en" ${b.lang === 'en' ? 'selected' : ''}>English</option></select></label>
          <label class="field" for="b-co">${t('color')}<input type="color" id="b-co" value="${esc(b.color)}" style="height:40px"></label>${f('b-tz', 'tz', timezone || Intl.DateTimeFormat().resolvedOptions().timeZone, 'text', 'ltr')}</div>
        <div class="row"><button class="btn primary" type="submit">${t('save')}</button></div></form>
      <section class="card" style="max-width:820px"><h2>${t('hookTitle')}</h2><p class="muted small">${t('hookLead')}</p>
        <div class="copy"><pre id="hk">${esc(location.origin + '/hooks/order?key=' + b.hookKey)}</pre><button class="btn sm" type="button" id="hkc">${t('copyLink')}</button></div>
        <label class="switch"><input type="checkbox" id="b-as" ${b.hookAutoSend ? 'checked' : ''}>${t('hookAuto')}</label></section>
      <form class="card" id="pw" style="max-width:480px"><h2>${t('pwTitle')}</h2><label class="field" for="pc">${t('current')}<input type="password" id="pc"></label><label class="field" for="pn">${t('next')}<input type="password" id="pn"></label><div class="err" id="pe"></div><div class="row"><button class="btn primary" type="submit">${t('change')}</button></div></form>
      <p class="muted small">Fatoora · ${esc(S.session.version)} · MIT · ${t('note')}</p></div>`;
    const saveB = async (extra = {}) => {
      S.business = (await api('/api/business', { method: 'PUT', body: { timezone: $('#b-tz').value, business: { name: $('#b-n').value, taxId: $('#b-t').value, phone: $('#b-p').value, email: $('#b-e').value, address: $('#b-a').value, paymentInfo: $('#b-pi').value, footer: $('#b-f').value, currency: $('#b-c').value, currencyName: $('#b-cn').value, currencyNameEn: $('#b-ce').value, taxLabel: $('#b-tl').value, taxRate: Number($('#b-tr').value), dueDays: Number($('#b-dd').value), invoicePrefix: $('#b-pf').value, quotePrefix: $('#b-qf').value, nextInvoice: Number($('#b-ni').value), lang: $('#b-l').value, color: $('#b-co').value, ...extra } } })).business;
    };
    $('#hkc').onclick = async () => { try { await navigator.clipboard.writeText($('#hk').textContent); toast(t('copied')); } catch { toast($('#hk').textContent); } };
    $('#b-as').onchange = async () => { await api('/api/business', { method: 'PUT', body: { business: { hookAutoSend: $('#b-as').checked } } }); toast(t('saved')); };
    $('#bf').onsubmit = async (e) => { e.preventDefault(); try { await saveB(); toast(t('saved')); } catch (err) { toast(err.message); } };
    $('#lu').onclick = () => $('#lf').click();
    $('#lf').onchange = () => { const file = $('#lf').files[0]; if (!file) return; const fr = new FileReader(); fr.onload = async () => { try { await saveB({ logo: String(fr.result) }); pSettings(main); } catch (err) { toast(err.message); } }; fr.readAsDataURL(file); };
    if ($('#lr')) $('#lr').onclick = async () => { await saveB({ logo: '' }); pSettings(main); };
    $('#pw').onsubmit = async (e) => { e.preventDefault(); try { await api('/api/password', { method: 'POST', body: { current: $('#pc').value, next: $('#pn').value } }); toast(t('saved')); } catch (err) { $('#pe').textContent = err.message; } };
  }
  boot();
})();
