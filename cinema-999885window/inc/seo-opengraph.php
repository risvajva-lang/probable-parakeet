<?php
/**
 * Centralized SEO, Open Graph & Multi-Language Metadata Generator for Cinema Window
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_SEO {

    const DEFAULT_MOVIE_TPL   = 'مشاهدة فيلم {TITLE} {YEAR} مترجم HD اون لاين | نافذة السينما VIP';
    const DEFAULT_TV_TPL      = 'مشاهدة مسلسل {TITLE} مترجم HD اون لاين | نافذة السينما VIP';
    const DEFAULT_ANIME_TPL   = 'مشاهدة أنمي {TITLE} مترجم HD اون لاين | نافذة السينما VIP';
    const DEFAULT_EPISODE_TPL = 'شاهد {TITLE} - الموسم {SEASON} الحلقة {EPISODE} بأعلى جودة على نافذة السينما';

    /**
     * Supported ISO 639-1 Languages for hreflang
     */
    public static $supported_languages = ['ar', 'en', 'ja', 'fr', 'es', 'de', 'it', 'tr', 'ko'];

    /**
     * Render Complete Header SEO Tags (Title, Meta Description, Canonical, OG, Twitter, Hreflang)
     */
    public static function render_head_tags($media_data = null, $season_number = null, $episode_number = null) {
        $meta = self::generate_metadata($media_data, $season_number, $episode_number);

        echo "\n<!-- Cinema Window SEO & Open Graph Meta -->\n";
        echo '<title>' . esc_html($meta['title']) . '</title>' . "\n";
        echo '<meta name="description" content="' . esc_attr($meta['description']) . '" />' . "\n";
        echo '<link rel="canonical" href="' . esc_url($meta['canonical']) . '" />' . "\n";

        // Open Graph & WhatsApp / Social Link Preview Meta Tags
        echo '<meta property="og:site_name" content="' . esc_attr(get_bloginfo('name') ?: 'نافذة السينما VIP') . '" />' . "\n";
        echo '<meta property="og:type" content="' . esc_attr($meta['og_type']) . '" />' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($meta['title']) . '" />' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($meta['description']) . '" />' . "\n";
        echo '<meta property="og:url" content="' . esc_url($meta['canonical']) . '" />' . "\n";
        echo '<meta property="og:image" content="' . esc_url($meta['image']) . '" />' . "\n";
        echo '<meta property="og:image:secure_url" content="' . esc_url($meta['image']) . '" />' . "\n";
        echo '<meta property="og:image:type" content="image/jpeg" />' . "\n";
        echo '<meta property="og:image:width" content="' . esc_attr($meta['image_width'] ?? '1200') . '" />' . "\n";
        echo '<meta property="og:image:height" content="' . esc_attr($meta['image_height'] ?? '630') . '" />' . "\n";
        echo '<meta property="og:image:alt" content="' . esc_attr($meta['title']) . '" />' . "\n";
        echo '<meta property="og:locale" content="ar_AR" />' . "\n";

        // Fallback itemprops for bots (WhatsApp, Google, etc.)
        echo '<meta itemprop="name" content="' . esc_attr($meta['title']) . '" />' . "\n";
        echo '<meta itemprop="description" content="' . esc_attr($meta['description']) . '" />' . "\n";
        echo '<meta itemprop="image" content="' . esc_url($meta['image']) . '" />' . "\n";

        // Twitter Card
        echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr($meta['title']) . '" />' . "\n";
        echo '<meta name="twitter:description" content="' . esc_attr($meta['description']) . '" />' . "\n";
        echo '<meta name="twitter:image" content="' . esc_url($meta['image']) . '" />' . "\n";

        echo "<!-- / Cinema Window SEO -->\n\n";
    }

    /**
     * Generate metadata array with customizable templates
     */
    public static function generate_metadata($media, $season = null, $episode = null) {
        $site_name = get_bloginfo('name') ?: 'نافذة السينما';
        $default_img = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';

        if (!$media) {
            return [
                'title'       => "{$site_name} VIP - منصة مشاهدة الأفلام والمسلسلات",
                'description' => "موقع {$site_name} لمشاهدة وتحميل أحدث الأفلام والمسلسلات والأنمي بجودة فائقة Full HD و 4K وسيرفرات مباشرة بدون إعلانات.",
                'canonical'   => home_url('/'),
                'image'       => $default_img,
                'og_type'     => 'website'
            ];
        }

        $type = $media['type'] ?? 'movie';
        $title = $media['title'] ?? 'عمل سينمائي';
        $year = !empty($media['year']) ? $media['year'] : (!empty($media['releaseDate']) ? substr($media['releaseDate'], 0, 4) : '');
        $type_label = ($type === 'anime') ? 'أنمي' : (($type === 'cartoon') ? 'كرتون' : 'مسلسل');
        $canonical = Cinema_Window_Schema::get_canonical_url($media, $season, $episode);
        $image = !empty($media['backdropPath']) ? $media['backdropPath'] : (!empty($media['posterPath']) ? $media['posterPath'] : $default_img);

        // 1. Movie SEO
        if ($type === 'movie') {
            $tpl = get_option('cw_seo_movie_template', self::DEFAULT_MOVIE_TPL);
            $seo_title = str_replace(
                ['{TITLE}', '{YEAR}', '{SITE_NAME}'],
                [$title, $year, $site_name],
                $tpl
            );

            $clean_overview = !empty($media['overview']) ? trim(strip_tags($media['overview'])) : '';
            if (!empty($clean_overview)) {
                $seo_desc = "قصة الفيلم: " . wp_trim_words($clean_overview, 45, '...') . " | مشاهدة فيلم {$title} كامل بجودة فائقة 4K وسيرفرات مباشرة بدون إعلانات عبر {$site_name}.";
            } else {
                $seo_desc = "مشاهدة وتحميل فيلم {$title} ({$year}) كامل بجودة فائقة 4K و Full HD وسيرفرات مباشرة سريعة بدون إعلانات عبر {$site_name}.";
            }

            return [
                'title'        => trim($seo_title),
                'description'  => trim($seo_desc),
                'canonical'    => $canonical,
                'image'        => $image,
                'image_width'  => !empty($media['backdropPath']) ? '1200' : '780',
                'image_height' => !empty($media['backdropPath']) ? '630' : '1170',
                'og_type'      => 'video.movie'
            ];
        }

        // 2. Episode SEO
        if (!empty($season) && !empty($episode)) {
            $season_word = Cinema_Window_Arabic::get_season_ordinal($season);
            $episode_word = Cinema_Window_Arabic::get_episode_ordinal($episode);

            $tpl = get_option('cw_seo_episode_template', self::DEFAULT_EPISODE_TPL);
            $seo_title = str_replace(
                ['{TYPE_LABEL}', '{TITLE}', '{SEASON}', '{SEASON_WORD}', '{EPISODE}', '{EPISODE_WORD}', '{SITE_NAME}'],
                [$type_label, $title, $season, $season_word, $episode, $episode_word, $site_name],
                $tpl
            );

            // Use episode still if available, otherwise poster or backdrop
            $ep_image = !empty($media['episodeStillPath']) ? $media['episodeStillPath'] : (!empty($media['stillPath']) ? $media['stillPath'] : $image);

            $clean_overview = !empty($media['overview']) ? trim(strip_tags($media['overview'])) : '';
            $ep_overview = !empty($media['episodeOverview']) ? trim(strip_tags($media['episodeOverview'])) : '';

            if (!empty($ep_overview)) {
                $seo_desc = "أحداث الحلقة {$episode}: " . wp_trim_words($ep_overview, 30, '...') . " | قصة العمل: " . wp_trim_words($clean_overview, 25, '...') . " | مشاهدة ممتعة بدقة 4K عبر {$site_name}.";
            } elseif (!empty($clean_overview)) {
                $seo_desc = "قصة العمل: " . wp_trim_words($clean_overview, 40, '...') . " | شاهد الآن {$type_label} {$title} الموسم {$season} الحلقة {$episode} مترجمة بدقة 4K و Full HD بدون إعلانات عبر {$site_name}.";
            } else {
                $seo_desc = "مشاهدة وتحميل {$type_label} {$title} الموسم {$season} الحلقة {$episode} مترجمة بجودة فائقة Full HD و 4K بدون إعلانات عبر {$site_name}.";
            }

            return [
                'title'        => trim($seo_title),
                'description'  => trim($seo_desc),
                'canonical'    => $canonical,
                'image'        => $ep_image,
                'image_width'  => '1200',
                'image_height' => '630',
                'og_type'      => 'video.episode'
            ];
        }

        // 3. Series / Anime SEO
        $tpl_key = ($type === 'anime') ? 'cw_seo_anime_template' : 'cw_seo_tv_template';
        $default_tpl = ($type === 'anime') ? self::DEFAULT_ANIME_TPL : self::DEFAULT_TV_TPL;
        $tpl = get_option($tpl_key, $default_tpl);

        $seo_title = str_replace(
            ['{TITLE}', '{YEAR}', '{SITE_NAME}'],
            [$title, $year, $site_name],
            $tpl
        );

        $clean_overview = !empty($media['overview']) ? trim(strip_tags($media['overview'])) : '';
        if (!empty($clean_overview)) {
            $seo_desc = "قصة العمل: " . wp_trim_words($clean_overview, 45, '...') . " | مشاهدة وتحميل جميع مواسم وحلقات {$type_label} {$title} مترجمة ومدبلجة بجودة 4K فائقة عبر {$site_name}.";
        } else {
            $seo_desc = "مشاهدة وتحميل جميع مواسم وحلقات {$type_label} {$title} كاملة مترجمة ومدبلجة بجودة عالية Full HD و 4K بدون إعلانات عبر {$site_name}.";
        }

        return [
            'title'        => trim($seo_title),
            'description'  => trim($seo_desc),
            'canonical'    => $canonical,
            'image'        => $image,
            'image_width'  => !empty($media['backdropPath']) ? '1200' : '780',
            'image_height' => !empty($media['backdropPath']) ? '630' : '1170',
            'og_type'      => 'video.tv_show'
        ];
    }
}
