import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/manage-reservation/'],
    },
    sitemap: 'https://fromme2u.app/sitemap.xml',
  };
}
