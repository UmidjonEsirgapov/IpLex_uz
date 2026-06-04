import { getAllPosts } from '@/lib/posts';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = getAllPosts();
  const categories = new Set();
  posts.forEach(post => {
    if (post.categories) {
      post.categories.forEach(c => categories.add(c));
    }
  });

  return Array.from(categories).map(cat => ({
    category: cat,
  }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  return {
    title: `Категория: ${decodedCategory} - EduPortal`,
    description: `Все публикации в категории "${decodedCategory}" на образовательном портале.`,
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const allPosts = getAllPosts();

  const filteredPosts = allPosts.filter(post => 
    post.categories && post.categories.includes(decodedCategory)
  );

  return (
    <div className="app-container" style={{ padding: '3rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Категория: <span style={{ color: 'var(--primary)' }}>{decodedCategory}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Найдено публикаций: {filteredPosts.length}
        </p>
      </header>

      {filteredPosts.length > 0 ? (
        <div className="posts-grid">
          {filteredPosts.map(post => (
            <article key={post.slug} className="post-card">
              <Link href={`/posts/${post.slug}`} style={{ display: 'block', height: '100%' }}>
                <div className="card-image-wrapper">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="card-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="card-image" style={{ background: 'linear-gradient(135deg, #1e1b4b, #311042)', height: '100%' }}></div>
                  )}
                </div>
                <div className="card-content">
                  <div className="card-meta">
                    <span className="card-category">
                      {post.categories && post.categories[0] ? post.categories[0] : 'Общее'}
                    </span>
                    <span>•</span>
                    <span>{post.date ? post.date.substring(0, 10) : ''}</span>
                  </div>
                  <h3 className="card-title">{post.title}</h3>
                  <div className="card-tags">
                    {post.tags && post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag-badge">#{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </article>
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
