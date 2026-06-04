import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load .env
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
  console.error('ERROR: Please set a valid GEMINI_API_KEY in the .env file.');
  process.exit(1);
}

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Constants
const CSV_FILE_PATH = 'd:\\Dasturlar\\Iplex.uz\\data\\wordpress_import_full.csv';
const SITEMAP_FILE_PATH = 'd:\\Dasturlar\\Iplex.uz\\data\\sitemap_urls.json';
const OUTPUT_DIR = 'd:\\Dasturlar\\Iplex.uz\\data\\posts';
const MAX_POSTS = 1000;
const CONCURRENCY_LIMIT = 5; // Low concurrency to avoid spike limits

// Categories allowed
const ALLOWED_CATEGORIES = [
  "Yangiliklar", "Abiturent", "Talaba", "Foydali", "Oliygohlar", 
  "Maktab", "Jahon talimi", "ilm fan", "Atestatsiya", "Milliy sertifikat"
];

// Helper: Clean words for keyword matching
function cleanWord(word) {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[‘’'ʻ`"]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Helper: Match best sitemap URL
function findBestMatchUrl(title, sitemapUrls) {
  const stopWords = new Set([
    'va', 'da', 'ning', 'uchun', 'bilan', 'yangi', 'bekor', 'etildi', 'boyicha', 
    'organildi', 'haqida', 'endi', 'yoq', 'qoldi', 'kun', 'tanlashimiz', 'kerak', 
    'bilasizmi', 'nega', 'aynan', 'diqqat', 'otkazilmoqda'
  ]);

  const titleWords = title.split(/\s+/)
    .map(cleanWord)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (titleWords.length === 0) {
    return 'https://infoedu.uz/oliygoh';
  }

  let bestUrl = 'https://infoedu.uz/oliygoh';
  let maxMatches = 0;

  for (const url of sitemapUrls) {
    try {
      const u = new URL(url);
      const pathname = u.pathname.toLowerCase();
      const urlWords = pathname.split(/[-_/]+/)
        .map(cleanWord)
        .filter(w => w.length > 2 && w !== 'https' && w !== 'infoedu' && w !== 'uz');

      let matches = 0;
      titleWords.forEach(tw => {
        if (urlWords.includes(tw) || pathname.includes(tw)) {
          matches++;
        }
      });

      if (matches > 0) {
        if (u.pathname.split('/').length <= 2 && u.pathname.includes('-')) {
          matches += 0.5;
        }
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        bestUrl = url;
      }
    } catch (e) {}
  }

  return bestUrl;
}

// Helper: Slugify title
function slugify(text) {
  const uzToLat = {
    'ў': 'o', 'ғ': 'g', 'ш': 'sh', 'ч': 'ch', 'қ': 'q', 'ҳ': 'h', 'э': 'e',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z', 'и': 'i',
    'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '',
    'ю': 'yu', 'я': 'ya'
  };

  let str = text.toLowerCase();
  for (const [cyr, lat] of Object.entries(uzToLat)) {
    str = str.replace(new RegExp(cyr, 'g'), lat);
  }

  str = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[‘’'ʻ`"]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return str;
}

// System Instruction
const SYSTEM_INSTRUCTION = `
You are an expert SEO copywriter, editor, and translator. Your task is to translate Uzbek educational articles into high-quality, professional, and SEO-optimized Russian articles.

Main Rules:
1. Translate the given article from Uzbek to Russian.
2. Rewrite and expand it into a comprehensive, highly readable Russian article of approximately 500 words.
3. Structure it with clear, SEO-friendly subheadings (using Markdown ## and ###).
4. Optimize for SEO using long-tail keywords in Russian relevant to the topic. Keywords must be integrated naturally.
5. Select a maximum of 3 categories from this list: ${JSON.stringify(ALLOWED_CATEGORIES)}.
6. Create exactly 5 relevant tags. Each tag must be a single word maximum.
7. Integrate the provided sitemap URL naturally into the Russian article text. You must use a natural anchor text in Russian as the link text. Do not just paste the URL or use generic anchor text like "ссылка" or "здесь". The link must flow naturally in the paragraph.

You must always output a JSON object matching the requested schema.
`;

const responseSchema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING", description: "The optimized Russian title for the article" },
    content: { type: "STRING", description: "The full body of the Russian article in Markdown format (excluding the title, starting directly with headings and paragraphs), containing the subheadings and the naturally integrated backlink" },
    categories: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of selected categories (maximum 3, minimum 1) from the allowed list"
    },
    tags: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Exactly 5 relevant tags, each tag being a single word"
    }
  },
  required: ["title", "content", "categories", "tags"]
};

