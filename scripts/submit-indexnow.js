const fs = require('fs');
const path = require('path');

const HOST = 'iplex.uz';
const BASE_URL = `https://${HOST}`;
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/IndexNow',
  'https://www.bing.com/indexnow',
];
const BATCH_SIZE = 10000;

const keyFileName = '6a6a70ef60c4446da04d84c050b8ac38.txt';
const keyPath = path.join(__dirname, '..', 'public', keyFileName);
const KEY = process.env.INDEXNOW_KEY || fs.readFileSync(keyPath, 'utf8').trim();
const KEY_LOCATION = `${BASE_URL}/${keyFileName}`;

function extractUrlsFromSitemap(xml) {
  const urls = [];
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let match;

  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

async function fetchSitemapUrls() {
  const response = await fetch(SITEMAP_URL);

  if (!response.ok) {
    throw new Error(`Sitemap fetch failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const urls = extractUrlsFromSitemap(xml);

  if (urls.length === 0) {
    throw new Error('No URLs found in sitemap.');
  }

  return urls;
}

async function verifyKeyFile() {
  const response = await fetch(KEY_LOCATION);

  if (!response.ok) {
    throw new Error(
      `IndexNow key file is not reachable at ${KEY_LOCATION} (${response.status}). Deploy the site first.`
    );
  }

  const content = (await response.text()).trim();
  if (content !== KEY) {
    throw new Error('IndexNow key file content does not match the configured key.');
  }
}

async function submitBatch(urlList) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const results = [];

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });

    results.push({ endpoint, status: response.status, statusText: response.statusText });
  }

  return results;
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  console.log('Verifying IndexNow key file...');
  await verifyKeyFile();
  console.log(`Key file OK: ${KEY_LOCATION}`);

  console.log(`Fetching sitemap: ${SITEMAP_URL}`);
  const urls = await fetchSitemapUrls();
  console.log(`Found ${urls.length} URLs.`);

  const batches = chunk(urls, BATCH_SIZE);

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    console.log(`Submitting batch ${i + 1}/${batches.length} (${batch.length} URLs)...`);
    const results = await submitBatch(batch);

    for (const result of results) {
      const ok = result.status === 200 || result.status === 202;
      console.log(
        `${ok ? 'OK' : 'FAIL'} ${result.endpoint}: ${result.status} ${result.statusText}`
      );

      if (!ok) {
        process.exitCode = 1;
      }
    }
  }

  if (!process.exitCode) {
    console.log('All URLs submitted to IndexNow successfully.');
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
