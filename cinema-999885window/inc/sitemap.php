<?php
/**
 * Dynamic XML Sitemaps Generator for Cinema Window
 * Strictly queries real WordPress Database records with accurate lastmod timestamps
 * Supports Sitemap Index and sub-sitemap pagination (1000 URLs per page)
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_Sitemap {

    const PER_PAGE = 1000;

    public static function init() {
        add_action('init', [__CLASS__, 'register_sitemap_rewrites']);
        add_action('template_redirect', [__CLASS__, 'render_sitemap_feed']);
    }

    public static function register_sitemap_rewrites() {
        add_rewrite_rule('^sitemap\.xml$', 'index.php?cw_sitemap=index', 'top');
        add_rewrite_rule('^sitemap_index\.xml$', 'index.php?cw_sitemap=index', 'top');
        add_rewrite_rule('^sitemap-pages\.xml$', 'index.php?cw_sitemap=pages', 'top');
        
        // Paginated & standard sub-sitemaps
        add_rewrite_rule('^sitemap-([a-z]+)(?:-([0-9]+))?\.xml$', 'index.php?cw_sitemap=$matches[1]&cw_sitemap_page=$matches[2]', 'top');

        add_filter('query_vars', function($vars) {
            $vars[] = 'cw_sitemap';
            $vars[] = 'cw_sitemap_page';
            return $vars;
        });
    }

    public static function render_sitemap_feed() {
        $sitemap = get_query_var('cw_sitemap');
        if (empty($sitemap)) {
            return;
        }

        $page = max(1, intval(get_query_var('cw_sitemap_page')));

        header('Content-Type: application/xml; charset=utf-8');
        header('X-Robots-Tag: noindex, follow', true);

        if ($sitemap === 'index') {
            self::render_index_sitemap();
        } elseif ($sitemap === 'pages') {
            self::render_pages_sitemap();
        } elseif ($sitemap === 'movies') {
            self::render_cpt_sitemap(Cinema_Window_Content_Model::CPT_MOVIE, 'movie', 0.9, 'weekly', $page);
        } elseif ($sitemap === 'tv') {
            self::render_cpt_sitemap(Cinema_Window_Content_Model::CPT_TV, 'tv', 0.9, 'weekly', $page);
        } elseif ($sitemap === 'anime') {
            self::render_cpt_sitemap(Cinema_Window_Content_Model::CPT_ANIME, 'anime', 0.85, 'weekly', $page);
        } elseif ($sitemap === 'episodes') {
            self::render_episodes_sitemap($page);
        }

        exit;
    }

    private static function render_index_sitemap() {
        global $wpdb;
        $now = gmdate('Y-m-d\TH:i:s+00:00');
        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        echo '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Pages sitemap
        echo "  <sitemap>\n";
        echo "    <loc>" . esc_url(home_url('/sitemap-pages.xml')) . "</loc>\n";
        echo "    <lastmod>{$now}</lastmod>\n";
        echo "  </sitemap>\n";

        $types = [
            'movies'   => Cinema_Window_Content_Model::CPT_MOVIE,
            'tv'       => Cinema_Window_Content_Model::CPT_TV,
            'anime'    => Cinema_Window_Content_Model::CPT_ANIME,
            'episodes' => 'cw_episode'
        ];

        foreach ($types as $key => $cpt) {
            $count = (int) $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(ID) FROM {$wpdb->posts} WHERE post_type = %s AND post_status = 'publish'",
                $cpt
            ));

            $pages = max(1, (int) ceil($count / self::PER_PAGE));
            for ($p = 1; $p <= $pages; $p++) {
                $suffix = ($pages > 1) ? "-{$p}" : "";
                $loc = home_url("/sitemap-{$key}{$suffix}.xml");
                
                // Get latest modification date
                $latest_mod = $wpdb->get_var($wpdb->prepare(
                    "SELECT post_modified_gmt FROM {$wpdb->posts} WHERE post_type = %s AND post_status = 'publish' ORDER BY post_modified_gmt DESC LIMIT 1",
                    $cpt
                ));
                $lastmod = !empty($latest_mod) ? gmdate('Y-m-d\TH:i:s+00:00', strtotime($latest_mod)) : $now;

                echo "  <sitemap>\n";
                echo "    <loc>" . esc_url($loc) . "</loc>\n";
                echo "    <lastmod>{$lastmod}</lastmod>\n";
                echo "  </sitemap>\n";
            }
        }

        echo '</sitemapindex>';
    }

    private static function render_pages_sitemap() {
        $now = gmdate('Y-m-d\TH:i:s+00:00');
        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        $pages = [
            ['url' => home_url('/'), 'freq' => 'daily', 'prio' => '1.0'],
            ['url' => home_url('/dmca'), 'freq' => 'monthly', 'prio' => '0.7'],
            ['url' => home_url('/terms'), 'freq' => 'monthly', 'prio' => '0.7'],
            ['url' => home_url('/movie'), 'freq' => 'daily', 'prio' => '0.9'],
            ['url' => home_url('/tv'), 'freq' => 'daily', 'prio' => '0.9'],
            ['url' => home_url('/anime'), 'freq' => 'daily', 'prio' => '0.9']
        ];

        foreach ($pages as $p) {
            echo "  <url>\n";
            echo "    <loc>" . esc_url($p['url']) . "</loc>\n";
            echo "    <lastmod>{$now}</lastmod>\n";
            echo "    <changefreq>{$p['freq']}</changefreq>\n";
            echo "    <priority>{$p['prio']}</priority>\n";
            echo "  </url>\n";
        }

        echo '</urlset>';
    }

    private static function render_cpt_sitemap($post_type, $url_prefix, $priority = 0.8, $freq = 'weekly', $page = 1) {
        global $wpdb;

        $offset = ($page - 1) * self::PER_PAGE;
        $limit = self::PER_PAGE;

        // Query real published posts from database
        $posts = $wpdb->get_results($wpdb->prepare(
            "SELECT ID, post_name, post_modified_gmt FROM {$wpdb->posts}
             WHERE post_type = %s AND post_status = 'publish' AND post_name != ''
             ORDER BY post_modified_gmt DESC LIMIT %d OFFSET %d",
            $post_type,
            $limit,
            $offset
        ));

        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        if (!empty($posts)) {
            foreach ($posts as $p) {
                if (empty($p->post_name)) continue;
                $loc = home_url("/{$url_prefix}/" . $p->post_name);
                $lastmod = !empty($p->post_modified_gmt) ? gmdate('Y-m-d\TH:i:s+00:00', strtotime($p->post_modified_gmt)) : gmdate('Y-m-d\TH:i:s+00:00');

                echo "  <url>\n";
                echo "    <loc>" . esc_url($loc) . "</loc>\n";
                echo "    <lastmod>{$lastmod}</lastmod>\n";
                echo "    <changefreq>{$freq}</changefreq>\n";
                echo "    <priority>{$priority}</priority>\n";
                echo "  </url>\n";
            }
        }

        echo '</urlset>';
    }

    private static function render_episodes_sitemap($page = 1) {
        global $wpdb;

        $offset = ($page - 1) * self::PER_PAGE;
        $limit = self::PER_PAGE;

        $episodes = $wpdb->get_results($wpdb->prepare(
            "SELECT p.ID, p.post_name, p.post_modified_gmt,
                    m1.meta_value as series_post_id,
                    m2.meta_value as season_num,
                    m3.meta_value as episode_num
             FROM {$wpdb->posts} p
             LEFT JOIN {$wpdb->postmeta} m1 ON p.ID = m1.post_id AND m1.meta_key = '_cw_series_post_id'
             LEFT JOIN {$wpdb->postmeta} m2 ON p.ID = m2.post_id AND m2.meta_key = '_cw_season_number'
             LEFT JOIN {$wpdb->postmeta} m3 ON p.ID = m3.post_id AND m3.meta_key = '_cw_episode_number'
             WHERE p.post_type = 'cw_episode' AND p.post_status = 'publish'
             ORDER BY p.post_modified_gmt DESC LIMIT %d OFFSET %d",
            $limit,
            $offset
        ));

        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        if (!empty($episodes)) {
            foreach ($episodes as $ep) {
                $series_post = get_post($ep->series_post_id);
                if (!$series_post || empty($series_post->post_name)) continue;

                $series_type = get_post_meta($series_post->ID, '_cw_media_type', true) ?: 'tv';
                $series_slug = $series_post->post_name;
                $season_num = intval($ep->season_num) ?: 1;
                $episode_num = intval($ep->episode_num) ?: 1;

                $loc = home_url("/{$series_type}/{$series_slug}/season-{$season_num}/episode-{$episode_num}");
                $lastmod = !empty($ep->post_modified_gmt) ? gmdate('Y-m-d\TH:i:s+00:00', strtotime($ep->post_modified_gmt)) : gmdate('Y-m-d\TH:i:s+00:00');

                echo "  <url>\n";
                echo "    <loc>" . esc_url($loc) . "</loc>\n";
                echo "    <lastmod>{$lastmod}</lastmod>\n";
                echo "    <changefreq>weekly</changefreq>\n";
                echo "    <priority>0.8</priority>\n";
                echo "  </url>\n";
            }
        }

        echo '</urlset>';
    }
}

Cinema_Window_Sitemap::init();
