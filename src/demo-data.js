import crypto from 'node:crypto';
import { defaultData } from './app.js';

export function buildDemo(demo) {
  const d = defaultData();
  const ar = demo.lang === 'ar';
  Object.assign(d.business, ar
    ? { name: 'استوديو نيل للتصميم', address: 'المعادي، القاهرة', phone: '+20 100 000 0000', email: 'hello@nile.studio', taxRate: 14, paymentInfo: 'إنستاباي: nile@instapay\nبنك مصر: 1234 5678 9012', footer: 'شكراً لتعاملكم معنا' }
    : { name: 'Nile Studio', address: 'Cairo, Egypt', phone: '+20 100 000 0000', email: 'hello@nile.studio', currency: 'USD', currencyName: 'دولار أمريكي', currencyNameEn: 'US dollars', taxLabel: 'Tax', taxRate: 0, paymentInfo: 'Bank transfer: 1234 5678 9012', lang: 'en', footer: 'Thank you for your business' });
  const client = (name, phone, email) => { const c = { id: crypto.randomUUID(), name, company: '', phone, email, address: '', taxId: '', notes: '', createdAt: new Date().toISOString() }; d.clients.push(c); return c; };
  const c1 = client(ar ? 'شركة الأمل للتجارة' : 'Hope Trading', '+201112223333', 'info@amal.co');
  const c2 = client(ar ? 'كافيه بين' : 'Bean Café', '+201005556666', '');
  const c3 = client(ar ? 'عيادة النور' : 'Noor Clinic', '+201227778888', '');
  const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  const doc = (type, c, items, { issued, due, status, paid = [], discount = 0 } = {}) => {
    const n = type === 'invoice' ? `${d.business.invoicePrefix}${String(d.business.nextInvoice++).padStart(4, '0')}` : `${d.business.quotePrefix}${String(d.business.nextQuote++).padStart(4, '0')}`;
    d.docs.push({ id: crypto.randomUUID(), token: crypto.randomBytes(16).toString('base64url'), type, number: n, clientId: c.id, issueDate: day(issued), dueDate: type === 'invoice' ? day(due) : '', validUntil: type === 'quote' ? day(issued - 30) : '', items: items.map(([desc, qty, price]) => ({ desc, qty, price, unit: '' })), discount, taxRate: d.business.taxRate, notes: '', lang: d.business.lang, status, payments: paid.map(([amount, ago]) => ({ id: crypto.randomUUID(), amount, date: day(ago), method: ar ? 'تحويل' : 'Transfer', note: '' })), createdAt: new Date(Date.now() - issued * 864e5).toISOString() });
  };
  const L = ar ? [['تصميم لوجو + 3 مقترحات', 1, 3000], ['هوية بصرية كاملة', 1, 4500], ['تصميم بوستات سوشيال ميديا', 12, 150], ['منيو مطبوع', 1, 2200], ['موقع إلكتروني (5 صفحات)', 1, 12000], ['استضافة سنة', 1, 1800]] : [['Logo design + 3 concepts', 1, 300], ['Full brand identity', 1, 450], ['Social media posts', 12, 15], ['Printed menu', 1, 220], ['Website (5 pages)', 1, 1200], ['Hosting, 1 year', 1, 180]];
  doc('invoice', c1, [L[0], L[1], L[2]], { issued: 20, due: 6, status: 'sent', paid: [[ar ? 5000 : 500, 10]], discount: ar ? 300 : 30 });
  doc('invoice', c2, [L[3]], { issued: 45, due: 31, status: 'sent' });
  doc('invoice', c3, [L[4], L[5]], { issued: 60, due: 46, status: 'sent', paid: [[ar ? 15732 : 1380, 40]] });
  doc('invoice', c2, [L[2]], { issued: 1, due: -13, status: 'draft' });
  doc('quote', c3, [L[0], L[1]], { issued: 3, status: 'sent' });
  doc('quote', c1, [L[4]], { issued: 8, status: 'accepted' });
  return d;
}
