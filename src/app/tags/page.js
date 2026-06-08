import { getTagsWithCounts } from '@/lib/posts';
import { slugifyPathSegment } from '@/lib/urlSlugs';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata = {
  title: 'Все теги',
  description: 'Полный список тем и тегов образовательного портала ИпЛекс.',
  alternates: {
    canonical: '/tags',
  },
  openGraph: {
    title: 'Все теги — ИпЛекс',
    description: 'Полный список тем и тегов образовательного портала ИпЛекс.',
  },
};

export default function TagsIndexPage() {
  const tags = getTagsWithCounts();

  return (
    <div className="app-container" style={{ padding: '2rem 1.5rem 4rem' }}>
      <Breadcrumb
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Теги' },
        ]}
      />

      <header className="hub-header">
        <h1 className="hub-title">Все теги</h1>
        <p className="hub-description">
          Темы и ключевые слова образовательного портала ИпЛекс. Выберите тег, чтобы найти все связанные статьи
          об образовании в Узбекистане.
        </p>
        <p className="hub-count">Всего тегов: {tags.length}</p>
      </header>

      <div className="tags-index-grid">
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/tags/${slugifyPathSegment(tag)}`}
            className="tag-index-card"
          >
            <span className="tag-index-name">#{tag}</span>
            <span className="tag-index-count">{count} {count === 1 ? 'статья' : count < 5 ? 'статьи' : 'статей'}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
