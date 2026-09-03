<?php
/**
 * 36 High-Speed Streaming Servers Configuration for Cinema Window
 *
 * @package Cinema_Window
 */

if (!defined('ABSPATH')) {
    exit;
}

class Cinema_Window_Servers {

    public static function get_default_servers() {
        return [
            ['id' => 'vidlink', 'name' => 'VidLink (Ultra 4K VIP)', 'speed' => 'خارق', 'quality' => '4K Ultra HD', 'features' => 'بدون إعلانات', 'enabled' => true, 'priority' => 1],
            ['id' => 'videm', 'name' => 'Videm VIP (سريع جداً)', 'speed' => 'فائق', 'quality' => '1080p FHD', 'features' => 'سريع', 'enabled' => true, 'priority' => 2],
            ['id' => 'vidsrc-icu', 'name' => 'VidSrc ICU (الرئيسي)', 'speed' => 'فائق', 'quality' => '1080p FHD', 'features' => 'شائع', 'enabled' => true, 'priority' => 3],
            ['id' => 'vidsrc-su', 'name' => 'VidSrc SU (سريع)', 'speed' => 'فائق', 'quality' => '1080p FHD', 'features' => 'سريع', 'enabled' => true, 'priority' => 4],
            ['id' => 'vidsrc-rip', 'name' => 'VidSrc RIP (أصلي)', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'مستقر', 'enabled' => true, 'priority' => 5],
            ['id' => 'vidsrc-xyz', 'name' => 'VidSrc Pro (احتياطي)', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'احتياطي', 'enabled' => true, 'priority' => 6],
            ['id' => 'vidsrc-nl', 'name' => 'VidSrc NL (أوروبي)', 'speed' => 'فائق', 'quality' => '1080p FHD', 'features' => 'أوروبي', 'enabled' => true, 'priority' => 7],
            ['id' => 'embos', 'name' => 'Embos VIP (أوتوماتيكي)', 'speed' => 'فائق', 'quality' => '1080p FHD', 'features' => 'تلقائي', 'enabled' => true, 'priority' => 8],
            ['id' => 'superembed', 'name' => 'SuperEmbed (متعدد الجودات)', 'speed' => 'فائق', 'quality' => '1080p Multi', 'features' => 'متعدد', 'enabled' => true, 'priority' => 9],
            ['id' => 'embedsu', 'name' => 'EmbedSu (سريع)', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'مباشر', 'enabled' => true, 'priority' => 10],
            ['id' => 'autoembed', 'name' => 'AutoEmbed (مباشر)', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'مباشر', 'enabled' => true, 'priority' => 11],
            ['id' => 'smashystream', 'name' => 'SmashyStream (مستقر)', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'مستقر', 'enabled' => true, 'priority' => 12],
            ['id' => '2embed', 'name' => '2Embed Official', 'speed' => 'جيد جداً', 'quality' => '1080p FHD', 'features' => 'شائع', 'enabled' => true, 'priority' => 13],
            ['id' => 'multiembed', 'name' => 'MultiEmbed VIP', 'speed' => 'فائق', 'quality' => '1080p Multi', 'features' => 'VIP', 'enabled' => true, 'priority' => 14],
            ['id' => 'streamhub', 'name' => 'StreamHub Cloud', 'speed' => 'فائق', 'quality' => '1080p Cloud', 'features' => 'سحابي', 'enabled' => true, 'priority' => 15],
            ['id' => 'moviee', 'name' => 'Moviee Stream', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'سريع', 'enabled' => true, 'priority' => 16],
            ['id' => 'moviesapi', 'name' => 'MoviesAPI Stream', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'مستقر', 'enabled' => true, 'priority' => 17],
            ['id' => 'primewire', 'name' => 'PrimeWire Cloud', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'مباشر', 'enabled' => true, 'priority' => 18],
            ['id' => 'frembed', 'name' => 'FrEmbed (سريع)', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'سريع', 'enabled' => true, 'priority' => 19],
            ['id' => 'kisskh', 'name' => 'KissKH (أنمي & دراما)', 'speed' => 'فائق', 'quality' => '1080p Anime', 'features' => 'أنمي', 'enabled' => true, 'priority' => 20],
            ['id' => 'animez', 'name' => 'AnimeStream Pro', 'speed' => 'فائق', 'quality' => '1080p FHD', 'features' => 'أنمي', 'enabled' => true, 'priority' => 21],
            ['id' => 'vidsrc-me', 'name' => 'VidSrc.me Mirror', 'speed' => 'جيد جداً', 'quality' => '1080p FHD', 'features' => 'مرآة', 'enabled' => true, 'priority' => 22],
            ['id' => 'vidsrc-net', 'name' => 'VidSrc.net Mirror', 'speed' => 'جيد جداً', 'quality' => '1080p FHD', 'features' => 'مرآة', 'enabled' => true, 'priority' => 23],
            ['id' => 'streamtape', 'name' => 'StreamTape VIP', 'speed' => 'ممتاز', 'quality' => '720p HD', 'features' => 'شائع', 'enabled' => true, 'priority' => 24],
            ['id' => 'doodstream', 'name' => 'DoodStream HD', 'speed' => 'جيد جداً', 'quality' => '720p HD', 'features' => 'مستقر', 'enabled' => true, 'priority' => 25],
            ['id' => 'filelions', 'name' => 'FileLions Speed', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'سريع', 'enabled' => true, 'priority' => 26],
            ['id' => 'mixdrop', 'name' => 'MixDrop Fast', 'speed' => 'جيد جداً', 'quality' => '720p HD', 'features' => 'شائع', 'enabled' => true, 'priority' => 27],
            ['id' => 'streamwish', 'name' => 'StreamWish Pro', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'مستقر', 'enabled' => true, 'priority' => 28],
            ['id' => 'vidguard', 'name' => 'VidGuard Protect', 'speed' => 'فائق', 'quality' => '1080p FHD', 'features' => 'آمن', 'enabled' => true, 'priority' => 29],
            ['id' => 'upstream', 'name' => 'UpStream Cloud', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'سحابي', 'enabled' => true, 'priority' => 30],
            ['id' => 'wolfstream', 'name' => 'WolfStream Pro', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'سريع', 'enabled' => true, 'priority' => 31],
            ['id' => 'hexupload', 'name' => 'HexStream 4K', 'speed' => 'فائق', 'quality' => '4K Ultra HD', 'features' => '4K', 'enabled' => true, 'priority' => 32],
            ['id' => 'luluvdo', 'name' => 'LuluStream VIP', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'VIP', 'enabled' => true, 'priority' => 33],
            ['id' => 'turbovid', 'name' => 'TurboVid Direct', 'speed' => 'خارق', 'quality' => '1080p FHD', 'features' => 'مباشر', 'enabled' => true, 'priority' => 34],
            ['id' => 'streamdav', 'name' => 'StreamDav Ultra', 'speed' => 'فائق', 'quality' => '1080p FHD', 'features' => 'سريع', 'enabled' => true, 'priority' => 35],
            ['id' => 'gomo', 'name' => 'GomoStream Alternative', 'speed' => 'ممتاز', 'quality' => '1080p FHD', 'features' => 'بديل', 'enabled' => true, 'priority' => 36]
        ];
    }

