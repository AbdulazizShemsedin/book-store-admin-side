import { MetadataRoute } from 'next';

/**
 * Strict robots exclusion policy for internal TEWBA Admin Portal.
 * Blocks all search engines, web spiders, and AI scrapers from indexing admin routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
