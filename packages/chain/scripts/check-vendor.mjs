import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../lib/openzeppelin-contracts/', import.meta.url);
const provenance = JSON.parse(readFileSync(new URL('PROVENANCE.json', root), 'utf8'));
for (const file of provenance.files) {
  const bytes = readFileSync(new URL(file.path, root));
  const hash = createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
  if (hash !== file.gitBlobSha) throw new Error(`Vendored OpenZeppelin file differs from its recorded upstream blob: ${file.path}`);
}
console.log(`${provenance.files.length} OpenZeppelin ${provenance.ref} files match their recorded upstream Git blobs.`);
