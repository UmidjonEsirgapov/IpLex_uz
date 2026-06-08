import { getAllPosts, getUniqueTagSlugs } from '@/lib/posts';
import { slugifyPathSegment } from '@/lib/urlSlugs';

export const dynamic = 'force-static';

export default async function sitemap() {
  const baseUrl = 'https://iplex.uz';
  const posts = getAllPosts();

  const postUrls = posts.map(post => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const categories = new Set();
  posts.forEach(post => {
    if (post.categories) post.categories.forEach(c => categories.add(c.toLowerCase()));
  });

  const categoryUrls = Array.from(categories).map(cat => ({
    url: `${baseUrl}/categories/${slugifyPathSegment(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const tagUrls = getUniqueTagSlugs().map(tag => ({
    url: `${baseUrl}/tags/${slugifyPathSegment(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.4,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    ...postUrls,
    ...categoryUrls,
    ...tagUrls,
  ];
}
