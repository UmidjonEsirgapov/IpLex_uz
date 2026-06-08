import { getAllPosts, getPopularTagsInCategory } from '@/lib/posts';
import { getCategoryHub } from '@/lib/categories';
import { resolveCategory, slugifyPathSegment } from '@/lib/urlSlugs';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import PostCard from '@/components/PostCard';

export async function generateStaticParams() {
  const posts = getAllPosts();
  const categories = new Set();
  posts.forEach(post => {
    if (post.categories) {
      post.categories.forEach(c => categories.add(c.toLowerCase()));
    }
  });

  return Array.from(categories).map(cat => ({
    category: cat,
  }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const decodedCategory = resolveCategory(category);
  const hub = getCategoryHub(decodedCategory);
  return {
    title: decodedCategory,
    description: hub.description.substring(0, 160),
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/categories/${slugifyPathSegment(decodedCategory)}`,
    },
    openGraph: {
      title: `${decodedCategory} — статьи об образовании`,
      description: hub.description.substring(0, 160),
    },
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const decodedCategory = resolveCategory(category);
  const allPosts = getAllPosts();
  const hub = getCategoryHub(decodedCategory);

  const filteredPosts = allPosts.filter(post =>
    post.categories && post.categories.includes(decodedCategory)
  );

  const popularTags = getPopularTagsInCategory(filteredPosts, 10);

  return (
    <div className="app-container" style={{ padding: '2rem 1.5rem 3rem' }}>
      <Breadcrumb
        items={[
          { label: 'Главная', href: '/' },
          { label: decodedCategory },
        ]}
      />

      <header className="hub-header">
        <h1 className="hub-title">
          {decodedCategory}
        </h1>
        <p className="hub-description">{hub.description}</p>
        <p className="hub-count">
          Найдено публикаций: {filteredPosts.length}
        </p>
      </header>

      {hub.related.length > 0 && (
        <section className="hub-links-section">
          <h2 className="hub-links-title">Связанные разделы</h2>
          <div className="hub-links-row">
            {hub.related.map(related => (
              <Link
                key={related}
                href={`/categories/${slugifyPathSegment(related)}`}
                className="category-chip"
              >
                {related}
              </Link>
            ))}
          </div>
        </section>
      )}

      {popularTags.length > 0 && (
        <section className="hub-links-section">
          <h2 className="hub-links-title">Популярные теги в разделе</h2>
          <div className="hub-links-row">
            {popularTags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${slugifyPathSegment(tag)}`}
                className="tag-badge"
              >
                #{tag} ({count})
              </Link>
            ))}
          </div>
          <p className="hub-tags-more">
            <Link href="/tags">Все теги портала →</Link>
          </p>
        </section>
      )}

      {filteredPosts.length > 0 ? (
        <div className="posts-grid">
          {filteredPosts.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <p>В этой категории пока нет статей.</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            На главную
          </Link>
        </div>
      )}
    </div>
  );
}
