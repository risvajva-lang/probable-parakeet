<?php
/**
 * REST API Endpoints for Cinema Window
 * Exposes real stored database content, internal episode navigation links, user sync, and manual triggers.
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_REST_API {

    const NAMESPACE = 'cinema-window/v1';

    public static function init() {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    public static function register_routes() {
        // 1. Get Stored Media List
        register_rest_route(self::NAMESPACE, '/media', [
            'methods'             => 'GET',
            'callback'            => [__CLASS__, 'get_media_list'],
            'permission_callback' => '__return_true'
        ]);

        // 2. Get Media Details by ID or Slug
        register_rest_route(self::NAMESPACE, '/media/(?P<id_or_slug>[a-zA-Z0-9\-_]+)', [
            'methods'             => 'GET',
            'callback'            => [__CLASS__, 'get_media_detail'],
            'permission_callback' => '__return_true'
        ]);

        // 3. Get Season Episodes with Previous / Next navigation links
        register_rest_route(self::NAMESPACE, '/media/(?P<id>\d+)/season/(?P<season>\d+)/episodes', [
            'methods'             => 'GET',
            'callback'            => [__CLASS__, 'get_season_episodes'],
            'permission_callback' => '__return_true'
        ]);

        // 4. Recently Added Media
        register_rest_route(self::NAMESPACE, '/recently-added', [
            'methods'             => 'GET',
            'callback'            => [__CLASS__, 'get_recently_added'],
            'permission_callback' => '__return_true'
        ]);

        // 5. Sync Trigger (Admin or authenticated secret)
        register_rest_route(self::NAMESPACE, '/sync', [
            'methods'             => 'POST',
            'callback'            => [__CLASS__, 'trigger_sync'],
            'permission_callback' => [__CLASS__, 'check_admin_permission']
        ]);

        // 6. Sync Status & Logs
        register_rest_route(self::NAMESPACE, '/sync/status', [
            'methods'             => 'GET',
            'callback'            => [__CLASS__, 'get_sync_status'],
            'permission_callback' => '__return_true'
        ]);

        // 7. User Favorites Sync
        register_rest_route(self::NAMESPACE, '/user/favorites', [
            'methods'             => ['GET', 'POST'],
            'callback'            => [__CLASS__, 'handle_user_favorites'],
            'permission_callback' => 'is_user_logged_in'
        ]);

        // 8. User Watch History Sync
        register_rest_route(self::NAMESPACE, '/user/history', [
            'methods'             => ['GET', 'POST'],
            'callback'            => [__CLASS__, 'handle_user_history'],
            'permission_callback' => 'is_user_logged_in'
        ]);
    }

    public static function check_admin_permission($request) {
        if (current_user_can('manage_options')) {
            return true;
        }
        $secret = $request->get_header('X-CW-Sync-Key');
        $stored_secret = get_option('cw_sync_secret_key');
        if (!empty($secret) && !empty($stored_secret) && hash_equals($stored_secret, $secret)) {
            return true;
        }
        return new WP_Error('rest_forbidden', 'غير مصرح لك بإجراء هذه العملية.', ['status' => 403]);
    }

    public static function get_media_list($request) {
        $type = sanitize_text_field($request->get_param('type') ?: 'all');
        $page = max(1, intval($request->get_param('page') ?: 1));
        $per_page = min(50, max(1, intval($request->get_param('per_page') ?: 20)));
        $search = sanitize_text_field($request->get_param('search') ?: '');

        $cpt = [];
        if ($type === 'movie') {
            $cpt[] = Cinema_Window_Content_Model::CPT_MOVIE;
        } elseif ($type === 'tv') {
            $cpt[] = Cinema_Window_Content_Model::CPT_TV;
        } elseif ($type === 'anime') {
            $cpt[] = Cinema_Window_Content_Model::CPT_ANIME;
        } else {
            $cpt = [Cinema_Window_Content_Model::CPT_MOVIE, Cinema_Window_Content_Model::CPT_TV, Cinema_Window_Content_Model::CPT_ANIME];
        }

        $args = [
            'post_type'      => $cpt,
            'post_status'    => 'publish',
            'paged'          => $page,
            'posts_per_page' => $per_page,
            'orderby'        => 'date',
            'order'          => 'DESC'
        ];

        if (!empty($search)) {
            $args['s'] = $search;
        }

        $query = new WP_Query($args);
        $items = [];

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $formatted = Cinema_Window_Content_Model::format_media_post(get_the_ID());
                if ($formatted) {
                    $items[] = $formatted;
                }
            }
            wp_reset_postdata();
        }

        return rest_ensure_response([
            'items'        => $items,
            'total'        => $query->found_posts,
            'totalPages'   => $query->max_num_pages,
            'currentPage'  => $page
        ]);
    }

    public static function get_media_detail($request) {
        $id_or_slug = sanitize_text_field($request->get_param('id_or_slug'));

        $post_id = 0;
        if (is_numeric($id_or_slug)) {
            $post_id = intval($id_or_slug);
        } else {
            // Find by slug
            global $wpdb;
            $post_id = $wpdb->get_var($wpdb->prepare(
                "SELECT ID FROM {$wpdb->posts} WHERE post_name = %s AND post_status = 'publish' LIMIT 1",
                $id_or_slug
            ));
        }

        if (!$post_id) {
            return new WP_Error('not_found', 'المحتوى المطلوب غير موجود', ['status' => 404]);
        }

        $item = Cinema_Window_Content_Model::format_media_post($post_id);
        if (!$item) {
            return new WP_Error('not_found', 'المحتوى المطلوب غير موجود', ['status' => 404]);
        }

        return rest_ensure_response($item);
    }

    public static function get_season_episodes($request) {
        $post_id = intval($request->get_param('id'));
        $season_number = intval($request->get_param('season'));

        $series = get_post($post_id);
        if (!$series) {
            return new WP_Error('not_found', 'المسلسل غير موجود', ['status' => 404]);
        }

        $series_tmdb_id = get_post_meta($post_id, '_cw_tmdb_id', true);
        $series_type = get_post_meta($post_id, '_cw_media_type', true) ?: 'tv';

        $episodes_posts = get_posts([
            'post_type'      => Cinema_Window_Content_Model::CPT_EPISODE,
            'posts_per_page' => 100,
            'meta_query'     => [
                'relation' => 'AND',
                [
                    'key'     => '_cw_series_post_id',
                    'value'   => $post_id,
                    'compare' => '='
                ],
                [
                    'key'     => '_cw_season_number',
                    'value'   => $season_number,
                    'compare' => '='
                ]
            ],
            'orderby'        => 'meta_value_num',
            'meta_key'       => '_cw_episode_number',
            'order'          => 'ASC'
        ]);

        $episodes = [];
        $count = count($episodes_posts);

        for ($i = 0; $i < $count; $i++) {
            $ep = $episodes_posts[$i];
            $ep_num = intval(get_post_meta($ep->ID, '_cw_episode_number', true));
            $runtime = get_post_meta($ep->ID, '_cw_runtime', true);
            $still_path = get_post_meta($ep->ID, '_cw_still_path', true);
            $air_date = get_post_meta($ep->ID, '_cw_air_date', true);

            // Previous & Next Episode Links
            $prev_link = ($i > 0)
                ? home_url("/{$series_type}/{$series->post_name}/season-{$season_number}/episode-" . get_post_meta($episodes_posts[$i - 1]->ID, '_cw_episode_number', true))
                : null;
            $next_link = ($i < $count - 1)
                ? home_url("/{$series_type}/{$series->post_name}/season-{$season_number}/episode-" . get_post_meta($episodes_posts[$i + 1]->ID, '_cw_episode_number', true))
                : null;

            $status = get_post_meta($ep->ID, '_cw_status', true) ?: 'released';
            $is_upcoming = (get_post_meta($ep->ID, '_cw_is_upcoming', true) === '1' || $status === 'upcoming');
            $airstamp = get_post_meta($ep->ID, '_cw_airstamp', true);

            $episodes[] = [
                'id'            => $ep->ID,
                'episodeNumber' => $ep_num,
                'seasonNumber'  => $season_number,
                'title'         => $ep->post_title,
                'overview'      => $ep->post_content,
                'stillPath'     => $still_path ? Cinema_Window_TMDb::get_image_url($still_path, 'w500') : '',
                'runtime'       => !empty($runtime) ? intval($runtime) : null,
                'duration'      => !empty($runtime) ? intval($runtime) . ' دقيقة' : null,
                'airDate'       => $air_date,
                'airstamp'      => $airstamp ?: null,
                'status'        => $status,
                'isUpcoming'    => $is_upcoming,
                'canonicalUrl'  => home_url("/{$series_type}/{$series->post_name}/season-{$season_number}/episode-{$ep_num}"),
                'prevEpisode'   => $prev_link,
                'nextEpisode'   => $next_link
            ];
        }

        return rest_ensure_response([
            'seriesId'     => $post_id,
            'seasonNumber' => $season_number,
            'episodes'     => $episodes
        ]);
    }

    public static function get_recently_added($request) {
        $limit = min(24, max(1, intval($request->get_param('limit') ?: 12)));

        $posts = get_posts([
            'post_type'      => [Cinema_Window_Content_Model::CPT_MOVIE, Cinema_Window_Content_Model::CPT_TV, Cinema_Window_Content_Model::CPT_ANIME],
            'posts_per_page' => $limit,
            'post_status'    => 'publish',
            'orderby'        => 'date',
            'order'          => 'DESC'
        ]);

        $items = [];
        foreach ($posts as $p) {
            $formatted = Cinema_Window_Content_Model::format_media_post($p->ID);
            if ($formatted) {
                $items[] = $formatted;
            }
        }

        return rest_ensure_response($items);
    }

    public static function trigger_sync($request) {
        $type = sanitize_text_field($request->get_param('type') ?: 'all');
        $res = Cinema_Window_Sync_Engine::run_sync($type);
        return rest_ensure_response($res);
    }

    public static function get_sync_status() {
        return rest_ensure_response([
            'stats' => Cinema_Window_Sync_Engine::get_stats(),
            'logs'  => Cinema_Window_Sync_Engine::get_logs()
        ]);
    }

    public static function handle_user_favorites($request) {
        $user_id = get_current_user_id();
        if ($request->get_method() === 'POST') {
            $favorites = $request->get_param('favorites');
            if (is_array($favorites)) {
                update_user_meta($user_id, 'cw_favorites', $favorites);
            }
            return rest_ensure_response(['success' => true]);
        }
        $saved = get_user_meta($user_id, 'cw_favorites', true) ?: [];
        return rest_ensure_response(['favorites' => $saved]);
    }

    public static function handle_user_history($request) {
        $user_id = get_current_user_id();
        if ($request->get_method() === 'POST') {
            $history = $request->get_param('history');
            if (is_array($history)) {
                update_user_meta($user_id, 'cw_history', $history);
            }
            return rest_ensure_response(['success' => true]);
        }
        $saved = get_user_meta($user_id, 'cw_history', true) ?: [];
        return rest_ensure_response(['history' => $saved]);
    }
}

Cinema_Window_REST_API::init();
