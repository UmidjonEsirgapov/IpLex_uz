'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { slugifyPathSegment } from '@/lib/urlSlugs';

const navCategories = [
  { label: 'Статьи', href: '/' },
  { label: 'Новости', href: `/categories/${slugifyPathSegment('Новости')}` },
  { label: 'Абитуриент', href: `/categories/${slugifyPathSegment('Абитуриент')}` },
  { label: 'Студент', href: `/categories/${slugifyPathSegment('Студент')}` },
  { label: 'Вузы', href: `/categories/${slugifyPathSegment('Вузы')}` },
  { label: 'Школа', href: `/categories/${slugifyPathSegment('Школа')}` },
  { label: 'Полезное', href: `/categories/${slugifyPathSegment('Полезное')}` },
  { label: 'Нац. сертификат', href: `/categories/${slugifyPathSegment('Национальный сертификат')}` },
  { label: 'Теги', href: '/tags' },
];

export default function Header() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="navbar">
      <div className="app-container navbar-inner">
        <div className="navbar-brand">
          <Link href="/" className="logo">
            <span>ИпЛекс</span>
          </Link>
        </div>

        <nav className="navbar-nav" aria-label="Основная навигация">
          {navCategories.map(({ label, href }) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>

        <div className="navbar-actions">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
