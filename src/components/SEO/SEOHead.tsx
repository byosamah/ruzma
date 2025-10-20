import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * SEOHead Component - Comprehensive SEO and GEO optimization
 *
 * Implements 2025 best practices including:
 * - Dynamic meta tags per page
 * - Bilingual hreflang support (en/ar)
 * - Open Graph optimization for social sharing
 * - Twitter Card support
 * - Structured data (JSON-LD) for rich snippets
 * - GEO (Generative Engine Optimization) for AI search engines
 *
 * @see /SEO_GEO_STRATEGY.md for complete documentation
 */

interface SEOHeadProps {
  /** Page title (50-60 characters recommended for SEO) */
  title: string;

  /** Meta description (150-160 characters, 120 for mobile) */
  description: string;

  /** Keywords for SEO (comma-separated, optional) */
  keywords?: string;

  /** Canonical URL (absolute URL without language prefix) */
  canonical?: string;

  /** Open Graph content type */
  type?: 'website' | 'profile' | 'article';

  /** Social sharing image URL (1200x630px recommended) */
  image?: string;

  /** Image width in pixels (for og:image:width) */
  imageWidth?: number;

  /** Image height in pixels (for og:image:height) */
  imageHeight?: number;

  /** Author name (for article type) */
  author?: string;

  /** Article publish date (ISO 8601 format) */
  publishedTime?: string;

  /** Article modified date (ISO 8601 format) */
  modifiedTime?: string;

  /** Structured data object(s) for JSON-LD schema */
  structuredData?: object | object[];

  /** Prevent search engine indexing (default: false) */
  noIndex?: boolean;

  /** Twitter handle for site (without @) */
  twitterSite?: string;

  /** Twitter handle for content creator (without @) */
  twitterCreator?: string;
}

function SEOHead({
  title,
  description,
  keywords,
  canonical,
  type = 'website',
  image,
  imageWidth = 1200,
  imageHeight = 630,
  author,
  publishedTime,
  modifiedTime,
  structuredData,
  noIndex = false,
  twitterSite = 'ruzma_app',
  twitterCreator
}: SEOHeadProps) {
  const { language } = useLanguage();
  const siteName = 'Ruzma';
  const baseUrl = 'https://app.ruzma.co';

  // Default social preview image
  const defaultImage = `${baseUrl}/assets/social-preview.svg`;
  const fullImageUrl = image || defaultImage;

  // Ensure image URL is absolute
  const absoluteImageUrl = fullImageUrl.startsWith('http')
    ? fullImageUrl
    : `${baseUrl}${fullImageUrl}`;

  // Locale mapping for Open Graph
  const localeMap: Record<string, string> = {
    en: 'en_US',
    ar: 'ar_SA'
  };
  const locale = localeMap[language] || 'en_US';
  const alternateLocale = language === 'en' ? 'ar_SA' : 'en_US';

  // Build alternate language URL for hreflang
  const alternateLanguage = language === 'en' ? 'ar' : 'en';

  // Canonical URL handling
  const canonicalUrl = canonical || `${baseUrl}/${language}${window.location.pathname}`;
  const alternateUrl = canonical?.replace(`/${language}/`, `/${alternateLanguage}/`)
    || `${baseUrl}/${alternateLanguage}${window.location.pathname}`;

  // Robots directive
  const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={language} />
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}

      {/* Robots & Crawling */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="bingbot" content={robotsContent} />

      {/* Canonical URL - prevents duplicate content issues */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang Tags - Critical for bilingual SEO */}
      <link rel="alternate" hrefLang="en" href={canonicalUrl.replace(`/${language}/`, '/en/')} />
      <link rel="alternate" hrefLang="ar" href={canonicalUrl.replace(`/${language}/`, '/ar/')} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl.replace(`/${language}/`, '/en/')} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:width" content={imageWidth.toString()} />
      <meta property="og:image:height" content={imageHeight.toString()} />
      <meta property="og:image:alt" content={`${siteName} - ${title}`} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content={alternateLocale} />

      {/* Article-specific Open Graph tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:image:alt" content={`${siteName} - ${title}`} />
      {twitterSite && <meta name="twitter:site" content={`@${twitterSite}`} />}
      {twitterCreator && <meta name="twitter:creator" content={`@${twitterCreator}`} />}

      {/* Additional SEO tags */}
      <meta name="theme-color" content="#ffffff" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured Data (JSON-LD) - Critical for rich snippets and GEO */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(
            Array.isArray(structuredData) ? structuredData : [structuredData],
            null,
            0
          )}
        </script>
      )}
    </Helmet>
  );
}

export default SEOHead;
