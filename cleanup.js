import fs from 'fs';
import path from 'path';

const entriesPath = 'anime/entries.json';
const assetsDir = 'anime/assets';

const entries = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
const before = entries.length;

const valid = entries.filter(e => {
  return e.formats.some(fmt => {
    const filePath = path.join(assetsDir, `${e.file}.${fmt}`);
    return fs.existsSync(filePath);
  });
});

const removed = before - valid.length;

if (removed === 0) {
  console.log('No invalid entries found.');
} else {
  fs.writeFileSync(entriesPath, JSON.stringify(valid, null, 4));
  console.log(`Removed ${removed} invalid entr${removed === 1 ? 'y' : 'ies'}.`);
}