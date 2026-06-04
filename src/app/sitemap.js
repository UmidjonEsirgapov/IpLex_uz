import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-static';

export default async function sitemap() {
  const baseUrl = 'https://iplex.uz'; // Default site URL
  const posts = getAllPosts();

  // Create article URLs
  const postUrls = posts.map(post => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Extracted unique categories and tags
  const categories = new Set();
  const tags = new Set();
  posts.forEach(post => {
    if (post.categories) post.categories.forEach(c => categories.add(c));
    if (post.tags) post.tags.forEach(t => tags.add(t));
  });

  // Create category URLs
  const categoryUrls = Array.from(categories).map(cat => ({
    url: `${baseUrl}/categories/${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Create tag URLs
  const tagUrls = Array.from(tags).map(tag => ({
    url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.4,
  }));

  // Merge everything, starting with the homepage
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...postUrls,
    ...categoryUrls,
    ...tagUrls,
  ];
}
