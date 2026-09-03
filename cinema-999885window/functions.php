<?php
/**
 * Cinema Window Theme Functions and Definitions
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

define('CINEMA_WINDOW_VERSION', '2.3.0');
define('CINEMA_WINDOW_DIR', get_template_directory());
define('CINEMA_WINDOW_URI', get_template_directory_uri());

// Require Core Modules & Subsystems
require_once CINEMA_WINDOW_DIR . '/inc/languages.php';
require_once CINEMA_WINDOW_DIR . '/inc/content-model.php';
require_once CINEMA_WINDOW_DIR . '/inc/arabic-helpers.php';
require_once CINEMA_WINDOW_DIR . '/inc/tmdb-api.php';
require_once CINEMA_WINDOW_DIR . '/inc/sync-engine.php';
require_once CINEMA_WINDOW_DIR . '/inc/schema-org.php';
require_once CINEMA_WINDOW_DIR . '/inc/seo-opengraph.php';
require_once CINEMA_WINDOW_DIR . '/inc/stream-servers.php';
require_once CINEMA_WINDOW_DIR . '/inc/sitemap.php';
require_once CINEMA_WINDOW_DIR . '/inc/migration.php';
require_once CINEMA_WINDOW_DIR . '/inc/rest-api.php';
require_once CINEMA_WINDOW_DIR . '/inc/admin-dashboard.php';

/**
 * Theme Setup
 */
function cinema_window_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);
    add_theme_support('custom-logo', [
        'height'      => 60,
        'width'       => 200,
        'flex-width'  => true,
        'flex-height' => true,
    ]);

    register_nav_menus([
        'primary' => __('القائمة الرئيسية', 'cinema-window'),
        'footer'  => __('قائمة الفوتر', 'cinema-window'),
    ]);
}
add_action('after_setup_theme', 'cinema_window_setup');

/**
 * Strictly enforce clean English/Latin ASCII slugs across all WordPress post creations/updates
 * NEVER allow Arabic characters in URLs or post_names.
 */
function cinema_window_enforce_latin_slug($slug, $post_ID = 0, $post_status = 'publish', $post_type = 'post') {
    if (empty($slug)) return $slug;
    if (!Cinema_Window_Arabic::is_clean_latin_slug($slug)) {
        $post = $post_ID ? get_post($post_ID) : null;
        $title = $post ? $post->post_title : $slug;
        $orig = $post ? get_post_meta($post_ID, '_cw_original_title', true) : '';
        $clean = Cinema_Window_Arabic::media_slug($title, $orig);
        if (!empty($clean) && $clean !== 'media') {
            return $clean;
        }
        return Cinema_Window_Arabic::clean_ascii(Cinema_Window_Arabic::transliterate_arabic($slug));
    }
    return $slug;
}
add_filter('wp_unique_post_slug', 'cinema_window_enforce_latin_slug', 10, 4);

function cinema_window_sanitize_post_data_slug($data, $postarr) {
    if (!empty($data['post_name'])) {
        if (!Cinema_Window_Arabic::is_clean_latin_slug($data['post_name'])) {
            $orig = !empty($postarr['ID']) ? get_post_meta($postarr['ID'], '_cw_original_title', true) : '';
            $data['post_name'] = Cinema_Window_Arabic::media_slug($data['post_title'] ?? $data['post_name'], $orig);
        }
    }
    return $data;
}
add_filter('wp_insert_post_data', 'cinema_window_sanitize_post_data_slug', 10, 2);

/**
 * Enqueue Theme Scripts and Styles
 */
