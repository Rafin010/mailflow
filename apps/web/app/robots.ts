import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://mailflow.example.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/inbox', '/admin', '/settings'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
