import puppeteer from 'puppeteer';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

async function prerender() {
  console.log('Starting SSG Pre-rendering Pipeline...');

  // 1. Start a local static server for the built SPA
  const app = express();
  
  // Serve static assets
  app.use(express.static(distDir));
  
  // SPA fallback for all other routes
  app.use((req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });

  const server = app.listen(4000, () => {
    console.log('Local server running on http://localhost:4000');
  });

  // 2. Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 3. Parse Sitemap to get URLs
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('sitemap.xml not found in dist. Run build and generate_sitemap first.');
    process.exit(1);
  }
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  
  // Filter for only programmatic city pages and blog pages (ignore root, /about, etc for now to speed up, or do all)
  let targetUrls = urls.filter(url => url.includes('/city/') || url.includes('/blog/'));
  console.log(`Found ${targetUrls.length} dynamic pages to prerender.`);

  // 4. Scrape and Save HTML
  const page = await browser.newPage();
  
  // Speed up rendering by blocking images/css
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  let count = 0;
  for (const fullUrl of targetUrls) {
    count++;
    const urlPath = new URL(fullUrl).pathname; // e.g., /city/cheapest-petrol-in-bristol
    const localUrl = `http://localhost:4000${urlPath}`;
    
    console.log(`[${count}/${targetUrls.length}] Rendering: ${urlPath}`);
    
    try {
      await page.goto(localUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Give React/Helmet a tiny bit of extra time to inject tags if networkidle0 fired too early
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const html = await page.content();
      
      // Save the HTML file
      const outDir = path.join(distDir, urlPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(path.join(outDir, 'index.html'), html);
    } catch (e) {
      console.error(`Failed to prerender ${urlPath}:`, e.message);
    }
  }

  // 5. Cleanup
  await browser.close();
  server.close();
  console.log('SSG Pipeline Complete!');
}

prerender();