// Helper: Extract retry delay from error message
function getRetryDelay(err) {
  try {
    const msg = err.message || '';
    const jsonStart = msg.indexOf('{');
    if (jsonStart !== -1) {
      const errorObj = JSON.parse(msg.substring(jsonStart));
      const details = errorObj.error?.details || [];
      const retryInfo = details.find(d => d['@type']?.includes('RetryInfo'));
      if (retryInfo && retryInfo.retryDelay) {
        const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
        if (!isNaN(seconds)) {
          console.log(`Parsed retry delay from API error: ${seconds} seconds.`);
          return (seconds + 3) * 1000; // wait with 3 seconds buffer
        }
      }
    }
  } catch (e) {
    // Fallback to default
  }
  return 45000; // Default to 45 seconds on rate limits
}

async function main() {
  console.log('--- STARTING SUPER-ROBUST ARTICLE PROCESSOR ---');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load sitemap URLs
  console.log('Loading sitemap URLs...');
  const sitemapUrls = JSON.parse(fs.readFileSync(SITEMAP_FILE_PATH, 'utf-8'));
  console.log(`Loaded ${sitemapUrls.length} sitemap URLs.`);

  // Load and parse CSV
  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
  const allRecords = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const publishRecords = allRecords.filter(r => r.post_status === 'publish');
  console.log(`Total records: ${allRecords.length}, Published records: ${publishRecords.length}`);

  const recordsToProcess = publishRecords.slice(0, MAX_POSTS);
  console.log(`We will process the first ${recordsToProcess.length} posts.`);

  // Statistics
  let skipped = 0;
  let processed = 0;
  let failed = 0;

  let index = 0;

  async function worker() {
    while (index < recordsToProcess.length) {
      const currentIndex = index++;
      const post = recordsToProcess[currentIndex];
      const origTitle = post.post_title;
      const origContent = post.post_content;
      const origDate = post.post_date;
      const imageUrl = post.fifu_image_url || '';

      const slug = slugify(origTitle);
      const outputFilePath = path.join(OUTPUT_DIR, `${slug}.md`);

      // Resume capability
      if (fs.existsSync(outputFilePath)) {
        skipped++;
        if (skipped % 50 === 0) {
          console.log(`Progress: Skipped ${skipped} existing files.`);
        }
        continue;
      }

      // Match best backlink URL
      const backlinkUrl = findBestMatchUrl(origTitle, sitemapUrls);

      let success = false;
      let retries = 5; // More retries for safety

      while (!success && retries > 0) {
        try {
          const userPrompt = `
Original Title: "${origTitle}"
Original Uzbek Content:
"${origContent}"

Required Backlink URL: "${backlinkUrl}"

Please translate, rewrite, and SEO-optimize the article into Russian. Output the result in JSON format conforming to the schema.
`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: userPrompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
              temperature: 0.2
            }
          });

          const result = JSON.parse(response.text);

          const markdownContent = `---
title: ${JSON.stringify(result.title)}
date: "${origDate}"
image: "${imageUrl}"
categories: ${JSON.stringify(result.categories)}
tags: ${JSON.stringify(result.tags)}
original_title: ${JSON.stringify(origTitle)}
backlink: "${backlinkUrl}"
---

${result.content}
`;

          fs.writeFileSync(outputFilePath, markdownContent, 'utf-8');
          processed++;
          success = true;

          console.log(`[${currentIndex + 1}/${recordsToProcess.length}] Processed: "${result.title}" -> ${slug}.md`);
        } catch (err) {
          retries--;
          const isRateLimit = err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota');
          
          if (isRateLimit) {
            const delay = getRetryDelay(err);
            console.warn(`[Rate Limit] Sleeping for ${delay / 1000}s before retrying "${origTitle}"... (Retries left: ${retries})`);
            await new Promise(r => setTimeout(r, delay));
          } else {
            console.warn(`Error processing post at index ${currentIndex} (Title: "${origTitle}"). Retries left: ${retries}. Error:`, err.message);
            // Default retry delay for normal network errors
            await new Promise(r => setTimeout(r, 3000));
          }
          
          if (retries === 0) {
            failed++;
            console.error(`FAILED to process post: "${origTitle}". Error: ${err.message}`);
          }
        }
      }
    }
  }

  console.log(`Starting ${CONCURRENCY_LIMIT} concurrent workers...`);
  const workers = Array.from({ length: CONCURRENCY_LIMIT }, () => worker());
  await Promise.all(workers);

  console.log('--- PROCESSING FINISHED ---');
  console.log(`Summary: Total processed: ${processed}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch(err => {
  console.error('Fatal error in main processing flow:', err);
});
