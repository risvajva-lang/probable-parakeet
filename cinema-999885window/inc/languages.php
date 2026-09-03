<?php
/**
 * Global ISO 639-1 Configuration-driven Language System for Cinema Window
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_Languages {

    private static $languages = [
        'ar' => [
            'code'        => 'ar',
            'name'        => 'العربية',
            'english'     => 'Arabic',
            'tmdb_locale' => 'ar-SA',
            'dir'         => 'rtl',
            'flag'        => '🇸🇦',
            'seo'         => [
                'movie_title'   => 'مشاهدة فيلم {TITLE} {YEAR} مترجم HD اون لاين | نافذة السينما VIP',
                'tv_title'      => 'مشاهدة مسلسل {TITLE} مترجم HD اون لاين | نافذة السينما VIP',
                'anime_title'   => 'مشاهدة أنمي {TITLE} مترجم HD اون لاين | نافذة السينما VIP',
                'episode_title' => '{TYPE_LABEL} {TITLE} الموسم {SEASON_WORD} الحلقة {EPISODE} {EPISODE_WORD} مترجمة HD | نافذة السينما VIP',
                'movie_desc'    => 'مشاهدة وتحميل فيلم {TITLE} ({YEAR}) كامل مترجم بجودة عالية 4K و 1080p عبر 36 سيرفر سريع بدون إعلانات.',
                'tv_desc'       => 'مشاهدة جميع مواسم وحلقات مسلسل {TITLE} كاملة ومترجمة بجودة عالية 4K.',
                'episode_desc'  => 'مشاهدة وتحميل {TYPE_LABEL} {TITLE} الموسم {SEASON} الحلقة {EPISODE} بجودة عالية Full HD وسيرفرات مباشرة سريعة.'
            ]
        ],
        'en' => [
            'code'        => 'en',
            'name'        => 'English',
            'english'     => 'English',
            'tmdb_locale' => 'en-US',
            'dir'         => 'ltr',
            'flag'        => '🇺🇸',
            'seo'         => [
                'movie_title'   => 'Watch {TITLE} ({YEAR}) Full Movie Online HD | Cinema Window VIP',
                'tv_title'      => 'Watch {TITLE} Full Series Online HD | Cinema Window VIP',
                'anime_title'   => 'Watch {TITLE} Anime Online HD | Cinema Window VIP',
                'episode_title' => '{TITLE} Season {SEASON} Episode {EPISODE} Online HD | Cinema Window VIP',
                'movie_desc'    => 'Watch and stream {TITLE} ({YEAR}) full movie in 4K Ultra HD and 1080p across 36 fast VIP streaming servers.',
                'tv_desc'       => 'Watch all seasons and episodes of {TITLE} series in high definition.',
                'episode_desc'  => 'Watch {TITLE} Season {SEASON} Episode {EPISODE} online in Full HD with fast streaming servers.'
            ]
        ],
        'ja' => [
            'code'        => 'ja',
            'name'        => '日本語',
            'english'     => 'Japanese',
            'tmdb_locale' => 'ja-JP',
            'dir'         => 'ltr',
            'flag'        => '🇯🇵',
            'seo'         => [
                'movie_title'   => '『{TITLE}』映画 無料フル視聴 HD | Cinema Window VIP',
                'tv_title'      => '『{TITLE}』ドラマ・アニメ全話 無料視聴 HD | Cinema Window VIP',
                'anime_title'   => '『{TITLE}』アニメ 無料視聴 HD | Cinema Window VIP',
                'episode_title' => '『{TITLE}』第{SEASON}期 第{EPISODE}話 無料視聴 HD | Cinema Window VIP',
                'movie_desc'    => '映画『{TITLE}』({YEAR}) を4K/1080p高画質・高速VIPサーバーでオンライン視聴。',
                'tv_desc'       => '『{TITLE}』の全シーズン・全エピソードを高画質でオンライン配信中。',
                'episode_desc'  => '『{TITLE}』第{SEASON}期 第{EPISODE}話をフルHD高画質で今すぐ無料視聴。'
            ]
        ],
        'fr' => [
            'code'        => 'fr',
            'name'        => 'Français',
            'english'     => 'French',
            'tmdb_locale' => 'fr-FR',
            'dir'         => 'ltr',
            'flag'        => '🇫🇷',
            'seo'         => [
                'movie_title'   => 'Regarder Film {TITLE} ({YEAR}) en Streaming VF/VOSTFR HD | Cinema Window VIP',
                'tv_title'      => 'Regarder Série {TITLE} Complète Streaming HD | Cinema Window VIP',
                'anime_title'   => 'Regarder Anime {TITLE} Streaming VOSTFR HD | Cinema Window VIP',
                'episode_title' => '{TITLE} Saison {SEASON} Épisode {EPISODE} Streaming HD | Cinema Window VIP',
                'movie_desc'    => 'Regarder {TITLE} ({YEAR}) film complet en streaming 4K Ultra HD et 1080p sans publicité.',
                'tv_desc'       => 'Toutes les saisons et épisodes de la série {TITLE} en haute définition.',
                'episode_desc'  => 'Regarder {TITLE} Saison {SEASON} Épisode {EPISODE} en streaming Full HD sur des serveurs rapides.'
            ]
        ],
        'es' => [
            'code'        => 'es',
            'name'        => 'Español',
            'english'     => 'Spanish',
            'tmdb_locale' => 'es-ES',
            'dir'         => 'ltr',
            'flag'        => '🇪🇸',
            'seo'         => [
                'movie_title'   => 'Ver Película {TITLE} ({YEAR}) Online en Español HD | Cinema Window VIP',
                'tv_title'      => 'Ver Serie {TITLE} Completa Online HD | Cinema Window VIP',
                'anime_title'   => 'Ver Anime {TITLE} Online HD | Cinema Window VIP',
                'episode_title' => '{TITLE} Temporada {SEASON} Episodio {EPISODE} Online HD | Cinema Window VIP',
                'movie_desc'    => 'Ver y descargar {TITLE} ({YEAR}) película completa en 4K Ultra HD y 1080p con 36 servidores VIP.',
                'tv_desc'       => 'Ver todas las temporadas y episodios de {TITLE} en alta definición.',
                'episode_desc'  => 'Ver {TITLE} Temporada {SEASON} Episodio {EPISODE} online en Full HD.'
            ]
        ],
        'de' => [
            'code'        => 'de',
            'name'        => 'Deutsch',
            'english'     => 'German',
            'tmdb_locale' => 'de-DE',
            'dir'         => 'ltr',
            'flag'        => '🇩🇪',
            'seo'         => [
                'movie_title'   => '{TITLE} ({YEAR}) Ganzer Film Online Stream HD | Cinema Window VIP',
                'tv_title'      => '{TITLE} Serie Online Stream HD | Cinema Window VIP',
                'anime_title'   => '{TITLE} Anime Stream Deutsch HD | Cinema Window VIP',
                'episode_title' => '{TITLE} Staffel {SEASON} Folge {EPISODE} Stream HD | Cinema Window VIP',
                'movie_desc'    => '{TITLE} ({YEAR}) ganzen Film online in 4K und Full HD streamen.',
                'tv_desc'       => 'Alle Staffeln und Episoden der Serie {TITLE} online in HD anschauen.',
                'episode_desc'  => '{TITLE} Staffel {SEASON} Episode {EPISODE} in HD streamen.'
            ]
        ],
        'tr' => [
            'code'        => 'tr',
            'name'        => 'Türkçe',
            'english'     => 'Turkish',
            'tmdb_locale' => 'tr-TR',
            'dir'         => 'ltr',
            'flag'        => '🇹🇷',
            'seo'         => [
                'movie_title'   => '{TITLE} ({YEAR}) Türkçe Dublaj & Altyazılı Full HD İzle | Cinema Window VIP',
                'tv_title'      => '{TITLE} Dizisi Tüm Bölümler Full HD İzle | Cinema Window VIP',
                'anime_title'   => '{TITLE} Anime Türkçe Altyazılı İzle | Cinema Window VIP',
                'episode_title' => '{TITLE} Sezon {SEASON} Bölüm {EPISODE} Full HD İzle | Cinema Window VIP',
                'movie_desc'    => '{TITLE} ({YEAR}) filmini 4K Ultra HD ve 1080p kalitesinde kesintisiz izle.',
                'tv_desc'       => '{TITLE} dizisinin tüm sezon ve bölümlerini Full HD kalitede izleyin.',
                'episode_desc'  => '{TITLE} Sezon {SEASON} Bölüm {EPISODE} tek parça Full HD izle.'
            ]
        ],
        'ko' => [
            'code'        => 'ko',
            'name'        => '한국어',
            'english'     => 'Korean',
            'tmdb_locale' => 'ko-KR',
            'dir'         => 'ltr',
            'flag'        => '🇰🇷',
            'seo'         => [
                'movie_title'   => '영화 {TITLE} ({YEAR}) 무료 다시보기 HD | Cinema Window VIP',
                'tv_title'      => '드라마 {TITLE} 전편 무료 다시보기 HD | Cinema Window VIP',
                'anime_title'   => '애니 {TITLE} 전편 다시보기 HD | Cinema Window VIP',
                'episode_title' => '{TITLE} 시즌 {SEASON} {EPISODE}화 다시보기 HD | Cinema Window VIP',
                'movie_desc'    => '영화 {TITLE} ({YEAR}) 4K 초고화질 스트리밍 무료 다시보기.',
                'tv_desc'       => '{TITLE} 모든 시즌과 에피소드를 Full HD 화질로 감상하세요.',
                'episode_desc'  => '{TITLE} 시즌 {SEASON} {EPISODE}화 빠른 스트리밍 무료 시청.'
            ]
        ]
    ];

    public static function get_all() {
        return self::$languages;
    }

    public static function get($code) {
        $code = strtolower(trim($code));
        return self::$languages[$code] ?? self::$languages['ar'];
    }

    public static function get_codes() {
        return array_keys(self::$languages);
    }
}
