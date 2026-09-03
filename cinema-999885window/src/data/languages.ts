export interface LanguageConfig {
  code: string; // ISO 639-1 code
  name: string; // Native language name
  englishName: string;
  tmdbLocale: string;
  dir: 'rtl' | 'ltr';
  flag: string;
  seo: {
    movieTitle: string;
    tvTitle: string;
    animeTitle: string;
    episodeTitle: string;
    movieDesc: string;
    tvDesc: string;
    episodeDesc: string;
  };
  ui: {
    siteName: string;
    home: string;
    movies: string;
    tvSeries: string;
    anime: string;
    cartoon: string;
    arabic: string;
    favorites: string;
    history: string;
    continueWatching: string;
    searchPlaceholder: string;
    allGenres: string;
    allYears: string;
    watchNow: string;
    details: string;
    season: string;
    episode: string;
    episodes: string;
    seasons: string;
    previousEpisode: string;
    nextEpisode: string;
    servers: string;
    share: string;
    copied: string;
    quality: string;
    rating: string;
    duration: string;
    releaseDate: string;
    cast: string;
    story: string;
    similar: string;
    noResults: string;
  };
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  ar: {
    code: 'ar',
    name: 'العربية',
    englishName: 'Arabic',
    tmdbLocale: 'ar-SA',
    dir: 'rtl',
    flag: '🇸🇦',
    seo: {
      movieTitle: 'مشاهدة فيلم {TITLE} {YEAR} مترجم HD اون لاين | نافذة السينما VIP',
      tvTitle: 'مشاهدة مسلسل {TITLE} مترجم HD اون لاين | نافذة السينما VIP',
      animeTitle: 'مشاهدة أنمي {TITLE} مترجم HD اون لاين | نافذة السينما VIP',
      episodeTitle: '{TYPE_LABEL} {TITLE} الموسم {SEASON_WORD} الحلقة {EPISODE} {EPISODE_WORD} مترجمة HD | نافذة السينما VIP',
      movieDesc: 'مشاهدة وتحميل فيلم {TITLE} ({YEAR}) كامل مترجم بجودة عالية 4K و 1080p عبر 36 سيرفر سريع بدون إعلانات.',
      tvDesc: 'مشاهدة جميع مواسم وحلقات مسلسل {TITLE} كاملة ومترجمة بجودة عالية 4K.',
      episodeDesc: 'مشاهدة وتحميل {TYPE_LABEL} {TITLE} الموسم {SEASON} الحلقة {EPISODE} بجودة عالية Full HD وسيرفرات مباشرة سريعة.'
    },
    ui: {
      siteName: 'نافذة السينما',
      home: 'الرئيسية',
      movies: 'الأفلام',
      tvSeries: 'المسلسلات',
      anime: 'الأنمي',
      cartoon: 'كرتون',
      arabic: 'عربي',
      favorites: 'المفضلة',
      history: 'سجل المشاهدة',
      continueWatching: 'متابعة المشاهدة',
      searchPlaceholder: 'ابحث عن فيلم، مسلسل، أنمي، ممثل...',
      allGenres: 'جميع التصنيفات',
      allYears: 'جميع السنوات',
      watchNow: 'شاهد الآن',
      details: 'التفاصيل',
      season: 'الموسم',
      episode: 'الحلقة',
      episodes: 'الحلقات',
      seasons: 'المواسم',
      previousEpisode: 'الحلقة السابقة',
      nextEpisode: 'الحلقة التالية',
      servers: 'سيرفرات البث',
      share: 'مشاركة',
      copied: 'تم نسخ الرابط بنجاح!',
      quality: 'الجودة',
      rating: 'التقييم',
      duration: 'المدة',
      releaseDate: 'تاريخ الإصدار',
      cast: 'طاقم التمثيل',
      story: 'القصة والأحداث',
      similar: 'أعمال مشابهة مقترحة',
      noResults: 'لا توجد نتائج مطابقة لبحثك'
    }
  },
  en: {
    code: 'en',
    name: 'English',
    englishName: 'English',
    tmdbLocale: 'en-US',
    dir: 'ltr',
    flag: '🇺🇸',
    seo: {
      movieTitle: 'Watch {TITLE} ({YEAR}) Full Movie Online HD | Cinema Window VIP',
      tvTitle: 'Watch {TITLE} Full Series Online HD | Cinema Window VIP',
      animeTitle: 'Watch {TITLE} Anime Online HD | Cinema Window VIP',
      episodeTitle: '{TITLE} Season {SEASON} Episode {EPISODE} Online HD | Cinema Window VIP',
      movieDesc: 'Watch and stream {TITLE} ({YEAR}) full movie in 4K Ultra HD and 1080p across 36 fast VIP streaming servers.',
      tvDesc: 'Watch all seasons and episodes of {TITLE} series in high definition.',
      episodeDesc: 'Watch {TITLE} Season {SEASON} Episode {EPISODE} online in Full HD with fast streaming servers.'
    },
    ui: {
      siteName: 'Cinema Window',
      home: 'Home',
      movies: 'Movies',
      tvSeries: 'TV Shows',
      anime: 'Anime',
      cartoon: 'Cartoons',
      arabic: 'Arabic Cinema',
      favorites: 'Favorites',
      history: 'Watch History',
      continueWatching: 'Continue Watching',
      searchPlaceholder: 'Search movies, series, anime, actors...',
      allGenres: 'All Genres',
      allYears: 'All Years',
      watchNow: 'Watch Now',
      details: 'Details',
      season: 'Season',
      episode: 'Episode',
      episodes: 'Episodes',
      seasons: 'Seasons',
      previousEpisode: 'Previous Episode',
      nextEpisode: 'Next Episode',
      servers: 'Streaming Servers',
      share: 'Share',
      copied: 'Link copied to clipboard!',
      quality: 'Quality',
      rating: 'Rating',
      duration: 'Duration',
      releaseDate: 'Release Date',
      cast: 'Cast',
      story: 'Storyline',
      similar: 'Similar Titles',
      noResults: 'No results found'
    }
  },
  ja: {
    code: 'ja',
    name: '日本語',
    englishName: 'Japanese',
    tmdbLocale: 'ja-JP',
    dir: 'ltr',
    flag: '🇯🇵',
    seo: {
      movieTitle: '『{TITLE}』映画 無料フル視聴 HD | Cinema Window VIP',
      tvTitle: '『{TITLE}』ドラマ・アニメ全話 無料視聴 HD | Cinema Window VIP',
      animeTitle: '『{TITLE}』アニメ 無料視聴 HD | Cinema Window VIP',
      episodeTitle: '『{TITLE}』第{SEASON}期 第{EPISODE}話 無料視聴 HD | Cinema Window VIP',
      movieDesc: '映画『{TITLE}』({YEAR}) を4K/1080p高画質・高速VIPサーバーでオンライン視聴。',
      tvDesc: '『{TITLE}』の全シーズン・全エピソードを高画質でオンライン配信中。',
      episodeDesc: '『{TITLE}』第{SEASON}期 第{EPISODE}話をフルHD高画質で今すぐ無料視聴。'
    },
    ui: {
      siteName: 'シネマウィンドウ',
      home: 'ホーム',
      movies: '映画',
      tvSeries: 'ドラマ',
      anime: 'アニメ',
      cartoon: 'カートゥーン',
      arabic: 'アラビア作品',
      favorites: 'お気に入り',
      history: '視聴履歴',
      continueWatching: '続きを観る',
      searchPlaceholder: '映画、ドラマ、アニメ、俳優を検索...',
      allGenres: 'すべてのジャンル',
      allYears: 'すべての公開年',
      watchNow: '今すぐ視聴',
      details: '詳細情報',
      season: 'シーズン',
      episode: 'エピソード',
      episodes: 'エピソード一覧',
      seasons: 'シーズン一覧',
      previousEpisode: '前のエピソード',
      nextEpisode: '次のエピソード',
      servers: 'ストリーミングサーバー',
      share: '共有する',
      copied: 'リンクをコピーしました！',
      quality: '画質',
      rating: '評価',
      duration: '再生時間',
      releaseDate: '公開日',
      cast: 'キャスト',
      story: 'あらすじ',
      similar: 'おすすめの類似作品',
      noResults: '見つかりませんでした'
    }
  },
  fr: {
    code: 'fr',
    name: 'Français',
    englishName: 'French',
    tmdbLocale: 'fr-FR',
    dir: 'ltr',
    flag: '🇫🇷',
    seo: {
      movieTitle: 'Regarder Film {TITLE} ({YEAR}) en Streaming VF/VOSTFR HD | Cinema Window VIP',
      tvTitle: 'Regarder Série {TITLE} Complète Streaming HD | Cinema Window VIP',
      animeTitle: 'Regarder Anime {TITLE} Streaming VOSTFR HD | Cinema Window VIP',
      episodeTitle: '{TITLE} Saison {SEASON} Épisode {EPISODE} Streaming HD | Cinema Window VIP',
      movieDesc: 'Regarder {TITLE} ({YEAR}) film complet en streaming 4K Ultra HD et 1080p sans publicité.',
      tvDesc: 'Toutes les saisons et épisodes de la série {TITLE} en haute définition.',
      episodeDesc: 'Regarder {TITLE} Saison {SEASON} Épisode {EPISODE} en streaming Full HD sur des serveurs rapides.'
    },
    ui: {
      siteName: 'Cinema Window',
      home: 'Accueil',
      movies: 'Films',
      tvSeries: 'Séries',
      anime: 'Animé',
      cartoon: 'Dessins Animés',
      arabic: 'Cinéma Arabe',
      favorites: 'Favoris',
      history: 'Historique',
      continueWatching: 'Continuer la lecture',
      searchPlaceholder: 'Rechercher un film, une série, un animé...',
      allGenres: 'Tous les genres',
      allYears: 'Toutes les années',
      watchNow: 'Regarder',
      details: 'Détails',
      season: 'Saison',
      episode: 'Épisode',
      episodes: 'Épisodes',
      seasons: 'Saisons',
      previousEpisode: 'Épisode précédent',
      nextEpisode: 'Épisode suivant',
      servers: 'Serveurs de streaming',
      share: 'Partager',
      copied: 'Lien copié dans le presse-papiers !',
      quality: 'Qualité',
      rating: 'Note',
      duration: 'Durée',
      releaseDate: 'Date de sortie',
      cast: 'Distribution',
      story: 'Synopsis',
      similar: 'Titres similaires',
      noResults: 'Aucun résultat trouvé'
    }
  },
  es: {
    code: 'es',
    name: 'Español',
    englishName: 'Spanish',
    tmdbLocale: 'es-ES',
    dir: 'ltr',
    flag: '🇪🇸',
    seo: {
      movieTitle: 'Ver Película {TITLE} ({YEAR}) Online en Español HD | Cinema Window VIP',
      tvTitle: 'Ver Serie {TITLE} Completa Online HD | Cinema Window VIP',
      animeTitle: 'Ver Anime {TITLE} Online HD | Cinema Window VIP',
      episodeTitle: '{TITLE} Temporada {SEASON} Episodio {EPISODE} Online HD | Cinema Window VIP',
      movieDesc: 'Ver y descargar {TITLE} ({YEAR}) película completa en 4K Ultra HD y 1080p con 36 servidores VIP.',
      tvDesc: 'Ver todas las temporadas y episodios de {TITLE} en alta definición.',
      episodeDesc: 'Ver {TITLE} Temporada {SEASON} Episodio {EPISODE} online en Full HD.'
    },
    ui: {
      siteName: 'Cinema Window',
      home: 'Inicio',
      movies: 'Películas',
      tvSeries: 'Series',
      anime: 'Anime',
      cartoon: 'Dibujos Animados',
      arabic: 'Cine Árabe',
      favorites: 'Favoritos',
      history: 'Historial',
      continueWatching: 'Continuar Viendo',
      searchPlaceholder: 'Buscar películas, series, anime, actores...',
      allGenres: 'Todos los géneros',
      allYears: 'Todos los años',
      watchNow: 'Ver Ahora',
      details: 'Detalles',
      season: 'Temporada',
      episode: 'Episodio',
      episodes: 'Episodios',
      seasons: 'Temporadas',
      previousEpisode: 'Episodio anterior',
      nextEpisode: 'Siguiente episodio',
      servers: 'Servidores de Streaming',
      share: 'Compartir',
      copied: '¡Enlace copiado al portapapeles!',
      quality: 'Calidad',
      rating: 'Calificación',
      duration: 'Duración',
      releaseDate: 'Fecha de estreno',
      cast: 'Reparto',
      story: 'Sinopsis',
      similar: 'Títulos similares',
      noResults: 'No se encontraron resultados'
    }
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    englishName: 'German',
    tmdbLocale: 'de-DE',
    dir: 'ltr',
    flag: '🇩🇪',
    seo: {
      movieTitle: '{TITLE} ({YEAR}) Ganzer Film Online Stream HD | Cinema Window VIP',
      tvTitle: '{TITLE} Serie Online Stream HD | Cinema Window VIP',
      animeTitle: '{TITLE} Anime Stream Deutsch HD | Cinema Window VIP',
      episodeTitle: '{TITLE} Staffel {SEASON} Folge {EPISODE} Stream HD | Cinema Window VIP',
      movieDesc: '{TITLE} ({YEAR}) ganzen Film online in 4K und Full HD streamen.',
      tvDesc: 'Alle Staffeln und Episoden der Serie {TITLE} online in HD anschauen.',
      episodeDesc: '{TITLE} Staffel {SEASON} Episode {EPISODE} in HD streamen.'
    },
    ui: {
      siteName: 'Cinema Window',
      home: 'Startseite',
      movies: 'Filme',
      tvSeries: 'Serien',
      anime: 'Anime',
      cartoon: 'Zeichentrick',
      arabic: 'Arabisches Kino',
      favorites: 'Favoriten',
      history: 'Verlauf',
      continueWatching: 'Weiterschauen',
      searchPlaceholder: 'Suche Filme, Serien, Anime, Schauspieler...',
      allGenres: 'Alle Genres',
      allYears: 'Alle Jahre',
      watchNow: 'Jetzt ansehen',
      details: 'Details',
      season: 'Staffel',
      episode: 'Folge',
      episodes: 'Episoden',
      seasons: 'Staffeln',
      previousEpisode: 'Vorherige Episode',
      nextEpisode: 'Nächste Episode',
      servers: 'Streaming-Server',
      share: 'Teilen',
      copied: 'Link in die Zwischenablage kopiert!',
      quality: 'Qualität',
      rating: 'Bewertung',
      duration: 'Laufzeit',
      releaseDate: 'Erscheinungsdatum',
      cast: 'Besetzung',
      story: 'Handlung',
      similar: 'Ähnliche Titel',
      noResults: 'Keine Ergebnisse gefunden'
    }
  },
  tr: {
    code: 'tr',
    name: 'Türkçe',
    englishName: 'Turkish',
    tmdbLocale: 'tr-TR',
    dir: 'ltr',
    flag: '🇹🇷',
    seo: {
      movieTitle: '{TITLE} ({YEAR}) Türkçe Dublaj & Altyazılı Full HD İzle | Cinema Window VIP',
      tvTitle: '{TITLE} Dizisi Tüm Bölümler Full HD İzle | Cinema Window VIP',
      animeTitle: '{TITLE} Anime Türkçe Altyazılı İzle | Cinema Window VIP',
      episodeTitle: '{TITLE} Sezon {SEASON} Bölüm {EPISODE} Full HD İzle | Cinema Window VIP',
      movieDesc: '{TITLE} ({YEAR}) filmini 4K Ultra HD ve 1080p kalitesinde kesintisiz izle.',
      tvDesc: '{TITLE} dizisinin tüm sezon ve bölümlerini Full HD kalitede izleyin.',
      episodeDesc: '{TITLE} Sezon {SEASON} Bölüm {EPISODE} tek parça Full HD izle.'
    },
    ui: {
      siteName: 'Cinema Window',
      home: 'Ana Sayfa',
      movies: 'Filmler',
      tvSeries: 'Diziler',
      anime: 'Anime',
      cartoon: 'Çizgi Filmler',
      arabic: 'Arap Sineması',
      favorites: 'Favorilerim',
      history: 'İzleme Geçmişi',
      continueWatching: 'İzlemeye Devam Et',
      searchPlaceholder: 'Film, dizi, anime, oyuncu ara...',
      allGenres: 'Tüm Türler',
      allYears: 'Tüm Yıllar',
      watchNow: 'Şimdi İzle',
      details: 'Detaylar',
      season: 'Sezon',
      episode: 'Bölüm',
      episodes: 'Bölümler',
      seasons: 'Sezonlar',
      previousEpisode: 'Önceki Bölüm',
      nextEpisode: 'Sonraki Bölüm',
      servers: 'Yayın Sunucuları',
      share: 'Paylaş',
      copied: 'Bağlantı kopyalandı!',
      quality: 'Kalite',
      rating: 'Puan',
      duration: 'Süre',
      releaseDate: 'Yayın Tarihi',
      cast: 'Oyuncular',
      story: 'Konu',
      similar: 'Benzer Yapımlar',
      noResults: 'Sonuç bulunamadı'
    }
  },
  ko: {
    code: 'ko',
    name: '한국어',
    englishName: 'Korean',
    tmdbLocale: 'ko-KR',
    dir: 'ltr',
    flag: '🇰🇷',
    seo: {
      movieTitle: '영화 {TITLE} ({YEAR}) 무료 다시보기 HD | Cinema Window VIP',
      tvTitle: '드라마 {TITLE} 전편 무료 다시보기 HD | Cinema Window VIP',
      animeTitle: '애니 {TITLE} 전편 다시보기 HD | Cinema Window VIP',
      episodeTitle: '{TITLE} 시즌 {SEASON} {EPISODE}화 다시보기 HD | Cinema Window VIP',
      movieDesc: '영화 {TITLE} ({YEAR}) 4K 초고화질 스트리밍 무료 다시보기.',
      tvDesc: '{TITLE} 모든 시즌과 에피소드를 Full HD 화질로 감상하세요.',
      episodeDesc: '{TITLE} 시즌 {SEASON} {EPISODE}화 빠른 스트리밍 무료 시청.'
    },
    ui: {
      siteName: '시네마 윈도우',
      home: '홈',
      movies: '영화',
      tvSeries: '드라마/시리즈',
      anime: '애니메이션',
      cartoon: '만화/키즈',
      arabic: '아랍 영화',
      favorites: '즐겨찾기',
      history: '시청 기록',
      continueWatching: '이어보기',
      searchPlaceholder: '영화, 드라마, 애니메이션 검색...',
      allGenres: '모든 장르',
      allYears: '모든 연도',
      watchNow: '지금 시청',
      details: '상세 정보',
      season: '시즌',
      episode: '에피소드',
      episodes: '회차 목록',
      seasons: '시즌 목록',
      previousEpisode: '이전 화',
      nextEpisode: '다음 화',
      servers: '스트리밍 서버',
      share: '공유하기',
      copied: '링크가 복사되었습니다!',
      quality: '화질',
      rating: '평점',
      duration: '러닝타임',
      releaseDate: '개봉일',
      cast: '출연진',
      story: '줄거리',
      similar: '추천 작품',
      noResults: '검색 결과가 없습니다'
    }
  }
};

export const DEFAULT_LANGUAGE = 'ar';

export function getLanguageConfig(langCode: string): LanguageConfig {
  const code = (langCode || '').toLowerCase().trim();
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
}

export function getAllSupportedLanguageCodes(): string[] {
  return Object.keys(SUPPORTED_LANGUAGES);
}
