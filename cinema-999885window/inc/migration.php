<?php
/**
 * Database Migration & Slug Normalization Engine for Cinema Window
 * Translates and migrates existing Arabic post_names / URLs to clean Latin ASCII slugs,
 * preserves legacy mappings in _cw_legacy_slugs, and handles 301 redirection.
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_Migration {

    const LEGACY_SLUG_META = '_cw_legacy_slugs';

    public static function init() {
        add_action('init', [__CLASS__, 'handle_legacy_redirects'], 1);
        add_action('template_redirect', [__CLASS__, 'handle_legacy_redirects'], 1);
        add_action('init', [__CLASS__, 'maybe_auto_heal_database'], 99);
        add_action('wp_ajax_cw_run_slug_migration', [__CLASS__, 'ajax_run_migration']);
        add_filter('wp_insert_post_data', [__CLASS__, 'force_clean_latin_post_name'], 10, 2);
    }

    /**
     * Prevent WordPress from ever saving an Arabic post_name for media post types
     */
    public static function force_clean_latin_post_name($data, $postarr) {
        $post_type = $data['post_type'] ?? '';
        if (in_array($post_type, [Cinema_Window_Content_Model::CPT_MOVIE, Cinema_Window_Content_Model::CPT_TV, Cinema_Window_Content_Model::CPT_ANIME, Cinema_Window_Content_Model::CPT_EPISODE], true)) {
            $current_slug = $data['post_name'] ?? '';
            if (empty($current_slug) || !Cinema_Window_Arabic::is_clean_latin_slug($current_slug)) {
                $title = $data['post_title'] ?? '';
                $clean_slug = Cinema_Window_Arabic::media_slug($title);
                if (empty($clean_slug) || $clean_slug === 'media') {
                    $type_prefix = ($post_type === Cinema_Window_Content_Model::CPT_MOVIE) ? 'movie' : (($post_type === Cinema_Window_Content_Model::CPT_ANIME) ? 'anime' : 'tv');
                    $clean_slug = $type_prefix . '-' . wp_generate_password(6, false, false);
                }
                $data['post_name'] = $clean_slug;
            }
        }
        return $data;
    }

    /**
     * Inspects incoming request to see if it matches an old Arabic or legacy URL
     * and performs a fast 301 Permanent Redirect to the canonical Latin URL.
     */
    public static function handle_legacy_redirects() {
        if (is_admin() || (defined('DOING_AJAX') && DOING_AJAX) || (defined('REST_REQUEST') && REST_REQUEST)) {
            return;
        }

        $raw_request = isset($_GET['url']) ? (string)$_GET['url'] : (string)($_SERVER['REQUEST_URI'] ?? '/');
        $path = parse_url($raw_request, PHP_URL_PATH);
        if (!$path || $path === '/') {
            $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        }
        if (!$path || $path === '/') return;

        $decoded_path = rawurldecode($path);
        // Normalize /mua/ prefix if present
        $clean_path = preg_replace('#^/mua/#iu', '/', $decoded_path);
        if (!preg_match('#^/#', $clean_path)) {
            $clean_path = '/' . $clean_path;
        }

        // Match /:type/:slug or /:type/:slug/season-:s/episode-:e or Arabic variations
        if (preg_match('#^/(movie|tv|anime|cartoon)/([^/]+)(?:/([^/]+)(?:/([^/]+))?)?#iu', $clean_path, $matches)) {
            $type = strtolower($matches[1]);
            $raw_slug = trim($matches[2]);
            $seg3 = isset($matches[3]) ? trim($matches[3]) : '';
            $seg4 = isset($matches[4]) ? trim($matches[4]) : '';

            $season = null;
            $episode = null;

            // Extract season from segment 3 or 4
            if (!empty($seg3)) {
                if (preg_match('/(?:season|s|الموسم|موسم)-?(\d+)/iu', $seg3, $sm)) {
                    $season = intval($sm[1]);
                } elseif (preg_match('/^(?:الموسم\s+)?(الأول|الاول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر)/u', $seg3, $sm)) {
                    $words_map = ['الأول'=>1,'الاول'=>1,'الثاني'=>2,'الثالث'=>3,'الرابع'=>4,'الخامس'=>5,'السادس'=>6,'السابع'=>7,'الثامن'=>8,'التاسع'=>9,'العاشر'=>10];
                    $season = $words_map[$sm[1]] ?? 1;
                }
            }

            // Extract episode from segment 3 or 4
            if (!empty($seg4)) {
                if (preg_match('/(?:episode|ep|e|الحلقة|حلقة)-?(\d+)/iu', $seg4, $em)) {
                    $episode = intval($em[1]);
                }
            } elseif (!empty($seg3) && !$season) {
                if (preg_match('/(?:episode|ep|e|الحلقة|حلقة)-?(\d+)/iu', $seg3, $em)) {
                    $episode = intval($em[1]);
                    $season = 1;
                }
            }

            // Check if slug contains non-ASCII characters (Arabic) or is not a clean Latin slug
            $needs_redirect = false;
            $target_slug = '';

            if (!Cinema_Window_Arabic::is_clean_latin_slug($raw_slug)) {
                $needs_redirect = true;
                $post = self::find_post_by_any_slug($raw_slug, $type);
                if ($post) {
                    // Check if the post in DB itself still has an Arabic slug and heal it immediately
                    if (Cinema_Window_Arabic::is_clean_latin_slug($post->post_name)) {
                        $target_slug = $post->post_name;
                    } else {
                        $orig_title = get_post_meta($post->ID, '_cw_original_title', true);
                        $target_slug = Cinema_Window_Arabic::media_slug($post->post_title, $orig_title);
                        if (empty($target_slug) || $target_slug === 'media') {
                            $target_slug = Cinema_Window_Arabic::clean_ascii(Cinema_Window_Arabic::transliterate_arabic($raw_slug));
                        }
                        // Self-heal the database entry
                        self::heal_post_slug($post->ID, $target_slug, $post->post_name);
                    }
                } else {
                    $target_slug = Cinema_Window_Arabic::media_slug($raw_slug);
                    if (empty($target_slug) || $target_slug === 'media') {
                        $target_slug = Cinema_Window_Arabic::clean_ascii(Cinema_Window_Arabic::transliterate_arabic($raw_slug));
                    }
                }
            } else {
                // Check if this clean slug is registered as a legacy slug for another post
                $redirect_post = self::find_post_by_legacy_meta($raw_slug, $type);
                if ($redirect_post && $redirect_post->post_name !== $raw_slug && Cinema_Window_Arabic::is_clean_latin_slug($redirect_post->post_name)) {
                    $needs_redirect = true;
                    $target_slug = $redirect_post->post_name;
                }
            }

            // If segments contained Arabic (e.g. /الموسم-الأول/حلقة-1) or non-standard format
            if (!empty($seg3) && !preg_match('/^season-\d+$/i', $seg3)) {
                $needs_redirect = true;
                if (empty($target_slug)) $target_slug = $raw_slug;
            }
            if (!empty($seg4) && !preg_match('/^episode-\d+$/i', $seg4)) {
                $needs_redirect = true;
                if (empty($target_slug)) $target_slug = $raw_slug;
            }

            // Ensure target_slug is strictly clean Latin ASCII
            if (!empty($target_slug)) {
                $target_slug = Cinema_Window_Arabic::clean_ascii($target_slug);
            }

            if ($needs_redirect && !empty($target_slug)) {
                $target_url = home_url("/{$type}/{$target_slug}");
                if ($season && $episode) {
                    $target_url .= "/season-{$season}/episode-{$episode}";
                }
                wp_safe_redirect($target_url, 301);
                exit;
            }
        }
    }

    /**
     * Self-heals a single post's slug in the database and preserves legacy redirects
     */
    public static function heal_post_slug($post_id, $clean_slug, $old_slug = '') {
        global $wpdb;
        if (!$post_id || empty($clean_slug)) return;

        $legacy_slugs = get_post_meta($post_id, self::LEGACY_SLUG_META, true);
        if (!is_array($legacy_slugs)) {
            $legacy_slugs = [];
        }
        if (!empty($old_slug) && !in_array($old_slug, $legacy_slugs, true)) {
            $legacy_slugs[] = $old_slug;
        }
        $raw_decoded = rawurldecode($old_slug);
        if (!empty($raw_decoded) && !in_array($raw_decoded, $legacy_slugs, true)) {
            $legacy_slugs[] = $raw_decoded;
        }
        update_post_meta($post_id, self::LEGACY_SLUG_META, $legacy_slugs);

        $wpdb->update($wpdb->posts, ['post_name' => $clean_slug], ['ID' => $post_id], ['%s'], ['%d']);
        clean_post_cache($post_id);
    }

    /**
     * Automatically heals batches of Arabic slugs in the background
     */
    public static function maybe_auto_heal_database() {
        if (get_transient('cw_auto_heal_lock')) {
            return;
        }
        set_transient('cw_auto_heal_lock', 1, 300); // 5 min interval check

        global $wpdb;
        $cpts = [
            Cinema_Window_Content_Model::CPT_MOVIE,
            Cinema_Window_Content_Model::CPT_TV,
            Cinema_Window_Content_Model::CPT_ANIME
        ];
        $placeholders = implode("','", array_map('esc_sql', $cpts));

        // Find posts with non-ASCII or percent-encoded characters in post_name
        $posts = $wpdb->get_results(
            "SELECT ID, post_title, post_name, post_type FROM {$wpdb->posts}
             WHERE post_type IN ('{$placeholders}')
               AND post_status = 'publish'
               AND (post_name REGEXP '[^a-zA-Z0-9_-]' OR post_name LIKE '%\\%%')
             LIMIT 30"
        );

        if (!empty($posts)) {
            foreach ($posts as $p) {
                $orig_title = get_post_meta($p->ID, '_cw_original_title', true);
                $new_slug = Cinema_Window_Arabic::media_slug($p->post_title, $orig_title);
                if (empty($new_slug) || $new_slug === 'media') {
                    $type_prefix = ($p->post_type === Cinema_Window_Content_Model::CPT_MOVIE) ? 'movie' : (($p->post_type === Cinema_Window_Content_Model::CPT_ANIME) ? 'anime' : 'tv');
                    $tmdb_id = get_post_meta($p->ID, '_cw_tmdb_id', true);
                    $new_slug = $tmdb_id ? "{$type_prefix}-{$tmdb_id}" : "{$type_prefix}-{$p->ID}";
                }
                self::heal_post_slug($p->ID, $new_slug, $p->post_name);
            }
        }
    }

    /**
     * Find post by current post_name, legacy meta, or Arabic title matching
     */
    public static function find_post_by_any_slug($slug_or_title, $type = 'movie') {
        global $wpdb;

        $cpt = Cinema_Window_Content_Model::get_cpt_for_type($type);

        // 1. Direct post_name lookup (exact URL-encoded or decoded)
        $post = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->posts} WHERE post_type = %s AND (post_name = %s OR post_name = %s) AND post_status = 'publish' LIMIT 1",
            $cpt,
            $slug_or_title,
            sanitize_title($slug_or_title)
        ));
        if ($post) return $post;

        // 2. Legacy Slug Meta lookup
        $post = self::find_post_by_legacy_meta($slug_or_title, $type);
        if ($post) return $post;

        // 3. Known dictionary Latin match
        $dict_latin = Cinema_Window_Arabic::media_slug($slug_or_title);
        if (!empty($dict_latin) && $dict_latin !== 'media') {
            $post = $wpdb->get_row($wpdb->prepare(
                "SELECT * FROM {$wpdb->posts} WHERE post_type = %s AND post_name = %s AND post_status = 'publish' LIMIT 1",
                $cpt,
                $dict_latin
            ));
            if ($post) return $post;
        }

        // 4. Post Title match (exact, spaced, or stripped)
        $spaced_title = str_replace(['-', '_'], ' ', $slug_or_title);
        $post = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->posts} WHERE post_type = %s AND (post_title = %s OR post_title = %s) AND post_status = 'publish' LIMIT 1",
            $cpt,
            $slug_or_title,
            $spaced_title
        ));
        if ($post) return $post;

        // 5. TMDb original title match
        $post_id = $wpdb->get_var($wpdb->prepare(
            "SELECT post_id FROM {$wpdb->postmeta} m
             INNER JOIN {$wpdb->posts} p ON p.ID = m.post_id
             WHERE p.post_type = %s AND m.meta_key = '_cw_original_title' AND (m.meta_value = %s OR m.meta_value = %s)
             LIMIT 1",
            $cpt,
            $slug_or_title,
            $spaced_title
        ));
        if ($post_id) return get_post($post_id);

        return null;
    }

    /**
     * Find post by legacy slug meta
     */
    public static function find_post_by_legacy_meta($slug, $type = 'movie') {
        global $wpdb;
        $cpt = Cinema_Window_Content_Model::get_cpt_for_type($type);

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT p.*, m.meta_value FROM {$wpdb->posts} p
             INNER JOIN {$wpdb->postmeta} m ON p.ID = m.post_id
             WHERE p.post_type = %s AND m.meta_key = %s",
            $cpt,
            self::LEGACY_SLUG_META
        ));

        foreach ($results as $row) {
            $legacy_list = maybe_unserialize($row->meta_value);
            if (is_array($legacy_list) && in_array($slug, $legacy_list, true)) {
                return $row;
            }
        }
        return null;
    }

    /**
     * Run full database migration for all media posts
     */
    public static function run_slug_migration() {
        global $wpdb;

        $stats = [
            'total_found' => 0,
            'updated'     => 0,
            'skipped'     => 0,
            'errors'      => 0,
            'logs'        => []
        ];

        $post_types = [
            Cinema_Window_Content_Model::CPT_MOVIE,
            Cinema_Window_Content_Model::CPT_TV,
            Cinema_Window_Content_Model::CPT_ANIME
        ];

        foreach ($post_types as $cpt) {
            $posts = $wpdb->get_results($wpdb->prepare(
                "SELECT ID, post_title, post_name, post_type FROM {$wpdb->posts}
                 WHERE post_type = %s AND post_status = 'publish'",
                $cpt
            ));

            foreach ($posts as $p) {
                $stats['total_found']++;
                $post_id = $p->ID;
                $current_slug = $p->post_name;
                $title = $p->post_title;
                $original_title = get_post_meta($post_id, '_cw_original_title', true);
                $tmdb_id = intval(get_post_meta($post_id, '_cw_tmdb_id', true));

                // Generate new clean Latin slug
                $new_slug = Cinema_Window_Arabic::media_slug($title, $original_title);
                if (empty($new_slug)) {
                    $type_prefix = ($cpt === Cinema_Window_Content_Model::CPT_MOVIE) ? 'movie' : (($cpt === Cinema_Window_Content_Model::CPT_ANIME) ? 'anime' : 'tv');
                    $new_slug = "{$type_prefix}-{$tmdb_id}";
                }

                // Deduplicate collision if another post already owns this slug
                $existing_owner = get_page_by_path($new_slug, OBJECT, $cpt);
                if ($existing_owner && (int)$existing_owner->ID !== (int)$post_id) {
                    $new_slug .= '-' . substr(md5((string)$tmdb_id), 0, 6);
                }

                // If slug is already clean and matches, skip
                if ($current_slug === $new_slug && Cinema_Window_Arabic::is_clean_latin_slug($current_slug)) {
                    $stats['skipped']++;
                    continue;
                }

                // Record old slug into legacy redirects meta
                $legacy_slugs = get_post_meta($post_id, self::LEGACY_SLUG_META, true);
                if (!is_array($legacy_slugs)) {
                    $legacy_slugs = [];
                }
                if (!in_array($current_slug, $legacy_slugs, true)) {
                    $legacy_slugs[] = $current_slug;
                }
                $raw_decoded = rawurldecode($current_slug);
                if ($raw_decoded !== $current_slug && !in_array($raw_decoded, $legacy_slugs, true)) {
                    $legacy_slugs[] = $raw_decoded;
                }
                update_post_meta($post_id, self::LEGACY_SLUG_META, $legacy_slugs);

                // Update post_name in wp_posts
                $update_res = $wpdb->update(
                    $wpdb->posts,
                    ['post_name' => $new_slug],
                    ['ID' => $post_id],
                    ['%s'],
                    ['%d']
                );

                if ($update_res !== false) {
                    clean_post_cache($post_id);
                    $stats['updated']++;
                    if (count($stats['logs']) < 15) {
                        $stats['logs'][] = "تم تحويل: [{$title}] من `{$current_slug}` -> `{$new_slug}`";
                    }
                } else {
                    $stats['errors']++;
                }
            }
        }

        // Migrate Episodes to maintain clean parent slug links
        $episodes = $wpdb->get_results(
            "SELECT p.ID, p.post_name, m1.meta_value as series_id, m2.meta_value as s_num, m3.meta_value as e_num
             FROM {$wpdb->posts} p
             INNER JOIN {$wpdb->postmeta} m1 ON p.ID = m1.post_id AND m1.meta_key = '_cw_series_post_id'
             INNER JOIN {$wpdb->postmeta} m2 ON p.ID = m2.post_id AND m2.meta_key = '_cw_season_number'
             INNER JOIN {$wpdb->postmeta} m3 ON p.ID = m3.post_id AND m3.meta_key = '_cw_episode_number'
             WHERE p.post_type = 'cw_episode'"
        );

        foreach ($episodes as $ep) {
            $parent_slug = get_post_field('post_name', $ep->series_id);
            if ($parent_slug) {
                $clean_ep_slug = "{$parent_slug}-s{$ep->s_num}-e{$ep->e_num}";
                if ($ep->post_name !== $clean_ep_slug) {
                    $wpdb->update(
                        $wpdb->posts,
                        ['post_name' => $clean_ep_slug],
                        ['ID' => $ep->ID],
                        ['%s'],
                        ['%d']
                    );
                    clean_post_cache($ep->ID);
                }
            }
        }

        return $stats;
    }

    public static function ajax_run_migration() {
        check_ajax_referer('cw_admin_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'غير مصرح'], 403);
        }

        $stats = self::run_slug_migration();
        wp_send_json_success($stats);
    }
}

Cinema_Window_Migration::init();
