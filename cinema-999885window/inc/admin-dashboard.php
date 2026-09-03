<?php
/**
 * Admin Dashboard, Manual Sync Controls & Data Diagnostics for Cinema Window
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_Admin {

    public static function init() {
        add_action('admin_menu', [__CLASS__, 'register_admin_pages']);
        add_action('admin_init', [__CLASS__, 'register_settings']);
        add_action('wp_ajax_cw_run_admin_sync', [__CLASS__, 'ajax_run_sync']);
        add_action('wp_ajax_cw_run_diagnostics', [__CLASS__, 'ajax_run_diagnostics']);
        add_action('wp_ajax_cw_clean_orphans', [__CLASS__, 'ajax_clean_orphans']);
    }

    public static function register_admin_pages() {
        add_menu_page(
            'نافذة السينما',
            'نافذة السينما VIP',
            'manage_options',
            'cinema-window-admin',
            [__CLASS__, 'render_main_page'],
            'dashicons-video-alt2',
            3
        );

        add_submenu_page(
            'cinema-window-admin',
            'إعدادات المزامنة والـ SEO',
            'الإعدادات والـ SEO',
            'manage_options',
            'cinema-window-settings',
            [__CLASS__, 'render_settings_page']
        );
    }

    public static function register_settings() {
        register_setting('cw_settings_group', 'cw_tmdb_api_key');
        register_setting('cw_settings_group', 'cw_sync_secret_key');
        register_setting('cw_settings_group', 'cw_seo_movie_template');
        register_setting('cw_settings_group', 'cw_seo_tv_template');
        register_setting('cw_settings_group', 'cw_seo_anime_template');
        register_setting('cw_settings_group', 'cw_seo_episode_template');
    }

    public static function render_main_page() {
        $stats = Cinema_Window_Sync_Engine::get_stats();
        $logs = Cinema_Window_Sync_Engine::get_logs();

        ?>
        <div class="wrap" style="direction: rtl; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h1 style="display: flex; align-items: center; gap: 10px;">
                <span class="dashicons dashicons-video-alt2" style="font-size: 32px; width: 32px; height: 32px; color: #e50914;"></span>
                نافذة السينما VIP - لوحة التحكم والمزامنة التلقائية
            </h1>

            <hr class="wp-header-end" />

            <!-- Stats Bar -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
                <div style="background: #fff; border: 1px solid #ccd0d4; padding: 15px; border-radius: 8px; border-top: 4px solid #2271b1;">
                    <div style="font-size: 13px; color: #646970;">آخر مزامنة ناجحة</div>
                    <div style="font-size: 18px; font-weight: bold; margin-top: 5px;"><?php echo esc_html($stats['last_sync'] ?? 'لم تتم بعد'); ?></div>
                </div>
                <div style="background: #fff; border: 1px solid #ccd0d4; padding: 15px; border-radius: 8px; border-top: 4px solid #46b450;">
                    <div style="font-size: 13px; color: #646970;">إجمالي المواد المضافة</div>
                    <div style="font-size: 24px; font-weight: bold; margin-top: 5px; color: #46b450;"><?php echo intval($stats['total_created'] ?? 0); ?></div>
                </div>
                <div style="background: #fff; border: 1px solid #ccd0d4; padding: 15px; border-radius: 8px; border-top: 4px solid #f0b849;">
                    <div style="font-size: 13px; color: #646970;">إجمالي المواد المحدثة</div>
                    <div style="font-size: 24px; font-weight: bold; margin-top: 5px; color: #f0b849;"><?php echo intval($stats['total_updated'] ?? 0); ?></div>
                </div>
                <div style="background: #fff; border: 1px solid #ccd0d4; padding: 15px; border-radius: 8px; border-top: 4px solid #826eb4;">
                    <div style="font-size: 13px; color: #646970;">إجمالي الحلقات الجديدة</div>
                    <div style="font-size: 24px; font-weight: bold; margin-top: 5px; color: #826eb4;"><?php echo intval($stats['total_episodes_new'] ?? 0); ?></div>
                </div>
            </div>

            <!-- Sync Controls -->
            <div style="background: #fff; border: 1px solid #ccd0d4; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h2 style="margin-top: 0;">تشغيل المزامنة الفورية (Manual Sync)</h2>
                <p>يمكنك تشغيل المزامنة اليدوية الآن لجلب أحدث الأفلام والمسلسلات والأنمي والحلقات من TMDb مباشرة إلى قاعدة بيانات الموقع:</p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
                    <button type="button" class="button button-primary button-hero" onclick="runManualSync('all', this)">⚡ مزامنة الكل الآن</button>
                    <button type="button" class="button button-secondary button-hero" onclick="runManualSync('movies', this)">🎬 مزامنة الأفلام فقط</button>
                    <button type="button" class="button button-secondary button-hero" onclick="runManualSync('tv', this)">📺 مزامنة المسلسلات فقط</button>
                    <button type="button" class="button button-secondary button-hero" onclick="runManualSync('anime', this)">🌸 مزامنة الأنمي فقط</button>
                </div>
                <div id="sync-progress-msg" style="margin-top: 15px; display: none; padding: 10px; border-radius: 4px;"></div>
            </div>

            <!-- Slug Migration & Clean URL Engine -->
            <div style="background: #fff; border: 1px solid #ccd0d4; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #7c3aed;">
                <h2 style="margin-top: 0; color: #7c3aed;">ترقية وإصلاح الروابط النظيفة (Clean Latin Slugs & 301 Migration)</h2>
                <p>يقوم هذا الخيار بفحص جميع الأفلام والمسلسلات والأنمي والحلقات في قاعدة البيانات وتحويل الروابط العربية المشفرة إلى روابط ASCII لاتينية نظيفة canonical وسريعة لمحركات البحث مع تفعيل إعادة التوجيه 301 للروابط القديمة لضمان عدم فقدان الأرشفة:</p>
                <button type="button" class="button button-primary button-large" style="background: #7c3aed; border-color: #6d28d9;" onclick="runSlugMigration(this)">🚀 ترقية وتنظيف جميع روابط قاعدة البيانات الآن</button>
                <div id="slug-migration-result" style="margin-top: 15px;"></div>
            </div>

            <!-- Diagnostics & DB Health -->
            <div style="background: #fff; border: 1px solid #ccd0d4; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h2 style="margin-top: 0;">فحص سلامة قاعدة البيانات (Data Diagnostics)</h2>
                <p>افحص التكرارات، الحلقات اليتيمة، ومشاكل البيانات:</p>
                <button type="button" class="button button-secondary" onclick="runDiagnostics(this)">🔍 بدء الفحص التشخيصي</button>
                <div id="diagnostics-result" style="margin-top: 15px;"></div>
            </div>

            <!-- Sync Logs -->
            <div style="background: #fff; border: 1px solid #ccd0d4; padding: 20px; border-radius: 8px;">
                <h2 style="margin-top: 0;">سجلات المزامنة الأخيرة (Recent Sync Logs)</h2>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th style="width: 140px;">معرف العملية</th>
                            <th style="width: 160px;">التاريخ والوقت</th>
                            <th style="width: 100px;">النوع</th>
                            <th style="width: 100px;">الحالة</th>
                            <th>المفحوص</th>
                            <th>المضاف</th>
                            <th>المحدث</th>
                            <th>حلقات جديدة</th>
                            <th>الأخطاء</th>
                            <th>المدة</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($logs)): ?>
                            <tr><td colspan="10" style="text-align: center; color: #888;">لا توجد سجلات بعد</td></tr>
                        <?php else: ?>
                            <?php foreach ($logs as $log): ?>
                                <tr>
                                    <td><code><?php echo esc_html($log['sync_id']); ?></code></td>
                                    <td><?php echo esc_html($log['timestamp']); ?></td>
                                    <td><strong><?php echo esc_html($log['type']); ?></strong></td>
                                    <td>
                                        <span style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; <?php echo ($log['status'] === 'Success') ? 'background: #e7f4e8; color: #1e7e34;' : 'background: #fff3cd; color: #856404;'; ?>">
                                            <?php echo esc_html($log['status']); ?>
                                        </span>
                                    </td>
                                    <td><?php echo intval($log['checked'] ?? 0); ?></td>
                                    <td><strong style="color: #28a745;"><?php echo intval($log['created'] ?? 0); ?></strong></td>
                                    <td><strong style="color: #ffc107;"><?php echo intval($log['updated'] ?? 0); ?></strong></td>
                                    <td><strong style="color: #17a2b8;"><?php echo intval($log['created_episodes'] ?? 0); ?></strong></td>
                                    <td><?php echo intval($log['errors'] ?? 0); ?></td>
                                    <td><?php echo esc_html($log['duration'] ?? ''); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <script>
        function runManualSync(type, btn) {
            var msg = document.getElementById('sync-progress-msg');
            msg.style.display = 'block';
            msg.style.background = '#e7f4e8';
            msg.style.color = '#155724';
            msg.innerHTML = '⏳ جاري بدء المزامنة وتنزيل البيانات... قد يستغرق ذلك بضع ثوانٍ.';
            btn.disabled = true;

            jQuery.post(ajaxurl, {
                action: 'cw_run_admin_sync',
                type: type,
                nonce: '<?php echo wp_create_nonce('cw_admin_nonce'); ?>'
            }, function(res) {
                btn.disabled = false;
                if (res.success) {
                    msg.innerHTML = '✅ اكتملت المزامنة بنجاح! مضاف: ' + (res.data.data.created || 0) + ' | محدث: ' + (res.data.data.updated || 0) + ' | حلقات جديدة: ' + (res.data.data.created_episodes || 0) + ' (' + res.data.data.duration + ')';
                    setTimeout(function() { location.reload(); }, 2500);
                } else {
                    msg.style.background = '#f8d7da';
                    msg.style.color = '#721c24';
                    msg.innerHTML = '❌ خطأ: ' + (res.data ? res.data.message : 'فشلت المزامنة');
                }
            }).fail(function() {
                btn.disabled = false;
                msg.style.background = '#f8d7da';
                msg.style.color = '#721c24';
                msg.innerHTML = '❌ حدث خطأ في الاتصال بالخادم.';
            });
        }

        function runDiagnostics(btn) {
            var resEl = document.getElementById('diagnostics-result');
            resEl.innerHTML = '⏳ جاري فحص الجداول والبيانات...';
            btn.disabled = true;

            jQuery.post(ajaxurl, {
                action: 'cw_run_diagnostics',
                nonce: '<?php echo wp_create_nonce('cw_admin_nonce'); ?>'
            }, function(res) {
                btn.disabled = false;
                if (res.success) {
                    var d = res.data;
                    var html = '<div style="padding: 12px; background: #f0f0f1; border-radius: 6px; line-height: 1.8;">';
                    html += '<strong>نتائج الفحص:</strong><br>';
                    html += '• إجمالي الأفلام في القاعدة: ' + d.movies_count + '<br>';
                    html += '• إجمالي المسلسلات: ' + d.tv_count + '<br>';
                    html += '• إجمالي الأنمي: ' + d.anime_count + '<br>';
                    html += '• إجمالي الحلقات: ' + d.episodes_count + '<br>';
                    html += '• التكرارات (TMDb IDs مكررة): ' + (d.duplicates_count === 0 ? '🟢 لا توجد تكرارات' : '🔴 ' + d.duplicates_count + ' مكرر') + '<br>';
                    html += '• الحلقات اليتيمة (بدون مسلسل أب): ' + (d.orphans_count === 0 ? '🟢 لا توجد حلقات يتيمة' : '⚠️ ' + d.orphans_count + ' حلقة يتيمة <button class="button button-small" onclick="cleanOrphans()">تنظيف الحلقات اليتيمة</button>') + '<br>';
                    html += '</div>';
                    resEl.innerHTML = html;
                }
            });
        }

        function runSlugMigration(btn) {
            var resEl = document.getElementById('slug-migration-result');
            resEl.innerHTML = '<div style="padding: 10px; background: #eef2ff; color: #4338ca; border-radius: 6px;">⏳ جاري فحص وترقية جميع الروابط وتحويل العناوين العربية إلى Latin Slugs...</div>';
            btn.disabled = true;

            jQuery.post(ajaxurl, {
                action: 'cw_run_slug_migration',
                nonce: '<?php echo wp_create_nonce('cw_admin_nonce'); ?>'
            }, function(res) {
                btn.disabled = false;
                if (res.success) {
                    var d = res.data;
                    var html = '<div style="padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 6px; line-height: 1.8;">';
                    html += '<strong>✅ اكتملت عملية ترقية الروابط بنجاح!</strong><br>';
                    html += '• إجمالي المواد المفحوصة: ' + d.total_found + '<br>';
                    html += '• الروابط التي تم تحديثها وترقيتها: <strong>' + d.updated + '</strong><br>';
                    html += '• الروابط النظيفة مسبقاً (تم تخطيها): ' + d.skipped + '<br>';
                    if (d.logs && d.logs.length > 0) {
                        html += '<div style="margin-top: 10px; font-size: 12px; color: #374151; background: #fff; padding: 8px; border-radius: 4px; border: 1px solid #e5e7eb;"><strong>عينة من الروابط المعدلة:</strong><br>' + d.logs.join('<br>') + '</div>';
                    }
                    html += '</div>';
                    resEl.innerHTML = html;
                } else {
                    resEl.innerHTML = '<div style="padding: 10px; background: #fef2f2; color: #991b1b; border-radius: 6px;">❌ حدث خطأ أثناء الترقية: ' + (res.data ? res.data.message : 'غير معروف') + '</div>';
                }
            }).fail(function() {
                btn.disabled = false;
                resEl.innerHTML = '<div style="padding: 10px; background: #fef2f2; color: #991b1b; border-radius: 6px;">❌ تعذر الاتصال بالخادم.</div>';
            });
        }

        function cleanOrphans() {
            if (!confirm('هل تريد فعلاً حذف الحلقات اليتيمة؟')) return;
            jQuery.post(ajaxurl, {
                action: 'cw_clean_orphans',
                nonce: '<?php echo wp_create_nonce('cw_admin_nonce'); ?>'
            }, function(res) {
                alert('تم التنظيف بنجاح.');
                location.reload();
            });
        }
        </script>
        <?php
    }

    public static function render_settings_page() {
        ?>
        <div class="wrap" style="direction: rtl; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h1>إعدادات الـ SEO ونظام Cinema Window</h1>
            <hr class="wp-header-end" />

            <form method="post" action="options.php" style="background: #fff; border: 1px solid #ccd0d4; padding: 25px; border-radius: 8px; max-width: 900px; margin-top: 20px;">
                <?php settings_fields('cw_settings_group'); ?>
                <?php do_settings_sections('cw_settings_group'); ?>

                <h2>إعدادات TMDb API والأمان</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">مفتاح TMDb API مخصص (Custom Key):</th>
                        <td>
                            <input type="text" name="cw_tmdb_api_key" value="<?php echo esc_attr(get_option('cw_tmdb_api_key')); ?>" class="regular-text" placeholder="اتركه فارغاً لاستخدام المفاتيح التلقائية" />
                            <p class="description">يمكنك إدخال مفتاحك الخاص من TheMovieDB لتجنب حدود الاستخدام.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">رمز الأمان للمزامنة الخارجية (Secret Key):</th>
                        <td>
                            <input type="text" name="cw_sync_secret_key" value="<?php echo esc_attr(get_option('cw_sync_secret_key')); ?>" class="regular-text" />
                            <p class="description">استخدم هذا الرمز إذا كنت تريد تشغيل المزامنة عبر Cron Job خارجي عبر الترويسة X-CW-Sync-Key.</p>
                        </td>
                    </tr>
                </table>

                <hr style="margin: 25px 0;" />

                <h2>قوالب عناوين الـ SEO التلقائية (SEO Templates)</h2>
                <p>المتغيرات المتاحة: <code>{TITLE}</code>، <code>{YEAR}</code>، <code>{SITE_NAME}</code>، <code>{TYPE_LABEL}</code>، <code>{SEASON}</code>، <code>{SEASON_WORD}</code>، <code>{EPISODE}</code>، <code>{EPISODE_WORD}</code></p>

                <table class="form-table">
                    <tr>
                        <th scope="row">عنوان سيو الأفلام:</th>
                        <td>
                            <input type="text" name="cw_seo_movie_template" value="<?php echo esc_attr(get_option('cw_seo_movie_template', Cinema_Window_SEO::DEFAULT_MOVIE_TPL)); ?>" class="large-text" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">عنوان سيو المسلسلات:</th>
                        <td>
                            <input type="text" name="cw_seo_tv_template" value="<?php echo esc_attr(get_option('cw_seo_tv_template', Cinema_Window_SEO::DEFAULT_TV_TPL)); ?>" class="large-text" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">عنوان سيو الأنمي:</th>
                        <td>
                            <input type="text" name="cw_seo_anime_template" value="<?php echo esc_attr(get_option('cw_seo_anime_template', Cinema_Window_SEO::DEFAULT_ANIME_TPL)); ?>" class="large-text" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">عنوان سيو الحلقات:</th>
                        <td>
                            <input type="text" name="cw_seo_episode_template" value="<?php echo esc_attr(get_option('cw_seo_episode_template', Cinema_Window_SEO::DEFAULT_EPISODE_TPL)); ?>" class="large-text" />
                        </td>
                    </tr>
                </table>

                <?php submit_button('حفظ جميع الإعدادات'); ?>
            </form>
        </div>
        <?php
    }

    public static function ajax_run_sync() {
        check_ajax_referer('cw_admin_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'غير مصرح'], 403);
        }

        $type = sanitize_text_field($_POST['type'] ?? 'all');
        $res = Cinema_Window_Sync_Engine::run_sync($type);

        if ($res['success']) {
            wp_send_json_success($res);
        } else {
            wp_send_json_error($res);
        }
    }

    public static function ajax_run_diagnostics() {
        check_ajax_referer('cw_admin_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'غير مصرح'], 403);
        }

        global $wpdb;

        $movies_count = (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'cw_movie' AND post_status = 'publish'");
        $tv_count = (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'cw_tv' AND post_status = 'publish'");
        $anime_count = (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'cw_anime' AND post_status = 'publish'");
        $episodes_count = (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'cw_episode' AND post_status = 'publish'");

        // Check duplicates by TMDb ID in movies/tv
        $duplicates = (int)$wpdb->get_var(
            "SELECT COUNT(*) FROM (
                SELECT meta_value FROM {$wpdb->postmeta}
                WHERE meta_key = '_cw_tmdb_id'
                GROUP BY meta_value HAVING COUNT(*) > 1
            ) as dups"
        );

        // Check orphan episodes
        $orphans = (int)$wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} p
             LEFT JOIN {$wpdb->postmeta} m ON p.ID = m.post_id AND m.meta_key = '_cw_series_post_id'
             LEFT JOIN {$wpdb->posts} parent ON m.meta_value = parent.ID
             WHERE p.post_type = 'cw_episode' AND (parent.ID IS NULL OR parent.post_status = 'trash')"
        );

        wp_send_json_success([
            'movies_count'     => $movies_count,
            'tv_count'         => $tv_count,
            'anime_count'      => $anime_count,
            'episodes_count'   => $episodes_count,
            'duplicates_count' => $duplicates,
            'orphans_count'    => $orphans
        ]);
    }

    public static function ajax_clean_orphans() {
        check_ajax_referer('cw_admin_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'غير مصرح'], 403);
        }

        global $wpdb;
        $orphan_ids = $wpdb->get_col(
            "SELECT p.ID FROM {$wpdb->posts} p
             LEFT JOIN {$wpdb->postmeta} m ON p.ID = m.post_id AND m.meta_key = '_cw_series_post_id'
             LEFT JOIN {$wpdb->posts} parent ON m.meta_value = parent.ID
             WHERE p.post_type = 'cw_episode' AND (parent.ID IS NULL OR parent.post_status = 'trash')"
        );

        if (!empty($orphan_ids)) {
            foreach ($orphan_ids as $id) {
                wp_delete_post($id, true);
            }
        }

        wp_send_json_success(['deleted' => count($orphan_ids)]);
    }
}

Cinema_Window_Admin::init();
