const fs = require('fs');
const path = require('path');

// Paths
const sourceXmlPath = 'C:\\Users\\Umidjon\\.gemini\\antigravity\\brain\\5bc3d0cc-aa01-4cfb-bb2a-59cb19f38bfe\\.system_generated\\steps\\12\\content.md';
const outputDir = 'd:\\Dasturlar\\Iplex.uz\\data';
const outputPath = path.join(outputDir, 'sitemap_urls.json');

try {
  console.log(`Reading sitemap from: ${sourceXmlPath}`);
  const content = fs.readFileSync(sourceXmlPath, 'utf-8');

  // Regex to match <loc>...</loc> content
  const locRegex = /<loc>(https?:\/\/[^\s<]+)<\/loc>/g;
  const urls = [];
  let match;

  while ((match = locRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  console.log(`Found ${urls.length} URLs in sitemap.`);

  // Save to data/sitemap_urls.json
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(urls, null, 2), 'utf-8');
  console.log(`Successfully saved URLs to ${outputPath}`);
} catch (error) {
  console.error('Error extracting sitemap URLs:', error);
}
