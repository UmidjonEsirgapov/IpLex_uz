import './globals.css';
import Header from '@/components/Header';
import Link from 'next/link';
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
  title: 'ИпЛекс - Образовательный Портал Узбекистана',
  description: 'Актуальные новости образования, вузов, школ, полезные материалы для абитуриентов, студентов и учителей в Узбекистане.',
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
                <Link href={`/categories/${encodeURIComponent('Новости')}`}>Новости</Link>
                <Link href={`/categories/${encodeURIComponent('Абитуриент')}`}>Абитуриент</Link>
                <Link href={`/categories/${encodeURIComponent('Студент')}`}>Студент</Link>
                <Link href={`/categories/${encodeURIComponent('Полезное')}`}>Полезное</Link>
                <Link href={`/categories/${encodeURIComponent('Вузы')}`}>Вузы</Link>
                <Link href={`/categories/${encodeURIComponent('Школа')}`}>Школа</Link>
                <Link href={`/categories/${encodeURIComponent('Мировое образование')}`}>Мировое образование</Link>
                <Link href={`/categories/${encodeURIComponent('Наука')}`}>Наука</Link>
                <Link href={`/categories/${encodeURIComponent('Аттестация')}`}>Аттестация</Link>
                <Link href={`/categories/${encodeURIComponent('Национальный сертификат')}`}>Нац. сертификат</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="app-container">
              <p>&copy; {new Date().getFullYear()} ИпЛекс. Все права защищены. Экспертные материалы об образовании.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