function cinema_window_scripts() {
    // Google Fonts: Cairo & Playfair Display
    wp_enqueue_style(
        'cinema-window-fonts',
        'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900;1000&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap',
        [],
        null
    );

    // Main Theme Stylesheet
    wp_enqueue_style(
        'cinema-window-style',
        get_stylesheet_uri(),
        [],
        CINEMA_WINDOW_VERSION
    );

    // Find and enqueue compiled CSS
    $assets_dir = file_exists(CINEMA_WINDOW_DIR . '/dist/assets') ? CINEMA_WINDOW_DIR . '/dist/assets' : CINEMA_WINDOW_DIR . '/assets';
    $assets_uri = file_exists(CINEMA_WINDOW_DIR . '/dist/assets') ? CINEMA_WINDOW_URI . '/dist/assets' : CINEMA_WINDOW_URI . '/assets';
    $css_files = glob($assets_dir . '/*.css');
    if (!empty($css_files)) {
        $main_css = basename($css_files[0]);
        wp_enqueue_style(
            'cinema-window-bundle',
            $assets_uri . '/' . $main_css,
            [],
            CINEMA_WINDOW_VERSION
        );
    }

    // Find and enqueue compiled JS (React application bundle)
    $js_files = glob($assets_dir . '/*.js');
    if (!empty($js_files)) {
        $main_js = basename($js_files[0]);
        wp_enqueue_script(
            'cinema-window-bundle',
            $assets_uri . '/' . $main_js,
            [],
            CINEMA_WINDOW_VERSION,
            true
        );

        // Localize settings for frontend
        wp_localize_script('cinema-window-bundle', 'CinemaWindowConfig', [
            'siteUrl'        => home_url(),
            'ajaxUrl'        => admin_url('admin-ajax.php'),
            'restUrl'        => esc_url_raw(rest_url('cinema-window/v1')),
            'nonce'          => wp_create_nonce('wp_rest'),
            'themeUri'       => CINEMA_WINDOW_URI,
            'isUserLoggedIn' => is_user_logged_in(),
            'initialRoute' => cinema_window_resolve_clean_route()
        ]);
    }
}
add_action('wp_enqueue_scripts', 'cinema_window_scripts');

/**
 * Add Module Type to React Bundle Script tag
 */
function cinema_window_add_module_to_script($tag, $handle, $src) {
    if ('cinema-window-bundle' === $handle) {
        $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
    }
    return $tag;
}
add_filter('script_loader_tag', 'cinema_window_add_module_to_script', 10, 3);

/**
 * Register Cinema Window Rewrite Rules for Clean Canonical Media URLs
 */
function cinema_window_custom_rewrite_rules() {
    // 1. Language + Season slug + Episode deep link: e.g. /anime/naruto/shippuden/episode-100 or /tv/game-of-thrones/season-1/episode-1
    add_rewrite_rule(
        '^(?:mua/)?(?:([a-z]{2})/)?(movie|tv|anime|cartoon)/([^/]+)/([^/]+)/episode-([0-9]+)/?$',
        'index.php?cw_lang=$matches[1]&cw_media_type=$matches[2]&cw_slug_id=$matches[3]&cw_season_slug=$matches[4]&cw_episode=$matches[5]',
        'top'
    );
    // 2. Language + Numeric Season + Episode deep link: e.g. /tv/game-of-thrones/season-1/episode-2
    add_rewrite_rule(
        '^(?:mua/)?(?:([a-z]{2})/)?(movie|tv|anime|cartoon)/([^/]+)/season-([0-9]+)/episode-([0-9]+)/?$',
        'index.php?cw_lang=$matches[1]&cw_media_type=$matches[2]&cw_slug_id=$matches[3]&cw_season=$matches[4]&cw_episode=$matches[5]',
        'top'
    );
    // 3. Language + Media item: e.g. /movie/inception or /tv/game-of-thrones
    add_rewrite_rule(
        '^(?:mua/)?(?:([a-z]{2})/)?(movie|tv|anime|cartoon)/([^/]+)/?$',
        'index.php?cw_lang=$matches[1]&cw_media_type=$matches[2]&cw_slug_id=$matches[3]',
        'top'
    );
    // 4. Legal pages
    add_rewrite_rule(
        '^(?:mua/)?(dmca|terms)/?$',
        'index.php?cw_page=$matches[1]',
        'top'
    );
}
add_action('init', 'cinema_window_custom_rewrite_rules');

/**
 * Register Custom Query Vars for Cinema Window
 */
function cinema_window_query_vars($vars) {
    $vars[] = 'cw_lang';
    $vars[] = 'cw_media_type';
    $vars[] = 'cw_slug_id';
    $vars[] = 'cw_season';
    $vars[] = 'cw_season_slug';
    $vars[] = 'cw_episode';
    $vars[] = 'cw_page';
    return $vars;
}
add_filter('query_vars', 'cinema_window_query_vars');

/**
 * Resolve the canonical route to a local media post or dynamically lookup TMDb.
 * Supports Arabic slugs, English/Latin slugs, and Season/Episode deep links.
 */
