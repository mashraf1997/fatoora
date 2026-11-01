// Amount in words ("tafqeet") for invoices, in Arabic and English.

const AR_ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const AR_TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const AR_HUNDREDS = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
// [singular, dual, plural (3-10), singular accusative (11+)]
const AR_SCALES = [null, ['ألف', 'ألفان', 'آلاف', 'ألف'], ['مليون', 'مليونان', 'ملايين', 'مليون'], ['مليار', 'ملياران', 'مليارات', 'مليار']];

function arBelowThousand(n) {
  const parts = [];
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h) parts.push(AR_HUNDREDS[h]);
  if (r) {
    if (r < 20) parts.push(AR_ONES[r]);
    else {
      const o = r % 10;
      parts.push(o ? `${AR_ONES[o]} و${AR_TENS[Math.floor(r / 10)]}` : AR_TENS[Math.floor(r / 10)]);
    }
  }
  return parts.join(' و');
}

export function arabicWords(n) {
  n = Math.floor(Math.abs(Number(n) || 0));
  if (n === 0) return 'صفر';
  const groups = [];
  let scale = 0;
  while (n > 0 && scale < AR_SCALES.length) {
    const g = n % 1000;
    if (g) {
      if (scale === 0) groups.unshift(arBelowThousand(g));
      else {
        const [one, two, few, many] = AR_SCALES[scale];
        let text;
        if (g === 1) text = one;
        else if (g === 2) text = two;
        else if (g >= 3 && g <= 10) text = `${arBelowThousand(g)} ${few}`;
        else text = `${arBelowThousand(g)} ${many}`;
        groups.unshift(text);
      }
    }
    n = Math.floor(n / 1000);
    scale += 1;
  }
  return groups.join(' و');
}

const EN_ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const EN_SCALES = ['', 'thousand', 'million', 'billion'];

function enBelowThousand(n) {
  const out = [];
  if (n >= 100) out.push(`${EN_ONES[Math.floor(n / 100)]} hundred`);
  const r = n % 100;
  if (r) out.push(r < 20 ? EN_ONES[r] : EN_TENS[Math.floor(r / 10)] + (r % 10 ? `-${EN_ONES[r % 10]}` : ''));
  return out.join(' ');
}

export function englishWords(n) {
  n = Math.floor(Math.abs(Number(n) || 0));
  if (n === 0) return 'zero';
  const parts = [];
  let scale = 0;
  while (n > 0 && scale < EN_SCALES.length) {
    const g = n % 1000;
    if (g) parts.unshift(enBelowThousand(g) + (EN_SCALES[scale] ? ` ${EN_SCALES[scale]}` : ''));
    n = Math.floor(n / 1000);
    scale += 1;
  }
  return parts.join(' ');
}

/** "فقط ألف وخمسمائة جنيه و 50/100 لا غير" / "One thousand five hundred dollars and 50/100 only" */
export function amountInWords(amount, currencyName, lang) {
  const a = Math.round(Math.abs(Number(amount) || 0) * 100);
  const whole = Math.floor(a / 100);
  const cents = a % 100;
  if (lang === 'en') {
    const w = englishWords(whole);
    return `${w[0].toUpperCase()}${w.slice(1)} ${currencyName || ''}${cents ? ` and ${String(cents).padStart(2, '0')}/100` : ''} only`.replace(/\s+/g, ' ').trim();
  }
  return `فقط ${arabicWords(whole)} ${currencyName || ''}${cents ? ` و ${String(cents).padStart(2, '0')}/100` : ''} لا غير`.replace(/\s+/g, ' ').trim();
}
