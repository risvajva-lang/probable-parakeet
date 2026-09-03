/**
 * Complete Latin ASCII Slugifier and Arabic Transliteration Engine
 * 100% parity with PHP Cinema_Window_Arabic::media_slug
 */

const TITLE_DICTIONARY: Record<string, string> = {
  // Anime
  'ريزيرو': 're-zero-starting-life-in-another-world',
  'ري زيرو': 're-zero-starting-life-in-another-world',
  'الحياة في عالم مختلف من الصفر': 're-zero-starting-life-in-another-world',
  'الحياة-في-عالم-مختلف-من-الصفر': 're-zero-starting-life-in-another-world',
  'الحياة في عالم مختلف من الصفر الموسم الأول': 're-zero-starting-life-in-another-world',
  'الحياة في عالم مختلف من الصفر الموسم الثاني': 're-zero-starting-life-in-another-world',
  'الحياة في عالم مختلف من الصفر الموسم الثالث': 're-zero-starting-life-in-another-world',
  're:zero': 're-zero-starting-life-in-another-world',
  're zero': 're-zero-starting-life-in-another-world',
  'rezero': 're-zero-starting-life-in-another-world',
  're:zero - starting life in another world': 're-zero-starting-life-in-another-world',
  'هجوم العمالقة': 'attack-on-titan',
  'هجوم-العمالقة': 'attack-on-titan',
  'shingeki no kyojin': 'attack-on-titan',
  'ون بيس': 'one-piece',
  'ون-بيس': 'one-piece',
  'ونبيس': 'one-piece',
  'one piece': 'one-piece',
  'المحقق كونان': 'detective-conan',
  'المحقق-كونان': 'detective-conan',
  'كونان': 'detective-conan',
  'قاتل الشياطين': 'demon-slayer',
  'قاتل-الشياطين': 'demon-slayer',
  'كيميتسو نو يايبا': 'demon-slayer',
  'kimetsu no yaiba': 'demon-slayer',
  'ناروتو': 'naruto',
  'ناروتو شيبودن': 'naruto-shippuden',
  'ناروتو-شيبودن': 'naruto-shippuden',
  'بوروتو': 'boruto-naruto-next-generations',
  'بليتش': 'bleach',
  'بليتش حرب دم الألف عام': 'bleach-thousand-year-blood-war',
  'دراغون بول': 'dragon-ball',
  'دراغون-بول': 'dragon-ball',
  'دراغون بول زد': 'dragon-ball-z',
  'دراغون بول سوبر': 'dragon-ball-super',
  'صياد ضد صياد': 'hunter-x-hunter',
  'هنتر اكس هنتر': 'hunter-x-hunter',
  'هنتر-اكس-هنتر': 'hunter-x-hunter',
  'القناص': 'hunter-x-hunter',
  'مذكرة الموت': 'death-note',
  'مذكرة-الموت': 'death-note',
  'دفتر الموت': 'death-note',
  'death note': 'death-note',
  'طوكيو غول': 'tokyo-ghoul',
  'طوكيو-غول': 'tokyo-ghoul',
  'سولو ليفلينج': 'solo-leveling',
  'سولو ليفلينغ': 'solo-leveling',
  'سولو-ليفلينج': 'solo-leveling',
  'النهوض الفردي': 'solo-leveling',
  'solo leveling': 'solo-leveling',
  'جوجوتسو كايسن': 'jujutsu-kaisen',
  'جوجوتسو-كايسن': 'jujutsu-kaisen',
  'جوجيتسو كايسن': 'jujutsu-kaisen',
  'jujutsu kaisen': 'jujutsu-kaisen',
  'رجل المنشار': 'chainsaw-man',
  'رجل-المنشار': 'chainsaw-man',
  'chainsaw man': 'chainsaw-man',
  'أكاديمية بطلي': 'my-hero-academia',
  'اكاديمية بطلي': 'my-hero-academia',
  'أكاديمية-بطلي': 'my-hero-academia',
  'boku no hero academia': 'my-hero-academia',
  'سباي اكس فاميلي': 'spy-x-family',
  'عائلة الجاسوس': 'spy-x-family',
  'بلو لوك': 'blue-lock',
  'القفل الأزرق': 'blue-lock',
  'هايكيو': 'haikyuu',
  'فينلاند ساغا': 'vinland-saga',
  'ملحمة فينلاند': 'vinland-saga',
  'فول ميتال الكيميائي': 'fullmetal-alchemist-brotherhood',
  'الكيميائي المعدني الكامل': 'fullmetal-alchemist-brotherhood',
  'كود غياس': 'code-geass',
  'سورد ارت اونلاين': 'sword-art-online',
  'طوكيو ريفينجرز': 'tokyo-revengers',
  'بلاك كلوفر': 'black-clover',
  'البرسيم الأسود': 'black-clover',
  'جينتاما': 'gintama',
  'فريرين': 'frieren-beyond-journeys-end',
  'فريرين ما بعد نهاية الرحلة': 'frieren-beyond-journeys-end',
  'موشوكو تينسي': 'mushoku-tensei-jobless-reincarnation',
  'تناسخ العاطل': 'mushoku-tensei-jobless-reincarnation',
  'كايجو رقم 8': 'kaiju-no-8',
  'داندادان': 'dandadan',
  'أوشي نو كو': 'oshi-no-ko',
  'ستاينز غيت': 'steins-gate',
  'جنة الجحيم': 'hells-paradise',
  'ويند بريكر': 'wind-breaker',
  'سبيس تون': 'spacetoon',
  'سبيستون': 'spacetoon',

  // TV Shows
  'صراع العروش': 'game-of-thrones',
  'آل التنين': 'house-of-the-dragon',
  'بيت التنين': 'house-of-the-dragon',
  'بريكنج باد': 'breaking-bad',
  'اختلال ضال': 'breaking-bad',
  'بيكي بلاندرز': 'peaky-blinders',
  'الأقنعة الهزيلة': 'peaky-blinders',
  'فايكنج': 'vikings',
  'فايكنغز': 'vikings',
  'سترينجر ثينقز': 'stranger-things',
  'أشياء غريبة': 'stranger-things',
  'ذا لاست أوف أس': 'the-last-of-us',
  'آخرنا': 'the-last-of-us',
  'ذا بويز': 'the-boys',
  'الرفاق': 'the-boys',
  'من الأفضل الاتصال بسول': 'better-call-saul',
  'بتر كول سول': 'better-call-saul',
  'لعبة الحبار': 'squid-game',
  'سكويد جيم': 'squid-game',
  'التاج': 'the-crown',
  'موني هايست': 'money-heist',
  'لا كاسا دي بابيل': 'money-heist',
  'البروفيسور': 'money-heist',
  'المرآة السوداء': 'black-mirror',
  'بلاك ميرور': 'black-mirror',
  'دارك': 'dark',
  'سوبرناتشورال': 'supernatural',
  'خارق للطبيعة': 'supernatural',
  'الموتى السائرون': 'the-walking-dead',
  'ذا ووكينغ ديد': 'the-walking-dead',
  'فصل النخبة': 'classroom-of-the-elite',
  'سيد الخواتم خواتم القوة': 'the-lord-of-the-rings-the-rings-of-power',
  'خواتم القوة': 'the-rings-of-power',

  // Movies
  'انسبشن': 'inception',
  'استهلال': 'inception',
  'بداية': 'inception',
  'انترستيلر': 'interstellar',
  'بين النجوم': 'interstellar',
  'الفارس الأسود': 'the-dark-knight',
  'أوبنهايمر': 'oppenheimer',
  'باربي': 'barbie',
  'أفاتار': 'avatar',
  'افاتار': 'avatar',
  'أفاتار طريق الماء': 'avatar-the-way-of-water',
  'العراب': 'the-godfather',
  'الخلاص من شاوشانك': 'the-shawshank-redemption',
  'خيال رخيص': 'pulp-fiction',
  'بالب فيكشن': 'pulp-fiction',
  'نادي القتال': 'fight-club',
  'فاينل ديستنيشن': 'final-destination',
  'الوجهة النهائية': 'final-destination',
  'المصفوفة': 'the-matrix',
  'ماتريكس': 'the-matrix',
  'سبايدرمان': 'spider-man',
  'سبايدر مان': 'spider-man',
  'الرجل العنكبوت': 'spider-man',
  'باتمان': 'batman',
  'الرجل الوطواط': 'batman',
  'سوبرمان': 'superman',
  'الرجل الخارق': 'superman',
  'جوكر': 'joker',
  'الجوكر': 'joker',
  'المنتقمون': 'the-avengers',
  'أفنجرز': 'the-avengers',
  'حرب النجوم': 'star-wars',
  'ستار وورز': 'star-wars',
  'سيد الخواتم': 'the-lord-of-the-rings',
  'لورد أوف ذا رينجز': 'the-lord-of-the-rings',
  'هاري بوتر': 'harry-potter',
  'جلادياتور': 'gladiator',
  'المصارع': 'gladiator',
  'قراصنة الكاريبي': 'pirates-of-the-caribbean',
  'تيتانيك': 'titanic',
  'تيتانك': 'titanic',
  'الأوديسة': 'the-odyssey',
  'الاوديسة': 'the-odyssey',
  'باكرومز': 'backrooms',
  'مصيدة فئران': 'mousetrap',
  'مصيدة الفئران': 'the-mousetrap'
};

