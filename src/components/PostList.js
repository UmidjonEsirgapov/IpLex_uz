'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function PostList({ initialPosts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;

  // Categories list extracted from all posts
  const categories = useMemo(() => {
    const allCats = new Set();
    initialPosts.forEach(post => {
      if (post.categories) {
        post.categories.forEach(cat => allCats.add(cat));
      }
    });
    return ['Все', ...Array.from(allCats)];
  }, [initialPosts]);

  // Filtered posts based on category and search query
  const filteredPosts = useMemo(() => {
    return initialPosts.filter(post => {
      const matchesCategory = selectedCategory === 'Все' || 
        (post.categories && post.categories.includes(selectedCategory));
      
      const cleanQuery = searchQuery.toLowerCase().trim();
      const matchesSearch = !cleanQuery || 
        post.title.toLowerCase().includes(cleanQuery) ||
        post.original_title.toLowerCase().includes(cleanQuery) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(cleanQuery)));
        
      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  // Paginated posts
  const paginatedPosts = useMemo(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    return filteredPosts.slice(0, indexOfLastPost);
  }, [filteredPosts, currentPage]);

  const hasMore = paginatedPosts.length < filteredPosts.length;

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // reset to page 1
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to page 1
  };

  return (
    <div className="app-container">
      {/* Hero Section */}
      <section className="hero">
        <h1>Образовательный Портал Узбекистана</h1>
        <p>
          Актуальные новости образования, полезные материалы для абитуриентов, студентов и преподавателей вузов и школ.
        </p>
      </section>

      {/* Filters & Search */}
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
          {categories.map(category => (
            <button
              key={category}
              className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Results Info */}
      <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Найдено: {filteredPosts.length} {filteredPosts.length === 1 ? 'статья' : 'статей'}
      </div>

      {/* Grid of Posts */}
      {paginatedPosts.length > 0 ? (
        <div className="posts-grid">
          {paginatedPosts.map(post => (
            <article key={post.slug} className="post-card">
              <Link href={`/posts/${post.slug}`} style={{ display: 'block', height: '100%' }}>
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
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Статьи по вашему запросу не найдены.</p>
          <button className="btn-secondary" onClick={() => { setSearchQuery(''); setSelectedCategory('Все'); }}>Сбросить фильтры</button>
        </div>
      )}

      {/* Load More Button */}
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
