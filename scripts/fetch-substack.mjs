import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const FEED_URL = process.env.SUBSTACK_FEED_URL || 'https://sankar1535.substack.com/feed';
const MAX_ITEMS = Number(process.env.SUBSTACK_MAX_ITEMS || 3);
const OUTFILE = process.env.SUBSTACK_OUTFILE || 'public/substack.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputPath = path.resolve(repoRoot, OUTFILE);

const stripText = (input) => {
  if (!input) return '';
  return String(input).replace(/\s+/g, ' ').trim();
};

const parseItems = (xml) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: true,
    trimValues: true,
    ignoreDeclaration: true,
    ignorePiTags: true,
    cdataPropName: '__cdata',
  });

  const data = parser.parse(xml);
  const channel = data?.rss?.channel;
  const items = channel?.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];

  return items.slice(0, MAX_ITEMS).map((item) => {
    const title = stripText(item.title?.__cdata || item.title) || 'Untitled';
    const link = stripText(item.link) || stripText(item.guid) || FEED_URL;
    const date = stripText(item.pubDate) || '';

    const descriptionSource =
      item.description?.__cdata ||
      item.description ||
      item['content:encoded']?.__cdata ||
      item['content:encoded'] ||
      '';
    const snippet = stripText(descriptionSource).slice(0, 240).replace(/\s+\S*$/, '');

    const enclosureUrl = item.enclosure?.['@_url'] || '';
    const mediaUrl = item['media:content']?.['@_url'] || '';
    const imageUrl = stripText(enclosureUrl || mediaUrl);

    return {
      title,
      link,
      date,
      snippet,
      imageUrl,
    };
  });
};

const main = async () => {
  const response = await fetch(FEED_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed (${response.status})`);
  }
  const xml = await response.text();
  const items = parseItems(xml);

  const payload = {
    feed: FEED_URL,
    generatedAt: new Date().toISOString(),
    items,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${items.length} items to ${OUTFILE}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