    public static function get_all_servers() {
        $saved = get_option('cw_custom_servers_config');
        if (!empty($saved) && is_array($saved)) {
            return $saved;
        }
        return self::get_default_servers();
    }

    public static function build_embed_url($server_id, $tmdb_id, $type = 'movie', $season = 1, $episode = 1) {
        $is_movie = ($type === 'movie');
        switch ($server_id) {
            case 'vidlink':
                return $is_movie 
                    ? "https://vidlink.pro/movie/{$tmdb_id}?primaryColor=a855f7&secondaryColor=f59e0b"
                    : "https://vidlink.pro/tv/{$tmdb_id}/{$season}/{$episode}?primaryColor=a855f7&secondaryColor=f59e0b";
            case 'videm':
                return $is_movie
                    ? "https://videm.net/embed/movie/{$tmdb_id}"
                    : "https://videm.net/embed/tv/{$tmdb_id}/{$season}/{$episode}";
            case 'vidsrc-icu':
                return $is_movie
                    ? "https://vidsrc.icu/embed/movie/{$tmdb_id}"
                    : "https://vidsrc.icu/embed/tv/{$tmdb_id}/{$season}/{$episode}";
            case 'vidsrc-su':
                return $is_movie
                    ? "https://vidsrc.su/embed/movie/{$tmdb_id}"
                    : "https://vidsrc.su/embed/tv/{$tmdb_id}/{$season}/{$episode}";
            case 'vidsrc-rip':
                return $is_movie
                    ? "https://vidsrc.rip/embed/movie/{$tmdb_id}"
                    : "https://vidsrc.rip/embed/tv/{$tmdb_id}/{$season}/{$episode}";
            case 'vidsrc-xyz':
                return $is_movie
                    ? "https://vidsrc.xyz/embed/movie/{$tmdb_id}"
                    : "https://vidsrc.xyz/embed/tv/{$tmdb_id}/{$season}/{$episode}";
            case 'vidsrc-nl':
                return $is_movie
                    ? "https://vidsrc.nl/embed/movie/{$tmdb_id}"
                    : "https://vidsrc.nl/embed/tv/{$tmdb_id}/{$season}/{$episode}";
            case 'embos':
                return $is_movie
                    ? "https://embos.cc/embed/movie/{$tmdb_id}"
                    : "https://embos.cc/embed/tv/{$tmdb_id}/{$season}/{$episode}";
            case 'superembed':
                return $is_movie
                    ? "https://multiembed.mov/?video_id={$tmdb_id}&tmdb=1"
                    : "https://multiembed.mov/?video_id={$tmdb_id}&tmdb=1&s={$season}&e={$episode}";
            case 'embedsu':
                return $is_movie
                    ? "https://embed.su/embed/movie/{$tmdb_id}"
                    : "https://embed.su/embed/tv/{$tmdb_id}/{$season}/{$episode}";
            case 'autoembed':
                return $is_movie
                    ? "https://player.autoembed.cc/embed/movie/{$tmdb_id}"
                    : "https://player.autoembed.cc/embed/tv/{$tmdb_id}/{$season}/{$episode}";
            case 'smashystream':
                return $is_movie
                    ? "https://player.smashy.stream/movie/{$tmdb_id}"
                    : "https://player.smashy.stream/tv/{$tmdb_id}?s={$season}&e={$episode}";
            case '2embed':
                return $is_movie
                    ? "https://www.2embed.cc/embed/{$tmdb_id}"
                    : "https://www.2embed.cc/embedtv/{$tmdb_id}&s={$season}&e={$episode}";
            case 'multiembed':
                return $is_movie
                    ? "https://multiembed.mov/directstream.php?video_id={$tmdb_id}&tmdb=1"
                    : "https://multiembed.mov/directstream.php?video_id={$tmdb_id}&tmdb=1&s={$season}&e={$episode}";
            case 'streamhub':
                return $is_movie
                    ? "https://streamhub.to/e/{$tmdb_id}"
                    : "https://streamhub.to/e/{$tmdb_id}-s{$season}e{$episode}";
            case 'frembed':
                return $is_movie
                    ? "https://frembed.live/api/film.php?id={$tmdb_id}"
                    : "https://frembed.live/api/serie.php?id={$tmdb_id}&sa={$season}&epi={$episode}";
            case 'kisskh':
                return $is_movie
                    ? "https://kisskh.co/embed/movie/{$tmdb_id}"
                    : "https://kisskh.co/embed/tv/{$tmdb_id}/{$season}/{$episode}";
            case 'animez':
                return $is_movie
                    ? "https://animez.stream/embed/{$tmdb_id}"
                    : "https://animez.stream/embed/{$tmdb_id}/{$season}/{$episode}";
            case 'vidsrc-me':
                return $is_movie
                    ? "https://vidsrc.me/embed/movie?tmdb={$tmdb_id}"
                    : "https://vidsrc.me/embed/tv?tmdb={$tmdb_id}&season={$season}&episode={$episode}";
            case 'vidsrc-net':
                return $is_movie
                    ? "https://vidsrc.net/embed/movie/{$tmdb_id}"
                    : "https://vidsrc.net/embed/tv/{$tmdb_id}/{$season}/{$episode}";
            default:
                return $is_movie
                    ? "https://vidsrc.icu/embed/movie/{$tmdb_id}"
                    : "https://vidsrc.icu/embed/tv/{$tmdb_id}/{$season}/{$episode}";
        }
    }
}
