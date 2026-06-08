const fs = require('fs');
const path = require('path');

const postsDirectory = path.join(__dirname, '../data/posts');
const publicDirectory = path.join(__dirname, '../public');

// Category mapping helper (aligns with src/lib/posts.js)
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
  'Atestatsiya': 'Аттестация',
  'Milliy sertifikat': 'Национальный сертификат'
};

const mapCategory = (cat) => {
  if (!cat) return '';
  const trimmed = cat.trim();
  return categoryMapping[trimmed] || trimmed;
};

// Helper to extract frontmatter
function parsePost(filename) {
  const slug = filename.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, filename);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Match frontmatter
  const match = fileContents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;

  const frontMatterBlock = match[1];
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

  const categories = rawCats.map(mapCategory);

  return {
    slug,
    title: metadata.title || '',
    date: metadata.date || '',
    categories: categories,
    tags: metadata.tags || []
  };
}

function main() {
  console.log('Generating llms.txt and llms-full.txt...');

  if (!fs.existsSync(postsDirectory)) {
    console.error('Error: posts directory not found at', postsDirectory);
    process.exit(1);
  }

  // Ensure public directory exists
  if (!fs.existsSync(publicDirectory)) {
    fs.mkdirSync(publicDirectory, { recursive: true });
  }

  // Read all md files
  const files = fs.readdirSync(postsDirectory).filter(file => file.endsWith('.md'));
  const posts = files
    .map(parsePost)
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));

  console.log(`Found ${posts.length} posts.`);

  const baseUrl = 'https://iplex.uz';

  // Section details
  const categoriesList = [
    { name: 'Новости', path: '/categories/%D0%9D%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8', desc: 'Оперативные новости сферы образования Узбекистана, постановления Президента, изменения в правилах.' },
    { name: 'Абитуриент', path: '/categories/%D0%90%D0%B1%D0%B8%D1%82%D1%83%D1%80%D0%B8%D0%B5%D0%BD%D1%82', desc: 'Информация о приеме в вузы, проходных баллах, льготах, государственном гранте и подготовке к экзаменам.' },
    { name: 'Студент', path: '/categories/%D0%A1%D1%82%D1%83%D0%B4%D0%B5%D0%BD%D1%82', desc: 'Учеба в вузе, перевод обучения (perevod), стипендии, кредитно-модульная система (HEMIS).' },
    { name: 'Вузы', path: '/categories/%D0%92%D1%83%D0%B7%D1%8B', desc: 'Сведения о государственных, частных (негосударственных) и филиалах зарубежных вузов в Узбекистане.' },
    { name: 'Школа', path: '/categories/%D0%A8%D0%BA%D0%BE%D0%BB%D0%B0', desc: 'Школьное образование, зарплата учителей, надбавки из директорского фонда, правила поведения учащихся.' },
    { name: 'Полезное', path: '/categories/%D0%9F%D0%BE%D0%BB%D0%B5%D0%B7%D0%BD%D0%BE%D0%B5', desc: 'Полезные инструкции, списки книг для чтения, советы перед тестами, психологическая подготовка.' },
    { name: 'Аттестация', path: '/categories/%D0%90%D1%82%D1%82%D0%B5%D1%81%D1%82%D0%B0%D1%86%D0%B8%D1%8F', desc: 'Все этапы аттестации педагогических кадров, тесты на квалификацию и категории.' },
    { name: 'Национальный сертификат', path: '/categories/%D0%9D%D0%B0%D1%86%D0%B8%D0%BE%D0%BD%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%D1%81%D0%B5%D1%80%D1%82%D0%B8%D1%84%D0%B8%D0%BA%D0%B0%D1%82', desc: 'Сертификация по предметам и языкам (IELTS, CEFR, химия, биология, история) для учителей и абитуриентов.' },
    { name: 'Наука', path: '/categories/%D0%9D%D0%B0%D1%83%D0%BA%D0%B0', desc: 'Научная деятельность в Узбекистане, квоты на докторантуру, PhD и DSc степени.' },
    { name: 'Мировое образование', path: '/categories/%D0%9C%D0%B8%D1%80%D0%BE%D0%B2%D0%BE%D0%B5%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5', desc: 'Обучение за границей, зарубежные гранты и стипендии.' }
  ];

  // 1. Generate llms.txt
  let llmsContent = `# IpLex — Образовательный Портал Узбекистана

> Информационно-образовательный портал о современном образовании в Узбекистане. Новости образования, высшие учебные заведения (вузы), школы, полезные материалы для абитуриентов, студентов и учителей, аттестация преподавателей и национальные сертификаты.

## Информация о ресурсе

- **Домен**: [https://iplex.uz](${baseUrl})
- **Язык**: Русский (с узбекской терминологией, оригинальными названиями и именами)
- **Целевая аудитория**: Абитуриенты, студенты, преподаватели, учителя, докторанты.
- **Sitemap**: [sitemap.xml](/sitemap.xml)
- **LLM-индекс**: [llms.txt](/llms.txt) | [llms-full.txt](/llms-full.txt)

## Разделы и Категории

`;

  categoriesList.forEach(cat => {
    llmsContent += `- [${cat.name}](${baseUrl}${cat.path}): ${cat.desc}\n`;
  });

  llmsContent += `- [Все теги](${baseUrl}/tags): Полный индекс тем и ключевых слов портала с количеством статей.\n`;

  llmsContent += `
## Свежие публикации (Топ-30)

`;

  const top30 = posts.slice(0, 30);
  top30.forEach(post => {
    const dateStr = post.date ? post.date.split(' ')[0] : 'н/д';
    const catsStr = post.categories.join(', ') || 'Без категории';
    llmsContent += `- [${post.title}](${baseUrl}/posts/${post.slug}) - ${catsStr} (${dateStr})\n`;
  });

  llmsContent += `
## Полный архив публикаций

Весь архив статей образовательного портала доступен в расширенном файле:
- [Полный архив статей (/llms-full.txt)](${baseUrl}/llms-full.txt) — Содержит список всех опубликованных материалов (${posts.length} статей) с их категориями и датами публикации.
`;

  // Write llms.txt
  fs.writeFileSync(path.join(publicDirectory, 'llms.txt'), llmsContent, 'utf8');
  console.log('Successfully generated public/llms.txt');

  // 2. Generate llms-full.txt
  let llmsFullContent = `# IpLex — Полный архив публикаций

> Полный перечень всех статей образовательного портала IpLex.uz. Актуальные новости, руководства для абитуриентов и учителей в Узбекистане.

## Информация о ресурсе

- **Домен**: [https://iplex.uz](${baseUrl})
- **Всего статей**: ${posts.length}

## Список всех статей (от новых к старым)

`;

  posts.forEach(post => {
    const dateStr = post.date ? post.date.split(' ')[0] : 'н/д';
    const catsStr = post.categories.join(', ') || 'Без категории';
    llmsFullContent += `- [${post.title}](${baseUrl}/posts/${post.slug}) - ${catsStr} (${dateStr})\n`;
  });

  fs.writeFileSync(path.join(publicDirectory, 'llms-full.txt'), llmsFullContent, 'utf8');
  console.log('Successfully generated public/llms-full.txt');
}

main();
