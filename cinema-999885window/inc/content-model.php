<?php
/**
 * Content Model & Custom Post Types for Cinema Window
 * Defines real database storage for Movies, TV Series, Anime, and Episodes
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_Content_Model {

    const CPT_MOVIE   = 'cw_movie';
    const CPT_TV      = 'cw_tv';
    const CPT_ANIME   = 'cw_anime';
    const CPT_EPISODE = 'cw_episode';
    const TAX_GENRE   = 'cw_genre';
    const TAX_YEAR    = 'cw_year';

    public static function init() {
        add_action('init', [__CLASS__, 'register_post_types']);
        add_action('init', [__CLASS__, 'register_taxonomies']);
    }

    /**
     * Register Custom Post Types for persistent storage
     */
    public static function register_post_types() {
        // 1. Movies
        register_post_type(self::CPT_MOVIE, [
            'labels' => [
                'name'               => __('الأفلام', 'cinema-window'),
                'singular_name'      => __('فيلم', 'cinema-window'),
                'add_new'            => __('إضافة فيلم جديد', 'cinema-window'),
                'add_new_item'       => __('إضافة فيلم جديد', 'cinema-window'),
                'edit_item'          => __('تعديل الفيلم', 'cinema-window'),
                'all_items'          => __('جميع الأفلام', 'cinema-window'),
                'search_items'       => __('بحث في الأفلام', 'cinema-window')
            ],
            'public'              => true,
            'has_archive'         => true,
            'show_in_rest'        => true,
            'rewrite'             => ['slug' => 'movie', 'with_front' => false],
            'supports'            => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'menu_icon'           => 'dashicons-format-video'
        ]);

        // 2. TV Series
        register_post_type(self::CPT_TV, [
            'labels' => [
                'name'               => __('المسلسلات', 'cinema-window'),
                'singular_name'      => __('مسلسل', 'cinema-window'),
                'add_new'            => __('إضافة مسلسل جديد', 'cinema-window'),
                'add_new_item'       => __('إضافة مسلسل جديد', 'cinema-window'),
                'edit_item'          => __('تعديل المسلسل', 'cinema-window'),
                'all_items'          => __('جميع المسلسلات', 'cinema-window'),
                'search_items'       => __('بحث في المسلسلات', 'cinema-window')
            ],
            'public'              => true,
            'has_archive'         => true,
            'show_in_rest'        => true,
            'rewrite'             => ['slug' => 'tv', 'with_front' => false],
            'supports'            => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'menu_icon'           => 'dashicons-video-alt3'
        ]);

        // 3. Anime
        register_post_type(self::CPT_ANIME, [
            'labels' => [
                'name'               => __('الأنمي', 'cinema-window'),
                'singular_name'      => __('أنمي', 'cinema-window'),
                'add_new'            => __('إضافة أنمي جديد', 'cinema-window'),
                'add_new_item'       => __('إضافة أنمي جديد', 'cinema-window'),
                'edit_item'          => __('تعديل الأنمي', 'cinema-window'),
                'all_items'          => __('جميع الأنميات', 'cinema-window'),
                'search_items'       => __('بحث في الأنميات', 'cinema-window')
            ],
            'public'              => true,
            'has_archive'         => true,
            'show_in_rest'        => true,
            'rewrite'             => ['slug' => 'anime', 'with_front' => false],
            'supports'            => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'menu_icon'           => 'dashicons-art'
        ]);

        // 4. Episodes
        register_post_type(self::CPT_EPISODE, [
            'labels' => [
                'name'               => __('الحلقات', 'cinema-window'),
                'singular_name'      => __('حلقة', 'cinema-window'),
                'add_new'            => __('إضافة حلقة جديدة', 'cinema-window'),
                'all_items'          => __('جميع الحلقات', 'cinema-window')
            ],
            'public'              => true,
            'has_archive'         => false,
            'show_in_rest'        => true,
            'rewrite'             => false, // Handled via custom rewrite rules
            'supports'            => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'menu_icon'           => 'dashicons-controls-play'
        ]);
    }

    /**
     * Register Taxonomies
     */
    public static function register_taxonomies() {
        register_taxonomy(self::TAX_GENRE, [self::CPT_MOVIE, self::CPT_TV, self::CPT_ANIME], [
            'labels' => [
                'name'          => __('التصنيفات', 'cinema-window'),
                'singular_name' => __('تصنيف', 'cinema-window')
            ],
            'hierarchical'      => true,
            'show_in_rest'      => true,
            'show_admin_column' => true
        ]);

        register_taxonomy(self::TAX_YEAR, [self::CPT_MOVIE, self::CPT_TV, self::CPT_ANIME], [
            'labels' => [
                'name'          => __('سنة الإنتاج', 'cinema-window'),
                'singular_name' => __('سنة', 'cinema-window')
            ],
            'hierarchical'      => false,
            'show_in_rest'      => true,
            'show_admin_column' => true
        ]);
    }

    /**
     * Find post by TMDb ID and Type
     */
    public static function find_by_tmdb_id($tmdb_id, $type = 'movie') {
        $cpt = self::get_cpt_for_type($type);
        $posts = get_posts([
            'post_type'      => $cpt,
            'meta_key'       => '_cw_tmdb_id',
            'meta_value'     => intval($tmdb_id),
            'posts_per_page' => 1,
            'post_status'    => 'any',
            'fields'         => 'ids'
        ]);
        return !empty($posts) ? $posts[0] : null;
    }

    /**
     * Find episode by series TMDb ID, Season, and Episode number
     */
    public static function find_episode($series_tmdb_id, $season_number, $episode_number) {
        $posts = get_posts([
            'post_type'      => self::CPT_EPISODE,
            'posts_per_page' => 1,
            'post_status'    => 'any',
            'meta_query'     => [
                'relation' => 'AND',
                [
                    'key'     => '_cw_series_tmdb_id',
                    'value'   => intval($series_tmdb_id),
                    'compare' => '='
                ],
                [
                    'key'     => '_cw_season_number',
                    'value'   => intval($season_number),
                    'compare' => '='
                ],
                [
                    'key'     => '_cw_episode_number',
                    'value'   => intval($episode_number),
                    'compare' => '='
                ]
            ],
            'fields'         => 'ids'
        ]);
        return !empty($posts) ? $posts[0] : null;
    }

    /**
     * Helper to map media type to post type
     */
    public static function get_cpt_for_type($type) {
        switch ($type) {
            case 'tv':
                return self::CPT_TV;
            case 'anime':
                return self::CPT_ANIME;
            case 'episode':
                return self::CPT_EPISODE;
            case 'movie':
            default:
                return self::CPT_MOVIE;
        }
    }

    /**
     * Format a post object into a normalized MediaItem array
     */
    public static function format_media_post($post_id) {
        $post = get_post($post_id);
        if (!$post) return null;

        $tmdb_id = intval(get_post_meta($post_id, '_cw_tmdb_id', true));
        $media_type = get_post_meta($post_id, '_cw_media_type', true) ?: 'movie';
        $original_title = get_post_meta($post_id, '_cw_original_title', true) ?: $post->post_title;
        $runtime = get_post_meta($post_id, '_cw_runtime', true);
        $poster_path = get_post_meta($post_id, '_cw_poster_path', true);
        $backdrop_path = get_post_meta($post_id, '_cw_backdrop_path', true);
        $vote_average = floatval(get_post_meta($post_id, '_cw_vote_average', true));
        $vote_count = intval(get_post_meta($post_id, '_cw_vote_count', true));
        $release_date = get_post_meta($post_id, '_cw_release_date', true);
        $year = get_post_meta($post_id, '_cw_year', true);
        $genres = get_post_meta($post_id, '_cw_genres', true) ?: [];
        $seasons_data = get_post_meta($post_id, '_cw_seasons_data', true) ?: [];

        return [
            'id'             => $post_id,
            'tmdbId'         => $tmdb_id,
            'title'          => $post->post_title,
            'originalTitle'  => $original_title,
            'slug'           => $post->post_name,
            'type'           => $media_type,
            'overview'       => $post->post_content,
            'posterPath'     => $poster_path ? Cinema_Window_TMDb::get_image_url($poster_path, 'w500') : '',
            'backdropPath'   => $backdrop_path ? Cinema_Window_TMDb::get_image_url($backdrop_path, 'original') : '',
            'voteAverage'    => $vote_average > 0 ? $vote_average : null,
            'voteCount'      => $vote_count > 0 ? $vote_count : null,
            'runtime'        => !empty($runtime) ? intval($runtime) : null,
            'duration'       => !empty($runtime) ? intval($runtime) . ' دقيقة' : null,
            'releaseDate'    => $release_date,
            'year'           => $year ?: ($release_date ? substr($release_date, 0, 4) : ''),
            'genres'         => is_array($genres) ? $genres : [],
            'seasons'        => is_array($seasons_data) ? $seasons_data : [],
            'seasonsCount'   => is_array($seasons_data) ? count($seasons_data) : 0,
            'createdAt'      => $post->post_date_gmt,
            'updatedAt'      => $post->post_modified_gmt
        ];
    }
}

Cinema_Window_Content_Model::init();
