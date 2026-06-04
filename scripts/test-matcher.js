const fs = require('fs');
const path = require('path');

function cleanWord(word) {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[‘’'ʻ`"]/g, '') // remove Uzbek specific quotes
    .replace(/[^a-z0-9]/g, '') // remove special characters
    .trim();
}

function findBestMatchUrl(title, sitemapUrls) {
  const stopWords = new Set([
    'va', 'da', 'ning', 'uchun', 'bilan', 'yangi', 'bekor', 'etildi', 'boyicha', 
    'organildi', 'haqida', 'endi', 'yoq', 'qoldi', 'kun', 'tanlashimiz', 'kerak', 
    'bilasizmi', 'nega', 'aynan', 'diqqat', 'uchun', 'ozgardi', 'tizimi', 'boyicha'
  ]);

  // Tokenize title
  const titleWords = title.split(/\s+/)
    .map(cleanWord)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (titleWords.length === 0) {
    return 'https://infoedu.uz/oliygoh'; // fallback
  }

  let bestUrl = 'https://infoedu.uz/oliygoh'; // default fallback
  let maxMatches = 0;

  // We score each URL
  for (const url of sitemapUrls) {
    try {
      const u = new URL(url);
      const pathname = u.pathname.toLowerCase();
      
      // Tokenize URL path
      const urlWords = pathname.split(/[-_/]+/)
        .map(cleanWord)
        .filter(w => w.length > 2 && w !== 'https' && w !== 'infoedu' && w !== 'uz');

      // Count matches
      let matches = 0;
      titleWords.forEach(tw => {
        if (urlWords.includes(tw) || pathname.includes(tw)) {
          matches++;
        }
      });

      // Score bonus if it's a specific post / news URL rather than directory list
      if (matches > 0) {
        // e.g. path is deep (like /attestatsiya-shikoyat-...)
        if (u.pathname.split('/').length <= 2 && u.pathname.includes('-')) {
          matches += 0.5; // bonus for specific articles
        }
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        bestUrl = url;
      }
    } catch (e) {}
  }

  return { bestUrl, maxMatches, titleWords };
}

// Test with our sample titles
try {
  const sitemapUrls = JSON.parse(fs.readFileSync('d:\\Dasturlar\\Iplex.uz\\data\\sitemap_urls.json', 'utf-8'));
  const testTitles = [
    "Endi super-kontrakt yo‘q: qishloq xo‘jaligi yo‘nalishlariga qabul tizimi o‘zgardi",
    "O‘quvchilarga ta’lim muassasasining binosi va uning hududida qo‘yiladigan talablarni bilasizmi?",
    "Qishki perevod natijalari e’lon qilinishi uchun 4 kun qoldi",
    "Diqqat: Harbiy qismlarda muddatli xizmatchilarning bilim darajasi sinovdan o‘tkazilmoqda",
    "Nega aynan Mentor ni tanlashimiz kerak?",
    "Nodavlat bog'chalar uchun yangi imtiyozlar: ijara, soliq yengilligi va subsidiyalar beriladi",
    "Surxondaryoda qog‘oz kundalik tekshiruvi bo‘yicha vazirlik rasmiy izoh berdi"
  ];

  testTitles.forEach(title => {
    const res = findBestMatchUrl(title, sitemapUrls);
    console.log(`\nTitle: "${title}"`);
    console.log(`Keywords: [${res.titleWords.join(', ')}]`);
    console.log(`Best Match: ${res.bestUrl} (Score: ${res.maxMatches})`);
  });
} catch (e) {
  console.error(e);
}
