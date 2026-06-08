import { getAllPosts, getUniqueTagSlugs } from '@/lib/posts';
import { tagMatchesSlug, resolveTagName, slugifyPathSegment } from '@/lib/urlSlugs';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import PostCard from '@/components/PostCard';

export async function generateStaticParams() {
  return getUniqueTagSlugs().map(tag => ({ tag }));
}

export async function generateMetadata({ params }) {
  const { tag } = await params;
  const allPosts = getAllPosts();
  const displayTag = resolveTagName(tag, allPosts);
  return {
    title: `#${displayTag}`,
    description: `Все статьи с тегом #${displayTag} на образовательном портале ИпЛекс.`,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/tags/${slugifyPathSegment(displayTag)}`,
    },
    openGraph: {
      title: `#${displayTag} — публикации`,
      description: `Все статьи с тегом #${displayTag} на образовательном портале ИпЛекс.`,
    },
  };
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  const allPosts = getAllPosts();
  const displayTag = resolveTagName(tag, allPosts);

  const filteredPosts = allPosts.filter(post =>
    post.tags && post.tags.some(t => tagMatchesSlug(t, tag))
  );

  return (
    <div className="app-container" style={{ padding: '2rem 1.5rem 3rem' }}>
      <Breadcrumb
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Теги', href: '/tags' },
          { label: `#${displayTag}` },
        ]}
      />

      <header className="hub-header">
        <h1 className="hub-title">
          Тег: <span style={{ color: 'var(--primary)' }}>#{displayTag}</span>
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
