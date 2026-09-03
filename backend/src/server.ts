import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Request ID & Structured Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  res.setHeader('X-Request-Id', requestId);
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      userAgent: req.get('User-Agent')
    }));
  });
  next();
});

// In-memory cache simulation with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlSeconds: number = 300) {
  cache.set(key, { data, expiresAt: Date.now() + (ttlSeconds * 1000) });
}

// 1. Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime()
  });
});

// 2. Remote Config
app.get('/v1/config', (req: Request, res: Response) => {
  res.json({
    features: {
      videoPulse: true,
      downloads: true,
      trakt: true,
      ads: false,
      analytics: true
    },
    player: {
      default: 'HDOFLIX_INTERNAL',
      videoPulsePackage: 'com.videopulse.pkvideo.pulsepk'
    },
    serverPriority: ['ProStream-VIP', 'StreamNest-Direct', 'VidSrc-Fast', 'CloudMedia-Direct', 'SuperEmbed-HD'],
    probeTimeoutMs: 5000,
    maintenanceMode: false
  });
});

// 3. Home Catalog
app.get('/v1/catalog/home', (req: Request, res: Response) => {
  const cached = getCached('catalog_home');
  if (cached) return res.json(cached);

  const homeData = {
    sections: [
      { id: 'trending_movies', title: 'Trending Movies', type: 'movie' },
      { id: 'popular_movies', title: 'Popular Movies', type: 'movie' },
      { id: 'top_rated_movies', title: 'Top Rated Movies', type: 'movie' },
      { id: 'popular_tv', title: 'Popular TV Shows', type: 'tv' },
      { id: 'top_rated_tv', title: 'Top Rated TV', type: 'tv' },
      { id: 'networks', title: 'Popular Networks', type: 'network' },
      { id: 'companies', title: 'Popular Companies', type: 'company' },
      { id: 'trending_tv', title: 'Trending TV', type: 'tv' },
      { id: 'airing_today', title: 'Airing Today', type: 'tv' },
      { id: 'anime_airing', title: 'Anime Airing Now', type: 'tv' },
      { id: 'returning_series', title: 'Returning Series', type: 'tv' },
      { id: 'all_time_greats', title: 'All-Time Greats', type: 'movie' },
      { id: 'coming_soon', title: 'Coming Soon', type: 'movie' },
      { id: 'in_cinemas', title: 'In Cinemas Now', type: 'movie' }
    ]
  };

  setCache('catalog_home', homeData, 600); // 10 min TTL
  res.json(homeData);
});

// 4. Catalog Search
app.get('/v1/catalog/search', (req: Request, res: Response) => {
  const query = req.query.q as string;
  const type = (req.query.type as string) || 'all';
  if (!query) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  res.json({
    query,
    type,
    results: [],
    page: 1,
    totalPages: 1
  });
});

// 5. Catalog Item Details
app.get('/v1/catalog/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  res.json({
    id,
    title: 'Media Title',
    overview: 'High definition content details powered by HDOFLIX Catalog Service.',
    rating: 8.5,
    year: '2024'
  });
});

// 6. Server Resolution
app.post('/v1/resolve', (req: Request, res: Response) => {
  const { tmdbId, type, season = 1, episode = 1 } = req.body;
  if (!tmdbId) {
    return res.status(400).json({ error: 'tmdbId is required' });
  }

  const resolvedServers = [
    {
      id: `srv_pro_${tmdbId}`,
      name: 'ProStream-VIP',
      quality: '1080p',
      streamUrl: type === 'tv' ? `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}` : `https://vidsrc.to/embed/movie/${tmdbId}`,
      latencyMs: 140,
      priority: 1
    },
    {
      id: `srv_super_${tmdbId}`,
      name: 'SuperEmbed-HD',
      quality: '1080p',
      streamUrl: type === 'tv' ? `https://multiembed.mov/directstream.php?video_id=${tmdbId}&s=${season}&e=${episode}` : `https://multiembed.mov/directstream.php?video_id=${tmdbId}`,
      latencyMs: 210,
      priority: 2
    },
    {
      id: `srv_nest_${tmdbId}`,
      name: 'StreamNest-Direct',
      quality: '720p',
      streamUrl: type === 'tv' ? `https://2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}` : `https://2embed.cc/embed/${tmdbId}`,
      latencyMs: 280,
      priority: 3
    }
  ];

  res.json({
    tmdbId,
    type,
    season,
    episode,
    count: resolvedServers.length,
    servers: resolvedServers
  });
});

// 7. Subtitles
app.get('/v1/subtitles', (req: Request, res: Response) => {
  const { tmdbId, lang = 'ar' } = req.query;
  res.json({
    tmdbId,
    subtitles: [
      { id: 'sub_ar', language: 'Arabic', code: 'ar', format: 'VTT', url: 'https://example.com/subs/ar.vtt' },
      { id: 'sub_en', language: 'English', code: 'en', format: 'VTT', url: 'https://example.com/subs/en.vtt' }
    ]
  });
});

// 8. User Profile, Favorites, and History
app.get('/v1/user/profile', (req: Request, res: Response) => {
  res.json({ userId: 'u_1001', name: 'HDOFLIX User', tier: 'PRO', expiresAt: '2028-12-31' });
});

app.get('/v1/user/favorites', (req: Request, res: Response) => {
  res.json({ favorites: [] });
});

app.get('/v1/user/history', (req: Request, res: Response) => {
  res.json({ history: [] });
});

// 9. Notifications
app.get('/v1/notifications', (req: Request, res: Response) => {
  res.json({
    notifications: [
      { id: 'notif_1', title: 'HDOFLIX 2.0 Released', message: 'Enjoy ultra-fast server resolution & native playback!', date: new Date().toISOString() }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`HDOFLIX Backend running on port ${PORT}`);
});
