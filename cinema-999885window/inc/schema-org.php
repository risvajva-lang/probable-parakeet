<?php
/**
 * Schema.org Structured Data Generator for Cinema Window
 * Generates standards-compliant JSON-LD for Movie, TVSeries, TVEpisode, BreadcrumbList, WebSite.
 * Strict rule: No fake placeholder ratings, counts, or runtimes.
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_Schema {

    /**
     * Render complete JSON-LD for current request
     */
    public static function render_schema($media_data = null, $season_number = null, $episode_number = null) {
        $schemas = [];

        // 1. WebSite Schema (SearchAction)
        $schemas[] = self::get_website_schema();

        // 2. Media Specific Schema
        if ($media_data) {
            $media_type = $media_data['type'] ?? 'movie';

            if ($media_type === 'movie') {
                $schemas[] = self::get_movie_schema($media_data);
                $schemas[] = self::get_breadcrumb_schema([
                    ['name' => 'الرئيسية', 'url' => home_url('/')],
                    ['name' => 'الأفلام', 'url' => home_url('/movie')],
                    ['name' => $media_data['title'], 'url' => self::get_canonical_url($media_data)]
                ]);
            } elseif (!empty($season_number) && !empty($episode_number)) {
                $schemas[] = self::get_episode_schema($media_data, intval($season_number), intval($episode_number));
                $schemas[] = self::get_breadcrumb_schema([
                    ['name' => 'الرئيسية', 'url' => home_url('/')],
                    ['name' => ($media_type === 'anime' ? 'الأنمي' : 'المسلسلات'), 'url' => home_url("/{$media_type}")],
                    ['name' => $media_data['title'], 'url' => self::get_canonical_url($media_data)],
                    ['name' => "الموسم {$season_number}", 'url' => self::get_canonical_url($media_data) . "/season-{$season_number}"],
                    ['name' => "الحلقة {$episode_number}", 'url' => self::get_canonical_url($media_data, $season_number, $episode_number)]
                ]);
            } else {
                $schemas[] = self::get_tv_series_schema($media_data);
                $schemas[] = self::get_breadcrumb_schema([
                    ['name' => 'الرئيسية', 'url' => home_url('/')],
                    ['name' => ($media_type === 'anime' ? 'الأنمي' : 'المسلسلات'), 'url' => home_url("/{$media_type}")],
                    ['name' => $media_data['title'], 'url' => self::get_canonical_url($media_data)]
                ]);
            }
        }

        foreach ($schemas as $schema) {
            if (!empty($schema)) {
                echo '<script type="application/ld+json">' . wp_json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>' . "\n";
            }
        }
    }

    /**
     * WebSite Schema
     */
    public static function get_website_schema() {
        return [
            '@context'        => 'https://schema.org',
            '@type'           => 'WebSite',
            'name'            => get_bloginfo('name') ?: 'نافذة السينما',
            'url'             => home_url('/'),
            'potentialAction' => [
                '@type'       => 'SearchAction',
                'target'      => home_url('/?s={search_term_string}'),
                'query-input' => 'required name=search_term_string'
            ]
        ];
    }

    /**
     * Movie Schema (No fake ratings or runtimes)
     */
    public static function get_movie_schema($media) {
        $schema = [
            '@context'    => 'https://schema.org',
            '@type'       => 'Movie',
            'name'        => $media['title'] ?? 'فيلم',
            'url'         => self::get_canonical_url($media),
            'inLanguage'  => 'ar'
        ];

        if (!empty($media['overview'])) {
            $schema['description'] = $media['overview'];
        }

        if (!empty($media['posterPath'])) {
            $schema['image'] = $media['posterPath'];
        }

        if (!empty($media['releaseDate'])) {
            $schema['datePublished'] = $media['releaseDate'];
        }

        // Real Runtime only (e.g. 115 min -> PT115M)
        if (!empty($media['runtime']) && intval($media['runtime']) > 0) {
            $schema['duration'] = 'PT' . intval($media['runtime']) . 'M';
        }

        // Real Ratings only
        if (!empty($media['voteAverage']) && !empty($media['voteCount']) && floatval($media['voteAverage']) > 0 && intval($media['voteCount']) > 0) {
            $schema['aggregateRating'] = [
                '@type'       => 'AggregateRating',
                'ratingValue' => round(floatval($media['voteAverage']), 1),
                'bestRating'  => '10',
                'worstRating' => '1',
                'ratingCount' => intval($media['voteCount'])
            ];
        }

        if (!empty($media['genres']) && is_array($media['genres'])) {
            $schema['genre'] = $media['genres'];
        }

        return $schema;
    }

    /**
     * TVSeries Schema (No fake ratings)
     */
    public static function get_tv_series_schema($media) {
        $schema = [
            '@context'   => 'https://schema.org',
            '@type'      => 'TVSeries',
            'name'       => $media['title'] ?? 'مسلسل',
            'url'        => self::get_canonical_url($media),
            'inLanguage' => 'ar'
        ];

        if (!empty($media['overview'])) {
            $schema['description'] = $media['overview'];
        }

        if (!empty($media['posterPath'])) {
            $schema['image'] = $media['posterPath'];
        }

        if (!empty($media['releaseDate'])) {
            $schema['startDate'] = $media['releaseDate'];
        }

        if (!empty($media['seasonsCount']) && intval($media['seasonsCount']) > 0) {
            $schema['numberOfSeasons'] = intval($media['seasonsCount']);
        }

        // Real Ratings only
        if (!empty($media['voteAverage']) && !empty($media['voteCount']) && floatval($media['voteAverage']) > 0 && intval($media['voteCount']) > 0) {
            $schema['aggregateRating'] = [
                '@type'       => 'AggregateRating',
                'ratingValue' => round(floatval($media['voteAverage']), 1),
                'bestRating'  => '10',
                'worstRating' => '1',
                'ratingCount' => intval($media['voteCount'])
            ];
        }

        if (!empty($media['genres']) && is_array($media['genres'])) {
            $schema['genre'] = $media['genres'];
        }

        return $schema;
    }

    /**
     * TVEpisode Schema (Real Episode Data)
     */
    public static function get_episode_schema($media, $season_number, $episode_number) {
        $title = $media['title'] ?? 'مسلسل';
        $season_word = Cinema_Window_Arabic::get_season_ordinal($season_number);
        $episode_word = Cinema_Window_Arabic::get_episode_ordinal($episode_number);

        $schema = [
            '@context'       => 'https://schema.org',
            '@type'          => 'TVEpisode',
            'name'           => "{$title} - الموسم {$season_word} الحلقة {$episode_number} {$episode_word}",
            'episodeNumber'  => $episode_number,
            'url'            => self::get_canonical_url($media, $season_number, $episode_number),
            'inLanguage'     => 'ar',
            'partOfSeason'   => [
                '@type'        => 'TVSeason',
                'seasonNumber' => $season_number
            ],
            'partOfSeries'   => [
                '@type' => 'TVSeries',
                'name'  => $title,
                'url'   => self::get_canonical_url($media)
            ]
        ];

        if (!empty($media['overview'])) {
            $schema['description'] = $media['overview'];
        }

        if (!empty($media['posterPath'])) {
            $schema['image'] = $media['posterPath'];
        }

        if (!empty($media['runtime']) && intval($media['runtime']) > 0) {
            $schema['duration'] = 'PT' . intval($media['runtime']) . 'M';
        }

        return $schema;
    }

    /**
     * BreadcrumbList Schema
     */
    public static function get_breadcrumb_schema($items) {
        $elements = [];
        $position = 1;

        foreach ($items as $item) {
            $elements[] = [
                '@type'    => 'ListItem',
                'position' => $position++,
                'name'     => $item['name'],
                'item'     => $item['url']
            ];
        }

        return [
            '@context'        => 'https://schema.org',
            '@type'           => 'BreadcrumbList',
            'itemListElement' => $elements
        ];
    }

    public static function get_canonical_url($media, $season = null, $episode = null) {
        $type = $media['type'] ?? 'movie';
        $title = $media['title'] ?? '';
        $orig_title = $media['originalTitle'] ?? ($media['original_title'] ?? '');
        
        $clean_slug = (!empty($media['slug']) && Cinema_Window_Arabic::is_clean_latin_slug($media['slug']))
            ? $media['slug']
            : Cinema_Window_Arabic::media_slug($title, $orig_title);
        $base = home_url("/{$type}/{$clean_slug}");

        if (!empty($season) && !empty($episode)) {
            $s_prefix = is_numeric($season) ? "season-{$season}" : $season;
            $e_prefix = is_numeric($episode) ? "episode-{$episode}" : $episode;
            return "{$base}/{$s_prefix}/{$e_prefix}";
        }
        return $base;
    }
}
