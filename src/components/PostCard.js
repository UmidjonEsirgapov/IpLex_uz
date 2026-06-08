'use client';

import Link from 'next/link';

export default function PostCard({ post, titleSize }) {
  return (
    <article className="post-card">
      <Link
        href={`/posts/${post.slug}`}
        className="post-card-stretched-link"
        aria-label={post.title}
      />
      <div className="card-image-wrapper">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="card-image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="card-image"
            style={{ background: 'linear-gradient(135deg, #1e1b4b, #311042)', height: '100%' }}
          />
        )}
      </div>
      <div className="card-content">
        <div className="card-meta">
          {post.categories && post.categories[0] ? (
            <Link
              href={`/categories/${encodeURIComponent(post.categories[0])}`}
              className="card-category card-category-link"
            >
              {post.categories[0]}
            </Link>
          ) : (
            <span className="card-category">Общее</span>
          )}
          <span>•</span>
          <span>{post.date ? post.date.substring(0, 10) : ''}</span>
        </div>
        <h3
          className="card-title"
          style={titleSize ? { fontSize: titleSize, height: '2.8rem' } : undefined}
        >
          {post.title}
        </h3>
        {post.tags && post.tags.length > 0 && (
          <div className="card-tags">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="tag-badge"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
