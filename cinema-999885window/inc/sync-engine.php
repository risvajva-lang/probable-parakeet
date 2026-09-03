<?php
/**
 * Auto-Discovery & Content Synchronization Engine for Cinema Window
 * Handles scheduled TMDb sync, movie imports, TV/Anime seasons & episodes creation,
 * change detection (no fake updates), deduplication, and structured logging.
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_Sync_Engine {

    const LOCK_PREFIX = 'cw_sync_lock_';
    const LOGS_KEY    = 'cw_sync_recent_logs';
    const STATS_KEY   = 'cw_sync_stats';

    public static function init() {
        // Register custom cron intervals
        add_filter('cron_schedules', [__CLASS__, 'add_cron_intervals']);

        // Register WP-Cron hooks
        add_action('cw_sync_movies_event', [__CLASS__, 'cron_sync_movies']);
        add_action('cw_sync_tv_event', [__CLASS__, 'cron_sync_tv']);
        add_action('cw_sync_anime_event', [__CLASS__, 'cron_sync_anime']);

        // Schedule events if not already scheduled
        if (!wp_next_scheduled('cw_sync_movies_event')) {
            wp_schedule_event(time(), 'daily', 'cw_sync_movies_event');
        }
        if (!wp_next_scheduled('cw_sync_tv_event')) {
            wp_schedule_event(time(), 'six_hours', 'cw_sync_tv_event');
        }
        if (!wp_next_scheduled('cw_sync_anime_event')) {
            wp_schedule_event(time() + 1800, 'six_hours', 'cw_sync_anime_event');
        }
    }

    public static function add_cron_intervals($schedules) {
        if (!isset($schedules['six_hours'])) {
            $schedules['six_hours'] = [
                'interval' => 6 * HOUR_IN_SECONDS,
                'display'  => __('كل 6 ساعات', 'cinema-window')
            ];
        }
        return $schedules;
    }

    public static function cron_sync_movies() {
        self::run_sync('movies');
    }

    public static function cron_sync_tv() {
        self::run_sync('tv');
    }

    public static function cron_sync_anime() {
        self::run_sync('anime');
    }

    private static function acquire_lock($type) {
        $lock_key = self::LOCK_PREFIX . $type;
        $locked = get_transient($lock_key);
        if ($locked) {
            return false;
        }
        // 10 minutes lock timeout
        set_transient($lock_key, time(), 600);
        return true;
    }

    private static function release_lock($type) {
        $lock_key = self::LOCK_PREFIX . $type;
        delete_transient($lock_key);
    }

    /**
     * Run Synchronization
     *
     * @param string $type 'all' | 'movies' | 'tv' | 'anime'
     * @return array
     */
    public static function run_sync($type = 'all') {
        if (!self::acquire_lock($type)) {
            return [
                'success' => false,
                'message' => 'عملية مزامنة من نفس النوع جارية حالياً، يرجى الانتظار.'
            ];
        }

        $sync_id    = 'sync_' . date('Ymd_His') . '_' . wp_generate_password(4, false);
        $start_time = microtime(true);
        $start_date = current_time('mysql');

        $stats = [
            'checked'          => 0,
            'created'          => 0,
            'updated'          => 0,
            'skipped'          => 0,
            'created_episodes' => 0,
            'updated_episodes' => 0,
            'errors'           => 0
        ];

        $error_messages = [];

        try {
            // 1. Sync Movies (Discover + Popular)
            if ($type === 'movies' || $type === 'all') {
                self::sync_movies_batch($stats, $error_messages);
            }

            // 2. Sync TV Series
            if ($type === 'tv' || $type === 'all') {
                self::sync_tv_batch($stats, $error_messages, false);
            }

            // 3. Sync Anime Series
            if ($type === 'anime' || $type === 'all') {
                self::sync_tv_batch($stats, $error_messages, true);
            }

            $duration = round(microtime(true) - $start_time, 2);

            $log_entry = [
                'sync_id'          => $sync_id,
                'timestamp'        => $start_date,
                'finish_date'      => current_time('mysql'),
                'type'             => $type,
                'status'           => empty($error_messages) ? 'Success' : 'Completed with warnings',
                'checked'          => $stats['checked'],
                'created'          => $stats['created'],
                'updated'          => $stats['updated'],
                'skipped'          => $stats['skipped'],
                'created_episodes' => $stats['created_episodes'],
                'updated_episodes' => $stats['updated_episodes'],
                'errors'           => $stats['errors'],
                'duration'         => "{$duration}s",
                'messages'         => array_slice($error_messages, 0, 5)
            ];

            self::save_log($log_entry);
            self::update_system_stats($type, $stats, $start_date);

            self::release_lock($type);

            return [
                'success' => true,
                'data'    => $log_entry
            ];

        } catch (Exception $e) {
            self::release_lock($type);
            $error_log = [
                'sync_id'     => $sync_id,
                'timestamp'   => $start_date,
                'finish_date' => current_time('mysql'),
                'type'        => $type,
                'status'      => 'Failed',
                'checked'     => $stats['checked'],
                'created'     => $stats['created'],
                'updated'     => $stats['updated'],
                'skipped'     => $stats['skipped'],
                'errors'      => $stats['errors'] + 1,
                'duration'    => round(microtime(true) - $start_time, 2) . 's',
                'messages'    => [$e->getMessage()]
            ];
            self::save_log($error_log);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Batch Sync Movies from TMDb
     */
    private static function sync_movies_batch(&$stats, &$error_messages) {
        $discover_pages = [1, 2];
        foreach ($discover_pages as $page) {
            $data = Cinema_Window_TMDb::discover('movie', [
                'sort_by' => 'popularity.desc',
                'page'    => $page
            ]);

            if (empty($data['results'])) continue;

            foreach ($data['results'] as $movie_item) {
                $stats['checked']++;
                $tmdb_id = intval($movie_item['id']);

                try {
                    $details = Cinema_Window_TMDb::get_details($tmdb_id, 'movie');
                    if (!$details) {
                        $stats['errors']++;
                        continue;
                    }

                    self::import_or_update_movie($details, $stats);
                } catch (Exception $ex) {
                    $stats['errors']++;
                    $error_messages[] = "Movie {$tmdb_id}: " . $ex->getMessage();
                }
            }
        }
    }

    /**
     * Import or update a single Movie with Change Detection (No Fake Modified Dates)
     */
    public static function import_or_update_movie($details, &$stats) {
        $tmdb_id = intval($details['id']);
        $existing_post_id = Cinema_Window_Content_Model::find_by_tmdb_id($tmdb_id, 'movie');

        $title = !empty($details['title']) ? $details['title'] : ($details['original_title'] ?? 'فيلم');
        $overview = !empty($details['overview']) ? $details['overview'] : '';
        $release_date = !empty($details['release_date']) ? $details['release_date'] : '';
        $year = $release_date ? substr($release_date, 0, 4) : '';
        $runtime = !empty($details['runtime']) ? intval($details['runtime']) : null;
        $poster_path = !empty($details['poster_path']) ? $details['poster_path'] : '';
        $backdrop_path = !empty($details['backdrop_path']) ? $details['backdrop_path'] : '';
        $vote_avg = !empty($details['vote_average']) ? round(floatval($details['vote_average']), 1) : 0;
        $vote_cnt = !empty($details['vote_count']) ? intval($details['vote_count']) : 0;

        $genres = [];
        if (!empty($details['genres']) && is_array($details['genres'])) {
            foreach ($details['genres'] as $g) {
                $genres[] = $g['name'];
            }
        }

        // Calculate Checksum of fields to verify genuine changes
        $data_signature = md5(json_encode([
            'title'         => $title,
            'overview'      => $overview,
            'release_date'  => $release_date,
            'runtime'       => $runtime,
            'poster_path'   => $poster_path,
            'backdrop_path' => $backdrop_path,
            'vote_avg'      => $vote_avg,
            'vote_cnt'      => $vote_cnt,
            'genres'        => $genres
        ]));

        $orig_title = $details['original_title'] ?? '';
        $translations = $details['translations']['translations'] ?? [];
        $slug_text = Cinema_Window_Arabic::media_slug($title, $orig_title, $translations);
        $clean_slug = !empty($slug_text) ? $slug_text : "movie-{$tmdb_id}";
        $slug_owner = get_page_by_path($clean_slug, OBJECT, Cinema_Window_Content_Model::CPT_MOVIE);
        if ($slug_owner && (!$existing_post_id || (int) $slug_owner->ID !== (int) $existing_post_id)) {
            $clean_slug .= '-' . substr(md5((string) $tmdb_id), 0, 6);
        }

        if ($existing_post_id) {
            $current_hash = get_post_meta($existing_post_id, '_cw_data_hash', true);
            if ($current_hash === $data_signature && get_post_field('post_name', $existing_post_id) === $clean_slug) {
                // No data or URL change detected.
                $stats['skipped']++;
                return $existing_post_id;
            }

            // Real change detected: update post and bump post_modified
            wp_update_post([
                'ID'           => $existing_post_id,
                'post_title'   => $title,
                'post_content' => $overview,
                'post_name'    => $clean_slug
            ]);

            self::save_movie_metadata($existing_post_id, $tmdb_id, $details, $data_signature, $runtime, $poster_path, $backdrop_path, $vote_avg, $vote_cnt, $release_date, $year, $genres);
            $stats['updated']++;
            return $existing_post_id;
        } else {
            // Create New Movie Post
            $new_post_id = wp_insert_post([
                'post_type'    => Cinema_Window_Content_Model::CPT_MOVIE,
                'post_title'   => $title,
                'post_content' => $overview,
                'post_status'  => 'publish',
                'post_name'    => $clean_slug
            ]);

            if ($new_post_id && !is_wp_error($new_post_id)) {
                self::save_movie_metadata($new_post_id, $tmdb_id, $details, $data_signature, $runtime, $poster_path, $backdrop_path, $vote_avg, $vote_cnt, $release_date, $year, $genres);
                $stats['created']++;
                return $new_post_id;
            }
        }
        return null;
    }

    private static function save_movie_metadata($post_id, $tmdb_id, $details, $data_signature, $runtime, $poster_path, $backdrop_path, $vote_avg, $vote_cnt, $release_date, $year, $genres) {
        update_post_meta($post_id, '_cw_tmdb_id', $tmdb_id);
        update_post_meta($post_id, '_cw_media_type', 'movie');
        update_post_meta($post_id, '_cw_original_title', $details['original_title'] ?? '');
        update_post_meta($post_id, '_cw_release_date', $release_date);
        update_post_meta($post_id, '_cw_year', $year);
        update_post_meta($post_id, '_cw_runtime', $runtime); // real runtime or null
        update_post_meta($post_id, '_cw_poster_path', $poster_path);
        update_post_meta($post_id, '_cw_backdrop_path', $backdrop_path);
        update_post_meta($post_id, '_cw_vote_average', $vote_avg);
        update_post_meta($post_id, '_cw_vote_count', $vote_cnt);
        update_post_meta($post_id, '_cw_genres', $genres);
        update_post_meta($post_id, '_cw_data_hash', $data_signature);
        update_post_meta($post_id, '_cw_last_synced', current_time('mysql'));

        // Assign Taxonomies
        if (!empty($genres)) {
            wp_set_object_terms($post_id, $genres, Cinema_Window_Content_Model::TAX_GENRE);
        }
        if (!empty($year)) {
            wp_set_object_terms($post_id, $year, Cinema_Window_Content_Model::TAX_YEAR);
        }
    }

    /**
     * Batch Sync TV & Anime Series + Seasons + Episodes
     */
    private static function sync_tv_batch(&$stats, &$error_messages, $is_anime = false) {
        $processed_tmdb_ids = [];

        // 1. Discover newly popular / trending series from TMDb
        $params = [
            'sort_by' => 'popularity.desc',
            'page'    => 1
        ];

        if ($is_anime) {
            $params['with_genres'] = 16;
            $params['with_original_language'] = 'ja';
        }

        $data = Cinema_Window_TMDb::discover('tv', $params);
        if (!empty($data['results'])) {
            foreach ($data['results'] as $tv_item) {
                $stats['checked']++;
                $tmdb_id = intval($tv_item['id']);
                $processed_tmdb_ids[$tmdb_id] = true;

                try {
                    $details = Cinema_Window_TMDb::get_details($tmdb_id, 'tv');
                    if (!$details) {
                        $stats['errors']++;
                        continue;
                    }

                    self::import_or_update_tv_series($details, $stats, $is_anime);
                } catch (Exception $ex) {
                    $stats['errors']++;
                    $error_messages[] = "TV {$tmdb_id}: " . $ex->getMessage();
                }
            }
        }

        // 2. Synchronize all existing series already in WordPress DB (ensures new episodes/seasons are always added)
        $cpt = $is_anime ? Cinema_Window_Content_Model::CPT_ANIME : Cinema_Window_Content_Model::CPT_TV;
        $existing_posts = get_posts([
            'post_type'      => $cpt,
            'post_status'    => 'publish',
            'posts_per_page' => 100,
            'fields'         => 'ids',
            'no_found_rows'  => true
        ]);

        if (!empty($existing_posts)) {
            foreach ($existing_posts as $post_id) {
                $tmdb_id = (int) get_post_meta($post_id, '_cw_tmdb_id', true);
                if ($tmdb_id <= 0 || isset($processed_tmdb_ids[$tmdb_id])) {
                    continue;
                }
                $processed_tmdb_ids[$tmdb_id] = true;
                $stats['checked']++;

                try {
                    $details = Cinema_Window_TMDb::get_details($tmdb_id, 'tv');
                    if (!$details) {
                        $stats['errors']++;
                        continue;
                    }

                    self::import_or_update_tv_series($details, $stats, $is_anime);
                } catch (Exception $ex) {
                    $stats['errors']++;
                    $error_messages[] = "Existing series {$tmdb_id}: " . $ex->getMessage();
                }
            }
        }
    }

    /**
     * Import or update TV/Anime Series and discover new Seasons and Episodes
     */
    public static function import_or_update_tv_series($details, &$stats, $is_anime = false) {
        $tmdb_id = intval($details['id']);
        $media_type = $is_anime ? 'anime' : 'tv';
        $existing_post_id = Cinema_Window_Content_Model::find_by_tmdb_id($tmdb_id, $media_type);

        $title = !empty($details['name']) ? $details['name'] : ($details['original_name'] ?? 'مسلسل');
        $overview = !empty($details['overview']) ? $details['overview'] : '';
        $first_air_date = !empty($details['first_air_date']) ? $details['first_air_date'] : '';
        $year = $first_air_date ? substr($first_air_date, 0, 4) : '';
        $poster_path = !empty($details['poster_path']) ? $details['poster_path'] : '';
        $backdrop_path = !empty($details['backdrop_path']) ? $details['backdrop_path'] : '';
        $vote_avg = !empty($details['vote_average']) ? round(floatval($details['vote_average']), 1) : 0;
        $vote_cnt = !empty($details['vote_count']) ? intval($details['vote_count']) : 0;
        $number_of_seasons = !empty($details['number_of_seasons']) ? intval($details['number_of_seasons']) : 1;

        $genres = [];
        if (!empty($details['genres']) && is_array($details['genres'])) {
            foreach ($details['genres'] as $g) {
                $genres[] = $g['name'];
            }
        }

        $seasons_summary = [];
        if (!empty($details['seasons']) && is_array($details['seasons'])) {
            foreach ($details['seasons'] as $s) {
                if ($s['season_number'] > 0) {
                    $seasons_summary[] = [
                        'seasonNumber'  => intval($s['season_number']),
                        'title'         => $s['name'] ?? ("الموسم " . $s['season_number']),
                        'episodesCount' => intval($s['episode_count'] ?? 0),
                        'posterPath'    => $s['poster_path'] ?? '',
                        'airDate'       => $s['air_date'] ?? ''
                    ];
                }
            }
        }

        $data_signature = md5(json_encode([
            'title'             => $title,
            'overview'          => $overview,
            'first_air_date'    => $first_air_date,
            'poster_path'       => $poster_path,
            'backdrop_path'     => $backdrop_path,
            'vote_avg'          => $vote_avg,
            'vote_cnt'          => $vote_cnt,
            'number_of_seasons' => $number_of_seasons,
            'seasons'           => $seasons_summary
        ]));

        $orig_name = $details['original_name'] ?? '';
        $translations = $details['translations']['translations'] ?? [];
        $slug_text = Cinema_Window_Arabic::media_slug($title, $orig_name, $translations);
        $clean_slug = !empty($slug_text) ? $slug_text : "series-{$tmdb_id}";
        $target_cpt = $is_anime ? Cinema_Window_Content_Model::CPT_ANIME : Cinema_Window_Content_Model::CPT_TV;
        $slug_owner = get_page_by_path($clean_slug, OBJECT, $target_cpt);
        if ($slug_owner && (!$existing_post_id || (int) $slug_owner->ID !== (int) $existing_post_id)) {
            $clean_slug .= '-' . substr(md5((string) $tmdb_id), 0, 6);
        }
        $series_post_id = null;

        if ($existing_post_id) {
            $current_hash = get_post_meta($existing_post_id, '_cw_data_hash', true);
            $series_post_id = $existing_post_id;

            if ($current_hash !== $data_signature || get_post_field('post_name', $existing_post_id) !== $clean_slug) {
                wp_update_post([
                    'ID'           => $existing_post_id,
                    'post_title'   => $title,
                    'post_content' => $overview,
                    'post_name'    => $clean_slug
                ]);
                self::save_tv_metadata($existing_post_id, $tmdb_id, $media_type, $details, $data_signature, $poster_path, $backdrop_path, $vote_avg, $vote_cnt, $first_air_date, $year, $genres, $seasons_summary);
                $stats['updated']++;
            } else {
                $stats['skipped']++;
            }
        } else {
            $cpt = $is_anime ? Cinema_Window_Content_Model::CPT_ANIME : Cinema_Window_Content_Model::CPT_TV;
            $new_post_id = wp_insert_post([
                'post_type'    => $cpt,
                'post_title'   => $title,
                'post_content' => $overview,
                'post_status'  => 'publish',
                'post_name'    => $clean_slug
            ]);

            if ($new_post_id && !is_wp_error($new_post_id)) {
                $series_post_id = $new_post_id;
                self::save_tv_metadata($new_post_id, $tmdb_id, $media_type, $details, $data_signature, $poster_path, $backdrop_path, $vote_avg, $vote_cnt, $first_air_date, $year, $genres, $seasons_summary);
                $stats['created']++;
            }
        }

        // Sync Episodes for all valid seasons
        if ($series_post_id && !empty($seasons_summary)) {
            foreach ($seasons_summary as $season_info) {
                self::sync_season_episodes($series_post_id, $tmdb_id, $clean_slug, $season_info['seasonNumber'], $media_type, $stats);
            }
        }

        return $series_post_id;
    }

    private static function save_tv_metadata($post_id, $tmdb_id, $media_type, $details, $data_signature, $poster_path, $backdrop_path, $vote_avg, $vote_cnt, $first_air_date, $year, $genres, $seasons_summary) {
        update_post_meta($post_id, '_cw_tmdb_id', $tmdb_id);
        update_post_meta($post_id, '_cw_media_type', $media_type);
        update_post_meta($post_id, '_cw_original_title', $details['original_name'] ?? '');
        update_post_meta($post_id, '_cw_release_date', $first_air_date);
        update_post_meta($post_id, '_cw_year', $year);
        update_post_meta($post_id, '_cw_poster_path', $poster_path);
        update_post_meta($post_id, '_cw_backdrop_path', $backdrop_path);
        update_post_meta($post_id, '_cw_vote_average', $vote_avg);
        update_post_meta($post_id, '_cw_vote_count', $vote_cnt);
        update_post_meta($post_id, '_cw_genres', $genres);
        update_post_meta($post_id, '_cw_seasons_data', $seasons_summary);
        update_post_meta($post_id, '_cw_data_hash', $data_signature);
        update_post_meta($post_id, '_cw_last_synced', current_time('mysql'));

        if (!empty($genres)) {
            wp_set_object_terms($post_id, $genres, Cinema_Window_Content_Model::TAX_GENRE);
        }
        if (!empty($year)) {
            wp_set_object_terms($post_id, $year, Cinema_Window_Content_Model::TAX_YEAR);
        }
    }

    /**
     * Determine whether an episode is already released or upcoming
     *
     * @param string|null $air_date YYYY-MM-DD
     * @param string|null $airstamp ISO-8601 timestamp
     * @return string 'released' | 'upcoming'
     */
    public static function determine_episode_status($air_date, $airstamp = null) {
        $now = time();
        if (!empty($airstamp)) {
            $ts = strtotime($airstamp);
            if ($ts !== false) {
                return $ts <= $now ? 'released' : 'upcoming';
            }
        }
        if (!empty($air_date)) {
            $ts = strtotime($air_date . ' 23:59:59');
            if ($ts !== false) {
                return $ts <= $now ? 'released' : 'upcoming';
            }
        }
        return 'upcoming';
    }

    /**
     * Sync Episodes of a Specific Season
     */
    public static function sync_season_episodes($series_post_id, $series_tmdb_id, $series_slug, $season_number, $media_type, &$stats) {
        $season_data = Cinema_Window_TMDb::get_season($series_tmdb_id, $season_number);
        if (empty($season_data['episodes']) || !is_array($season_data['episodes'])) {
            return;
        }

        foreach ($season_data['episodes'] as $ep) {
            $ep_number = intval($ep['episode_number']);
            if ($ep_number < 1) continue;

            $ep_title = !empty($ep['name']) ? $ep['name'] : "الحلقة {$ep_number}";
            $ep_overview = !empty($ep['overview']) ? $ep['overview'] : '';
            $still_path = !empty($ep['still_path']) ? $ep['still_path'] : '';
            $runtime = !empty($ep['runtime']) ? intval($ep['runtime']) : null;
            $air_date = !empty($ep['air_date']) ? $ep['air_date'] : '';
            $airstamp = !empty($ep['airstamp']) ? $ep['airstamp'] : null;
            $tmdb_ep_id = !empty($ep['id']) ? intval($ep['id']) : 0;
            $status = self::determine_episode_status($air_date, $airstamp);

            $ep_hash = md5(json_encode([
                'name'       => $ep_title,
                'overview'   => $ep_overview,
                'still_path' => $still_path,
                'runtime'    => $runtime,
                'air_date'   => $air_date,
                'status'     => $status
            ]));

            $existing_ep_id = Cinema_Window_Content_Model::find_episode($series_tmdb_id, $season_number, $ep_number);
            $ep_slug = "{$series_slug}-s{$season_number}-e{$ep_number}";

            if ($existing_ep_id) {
                $cur_ep_hash = get_post_meta($existing_ep_id, '_cw_data_hash', true);
                if ($cur_ep_hash !== $ep_hash) {
                    wp_update_post([
                        'ID'           => $existing_ep_id,
                        'post_title'   => $ep_title,
                        'post_content' => $ep_overview
                    ]);
                    self::save_episode_meta($existing_ep_id, $series_post_id, $series_tmdb_id, $season_number, $ep_number, $tmdb_ep_id, $runtime, $still_path, $air_date, $ep_hash, $status, $airstamp);
                    $stats['updated_episodes']++;
                }
            } else {
                // Insert New Episode Post
                $new_ep_id = wp_insert_post([
                    'post_type'    => Cinema_Window_Content_Model::CPT_EPISODE,
                    'post_title'   => $ep_title,
                    'post_content' => $ep_overview,
                    'post_status'  => 'publish',
                    'post_name'    => $ep_slug
                ]);

                if ($new_ep_id && !is_wp_error($new_ep_id)) {
                    self::save_episode_meta($new_ep_id, $series_post_id, $series_tmdb_id, $season_number, $ep_number, $tmdb_ep_id, $runtime, $still_path, $air_date, $ep_hash, $status, $airstamp);
                    $stats['created_episodes']++;

                    // Trigger action for new episode notification subscribers ONLY if released
                    if ($status === 'released') {
                        do_action('cw_new_episode_published', $series_post_id, $season_number, $ep_number);
                    }
                }
            }
        }
    }

    private static function save_episode_meta($ep_post_id, $series_post_id, $series_tmdb_id, $season_number, $episode_number, $tmdb_ep_id, $runtime, $still_path, $air_date, $ep_hash, $status = 'released', $airstamp = null) {
        update_post_meta($ep_post_id, '_cw_series_post_id', $series_post_id);
        update_post_meta($ep_post_id, '_cw_series_tmdb_id', $series_tmdb_id);
        update_post_meta($ep_post_id, '_cw_season_number', $season_number);
        update_post_meta($ep_post_id, '_cw_episode_number', $episode_number);
        update_post_meta($ep_post_id, '_cw_tmdb_episode_id', $tmdb_ep_id);
        update_post_meta($ep_post_id, '_cw_runtime', $runtime); // real integer or null
        update_post_meta($ep_post_id, '_cw_still_path', $still_path);
        update_post_meta($ep_post_id, '_cw_air_date', $air_date);
        if ($airstamp) {
            update_post_meta($ep_post_id, '_cw_airstamp', $airstamp);
        }
        update_post_meta($ep_post_id, '_cw_status', $status);
        update_post_meta($ep_post_id, '_cw_is_upcoming', $status === 'upcoming' ? 1 : 0);
        update_post_meta($ep_post_id, '_cw_data_hash', $ep_hash);
    }

    private static function save_log($log) {
        $logs = get_option(self::LOGS_KEY, []);
        array_unshift($logs, $log);
        $logs = array_slice($logs, 0, 50); // Keep last 50 logs
        update_option(self::LOGS_KEY, $logs);
    }

    private static function update_system_stats($type, $stats, $start_date) {
        $all_stats = get_option(self::STATS_KEY, []);
        $all_stats['last_sync']           = $start_date;
        $all_stats['last_type']           = $type;
        $all_stats['last_status']         = 'Success';
        $all_stats['total_checked']       = ($all_stats['total_checked'] ?? 0) + $stats['checked'];
        $all_stats['total_created']       = ($all_stats['total_created'] ?? 0) + $stats['created'];
        $all_stats['total_updated']       = ($all_stats['total_updated'] ?? 0) + $stats['updated'];
        $all_stats['total_episodes_new']  = ($all_stats['total_episodes_new'] ?? 0) + $stats['created_episodes'];

        // Per-type latest counts
        $all_stats[$type . '_last_created'] = $stats['created'];
        $all_stats[$type . '_last_updated'] = $stats['updated'];
        $all_stats[$type . '_last_errors']  = $stats['errors'];

        update_option(self::STATS_KEY, $all_stats);
    }

    public static function get_stats() {
        return get_option(self::STATS_KEY, [
            'last_sync'          => 'لم يتم بعد',
            'last_status'        => 'جاهز',
            'total_checked'      => 0,
            'total_created'      => 0,
            'total_updated'      => 0,
            'total_episodes_new' => 0
        ]);
    }

    public static function get_logs() {
        return get_option(self::LOGS_KEY, []);
    }
}

Cinema_Window_Sync_Engine::init();
