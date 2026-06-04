import { getPostBySlug, getPostSlugs, getAllPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { Marked } from 'marked';
import Link from 'next/link';

const marked = new Marked();

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map(slug => ({
    slug: slug.replace(/\.md$/, ''),
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  // Generate clean description from markdown content
  const cleanDescription = post.content
    ? post.content
        .replace(/[#*`_\[\]()\-]/g, '') // remove markdown symbols
        .substring(0, 160)
        .trim()
    : '';

  return {
    title: `${post.title} - EduPortal`,
    description: cleanDescription,
  };
}

// Find related posts that share categories or tags (prioritize categories)
function getRelatedPosts(currentPost, allPosts, limit = 3) {
  return allPosts
    .filter(p => p.slug !== currentPost.slug)
    .map(p => {
      let score = 0;
      // Calculate intersection score
      if (currentPost.categories && p.categories) {
        currentPost.categories.forEach(c => {
          if (p.categories.includes(c)) score += 3; // 3 points for category match
        });
      }
      if (currentPost.tags && p.tags) {
        currentPost.tags.forEach(t => {
          if (p.tags.includes(t)) score += 1; // 1 point for tag match
        });
      }
      return { post: p, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Convert markdown to HTML
  const htmlContent = marked.parse(post.content);

  // Fetch all posts to find related ones
  const allPosts = getAllPosts();
  const relatedPosts = getRelatedPosts(post, allPosts);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': post.title,
    'image': post.image ? [post.image] : [],
    'datePublished': post.date || new Date().toISOString(),
    'author': [{
      '@type': 'Person',
      'name': 'Нозима Идрокова',
      'jobTitle': 'Эксперт по образованию',
      'url': 'https://iplex.uz'
    }],
    'publisher': {
      '@type': 'Organization',
      'name': 'ИпЛекс',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://iplex.uz/logo.png'
      }
    },
    'description': post.content ? post.content.replace(/[#*`_\[\]()\-]/g, '').substring(0, 160).trim() : ''
  };

  return (
    <article className="post-detail app-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="post-header">
        <h1 className="post-title-large">{post.title}</h1>
        
        <div className="post-meta-details">
          <span>Дата публикации: {post.date ? post.date.substring(0, 16) : ''}</span>
          <span>•</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            Категории: 
            {post.categories.map(cat => (
              <Link 
                key={cat} 
                href={`/categories/${encodeURIComponent(cat)}`}
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {post.image && (
          <div className="post-banner-wrapper">
            <img 
              src={post.image} 
              alt={post.title} 
              className="post-banner"
              decoding="async"
              fetchpriority="high"
            />
          </div>
        )}
      </div>

      {/* Main Article Content */}
      <div 
        className="article-body" 
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />

      <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Теги:</h4>
        <div className="card-tags">
          {post.tags.map(tag => (
            <Link 
              key={tag} 
              href={`/tags/${encodeURIComponent(tag)}`}
              className="tag-badge"
              style={{ cursor: 'pointer' }}
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Author Box - Google E-E-A-T */}
      <div className="author-box">
        <div className="author-avatar">НИ</div>
        <div className="author-info">
          <span className="author-label">Автор статьи</span>
          <h4 className="author-name">Нозима Идрокова</h4>
          <p className="author-bio">Эксперт по вопросам образования в Узбекистане с 5-летним профессиональным стажем.</p>
        </div>
      </div>

      {/* Related Posts Section (Internal Linking) */}
      {relatedPosts.length > 0 && (
        <section className="related-section">
          <h2 className="related-title">Читайте также</h2>
          <div className="posts-grid">
            {relatedPosts.map(rp => (
              <article key={rp.slug} className="post-card">
                <Link href={`/posts/${rp.slug}`} style={{ display: 'block', height: '100%' }}>
                  <div className="card-image-wrapper">
                    {rp.image ? (
                      <img 
                        src={rp.image} 
                        alt={rp.title} 
                        className="card-image"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="card-image" style={{ background: 'linear-gradient(135deg, #1e1b4b, #311042)', height: '100%' }}></div>
                    )}
                  </div>
                  <div className="card-content">
                    <div className="card-meta">
                      <span className="card-category">
                        {rp.categories && rp.categories[0] ? rp.categories[0] : 'Общее'}
                      </span>
                      <span>•</span>
                      <span>{rp.date ? rp.date.substring(0, 10) : ''}</span>
                    </div>
                    <h3 className="card-title" style={{ fontSize: '1.1rem', height: '2.8rem' }}>{rp.title}</h3>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
