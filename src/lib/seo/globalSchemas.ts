/**
 * Global Structured Data Schemas
 *
 * These schemas are added globally to improve SEO and GEO (Generative Engine Optimization).
 * They help search engines and AI platforms understand our application better.
 *
 * @see https://schema.org for schema documentation
 * @see /SEO_GEO_STRATEGY.md for implementation strategy
 */

/**
 * Organization Schema - Tells search engines about Ruzma as a company/product
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ruzma',
  url: 'https://app.ruzma.co',
  logo: 'https://app.ruzma.co/assets/logo-full-en.svg',
  description: 'Complete project, client, and invoice management system for freelancers',
  sameAs: [
    'https://twitter.com/ruzmaco',
    'https://www.linkedin.com/company/ruzma',
    'https://www.instagram.com/ruzmaco',
    'https://www.youtube.com/@ruzmaco'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'support@ruzma.co',
    availableLanguage: ['English', 'Arabic']
  }
};

/**
 * WebApplication Schema - Describes Ruzma as a web application
 * Critical for appearing in software/tool searches
 */
export const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Ruzma',
  url: 'https://app.ruzma.co',
  description: 'Manage projects, clients, invoices, and payments in one place. Built specifically for freelancers who want to stay organized and professional.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  browserRequirements: 'Requires JavaScript. Modern browser recommended.',
  softwareVersion: '0.0.0',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: '349',
    priceCurrency: 'USD',
    offerCount: '3',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        description: '1 project, 5 clients, 5 invoices'
      },
      {
        '@type': 'Offer',
        name: 'Plus Plan',
        price: '19',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '19',
          priceCurrency: 'USD',
          unitText: 'MONTH'
        },
        description: 'Unlimited projects, AI assistant, all premium features'
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan (Lifetime)',
        price: '349',
        priceCurrency: 'USD',
        description: 'One-time payment, lifetime access to all features'
      }
    ]
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
    bestRating: '5',
    worstRating: '1'
  },
  featureList: [
    'Project Management',
    'Client Management',
    'Invoice Generation',
    'Milestone Tracking',
    'Payment Tracking',
    'Multi-currency Support',
    'PDF Generation',
    'Custom Branding',
    'Client Portal',
    'Bilingual Support (English/Arabic)'
  ]
};

/**
 * SoftwareApplication Schema - Alternative to WebApplication
 * Provides additional context about the application
 */
export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Ruzma',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150'
  }
};

/**
 * BreadcrumbList Schema Generator
 * Creates breadcrumb navigation for better SEO
 *
 * @param breadcrumbs Array of {name, url} objects
 * @returns Schema.org BreadcrumbList object
 */
export const createBreadcrumbSchema = (
  breadcrumbs: Array<{ name: string; url: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

/**
 * FAQ Schema Generator
 * Creates FAQ structured data for GEO optimization
 *
 * @param faqs Array of {question, answer} objects
 * @returns Schema.org FAQPage object
 */
export const createFAQSchema = (
  faqs: Array<{ question: string; answer: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

/**
 * Product Schema Generator for Pricing Plans
 *
 * @param planName Name of the plan (Free, Plus, Pro)
 * @param price Price in USD
 * @param description Plan description
 * @param features Array of feature strings
 * @returns Schema.org Product object
 */
export const createProductSchema = (
  planName: string,
  price: string,
  description: string,
  features: string[]
) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: `Ruzma ${planName} Plan`,
  description,
  brand: {
    '@type': 'Brand',
    name: 'Ruzma'
  },
  offers: {
    '@type': 'Offer',
    price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://app.ruzma.co/en/plans'
  },
  additionalProperty: features.map((feature) => ({
    '@type': 'PropertyValue',
    name: 'Feature',
    value: feature
  }))
});

/**
 * All global schemas combined
 * Use this in App.tsx to add all schemas at once
 */
export const globalSchemas = [
  organizationSchema,
  webApplicationSchema
];
