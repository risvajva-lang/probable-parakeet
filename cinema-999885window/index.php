<?php
/**
 * Main Template File for Cinema Window WordPress Theme
 * Intelligent Clean URL Router & SSR Meta Injector
 *
 * Supported Clean URL Hierarchy:
 * - /movie/{slug}                                 -> e.g. /movie/inception
 * - /tv/{slug}                                    -> e.g. /tv/game-of-thrones
 * - /tv/{slug}/{season_slug}/{episode_slug}       -> e.g. /tv/game-of-thrones/season-1/episode-1
 * - /anime/{slug}                                 -> e.g. /anime/naruto
 * - /anime/{slug}/{season_slug}/{episode_slug}    -> e.g. /anime/naruto/shippuden/episode-100
 *
 * @package Cinema_Window
 */

// Resolve the clean route through the same server-side resolver used by SEO/React.
$route = function_exists('cinema_window_resolve_clean_route') ? cinema_window_resolve_clean_route() : null;
$current_media = null;
$season_number = 0;
$episode_number = 0;

if ($route) {
    if (!empty($route['id'])) {
        $current_media = Cinema_Window_Content_Model::format_media_post($route['id']);
    } elseif (!empty($route['tmdbId'])) {
        $details = Cinema_Window_TMDb::get_details($route['tmdbId'], $route['type'] === 'movie' ? 'movie' : 'tv');
        if ($details) {
            $current_media = [
                'id'           => $route['tmdbId'],
                'tmdbId'       => $route['tmdbId'],
                'title'        => $details['title'] ?? ($details['name'] ?? ''),
                'type'         => $route['type'],
                'slug'         => $route['slug'] ?? '',
                'overview'     => $details['overview'] ?? '',
                'posterPath'   => !empty($details['poster_path']) ? Cinema_Window_TMDb::get_image_url($details['poster_path'], 'w780') : '',
                'backdropPath' => !empty($details['backdrop_path']) ? Cinema_Window_TMDb::get_image_url($details['backdrop_path'], 'w1280') : '',
                'releaseDate'  => $details['release_date'] ?? ($details['first_air_date'] ?? ''),
                'year'         => !empty($details['release_date']) ? substr($details['release_date'], 0, 4) : (!empty($details['first_air_date']) ? substr($details['first_air_date'], 0, 4) : ''),
                'runtime'      => !empty($details['runtime']) ? intval($details['runtime']) : null,
                'voteAverage'  => !empty($details['vote_average']) ? round(floatval($details['vote_average']), 1) : null,
            ];
        }
    }
    $season_number = (int) $route['season'];
    $episode_number = (int) $route['episode'];
}

// Pass global metadata to header
global $cw_active_media, $cw_season_num, $cw_episode_num;
$cw_active_media = $current_media;
$cw_season_num   = $season_number;
$cw_episode_num  = $episode_number;

get_header();
?>

<main id="primary" class="site-main">
    <!-- Cinema Window React Core Root Mount Point -->
    <div id="root">
        <?php if (is_404()): ?>
            <!-- SSR 404 Response -->
            <div class="min-h-screen bg-[#060913] flex items-center justify-center text-white" style="display: flex; min-height: 80vh; background-color: #060913; align-items: center; justify-content: center; color: #fff; text-align: center; font-family: 'Cairo', sans-serif;" dir="rtl">
                <div style="max-width: 500px; padding: 40px 20px;">
                    <div style="font-size: 72px; font-weight: 900; color: #ef4444; line-height: 1; margin-bottom: 16px;">404</div>
                    <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 12px; color: #ffffff;">الصفحة أو المحتوى غير موجود</h1>
                    <p style="font-size: 14px; color: #9ca3af; margin-bottom: 24px;">عذراً، المحتوى الذي تبحث عنه غير موجود أو أن الرابط غير صحيح.</p>
                    <a href="<?= esc_url(home_url('/')); ?>" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff; border-radius: 12px; font-weight: bold; text-decoration: none;">العودة للرئيسية</a>
                </div>
            </div>
        <?php elseif (!empty($current_media)): ?>
            <!-- Crawlers & SSR Semantic HTML Payload (Replaced seamlessly when React hydrates) -->
            <article class="ssr-media-container" style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; color: #ffffff; font-family: 'Cairo', sans-serif;" dir="rtl">
                <header style="margin-bottom: 24px;">
                    <h1 style="font-size: 32px; font-weight: 900; margin-bottom: 12px; color: #ffffff;">
                        <?= esc_html($current_media['title']); ?> <?= !empty($current_media['year']) ? '(' . esc_html($current_media['year']) . ')' : ''; ?>
                    </h1>
                    <?php if ($season_number > 0 && $episode_number > 0): ?>
                        <h2 style="font-size: 20px; font-weight: 700; color: #c084fc; margin-bottom: 16px;">
                            الموسم <?= esc_html($season_number); ?> - الحلقة <?= esc_html($episode_number); ?>
                        </h2>
                    <?php endif; ?>
                </header>

                <div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start;">
                    <?php if (!empty($current_media['posterPath'])): ?>
                        <div style="flex-shrink: 0; width: 220px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                            <img src="<?= esc_url($current_media['posterPath']); ?>" alt="<?= esc_attr($current_media['title']); ?>" style="width: 100%; height: auto; display: block;" />
                        </div>
                    <?php endif; ?>

                    <div style="flex: 1; min-width: 280px;">
                        <?php if (!empty($current_media['overview'])): ?>
                            <p style="font-size: 16px; line-height: 1.8; color: #cbd5e1; margin-bottom: 20px;">
                                <?= esc_html($current_media['overview']); ?>
                            </p>
                        <?php endif; ?>

                        <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 14px; color: #94a3b8;">
                            <?php if (!empty($current_media['voteAverage'])): ?>
                                <span style="background: rgba(234, 179, 8, 0.2); color: #facc15; padding: 4px 12px; border-radius: 8px; font-weight: bold;">
                                    ★ <?= esc_html($current_media['voteAverage']); ?> / 10
                                </span>
                            <?php endif; ?>
                            <?php if (!empty($current_media['year'])): ?>
                                <span style="background: rgba(255, 255, 255, 0.1); color: #ffffff; padding: 4px 12px; border-radius: 8px;">
                                    سنة الإنتاج: <?= esc_html($current_media['year']); ?>
                                </span>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </article>
        <?php else: ?>
            <!-- Server-side initial hydration placeholder for home/catalog -->
            <div class="min-h-screen bg-[#060913] flex items-center justify-center text-white" style="display: flex; min-height: 100vh; background-color: #060913; align-items: center; justify-content: center; color: #fff;">
                <div style="text-align: center; font-family: 'Cairo', sans-serif;">
                    <div style="font-size: 28px; font-weight: 900; margin-bottom: 8px; color: #a855f7;">
                        🎬 نافذة السينما VIP
                    </div>
                    <div style="font-size: 14px; color: #9ca3af;">
                        جاري تحميل أكبر مكتبة سينمائية عبر سيرفرات فائقة السرعة...
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <noscript>
        <div style="padding: 40px; text-align: center; color: white; background: #0b1020; margin: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); font-family: 'Cairo', sans-serif;">
            <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 12px;">مرحباً بك في نافذة السينما</h2>
            <p style="color: #cbd5e1; font-size: 15px; line-height: 1.8;">
                تتطلب هذه المنصة تفعيل الجافاسكربت (JavaScript) للاستمتاع بالمشاهدة الحية عبر 36 سيرفر بث عالي الجودة Full HD و 4K بدون إعلانات.
            </p>
        </div>
    </noscript>
</main>

<?php
get_footer();

