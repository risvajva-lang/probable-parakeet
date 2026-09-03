<?php
/**
 * Arabic Linguistic, Number Conversion & Latin ASCII Slug Engine for Cinema Window
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_Arabic {

    private static $ordinal_feminine = [
        1   => 'الأولى',
        2   => 'الثانية',
        3   => 'الثالثة',
        4   => 'الرابعة',
        5   => 'الخامسة',
        6   => 'السادسة',
        7   => 'السابعة',
        8   => 'الثامنة',
        9   => 'التاسعة',
        10  => 'العاشرة',
        11  => 'الحادية عشرة',
        12  => 'الثانية عشرة',
        13  => 'الثالثة عشرة',
        14  => 'الرابعة عشرة',
        15  => 'الخامسة عشرة',
        16  => 'السادسة عشرة',
        17  => 'السابعة عشرة',
        18  => 'الثامنة عشرة',
        19  => 'التاسعة عشرة',
        20  => 'العشرون',
        30  => 'الثلاثون',
        40  => 'الأربعون',
        50  => 'الخمسون',
        60  => 'الستون',
        70  => 'السبعون',
        80  => 'الثمانون',
        90  => 'التسعون',
        100 => 'المائة',
        200 => 'المائتان',
        300 => 'الثلاثمائة',
        400 => 'الأربعمائة',
        500 => 'الخمسمائة',
        600 => 'الستمائة',
        700 => 'السبعمائة',
        800 => 'الثمانمائة',
        900 => 'التسعمائة',
        1000 => 'الألف'
    ];

    private static $ordinal_masculine = [
        1   => 'الأول',
        2   => 'الثاني',
        3   => 'الثالث',
        4   => 'الرابع',
        5   => 'الخامس',
        6   => 'السادس',
        7   => 'السابع',
        8   => 'الثامن',
        9   => 'التاسع',
        10  => 'العاشر',
        11  => 'الحادي عشر',
        12  => 'الثاني عشر',
        13  => 'الثالث عشر',
        14  => 'الرابع عشر',
        15  => 'الخامس عشر',
        16  => 'السادس عشر',
        17  => 'السابع عشر',
        18  => 'الثامن عشر',
        19  => 'التاسع عشر',
        20  => 'العشرون',
        30  => 'الثلاثون',
        40  => 'الأربعون',
        50  => 'الخمسون',
        60  => 'الستون',
        70  => 'السبعون',
        80  => 'الثمانون',
        90  => 'التسعون',
        100 => 'المائة',
        200 => 'المائتان',
        300 => 'الثلاثمائة',
        400 => 'الأربعمائة',
        500 => 'الخمسمائة',
        600 => 'الستمائة',
        700 => 'السبعمائة',
        800 => 'الثمانمائة',
        900 => 'التسعمائة',
        1000 => 'الألف'
    ];

    /**
     * Dictionary of common Arabic media titles and their standard Latin/English slugs
     */
    private static $title_dictionary = [
        // Anime
        'ريزيرو' => 're-zero-starting-life-in-another-world',
        'ري زيرو' => 're-zero-starting-life-in-another-world',
        'الحياة في عالم مختلف من الصفر' => 're-zero-starting-life-in-another-world',
        'الحياة-في-عالم-مختلف-من-الصفر' => 're-zero-starting-life-in-another-world',
        'الحياة في عالم مختلف من الصفر الموسم الأول' => 're-zero-starting-life-in-another-world',
        'الحياة في عالم مختلف من الصفر الموسم الثاني' => 're-zero-starting-life-in-another-world',
        'الحياة في عالم مختلف من الصفر الموسم الثالث' => 're-zero-starting-life-in-another-world',
        're:zero' => 're-zero-starting-life-in-another-world',
        're zero' => 're-zero-starting-life-in-another-world',
        'rezero' => 're-zero-starting-life-in-another-world',
        're:zero - starting life in another world' => 're-zero-starting-life-in-another-world',
        'هجوم العمالقة' => 'attack-on-titan',
        'هجوم-العمالقة' => 'attack-on-titan',
        'shingeki no kyojin' => 'attack-on-titan',
        'ون بيس' => 'one-piece',
        'ون-بيس' => 'one-piece',
        'ونبيس' => 'one-piece',
        'one piece' => 'one-piece',
        'المحقق كونان' => 'detective-conan',
        'المحقق-كونان' => 'detective-conan',
        'كونان' => 'detective-conan',
        'قاتل الشياطين' => 'demon-slayer',
        'قاتل-الشياطين' => 'demon-slayer',
        'كيميتسو نو يايبا' => 'demon-slayer',
        'kimetsu no yaiba' => 'demon-slayer',
        'ناروتو' => 'naruto',
        'ناروتو شيبودن' => 'naruto-shippuden',
        'ناروتو-شيبودن' => 'naruto-shippuden',
        'بوروتو' => 'boruto-naruto-next-generations',
        'بليتش' => 'bleach',
        'بليتش حرب دم الألف عام' => 'bleach-thousand-year-blood-war',
        'دراغون بول' => 'dragon-ball',
        'دراغون-بول' => 'dragon-ball',
        'دراغون بول زد' => 'dragon-ball-z',
        'دراغون بول سوبر' => 'dragon-ball-super',
        'صياد ضد صياد' => 'hunter-x-hunter',
        'هنتر اكس هنتر' => 'hunter-x-hunter',
        'هنتر-اكس-هنتر' => 'hunter-x-hunter',
        'القناص' => 'hunter-x-hunter',
        'مذكرة الموت' => 'death-note',
        'مذكرة-الموت' => 'death-note',
        'دفتر الموت' => 'death-note',
        'death note' => 'death-note',
        'طوكيو غول' => 'tokyo-ghoul',
        'طوكيو-غول' => 'tokyo-ghoul',
        'سولو ليفلينج' => 'solo-leveling',
        'سولو ليفلينغ' => 'solo-leveling',
        'سولو-ليفلينج' => 'solo-leveling',
        'النهوض الفردي' => 'solo-leveling',
        'solo leveling' => 'solo-leveling',
        'جوجوتسو كايسن' => 'jujutsu-kaisen',
        'جوجوتسو-كايسن' => 'jujutsu-kaisen',
        'جوجيتسو كايسن' => 'jujutsu-kaisen',
        'jujutsu kaisen' => 'jujutsu-kaisen',
        'رجل المنشار' => 'chainsaw-man',
        'رجل-المنشار' => 'chainsaw-man',
        'chainsaw man' => 'chainsaw-man',
        'أكاديمية بطلي' => 'my-hero-academia',
        'اكاديمية بطلي' => 'my-hero-academia',
        'أكاديمية-بطلي' => 'my-hero-academia',
        'boku no hero academia' => 'my-hero-academia',
        'سباي اكس فاميلي' => 'spy-x-family',
        'عائلة الجاسوس' => 'spy-x-family',
        'بلو لوك' => 'blue-lock',
        'القفل الأزرق' => 'blue-lock',
        'هايكيو' => 'haikyuu',
        'فينلاند ساغا' => 'vinland-saga',
        'ملحمة فينلاند' => 'vinland-saga',
        'فول ميتال الكيميائي' => 'fullmetal-alchemist-brotherhood',
        'الكيميائي المعدني الكامل' => 'fullmetal-alchemist-brotherhood',
        'كود غياس' => 'code-geass',
        'سورد ارت اونلاين' => 'sword-art-online',
        'طوكيو ريفينجرز' => 'tokyo-revengers',
        'بلاك كلوفر' => 'black-clover',
        'البرسيم الأسود' => 'black-clover',
        'جينتاما' => 'gintama',
        'فريرين' => 'frieren-beyond-journeys-end',
        'فريرين ما بعد نهاية الرحلة' => 'frieren-beyond-journeys-end',
        'موشوكو تينسي' => 'mushoku-tensei-jobless-reincarnation',
        'تناسخ العاطل' => 'mushoku-tensei-jobless-reincarnation',
        'كايجو رقم 8' => 'kaiju-no-8',
        'داندادان' => 'dandadan',
        'أوشي نو كو' => 'oshi-no-ko',
        'ستاينز غيت' => 'steins-gate',
        'جنة الجحيم' => 'hells-paradise',
        'ويند بريكر' => 'wind-breaker',
        'سبيس تون' => 'spacetoon',
        'سبيستون' => 'spacetoon',

        // TV Shows
        'صراع العروش' => 'game-of-thrones',
        'آل التنين' => 'house-of-the-dragon',
        'بيت التنين' => 'house-of-the-dragon',
        'بريكنج باد' => 'breaking-bad',
        'اختلال ضال' => 'breaking-bad',
        'بيكي بلاندرز' => 'peaky-blinders',
        'الأقنعة الهزيلة' => 'peaky-blinders',
        'فايكنج' => 'vikings',
        'فايكنغز' => 'vikings',
        'سترينجر ثينقز' => 'stranger-things',
        'أشياء غريبة' => 'stranger-things',
        'ذا لاست أوف أس' => 'the-last-of-us',
        'آخرنا' => 'the-last-of-us',
        'ذا بويز' => 'the-boys',
        'الرفاق' => 'the-boys',
        'من الأفضل الاتصال بسول' => 'better-call-saul',
        'بتر كول سول' => 'better-call-saul',
        'لعبة الحبار' => 'squid-game',
        'سكويد جيم' => 'squid-game',
        'التاج' => 'the-crown',
        'موني هايست' => 'money-heist',
        'لا كاسا دي بابيل' => 'money-heist',
        'البروفيسور' => 'money-heist',
        'المرآة السوداء' => 'black-mirror',
        'بلاك ميرور' => 'black-mirror',
        'دارك' => 'dark',
        'سوبرناتشورال' => 'supernatural',
        'خارق للطبيعة' => 'supernatural',
        'الموتى السائرون' => 'the-walking-dead',
        'ذا ووكينغ ديد' => 'the-walking-dead',
        'فصل النخبة' => 'classroom-of-the-elite',
        'سيد الخواتم خواتم القوة' => 'the-lord-of-the-rings-the-rings-of-power',
        'خواتم القوة' => 'the-rings-of-power',

        // Movies
        'انسبشن' => 'inception',
        'استهلال' => 'inception',
        'بداية' => 'inception',
        'انترستيلر' => 'interstellar',
        'بين النجوم' => 'interstellar',
        'الفارس الأسود' => 'the-dark-knight',
        'أوبنهايمر' => 'oppenheimer',
        'باربي' => 'barbie',
        'أفاتار' => 'avatar',
        'افاتار' => 'avatar',
        'أفاتار طريق الماء' => 'avatar-the-way-of-water',
        'العراب' => 'the-godfather',
        'الخلاص من شاوشانك' => 'the-shawshank-redemption',
        'خيال رخيص' => 'pulp-fiction',
        'بالب فيكشن' => 'pulp-fiction',
        'نادي القتال' => 'fight-club',
        'فاينل ديستنيشن' => 'final-destination',
        'الوجهة النهائية' => 'final-destination',
        'المصفوفة' => 'the-matrix',
        'ماتريكس' => 'the-matrix',
        'سبايدرمان' => 'spider-man',
        'سبايدر مان' => 'spider-man',
        'الرجل العنكبوت' => 'spider-man',
        'باتمان' => 'batman',
        'الرجل الوطواط' => 'batman',
        'سوبرمان' => 'superman',
        'الرجل الخارق' => 'superman',
        'جوكر' => 'joker',
        'الجوكر' => 'joker',
        'المنتقمون' => 'the-avengers',
        'أفنجرز' => 'the-avengers',
        'حرب النجوم' => 'star-wars',
        'ستار وورز' => 'star-wars',
        'سيد الخواتم' => 'the-lord-of-the-rings',
        'لورد أوف ذا رينجز' => 'the-lord-of-the-rings',
        'هاري بوتر' => 'harry-potter',
        'جلادياتور' => 'gladiator',
        'المصارع' => 'gladiator',
        'قراصنة الكاريبي' => 'pirates-of-the-caribbean',
        'تيتانيك' => 'titanic',
        'تيتانك' => 'titanic',
        'الأوديسة' => 'the-odyssey',
        'الاوديسة' => 'the-odyssey',
        'باكرومز' => 'backrooms',
        'مصيدة فئران' => 'mousetrap',
        'مصيدة الفئران' => 'the-mousetrap'
    ];

    /**
     * Complete Arabic-to-Latin phonetic character mapping for transliteration
     */
    private static $phonetic_char_map = [
        // Hamzas and Alefs
        'أ' => 'a', 'إ' => 'e', 'آ' => 'aa', 'ا' => 'a', 'ء' => 'a', 'ئ' => 'e', 'ؤ' => 'o', 'ى' => 'a',
        // Consonants
        'ب' => 'b', 'ت' => 't', 'ة' => 'a', 'ث' => 'th',
        'ج' => 'j', 'ح' => 'h', 'خ' => 'kh',
        'د' => 'd', 'ذ' => 'dh', 'ر' => 'r', 'ز' => 'z',
        'س' => 's', 'ش' => 'sh', 'ص' => 's', 'ض' => 'd',
        'ط' => 't', 'ظ' => 'z', 'ع' => 'a', 'غ' => 'gh',
        'ف' => 'f', 'ق' => 'q', 'ك' => 'k', 'ل' => 'l',
        'م' => 'm', 'ن' => 'n', 'ه' => 'h',
        'و' => 'w', 'ي' => 'y',
        // Persian / Urdu additions
        'پ' => 'p', 'چ' => 'ch', 'ژ' => 'zh', 'گ' => 'g', 'ڤ' => 'v'
    ];

    /**
     * Get feminine ordinal word (used for episodes "الحلقة العاشرة")
     */
    public static function get_episode_ordinal($num) {
        $num = intval($num);
        if ($num <= 0) return '';
        if (isset(self::$ordinal_feminine[$num])) {
            return self::$ordinal_feminine[$num];
        }
        if ($num > 20 && $num < 100) {
            $ones = $num % 10;
            $tens = intval($num / 10) * 10;
            if ($ones === 0) {
                return self::$ordinal_feminine[$tens] ?? (string)$num;
            }
            $ones_str = ($ones === 1) ? 'الحادية' : (self::$ordinal_feminine[$ones] ?? '');
            return $ones_str . ' و' . (self::$ordinal_feminine[$tens] ?? '');
        }
        if ($num > 100 && $num < 1000) {
            $hundreds = intval($num / 100) * 100;
            $remainder = $num % 100;
            if ($remainder === 0) {
                return self::$ordinal_feminine[$hundreds] ?? (string)$num;
            }
            $rem_word = self::get_episode_ordinal($remainder);
            return $rem_word . ' بعد ' . (self::$ordinal_feminine[$hundreds] ?? '');
        }
        return (string)$num;
    }

    /**
     * Get masculine ordinal word (used for seasons "الموسم الرابع")
     */
    public static function get_season_ordinal($num) {
        $num = intval($num);
        if ($num <= 0) return '';
        if (isset(self::$ordinal_masculine[$num])) {
            return self::$ordinal_masculine[$num];
        }
        if ($num > 20 && $num < 100) {
            $ones = $num % 10;
            $tens = intval($num / 10) * 10;
            if ($ones === 0) {
                return self::$ordinal_masculine[$tens] ?? (string)$num;
            }
            $ones_str = ($ones === 1) ? 'الحادي' : (self::$ordinal_masculine[$ones] ?? '');
            return $ones_str . ' و' . (self::$ordinal_masculine[$tens] ?? '');
        }
        if ($num > 100 && $num < 1000) {
            $hundreds = intval($num / 100) * 100;
            $remainder = $num % 100;
            if ($remainder === 0) {
                return self::$ordinal_masculine[$hundreds] ?? (string)$num;
            }
            $rem_word = self::get_season_ordinal($remainder);
            return $rem_word . ' بعد ' . (self::$ordinal_masculine[$hundreds] ?? '');
        }
        return (string)$num;
    }

    /**
     * Format real runtime duration in hours & minutes
     */
    public static function format_duration($minutes) {
        $minutes = intval($minutes);
        if ($minutes <= 0) return '';
        $h = floor($minutes / 60);
        $m = $minutes % 60;
        if ($h > 0 && $m > 0) return sprintf('%d س و %d د', $h, $m);
        if ($h > 0) return sprintf('%d ساعة', $h);
        return sprintf('%d دقيقة', $m);
    }

    /**
     * Check if a string is a clean ASCII Latin slug (a-z, 0-9, -)
     */
    public static function is_clean_ascii_slug($str) {
        if (empty($str)) return false;
        return (bool) preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $str);
    }

    public static function is_clean_latin_slug($str) {
        return self::is_clean_ascii_slug($str);
    }

    /**
     * Transliterate Arabic text into clean phonetic Latin representation
     */
    public static function transliterate_arabic($arabic_text) {
        if (empty($arabic_text)) return '';

        // 1. Remove diacritics / Tashkeel / Tatweel / Harakat
        $text = preg_replace('/[\x{064B}-\x{065F}\x{0670}\x{0640}]/u', '', $arabic_text);

        // 2. Normalize common Arabic prefixes & phrases
        // Definite article "ال" at beginning of string or after whitespace
        $text = preg_replace('/(?:^|\s)ال/u', ' al-', $text);

        // Common stopwords & season/episode labels to remove or clean
        $text = preg_replace('/\b(?:الموسم|موسم|الحلقة|حلقة|فيلم|مسلسل|أنمي|انمي|مترجم|مدبلج)\b/u', '', $text);

        // 3. Transliterate character by character
        $out = '';
        $len = mb_strlen($text, 'UTF-8');
        for ($i = 0; $i < $len; $i++) {
            $char = mb_substr($text, $i, 1, 'UTF-8');
            if (isset(self::$phonetic_char_map[$char])) {
                $out .= self::$phonetic_char_map[$char];
            } else {
                $out .= $char;
            }
        }

        return $out;
    }

    /**
     * Standard ASCII slug cleanup: strips non-alphanumeric, converts spaces to hyphens
     */
    public static function clean_ascii($str) {
        if (empty($str)) return '';
        // Convert accented characters to plain ASCII if possible
        $str = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $str);
        $clean = strtolower($str);
        $clean = preg_replace('/[^a-z0-9\s-]/', '', $clean);
        $clean = preg_replace('/[\s-]+/', '-', $clean);
        $clean = trim($clean, '-');
        return $clean;
    }

    /**
     * Build a stable Latin-only public slug.
     * Priority order:
     * 1. Known dictionary title mappings (e.g. "الحياة في عالم مختلف من الصفر" -> "re-zero-starting-life-in-another-world")
     * 2. English translation from TMDb translations array
     * 3. Original title if it contains clean Latin characters (and not truncated CJK)
     * 4. Display title if it contains clean Latin characters
     * 5. High-quality phonetic transliteration of Arabic title
     * 6. Clean fallback
     */
    public static function media_slug($title, $original_title = '', $translations = []) {
        // 1. Check known dictionary mappings for title
        if (!empty($title)) {
            $normalized_title = trim(preg_replace('/[\x{064B}-\x{065F}\x{0670}\x{0640}]/u', '', mb_strtolower($title, 'UTF-8')));
            $spaced_title = trim(preg_replace('/[\s_-]+/u', ' ', $normalized_title));
            if (isset(self::$title_dictionary[$normalized_title])) {
                return self::$title_dictionary[$normalized_title];
            }
            if (isset(self::$title_dictionary[$spaced_title])) {
                return self::$title_dictionary[$spaced_title];
            }
            foreach (self::$title_dictionary as $ar_key => $latin_val) {
                if ($normalized_title === $ar_key || $spaced_title === $ar_key || mb_strpos($normalized_title, $ar_key, 0, 'UTF-8') === 0 || mb_strpos($spaced_title, $ar_key, 0, 'UTF-8') === 0) {
                    return $latin_val;
                }
            }
        }

        // Check known dictionary mappings for original_title
        if (!empty($original_title)) {
            $norm_orig = trim(preg_replace('/[\x{064B}-\x{065F}\x{0670}\x{0640}]/u', '', mb_strtolower($original_title, 'UTF-8')));
            $spaced_orig = trim(preg_replace('/[\s_-]+/u', ' ', $norm_orig));
            if (isset(self::$title_dictionary[$norm_orig])) {
                return self::$title_dictionary[$norm_orig];
            }
            if (isset(self::$title_dictionary[$spaced_orig])) {
                return self::$title_dictionary[$spaced_orig];
            }
            foreach (self::$title_dictionary as $ar_key => $latin_val) {
                if ($norm_orig === $ar_key || $spaced_orig === $ar_key || mb_strpos($norm_orig, $ar_key, 0, 'UTF-8') === 0 || mb_strpos($spaced_orig, $ar_key, 0, 'UTF-8') === 0) {
                    return $latin_val;
                }
            }
        }

        // 2. Check TMDb English translation
        if (is_array($translations)) {
            foreach ($translations as $translation) {
                $iso = strtolower($translation['iso_639_1'] ?? '');
                $data = $translation['data'] ?? [];
                if ($iso === 'en') {
                    $candidate = $data['title'] ?? ($data['name'] ?? ($data['english_name'] ?? ''));
                    if (!empty($candidate) && preg_match('/[a-zA-Z]/', $candidate)) {
                        $clean = self::clean_ascii($candidate);
                        if (!empty($clean) && strlen($clean) >= 3 && $clean !== 'watch') {
                            return $clean;
                        }
                    }
                }
            }
        }

        // 3. Check original_title if Latin (and does NOT have Japanese/CJK characters that would be truncated)
        if (!empty($original_title) && preg_match('/[a-zA-Z]/', $original_title)) {
            $has_cjk = preg_match('/[\x{3040}-\x{30ff}\x{3400}-\x{4dbf}\x{4e00}-\x{9fff}\x{f900}-\x{faff}\x{ff66}-\x{ff9f}]/u', $original_title);
            if (!$has_cjk) {
                $clean = self::clean_ascii($original_title);
                if (!empty($clean) && strlen($clean) >= 3 && $clean !== 'watch') {
                    return $clean;
                }
            }
        }

        // 4. Check display title if Latin
        if (!empty($title) && preg_match('/[a-zA-Z]/', $title)) {
            $has_arabic = preg_match('/[\x{0600}-\x{06FF}]/u', $title);
            if (!$has_arabic) {
                $clean = self::clean_ascii($title);
                if (!empty($clean) && strlen($clean) >= 3 && $clean !== 'watch') {
                    return $clean;
                }
            }
        }

        // 5. Algorithmic Transliteration of Arabic title
        if (!empty($title)) {
            $transliterated = self::transliterate_arabic($title);
            $clean = self::clean_ascii($transliterated);
            if (!empty($clean) && strlen($clean) >= 2) {
                return $clean;
            }
        }

        // 6. If original_title exists, transliterate it
        if (!empty($original_title)) {
            $transliterated_orig = self::transliterate_arabic($original_title);
            $clean_orig = self::clean_ascii($transliterated_orig);
            if (!empty($clean_orig) && strlen($clean_orig) >= 2) {
                return $clean_orig;
            }
        }

        return 'media';
    }

    /**
     * Direct slugify helper
     */
    public static function slugify($title, $original_title = '') {
        return self::media_slug($title, $original_title, []);
    }
}
