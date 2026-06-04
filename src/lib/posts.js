import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'data/posts');

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.md'));
}

const categoryMapping = {
  'yangiliklar': 'Новости',
  'abiturent': 'Абитуриент',
  'talaba': 'Студент',
  'foydali': 'Полезное',
  'oliygohlar': 'Вузы',
  'maktab': 'Школа',
  'jahon talimi': 'Мировое образование',
  'ilm fan': 'Наука',
  'atestatsiya': 'Аттестация',
  'milliy sertifikat': 'Национальный сертификат',
  
  'Yangiliklar': 'Новости',
  'Abiturent': 'Абитуриент',
  'Talaba': 'Студент',
  'Foydali': 'Полезное',
  'Oliygohlar': 'Вузы',
  'Maktab': 'Школа',
  'Jahon talimi': 'Мировое образование',
  'ilm fan': 'Наука',
  'Atestatsiya': 'Аттестация',
  'Milliy sertifikat': 'Национальный сертификат'
};

const mapCategory = (cat) => {
  if (!cat) return '';
  const trimmed = cat.trim();
  return categoryMapping[trimmed] || trimmed;
};

export function getPostBySlug(slug, includeContent = true) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const match = fileContents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return null;
  }

  const frontMatterBlock = match[1];
  const content = includeContent ? match[2] : '';

  const metadata = {};
  frontMatterBlock.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      const valueStr = line.substring(colonIndex + 1).trim();
      try {
        metadata[key] = JSON.parse(valueStr);
      } catch (e) {
        metadata[key] = valueStr.replace(/^"(.*)"$/, '$1');
      }
    }
  });

  const rawCats = Array.isArray(metadata.categories) 
    ? metadata.categories 
    : (metadata.categories ? [metadata.categories] : []);

  return {
    slug: realSlug,
    content,
    title: metadata.title || '',
    date: metadata.date || '',
    image: metadata.image || '',
    categories: rawCats.map(mapCategory),
    tags: metadata.tags || [],
    original_title: metadata.original_title || '',
    backlink: metadata.backlink || ''
  };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs
    .map(slug => getPostBySlug(slug, false))
    .filter(Boolean)
    .sort((post1, post2) => (post2.date && post1.date ? post2.date.localeCompare(post1.date) : 0));
  return posts;
}