function cinema_window_resolve_clean_route() {
    static $cache = null;
    static $resolved = false;
    if ($resolved) return $cache;
    $resolved = true;

    $type = sanitize_key(get_query_var('cw_media_type'));
    $raw_slug_var = get_query_var('cw_slug_id');
    $slug = !empty($raw_slug_var) ? trim(rawurldecode($raw_slug_var)) : '';
    $season = max(0, (int) get_query_var('cw_season'));
    $season_slug = sanitize_title(get_query_var('cw_season_slug'));
    $episode = max(0, (int) get_query_var('cw_episode'));

    // This theme's .htaccess is a front controller, so WP rewrite vars can be empty.
    if (!$type || !$slug) {
        $raw = isset($_GET['url']) ? (string) $_GET['url'] : (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $raw = trim(rawurldecode($raw), '/');
        $parts = array_values(array_filter(explode('/', $raw), 'strlen'));
        if (($parts[0] ?? '') === 'mua') array_shift($parts);
        if (isset($parts[0], $parts[1]) && in_array(strtolower($parts[0]), ['movie','tv','anime','cartoon'], true)) {
            $type = strtolower($parts[0]);
            $slug = trim($parts[1]);
            if (isset($parts[2])) {
                $season_slug = trim($parts[2]);
                if (preg_match('/^(?:season|s|الموسم|موسم)-?(\d+)$/iu', $season_slug, $m)) $season = (int) $m[1];
            }
            if (isset($parts[3]) && preg_match('/^(?:episode|ep|e|الحلقة|حلقة)-?(\d+)$/iu', $parts[3], $m)) $episode = (int) $m[1];
        }
    }
    if (!$type || !$slug) return null;

    $clean_latin_slug = Cinema_Window_Arabic::media_slug($slug);
    $post = Cinema_Window_Migration::find_post_by_any_slug($slug, $type);
    if (!$post && !empty($clean_latin_slug)) {
        $post = Cinema_Window_Migration::find_post_by_any_slug($clean_latin_slug, $type);
    }
    if (!$post) {
        $post_type = $type === 'movie' ? Cinema_Window_Content_Model::CPT_MOVIE
            : ($type === 'anime' ? Cinema_Window_Content_Model::CPT_ANIME : Cinema_Window_Content_Model::CPT_TV);
        $ids = get_posts([
            'post_type' => $post_type,
            'name' => sanitize_title($slug),
            'post_status' => 'publish',
            'posts_per_page' => 1,
            'fields' => 'ids'
        ]);
        if (!empty($ids)) {
            $post = get_post($ids[0]);
        }
    }

    if ($post) {
        $post_id = (int) $post->ID;
        $media = Cinema_Window_Content_Model::format_media_post($post_id);
        if ($media) {
            if ($season <= 0 && $season_slug) {
                if (preg_match('/^(?:season|s|الموسم|موسم)-?(\d+)$/iu', $season_slug, $m)) {
                    $season = (int) $m[1];
                }
            }

            // Movies do not have seasons or episodes - return 404 if requested
            if ($type === 'movie' && ($season > 0 || $episode > 0)) {
                return null;
            }

            $episode_id = 0;
            if ($season > 0 || $episode > 0) {
                $actual_season = $season > 0 ? $season : 1;

                if ($episode > 0) {
                    $episode_id = (int) Cinema_Window_Content_Model::find_episode((int) $media['tmdbId'], $actual_season, $episode);
                    if ($episode_id === 0) {
                        // Check if episode exists on TMDb
                        $tmdb_season = Cinema_Window_TMDb::get_season((int) $media['tmdbId'], $actual_season);
                        $found_ep = false;
                        if (!empty($tmdb_season['episodes']) && is_array($tmdb_season['episodes'])) {
                            foreach ($tmdb_season['episodes'] as $ep_data) {
                                if ((int) ($ep_data['episode_number'] ?? 0) === $episode) {
                                    $found_ep = true;
                                    break;
                                }
                            }
                        }
                        if (!$found_ep) {
                            return null; // Episode does not exist
                        }
                    }
                } else {
                    // Check if season exists in show data or on TMDb
                    $seasons_data = get_post_meta($post_id, '_cw_seasons_data', true);
                    $found_season = false;
                    if (!empty($seasons_data) && is_array($seasons_data)) {
                        foreach ($seasons_data as $s_item) {
                            if ((int) ($s_item['seasonNumber'] ?? 0) === $actual_season) {
                                $found_season = true;
                                break;
                            }
                        }
                    }
                    if (!$found_season) {
                        $tmdb_season = Cinema_Window_TMDb::get_season((int) $media['tmdbId'], $actual_season);
                        if (empty($tmdb_season['episodes'])) {
                            return null; // Season does not exist
                        }
                    }
                }
            }

            $cache = [
                'id' => $post_id,
                'tmdbId' => (int) ($media['tmdbId'] ?? 0),
                'type' => $type,
                'slug' => get_post_field('post_name', $post_id),
                'rawSlug' => $slug,
                'season' => $season > 0 ? $season : ($episode > 0 ? 1 : 0),
                'seasonSlug' => $season_slug,
                'episode' => $episode,
                'episodeId' => $episode_id,
                'isEpisode' => $episode > 0,
            ];
            return $cache;
        }
    }

    // Dynamic Live Fallback: Resolve via TMDb Search if not yet saved in WordPress DB
    $search_candidates = [];
    if (!empty($clean_latin_slug) && $clean_latin_slug !== 'media') {
        $search_candidates[] = str_replace('-', ' ', $clean_latin_slug);
    }
    $search_candidates[] = str_replace(['-', '_'], ' ', $slug);

    foreach ($search_candidates as $q) {
        if (empty($q)) continue;
        $search_res = Cinema_Window_TMDb::search_multi($q);
        if (!empty($search_res['results'][0])) {
            $item = $search_res['results'][0];
            $t_id = (int) $item['id'];
            $t_type = ($item['media_type'] ?? '') === 'tv' || $type === 'tv' || $type === 'anime' ? 'tv' : 'movie';
            
            // Movies do not have seasons or episodes
            if ($t_type === 'movie' && ($season > 0 || $episode > 0)) {
                return null;
            }

            if ($t_type === 'tv' && ($season > 0 || $episode > 0)) {
                $actual_season = $season > 0 ? $season : 1;
                $tmdb_season = Cinema_Window_TMDb::get_season($t_id, $actual_season);
                if (empty($tmdb_season['episodes']) || !is_array($tmdb_season['episodes'])) {
                    return null;
                }
                if ($episode > 0) {
                    $found_ep = false;
                    foreach ($tmdb_season['episodes'] as $ep_data) {
                        if ((int) ($ep_data['episode_number'] ?? 0) === $episode) {
                            $found_ep = true;
                            break;
                        }
                    }
                    if (!$found_ep) {
                        return null;
                    }
                }
            }

            $cache = [
                'id' => 0,
                'tmdbId' => $t_id,
                'type' => $type,
                'slug' => !empty($clean_latin_slug) ? $clean_latin_slug : sanitize_title($slug),
                'rawSlug' => $slug,
                'season' => $season > 0 ? $season : ($episode > 0 ? 1 : 0),
                'seasonSlug' => $season_slug,
                'episode' => $episode,
                'episodeId' => 0,
                'isEpisode' => $episode > 0,
            ];
            return $cache;
        }
    }

    return null;
}

/**
 * Template Redirect - Load Single App for all Custom Media Routes & Legal Pages
 * Accurately returns HTTP 404 for non-existing media or invalid episodes
 */
function cinema_window_template_redirect() {
    $media_type = get_query_var('cw_media_type');
    $cw_page = get_query_var('cw_page');

    if (!empty($cw_page)) {
        if (in_array($cw_page, ['dmca', 'terms'], true)) {
            global $wp_query;
            $wp_query->is_404 = false;
            status_header(200);
            return;
        }
    }

    if (!empty($media_type)) {
        $resolved = cinema_window_resolve_clean_route();
        if ($resolved) {
            global $wp_query;
            $wp_query->is_404 = false;
            status_header(200);
            return;
        } else {
            // Real 404 response for invalid media or non-existent episode
            global $wp_query;
            $wp_query->set_404();
            status_header(404);
            nocache_headers();
            return;
        }
    }
}
add_action('template_redirect', 'cinema_window_template_redirect');

/**
 * Helper to get currently active media data on the server
 */
function cinema_window_get_active_media_data() {
    static $media_data = null;
    static $evaluated = false;
    if ($evaluated) return $media_data;
    $evaluated = true;

    $resolved = cinema_window_resolve_clean_route();
    if (!$resolved) return null;

    $media_type = $resolved['type'];
    $slug_id = $resolved['slug'];
    $season = (int) $resolved['season'];
    $episode = (int) $resolved['episode'];

    if (!empty($resolved['id'])) {
        $media_data = Cinema_Window_Content_Model::format_media_post($resolved['id']);
    } elseif (!empty($resolved['tmdbId'])) {
        $details = Cinema_Window_TMDb::get_details($resolved['tmdbId'], $resolved['type'] === 'movie' ? 'movie' : 'tv');
        if ($details) {
            $media_data = [
                'title'        => $details['title'] ?? ($details['name'] ?? ''),
                'type'         => $resolved['type'],
                'slug'         => $resolved['slug'] ?? $slug_id,
                'overview'     => $details['overview'] ?? '',
                'posterPath'   => !empty($details['poster_path']) ? Cinema_Window_TMDb::get_image_url($details['poster_path'], 'w780') : '',
                'backdropPath' => !empty($details['backdrop_path']) ? Cinema_Window_TMDb::get_image_url($details['backdrop_path'], 'w1280') : '',
                'releaseDate'  => $details['release_date'] ?? ($details['first_air_date'] ?? ''),
                'year'         => !empty($details['release_date']) ? substr($details['release_date'], 0, 4) : (!empty($details['first_air_date']) ? substr($details['first_air_date'], 0, 4) : ''),
                'runtime'      => !empty($details['runtime']) ? intval($details['runtime']) : null,
                'voteAverage'  => !empty($details['vote_average']) ? round(floatval($details['vote_average']), 1) : null,
                'tmdbId'       => (int) $resolved['tmdbId'],
                'rawSeasons'   => $details['seasons'] ?? []
            ];
        }
    }

    // Enrich with episode specific data (still image and overview) for WhatsApp link preview
    if ($media_data && $season > 0 && $episode > 0) {
        $tmdb_id = !empty($media_data['tmdbId']) ? (int) $media_data['tmdbId'] : 0;
        if ($tmdb_id > 0) {
            $matched_ep = null;
            $season_data = Cinema_Window_TMDb::get_season($tmdb_id, $season);

            if (!empty($season_data['episodes'])) {
                foreach ($season_data['episodes'] as $ep) {
                    if ((int) ($ep['episode_number'] ?? 0) === $episode) {
                        $matched_ep = $ep;
                        break;
                    }
                }
            }

            // If episode wasn't found in current season (e.g. episode 41 in Season 1 for Re:Zero/Anime):
            // Search across other seasons cumulatively
            if (!$matched_ep && !empty($media_data['rawSeasons'])) {
                $accumulated = 0;
                foreach ($media_data['rawSeasons'] as $s_info) {
                    $s_num = (int) ($s_info['season_number'] ?? 0);
                    $ep_count = (int) ($s_info['episode_count'] ?? 0);
                    if ($s_num <= 0 || $ep_count <= 0) continue;

                    if ($episode > $accumulated && $episode <= ($accumulated + $ep_count)) {
                        $relative_ep = $episode - $accumulated;
                        $other_season = Cinema_Window_TMDb::get_season($tmdb_id, $s_num);
                        if (!empty($other_season['episodes'])) {
                            foreach ($other_season['episodes'] as $ep) {
                                if ((int) ($ep['episode_number'] ?? 0) === $relative_ep) {
                                    $matched_ep = $ep;
                                    break 2;
                                }
                            }
                        }
                    }
                    $accumulated += $ep_count;
                }
            }

            if ($matched_ep) {
                if (!empty($matched_ep['still_path'])) {
                    $media_data['episodeStillPath'] = Cinema_Window_TMDb::get_image_url($matched_ep['still_path'], 'w780');
                }
                if (!empty($matched_ep['overview'])) {
                    $media_data['episodeOverview'] = $matched_ep['overview'];
                }
                if (!empty($matched_ep['name'])) {
                    $media_data['episodeTitle'] = $matched_ep['name'];
                }
            }
        }
    }

    return $media_data;
}

/**
 * Filter WordPress document title for clean social sharing
 */
function cinema_window_filter_document_title($title) {
    $resolved = cinema_window_resolve_clean_route();
    if ($resolved) {
        $media_data = cinema_window_get_active_media_data();
        if ($media_data) {
            $meta = Cinema_Window_SEO::generate_metadata($media_data, $resolved['season'], $resolved['episode']);
            if (!empty($meta['title'])) {
                return $meta['title'];
            }
        }
    }
    return $title;
}
add_filter('pre_get_document_title', 'cinema_window_filter_document_title', 99);

/**
 * Render complete SEO and Schema.org tags into <head> with full WhatsApp / Social Preview Support
 */
function cinema_window_render_seo_tags() {
    $resolved = cinema_window_resolve_clean_route();
    $season = $resolved ? (int) $resolved['season'] : 0;
    $episode = $resolved ? (int) $resolved['episode'] : 0;
    $media_data = cinema_window_get_active_media_data();

    Cinema_Window_SEO::render_head_tags($media_data, $season, $episode);
    Cinema_Window_Schema::render_schema($media_data, $season, $episode);
}
add_action('wp_head', 'cinema_window_render_seo_tags', 1);

/**
 * Flush Rewrite Rules upon theme activation
 */
function cinema_window_activate() {
    cinema_window_custom_rewrite_rules();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'cinema_window_activate');
