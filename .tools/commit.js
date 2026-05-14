import fs from 'fs';
import { execSync } from 'child_process';

throw new Error('THIS SCRIPT MAKES A BUNCH OF COMMITS AND AS SUCH A BUNCH OF BUILDS. DISABLED UNTIL I CAN FIGURE OUT A BETTER WAY TO DO THIS.');

const GITHUB_TOKEN = process.env.GIFFY_GH_PAT;
const REPO = 'NotPiny/Giffy';
const assetsDir = 'anime/assets';
const commitMessage = process.argv.slice(2).join(' ') || 'update entries';

if (!GITHUB_TOKEN) {
  console.error('GIFFY_GH_PAT not set');
  process.exit(1);
}

const apiRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${assetsDir}`, {
  headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
});

const remote = apiRes.ok ? (await apiRes.json()).map(f => f.name) : [];
const local = fs.readdirSync(assetsDir);
const toUpload = local.filter(f => !remote.includes(f));

if (toUpload.length === 0) {
  console.log('No new assets to upload.');
} else {
  console.log(`Uploading ${toUpload.length} file(s)...`);
  for (const file of toUpload) {
    const content = fs.readFileSync(`${assetsDir}/${file}`).toString('base64');
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${assetsDir}/${file}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: `add ${file}`, content })
    });

    if (!res.ok) {
      console.error(`Failed to upload ${file}:`, await res.text());
      process.exit(1);
    }

    console.log(`Uploaded ${file}`);
  }
}

execSync('git add anime/entries.json', { stdio: 'inherit' });
execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
execSync('git push', { stdio: 'inherit' });