// --allow-write --allow-env --allow-net --allow-run
const incomingDir = `${Deno.env.get('HOME')}/Downloads/incoming/deno`;
await Deno.mkdir(incomingDir, { recursive: true });

console.log('Watching clipboard...');

let last = '';

const command = new Deno.Command('wl-paste', { args: ['--watch', 'cat'], stdout: 'piped' });
const proc = command.spawn();
const reader = proc.stdout.pipeThrough(new TextDecoderStream()).getReader();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  const url = value.trim();
  if (!url || url === last) continue;
  if (!url.startsWith('http')) continue;

  // Only act on image URLs
  const ext = url.split('.').pop()?.split('?')[0] ?? '';
  if (!['gif', 'webp', 'mp4', 'png', 'jpg', 'jpeg'].includes(ext)) continue;

  last = url;
  console.log(`Downloading ${url}`);

  const res = await fetch(url);
  if (!res.ok) { console.error(`Failed to fetch: ${res.status}`); continue; }

  const filename = `${crypto.randomUUID()}.${ext}`;
  const data = new Uint8Array(await res.arrayBuffer());
  await Deno.writeFile(`${incomingDir}/${filename}`, data);
  console.log(`Saved ${filename}`);
}