import { getAllPosts } from '@/lib/posts';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import PostCard from '@/components/PostCard';

export async function generateStaticParams() {
  const posts = getAllPosts();
  const tags = new Set();
  posts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(t => tags.add(t));
    }
  });

  return Array.from(tags).map(tag => ({
    tag: tag,
  }));
}

export async function generateMetadata({ params }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `#${decodedTag}`,
    description: `Все статьи с тегом #${decodedTag} на образовательном портале ИпЛекс.`,
    alternates: {
      canonical: `/tags/${encodeURIComponent(decodedTag)}`,
    },
    openGraph: {
      title: `#${decodedTag} — публикации`,
      description: `Все статьи с тегом #${decodedTag} на образовательном портале ИпЛекс.`,
    },
  };
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const allPosts = getAllPosts();

  const filteredPosts = allPosts.filter(post =>
    post.tags && post.tags.includes(decodedTag)
  );

  return (
    <div className="app-container" style={{ padding: '2rem 1.5rem 3rem' }}>
      <Breadcrumb
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Теги', href: '/tags' },
          { label: `#${decodedTag}` },
        ]}
      />

      <header className="hub-header">
        <h1 className="hub-title">
          Тег: <span style={{ color: 'var(--primary)' }}>#{decodedTag}</span>
        </h1>
        <p className="hub-count">
          Найдено публикаций: {filteredPosts.length}
        </p>
      </header>

      {filteredPosts.length > 0 ? (
        <div className="posts-grid">
          {filteredPosts.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <p>С этим тегом пока нет статей.</p>
          <Link href="/tags" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Все теги
          </Link>
        </div>
      )}
    </div>
  );
}
