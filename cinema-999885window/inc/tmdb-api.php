<?php
/**
 * TMDb API Integration with Exponential Backoff Retries & Multi-Key Rotation
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_TMDb {

    private static $api_keys = [
        '5549079deaa6599b533d1c810d7a1873',
        '844dba0bfd8f3a4f3799f6130ef9e335',
        'a2c65076cf89d4d5e03ebcb5e1d52d9a',
        '1cf50e6248dc270629e802686245c2c8',
        'c0b0a88006bfdc37f6a7d5cf59de96dc',
        '39b1a511ec9cf5c777492c0ee9bc1777'
    ];

    private static $current_key_idx = 0;

    /**
     * Get configured API key (supports WP option or fallback pool)
     */
    public static function get_api_key() {
        $custom_key = get_option('cw_tmdb_api_key');
        if (!empty($custom_key)) {
            return trim($custom_key);
        }
        return self::$api_keys[self::$current_key_idx % count(self::$api_keys)];
    }

    private static function rotate_key() {
        self::$current_key_idx = (self::$current_key_idx + 1) % count(self::$api_keys);
    }

    /**
     * Fetch data from TMDb with Exponential Backoff Retry (Max 3 attempts) and transient caching
     */
    public static function fetch_data($endpoint, $params = [], $cache_hours = 12) {
        $cache_key = 'cw_tmdb_' . md5($endpoint . serialize($params));
        $cached = get_transient($cache_key);
        if ($cached !== false && !is_null($cached)) {
            return $cached;
        }

        if (!isset($params['language'])) {
            $params['language'] = 'ar-SA';
        }
        $params['include_adult'] = 'false';

        $max_retries = 3;
        $attempt = 0;

        while ($attempt < $max_retries) {
            $attempt++;
            $params['api_key'] = self::get_api_key();
            $url = add_query_arg($params, 'https://api.themoviedb.org/3/' . ltrim($endpoint, '/'));

            $response = wp_remote_get($url, [
                'timeout'    => 12,
                'user-agent' => 'CinemaWindow/2.0 (WordPress)'
            ]);

            if (is_wp_error($response)) {
                // Exponential backoff wait (e.g. 500ms, 1000ms)
                usleep($attempt * 500000);
                self::rotate_key();
                continue;
            }

            $code = wp_remote_retrieve_response_code($response);

            // Rate limit or key unauthorized: rotate and retry
            if ($code === 429 || $code === 401 || $code === 403) {
                self::rotate_key();
                usleep($attempt * 600000);
                continue;
            }

            if ($code === 404) {
                return null;
            }

            if ($code === 200) {
                $body = wp_remote_retrieve_body($response);
                $data = json_decode($body, true);

                if (!empty($data) && !isset($data['status_code'])) {
                    if ($cache_hours > 0) {
                        set_transient($cache_key, $data, $cache_hours * HOUR_IN_SECONDS);
                    }
                    return $data;
                }
            }

            // Retry with exponential backoff
            usleep($attempt * 500000);
        }

        return null;
    }

    /**
     * Get Media Details with append_to_response (credits, videos, similar, translations)
     */
    public static function get_details($tmdb_id, $type = 'movie', $language = 'ar-SA') {
        $type_endpoint = ($type === 'movie') ? 'movie' : 'tv';
        return self::fetch_data("{$type_endpoint}/{$tmdb_id}", [
            'append_to_response' => 'credits,videos,similar,recommendations,keywords,translations,external_ids',
            'language'           => $language
        ], 24);
    }

    /**
     * Get Season Episodes
     */
    public static function get_season($tmdb_id, $season_number, $language = 'ar-SA') {
        return self::fetch_data("tv/{$tmdb_id}/season/{$season_number}", [
            'language' => $language
        ], 12);
    }

    /**
     * Multi-Search query
     */
    public static function search_multi($query, $page = 1, $language = 'ar-SA') {
        return self::fetch_data('search/multi', [
            'query'         => $query,
            'page'          => $page,
            'language'      => $language
        ], 6);
    }

    /**
     * Discover Media
     */
    public static function discover($type = 'movie', $params = [], $language = 'ar-SA') {
        $endpoint = ($type === 'movie') ? 'discover/movie' : 'discover/tv';
        $params['language'] = $language;
        return self::fetch_data($endpoint, $params, 6);
    }

    /**
     * Format poster image URL (or return empty if none)
     */
    public static function get_image_url($path, $size = 'w500') {
        if (empty($path)) {
            return '';
        }
        if (strpos($path, 'http') === 0) {
            return $path;
        }
        return 'https://image.tmdb.org/t/p/' . $size . '/' . ltrim($path, '/');
    }
}
