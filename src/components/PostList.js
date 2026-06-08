'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { allCategories } from '@/lib/categories';

export default function PostList({ initialPosts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;

  const filteredPosts = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return initialPosts;

    return initialPosts.filter(post =>
      post.title.toLowerCase().includes(cleanQuery) ||
      post.original_title.toLowerCase().includes(cleanQuery) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(cleanQuery)))
    );
  }, [initialPosts, searchQuery]);

  const paginatedPosts = useMemo(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    return filteredPosts.slice(0, indexOfLastPost);
  }, [filteredPosts, currentPage]);

  const hasMore = paginatedPosts.length < filteredPosts.length;

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="app-container">
      <section className="hero">
        <h1>Образовательный Портал Узбекистана</h1>
        <p>
          Актуальные новости образования, полезные материалы для абитуриентов, студентов и преподавателей вузов и школ.
        </p>
      </section>

      <section className="filters-section">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Поиск статей, тегов или тем..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>

        <div className="categories-container">
          <Link href="/" className="category-chip active">
            Все
          </Link>
          {allCategories.map(category => (
            <Link
              key={category}
              href={`/categories/${encodeURIComponent(category)}`}
              className="category-chip"
            >
              {category}
            </Link>
          ))}
          <Link href="/tags" className="category-chip category-chip-tags">
            Все теги
          </Link>
        </div>
      </section>

      <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Найдено: {filteredPosts.length} {filteredPosts.length === 1 ? 'статья' : 'статей'}
      </div>

      {paginatedPosts.length > 0 ? (
        <div className="posts-grid">
          {paginatedPosts.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Статьи по вашему запросу не найдены.</p>
          <button className="btn-secondary" onClick={() => { setSearchQuery(''); setCurrentPage(1); }}>Сбросить фильтры</button>
        </div>
      )}

      {hasMore && (
        <div className="pagination-container" style={{ marginBottom: '5rem' }}>
          <button className="btn-primary" onClick={() => setCurrentPage(prev => prev + 1)}>
            Загрузить еще
          </button>
        </div>
      )}
    </div>
  );
}
