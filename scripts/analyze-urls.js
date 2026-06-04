const fs = require('fs');

try {
  const urls = JSON.parse(fs.readFileSync('d:\\Dasturlar\\Iplex.uz\\data\\sitemap_urls.json', 'utf-8'));
  console.log(`Total URLs: ${urls.length}`);

  // Let's look at unique prefixes/types of paths
  const pathTypes = {};
  urls.forEach(url => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      const key = parts[0] || 'root';
      pathTypes[key] = (pathTypes[key] || 0) + 1;
    } catch (e) {}
  });

  console.log('Path types distribution:', pathTypes);

  // Print 5 example URLs from each path type
  Object.keys(pathTypes).forEach(type => {
    console.log(`\nExamples for type "${type}":`);
    const examples = urls
      .filter(url => {
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(Boolean);
        return (parts[0] || 'root') === type;
      })
      .slice(0, 5);
    examples.forEach(e => console.log(`  ${e}`));
  });
} catch (e) {
  console.error(e);
}
