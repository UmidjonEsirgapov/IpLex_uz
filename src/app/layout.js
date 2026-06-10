import './globals.css';
import Header from '@/components/Header';
import WwwUzCounter from '@/components/WwwUzCounter';
import Link from 'next/link';
import { slugifyPathSegment } from '@/lib/urlSlugs';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://iplex.uz'),
  title: {
    default: 'ИпЛекс — Образовательный Портал Узбекистана',
    template: '%s | ИпЛекс',
  },
  description: 'Актуальные новости образования, вузов, школ, полезные материалы для абитуриентов, студентов и учителей в Узбекистане.',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    types: {
      'text/plain': [{ url: '/llms.txt', title: 'LLM Site Information' }],
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'ИпЛекс',
    title: 'ИпЛекс — Образовательный Портал Узбекистана',
    description: 'Актуальные новости образования, вузов, школ, полезные материалы для абитуриентов, студентов и учителей в Узбекистане.',
    url: 'https://iplex.uz',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" data-theme="light" className={`${outfit.variable} ${plusJakartaSans.variable}`}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div style={{ flex: '1 0 auto' }}>
          {children}
        </div>
        <footer className="site-footer">
          <div className="app-container footer-inner">
            <div className="footer-brand">
              <span className="footer-logo">ИпЛекс</span>
              <p>Информационный портал о современном образовании, вузах, школах и академической жизни в Узбекистане.</p>
            </div>
            <div className="footer-links-section">
              <h4 className="footer-title">Разделы и Категории</h4>
              <div className="footer-grid">
                <Link href="/">Все статьи</Link>
                <Link href={`/categories/${slugifyPathSegment('Новости')}`}>Новости</Link>
                <Link href={`/categories/${slugifyPathSegment('Абитуриент')}`}>Абитуриент</Link>
                <Link href={`/categories/${slugifyPathSegment('Студент')}`}>Студент</Link>
                <Link href={`/categories/${slugifyPathSegment('Полезное')}`}>Полезное</Link>
                <Link href={`/categories/${slugifyPathSegment('Вузы')}`}>Вузы</Link>
                <Link href={`/categories/${slugifyPathSegment('Школа')}`}>Школа</Link>
                <Link href={`/categories/${slugifyPathSegment('Мировое образование')}`}>Мировое образование</Link>
                <Link href={`/categories/${slugifyPathSegment('Наука')}`}>Наука</Link>
                <Link href={`/categories/${slugifyPathSegment('Аттестация')}`}>Аттестация</Link>
                <Link href={`/categories/${slugifyPathSegment('Национальный сертификат')}`}>Нац. сертификат</Link>
                <Link href="/tags">Все теги</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="app-container">
              <p>&copy; {new Date().getFullYear()} ИпЛекс. Все права защищены. Экспертные материалы об образовании.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
                <a href="/llms.txt" type="text/plain">llms.txt</a>
                {' · '}
                <a href="/llms-full.txt" type="text/plain">llms-full.txt</a>
              </p>
            </div>
          </div>
        </footer>
        {/* START WWW.UZ TOP-RATING */}
        <WwwUzCounter />
        {/* FINISH WWW.UZ TOP-RATING */}
      </body>
    </html>
  );
}
