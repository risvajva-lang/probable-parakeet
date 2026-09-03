/**
 * Arabic Linguistic & Ordinal Number Utilities for Cinema Window
 */

const ORDINAL_FEMININE_MAP: Record<number, string> = {
  1: 'الأولى',
  2: 'الثانية',
  3: 'الثالثة',
  4: 'الرابعة',
  5: 'الخامسة',
  6: 'السادسة',
  7: 'السابعة',
  8: 'الثامنة',
  9: 'التاسعة',
  10: 'العاشرة',
  11: 'الحادية عشرة',
  12: 'الثانية عشرة',
  13: 'الثالثة عشرة',
  14: 'الرابعة عشرة',
  15: 'الخامسة عشرة',
  16: 'السادسة عشرة',
  17: 'السابعة عشرة',
  18: 'الثامنة عشرة',
  19: 'التاسعة عشرة',
  20: 'العشرون',
  30: 'الثلاثون',
  40: 'الأربعون',
  50: 'الخمسون',
  60: 'الستون',
  70: 'السبعون',
  80: 'الثمانون',
  90: 'التسعون',
  100: 'المائة',
  200: 'المائتان',
  300: 'الثلاثمائة',
  400: 'الأربعمائة',
  500: 'الخمسمائة',
  600: 'الستمائة',
  700: 'السبعمائة',
  800: 'الثمانمائة',
  900: 'التسعمائة',
  1000: 'الألف'
};

const ORDINAL_MASCULINE_MAP: Record<number, string> = {
  1: 'الأول',
  2: 'الثاني',
  3: 'الثالث',
  4: 'الرابع',
  5: 'الخامس',
  6: 'السادس',
  7: 'السابع',
  8: 'الثامن',
  9: 'التاسع',
  10: 'العاشر',
  11: 'الحادي عشر',
  12: 'الثاني عشر',
  13: 'الثالث عشر',
  14: 'الرابع عشر',
  15: 'الخامس عشر',
  16: 'السادس عشر',
  17: 'السابع عشر',
  18: 'الثامن عشر',
  19: 'التاسع عشر',
  20: 'العشرون',
  30: 'الثلاثون',
  40: 'الأربعون',
  50: 'الخمسون',
  60: 'الستون',
  70: 'السبعون',
  80: 'الثمانون',
  90: 'التسعون',
  100: 'المائة',
  200: 'المائتان',
  300: 'الثلاثمائة',
  400: 'الأربعمائة',
  500: 'الخمسمائة',
  600: 'الستمائة',
  700: 'السبعمائة',
  800: 'الثمانمائة',
  900: 'التسعمائة',
  1000: 'الألف'
};

/**
 * Returns feminine ordinal string for episodes (e.g. 1 -> "الأولى", 10 -> "العاشرة", 11 -> "الحادية عشرة", 25 -> "الخامسة والعشرون")
 */
export function getEpisodeOrdinalWord(num: number): string {
  const n = Math.floor(num);
  if (n <= 0) return '';
  if (ORDINAL_FEMININE_MAP[n]) return ORDINAL_FEMININE_MAP[n];

  if (n > 20 && n < 100) {
    const ones = n % 10;
    const tens = Math.floor(n / 10) * 10;
    if (ones === 0) return ORDINAL_FEMININE_MAP[tens] || String(n);
    const onesWord = ones === 1 ? 'الحادية' : ORDINAL_FEMININE_MAP[ones];
    return `${onesWord} و${ORDINAL_FEMININE_MAP[tens]}`;
  }

  if (n > 100 && n < 1000) {
    const hundreds = Math.floor(n / 100) * 100;
    const remainder = n % 100;
    if (remainder === 0) return ORDINAL_FEMININE_MAP[hundreds] || String(n);
    const remainderWord = getEpisodeOrdinalWord(remainder);
    return `${remainderWord} بعد ${ORDINAL_FEMININE_MAP[hundreds]}`;
  }

  return String(n);
}

/**
 * Returns masculine ordinal string for seasons (e.g. 1 -> "الأول", 4 -> "الرابع", 12 -> "الثاني عشر")
 */
export function getSeasonOrdinalWord(num: number): string {
  const n = Math.floor(num);
  if (n <= 0) return '';
  if (ORDINAL_MASCULINE_MAP[n]) return ORDINAL_MASCULINE_MAP[n];

  if (n > 20 && n < 100) {
    const ones = n % 10;
    const tens = Math.floor(n / 10) * 10;
    if (ones === 0) return ORDINAL_MASCULINE_MAP[tens] || String(n);
    const onesWord = ones === 1 ? 'الحادي' : ORDINAL_MASCULINE_MAP[ones];
    return `${onesWord} و${ORDINAL_MASCULINE_MAP[tens]}`;
  }

  if (n > 100 && n < 1000) {
    const hundreds = Math.floor(n / 100) * 100;
    const remainder = n % 100;
    if (remainder === 0) return ORDINAL_MASCULINE_MAP[hundreds] || String(n);
    const remainderWord = getSeasonOrdinalWord(remainder);
    return `${remainderWord} بعد ${ORDINAL_MASCULINE_MAP[hundreds]}`;
  }

  return String(n);
}

/**
 * Formats duration in authentic human readable style: "2:01:12" or "121 دقيقة"
 * Never invents values if runtime is not provided.
 */
export function formatRealDuration(minutes?: number, lang: string = 'ar'): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (lang === 'ar') {
    if (h > 0 && m > 0) return `${h} س و ${m} د`;
    if (h > 0) return `${h} ساعة`;
    return `${m} دقيقة`;
  }
  
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
