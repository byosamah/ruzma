import { Helmet } from 'react-helmet-async';
import { globalSchemas } from '@/lib/seo/globalSchemas';

/**
 * GlobalSEO Component
 *
 * Adds global structured data (Organization and WebApplication schemas)
 * to all pages for improved SEO and GEO (Generative Engine Optimization).
 *
 * This component should be placed once at the app level (in App.tsx)
 * so the schemas are present on every page.
 *
 * @see /SEO_GEO_STRATEGY.md for complete documentation
 * @see /src/lib/seo/globalSchemas.ts for schema definitions
 */
function GlobalSEO() {
  return (
    <Helmet>
      {/* Global Structured Data - Organization & WebApplication */}
      <script type="application/ld+json">
        {JSON.stringify(globalSchemas, null, 0)}
      </script>
    </Helmet>
  );
}

export default GlobalSEO;
