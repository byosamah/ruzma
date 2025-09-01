
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  type?: 'website' | 'profile' | 'article';
  image?: string;
  author?: string;
  locale?: string;
  structuredData?: object;
}

function SEOHead({
  title,
  description,
  keywords,
  canonical,
  type = 'website',
  image,
  author,
  locale = 'en_US',
  structuredData
}: SEOHeadProps) {
  const siteName = 'Ruzma - Freelancers Management System';
  const defaultImage = '/assets/social-preview.svg';
  const fullImageUrl = image || defaultImage;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={`${siteName} - ${title}`} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@lovable_dev" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
