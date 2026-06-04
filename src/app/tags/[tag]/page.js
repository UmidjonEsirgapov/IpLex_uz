import { getAllPosts } from '@/lib/posts';
import Link from 'next/link';

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
    title: `Тег: #${decodedTag} - EduPortal`,
    description: `Публикации с тегом #${decodedTag} на образовательном портале.`,
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
    <div className="app-container" style={{ padding: '3rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Тег: <span style={{ color: 'var(--primary)' }}>#{decodedTag}</span>
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
                    {post.tags && post.tags.slice(0, 3).map(t => (
                      <span key={t} className="tag-badge">#{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <p>С этим тегом пока нет статей.</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            На главную
          </Link>
        </div>
      )}
    </div>
  );
}
