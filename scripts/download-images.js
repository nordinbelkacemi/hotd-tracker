import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHARACTERS_JSON_PATH = path.join(__dirname, '../src/data/characters.json');
const OUTPUT_DIR = path.join(__dirname, '../public/characters');

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const characters = JSON.parse(fs.readFileSync(CHARACTERS_JSON_PATH, 'utf-8'));

  console.log(`Starting image downloads for ${characters.length} characters...`);

  for (const char of characters) {
    if (!char.wikiUrl) {
      console.warn(`[WARN] No wikiUrl found for ${char.name}`);
      continue;
    }

    try {
      const pageTitle = char.wikiUrl.split('/wiki/')[1];
      if (!pageTitle) {
        console.warn(`[WARN] Could not parse page title for ${char.name} from URL: ${char.wikiUrl}`);
        continue;
      }

      const apiUrl = `https://gameofthrones.fandom.com/api.php?action=query&prop=pageimages&titles=${pageTitle}&format=json&pithumbsize=600&redirects=1`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const pages = data.query?.pages;
      if (!pages) {
        throw new Error(`Invalid API response structure`);
      }

      const pageId = Object.keys(pages)[0];
      if (pageId === '-1') {
        throw new Error(`Page not found on wiki (${pageTitle})`);
      }

      const thumbnail = pages[pageId].thumbnail;
      if (!thumbnail || !thumbnail.source) {
        throw new Error(`No thumbnail found for page`);
      }

      const destPath = path.join(OUTPUT_DIR, `${char.id}.png`);
      console.log(`Downloading image for ${char.name} (${char.id}) from: ${thumbnail.source}`);
      await downloadImage(thumbnail.source, destPath);
      console.log(`[SUCCESS] Saved to ${char.id}.png`);

    } catch (err) {
      console.error(`[ERROR] Failed to fetch image for ${char.name}: ${err.message}`);
    }

    // Small delay to be polite to the Fandom API
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('Finished downloading images!');
}

main().catch(err => {
  console.error('Fatal error in main:', err);
});
