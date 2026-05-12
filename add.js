import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

const imagePath = process.argv[2];
if (!imagePath) {
	console.error('Usage: node add.js <image>');
	process.exit(1);
}

const imageBuffer = fs.readFileSync(imagePath);
const hash = crypto.createHash('sha256').update(imageBuffer).digest('base64');
const ext = path.extname(imagePath).slice(1).toLowerCase();
const originalName = path.basename(imagePath, '.' + ext);

const entriesPath = 'anime/entries.json';
const entries = fs.existsSync(entriesPath)
	? JSON.parse(fs.readFileSync(entriesPath, 'utf8'))
	: [];

if (entries.some(e => e.hash === hash)) {
	console.log('Duplicate detected, skipping.');
	rl.close();
	process.exit(0);
}

let meta = null;

if (process.env.CATEGORY || process.env.TAGS || process.env.TYPE) {
	const category = process.env.CATEGORY?.trim() || (await ask('Category: '));
	const tagsRaw = process.env.TAGS === 'null' ? '' : (process.env.TAGS || (await ask('Tags (comma separated): ')));
	const type = process.env.TYPE?.trim() || (await ask('Type (anim/still): '));
	meta = {
		category,
		tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
		type
	};
}

if (!meta) {
	const jsonlPath = path.join(os.homedir(), 'Downloads/wfp/rp_entries.jsonl');
	if (fs.existsSync(jsonlPath)) {
		const lines = fs.readFileSync(jsonlPath, 'utf8').trim().split('\n');
		for (const line of lines) {
			const entry = JSON.parse(line);
			const urlName = entry.url ? path.basename(new URL(entry.url).pathname, path.extname(entry.url)) : null;
			if (entry.hash === hash || urlName === originalName) {
				meta = entry;
				break;
			}
		}
	}
}

if (!meta) {
	console.log('No matching entry found, please enter the metadata manually:');
	const category = await ask('Category: ');
	const tagsRaw = await ask('Tags (comma separated): ');
	const type = await ask('Type (anim/still): ');
	meta = {
		category: category.trim(),
		tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
		type: type.trim()
	};
}

rl.close();

const newName = crypto.randomBytes(6).toString('base64url');

entries.push({
	category: meta.category,
	tags: meta.tags,
	type: meta.type,
	file: newName,
	formats: [ext],
	hash
});

fs.writeFileSync(entriesPath, JSON.stringify(entries, null, 4));

const assetsDir = 'anime/assets';
fs.mkdirSync(assetsDir, { recursive: true });
fs.copyFileSync(imagePath, path.join(assetsDir, `${newName}.${ext}`));

console.log(`Added ${newName}.${ext} (${meta.category}) — tags: ${meta.tags.join(', ')}`);
