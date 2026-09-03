import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MediaItem } from '../types';
import { getCanonicalUrl } from '../utils/share';

interface SeoMetaHelmetProps {
  media: MediaItem | null;
  season?: number;
  episode?: number;
  legalPage?: 'dmca' | 'terms' | null;
}

export const SeoMetaHelmet: React.FC<SeoMetaHelmetProps> = ({
  media,
  season,
  episode,
  legalPage
}) => {
  if (legalPage === 'dmca') {
    return (
      <Helmet>
        <title>حقوق الملكية الفكرية والنشر (DMCA) | نافذة السينما VIP</title>
        <meta name="description" content="سياسة حقوق الملكية الفكرية والنشر وإرشادات DMCA لموقع نافذة السينما VIP." />
        <meta property="og:title" content="حقوق الملكية الفكرية والنشر (DMCA) | نافذة السينما VIP" />
        <meta property="og:description" content="سياسة حقوق الملكية الفكرية والنشر وإرشادات DMCA لموقع نافذة السينما VIP." />
      </Helmet>
    );
  }

  if (legalPage === 'terms') {
    return (
      <Helmet>
        <title>الشروط والأحكام وسياسة الخصوصية | نافذة السينما VIP</title>
        <meta name="description" content="الشروط والأحكام وسياسة الاستخدام لموقع نافذة السينما VIP." />
        <meta property="og:title" content="الشروط والأحكام وسياسة الخصوصية | نافذة السينما VIP" />
        <meta property="og:description" content="الشروط والأحكام وسياسة الاستخدام لموقع نافذة السينما VIP." />
      </Helmet>
    );
  }

  if (!media) {
    return (
      <Helmet>
        <title>نافذة السينما VIP | أكبر منصة عربية للأفلام والمسلسلات والأنمي</title>
        <meta
          name="description"
          content="شاهد أحدث الأفلام والمسلسلات والأنمي المترجمة والمدبلجة مجاناً وبأعلى جودة 4K و Full HD عبر أكثر من 36 سيرفر سريع وبدون إعلانات."
        />
        <meta property="og:title" content="نافذة السينما VIP | أكبر منصة عربية للأفلام والمسلسلات والأنمي" />
        <meta
          property="og:description"
          content="شاهد أحدث الأفلام والمسلسلات والأنمي المترجمة والمدبلجة مجاناً وبأعلى جودة 4K و Full HD عبر أكثر من 36 سيرفر سريع وبدون إعلانات."
        />
        <meta property="og:image" content="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="نافذة السينما VIP" />
        <meta property="og:locale" content="ar_SA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="نافذة السينما VIP | أكبر منصة عربية للأفلام والمسلسلات والأنمي" />
        <meta
          name="twitter:description"
          content="شاهد أحدث الأفلام والمسلسلات والأنمي المترجمة والمدبلجة مجاناً وبأعلى جودة 4K و Full HD عبر أكثر من 36 سيرفر سريع وبدون إعلانات."
        />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200" />
      </Helmet>
    );
  }

  const cleanTitle = media.title || media.originalTitle || 'نافذة السينما';
  const isMovie = media.type === 'movie';
  const typeLabel = media.type === 'anime' ? 'أنمي' : media.type === 'cartoon' ? 'كرتون' : 'مسلسل';
  const year = media.year ? ` (${media.year})` : (media.releaseDate ? ` (${media.releaseDate.substring(0, 4)})` : '');

  let title = '';
  let description = '';

  if (isMovie) {
    title = `مشاهدة فيلم ${cleanTitle}${year} مترجم HD اون لاين | نافذة السينما VIP`;
    description = media.overview || `مشاهدة فيلم ${cleanTitle}${year} كامل مترجم بأعلى جودة Full HD و 4K بدون إعلانات عبر نافذة السينما.`;
  } else if (season !== undefined && episode !== undefined && Number(season) > 0 && Number(episode) > 0) {
    title = `شاهد ${cleanTitle} - الموسم ${season} الحلقة ${episode} بأعلى جودة على نافذة السينما`;
    description = media.overview || `مشاهدة وتحميل ${typeLabel} ${cleanTitle} الموسم ${season} الحلقة ${episode} مترجمة بجودة عالية 1080p و 4K عبر سيرفرات سريعة ومباشرة.`;
  } else {
    title = `مشاهدة ${typeLabel} ${cleanTitle}${year} كامل ومترجم HD | نافذة السينما VIP`;
    description = media.overview || `مشاهدة وتحميل جميع مواسم وحلقات ${typeLabel} ${cleanTitle} كاملة ومترجمة بأعلى جودة على شباك السينما.`;
  }

  const canonicalUrl = getCanonicalUrl(media, season, episode);
  const imageUrl = media.posterPath || media.backdropPath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';
  const ogType = isMovie ? 'video.movie' : (season && episode ? 'video.episode' : 'video.tv_show');

  return (
    <Helmet>
      {/* Primary HTML Title */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph for Facebook, WhatsApp, Telegram */}
      <meta property="og:site_name" content="نافذة السينما VIP" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:alt" content={`${cleanTitle} - بوستر`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="ar_SA" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};
