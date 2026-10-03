import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const assets = new URL('../assets/', import.meta.url);
const output = new URL('../public/', import.meta.url);
await mkdir(output, { recursive: true });
for (const name of await readdir(assets)) {
  if (!name.endsWith('.jpg.base64')) continue;
  const bytes = Buffer.from(await readFile(new URL(name, assets), 'utf8'), 'base64');
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error(`Invalid JPEG: ${name}`);
  await writeFile(new URL(name.replace(/\.base64$/, ''), output), bytes);
}
console.log(`Images prepared in ${fileURLToPath(output)}`);
