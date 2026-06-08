import { getPostBySlug, getPostSlugs, getAllPosts, getRelatedPosts, getCategoryPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { Marked } from 'marked';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import PostCard from '@/components/PostCard';
import { slugifyPathSegment } from '@/lib/urlSlugs';

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

  const cleanDescription = post.content
    ? post.content
        .replace(/[#*`_\[\]()\-]/g, '')
        .substring(0, 160)
        .trim()
    : '';

  return {
    title: post.title,
    description: cleanDescription,
    alternates: {
      canonical: `/posts/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: cleanDescription,
      type: 'article',
      publishedTime: post.date || undefined,
      ...(post.image ? { images: [{ url: post.image }] } : {}),
    },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const htmlContent = marked.parse(post.content);
  const allPosts = getAllPosts();
  const relatedPosts = getRelatedPosts(post, allPosts, 6);
  const categoryPosts = getCategoryPosts(post, allPosts, 4);
  const primaryCategory = post.categories?.[0];

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    ...(primaryCategory
      ? [{ label: primaryCategory, href: `/categories/${slugifyPathSegment(primaryCategory)}` }]
      : []),
    { label: post.title },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    image: post.image ? [post.image] : [],
    datePublished: post.date || new Date().toISOString(),
    author: [{
      '@type': 'Person',
      name: 'Нозима Идрокова',
      jobTitle: 'Эксперт по образованию',
      url: 'https://iplex.uz',
    }],
    publisher: {
      '@type': 'Organization',
      name: 'ИпЛекс',
      logo: {
        '@type': 'ImageObject',
        url: 'https://iplex.uz/logo.png',
      },
    },
    description: post.content
      ? post.content.replace(/[#*`_\[\]()\-]/g, '').substring(0, 160).trim()
      : '',
  };

  return (
    <article className="post-detail app-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb items={breadcrumbItems} />

      <div className="post-header">
        <h1 className="post-title-large">{post.title}</h1>

        <div className="post-meta-details">
          <span>Дата публикации: {post.date ? post.date.substring(0, 16) : ''}</span>
          <span>•</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            Категории:
            {post.categories.map(cat => (
              <Link
                key={cat}
                href={`/categories/${slugifyPathSegment(cat)}`}
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
              href={`/tags/${slugifyPathSegment(tag)}`}
              className="tag-badge"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      <div className="author-box">
        <div className="author-avatar">НИ</div>
        <div className="author-info">
          <span className="author-label">Автор статьи</span>
          <h4 className="author-name">Нозима Идрокова</h4>
          <p className="author-bio">Эксперт по вопросам образования в Узбекистане с 5-летним профессиональным стажем.</p>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="related-section">
          <h2 className="related-title">Читайте также</h2>
          <div className="posts-grid">
            {relatedPosts.map(rp => (
              <PostCard key={rp.slug} post={rp} titleSize="1.1rem" />
            ))}
          </div>
        </section>
      )}

      {categoryPosts.length > 0 && primaryCategory && (
        <section className="related-section">
          <h2 className="related-title">
            Ещё из категории{' '}
            <Link
              href={`/categories/${slugifyPathSegment(primaryCategory)}`}
              style={{ color: 'var(--primary)' }}
            >
              {primaryCategory}
            </Link>
          </h2>
          <div className="posts-grid">
            {categoryPosts.map(rp => (
              <PostCard key={rp.slug} post={rp} titleSize="1.1rem" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