const PHONETIC_MAP: Record<string, string> = {
  'أ': 'a', 'إ': 'e', 'آ': 'aa', 'ا': 'a', 'ء': 'a', 'ئ': 'e', 'ؤ': 'o', 'ى': 'a',
  'ب': 'b', 'ت': 't', 'ة': 'a', 'ث': 'th',
  'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
  'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
  'م': 'm', 'ن': 'n', 'ه': 'h',
  'و': 'w', 'ي': 'y',
  'پ': 'p', 'چ': 'ch', 'ژ': 'zh', 'گ': 'g', 'ڤ': 'v'
};

/**
 * Remove Arabic tashkeel / harakat / diacritics
 */
export function removeArabicTashkeel(text: string): string {
  if (!text) return '';
  return text.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
}

/**
 * Clean string to strict ASCII alphanumeric with hyphens (a-z, 0-9, -)
 */
export function cleanAscii(str: string): string {
  if (!str) return '';
  // Normalize unicode accents
  const normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Transliterate Arabic text into Latin characters
 */
export function transliterateArabic(text: string): string {
  if (!text) return '';
  let cleaned = removeArabicTashkeel(text);

  // Normalize prefix "ال" -> "al-"
  cleaned = cleaned.replace(/(?:^|\s)ال/g, ' al-');

  // Strip common noisy words
  cleaned = cleaned.replace(/\b(?:الموسم|موسم|الحلقة|حلقة|فيلم|مسلسل|أنمي|انمي|مترجم|مدبلج)\b/g, '');

  let result = '';
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (PHONETIC_MAP[char]) {
      result += PHONETIC_MAP[char];
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Check if a string is already a clean Latin slug
 */
export function isCleanLatinSlug(str: string): boolean {
  if (!str) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str);
}

/**
 * Generate a clean Latin-only ASCII slug for media items
 */
export function slugify(title?: string, originalTitle?: string): string {
  // 1. Check Dictionary mappings first (to handle known Arabic and CJK titles perfectly)
  if (title) {
    const norm = removeArabicTashkeel(title.trim().toLowerCase());
    const normSpaced = norm.replace(/[\s_-]+/g, ' ');
    if (TITLE_DICTIONARY[norm]) return TITLE_DICTIONARY[norm];
    if (TITLE_DICTIONARY[normSpaced]) return TITLE_DICTIONARY[normSpaced];
    for (const [arKey, latinVal] of Object.entries(TITLE_DICTIONARY)) {
      if (norm === arKey || normSpaced === arKey || norm.startsWith(arKey) || normSpaced.startsWith(arKey)) {
        return latinVal;
      }
    }
  }

  if (originalTitle) {
    const normOrig = removeArabicTashkeel(originalTitle.trim().toLowerCase());
    const normOrigSpaced = normOrig.replace(/[\s_-]+/g, ' ');
    if (TITLE_DICTIONARY[normOrig]) return TITLE_DICTIONARY[normOrig];
    if (TITLE_DICTIONARY[normOrigSpaced]) return TITLE_DICTIONARY[normOrigSpaced];
    for (const [arKey, latinVal] of Object.entries(TITLE_DICTIONARY)) {
      if (normOrig === arKey || normOrigSpaced === arKey || normOrig.startsWith(arKey) || normOrigSpaced.startsWith(arKey)) {
        return latinVal;
      }
    }
  }

  // 2. If originalTitle is clean Latin (without CJK/Japanese characters)
  if (originalTitle && /[a-zA-Z]/.test(originalTitle)) {
    const hasCjk = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(originalTitle);
    if (!hasCjk) {
      const clean = cleanAscii(originalTitle);
      if (clean && clean.length >= 3 && clean !== 'watch') {
        return clean;
      }
    }
  }

  // 3. If title is clean Latin
  if (title && /[a-zA-Z]/.test(title)) {
    const hasArabic = /[\u0600-\u06FF]/.test(title);
    if (!hasArabic) {
      const clean = cleanAscii(title);
      if (clean && clean.length >= 3 && clean !== 'watch') {
        return clean;
      }
    }
  }

  // 4. Algorithmic Transliteration of Arabic title
  if (title) {
    const transliterated = transliterateArabic(title);
    const clean = cleanAscii(transliterated);
    if (clean && clean.length >= 2) {
      return clean;
    }
  }

  if (originalTitle) {
    const transliteratedOrig = transliterateArabic(originalTitle);
    const cleanOrig = cleanAscii(transliteratedOrig);
    if (cleanOrig && cleanOrig.length >= 2) {
      return cleanOrig;
    }
  }

  return 'media';
}

/**
 * Extracts or generates the clean slug from a MediaItem
 */
export function getMediaSlug(media: { title?: string; originalTitle?: string; slug?: string }): string {
  if (media.slug && isCleanLatinSlug(media.slug)) {
    return media.slug;
  }
  return slugify(media.title, media.originalTitle);
}
