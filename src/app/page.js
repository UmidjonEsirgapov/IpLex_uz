import { getAllPosts } from '@/lib/posts';
import PostList from '@/components/PostList';

export const revalidate = 3600; // revalidate every hour

export default function Home() {
  // Fetch all posts (metadata only or full, since they are in memory, it's fast)
  const posts = getAllPosts().map(post => {
    // Keep only necessary fields for list rendering to keep payload small
    return {
      slug: post.slug,
      title: post.title,
      date: post.date,
      image: post.image,
      categories: post.categories,
      tags: post.tags,
      original_title: post.original_title
    };
  });

  return (
    <main>
      <PostList initialPosts={posts} />
    </main>
  );
}
