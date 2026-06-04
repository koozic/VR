import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '..', 'public', 'assets', 'greek');

const MODELS = [
  {
    id: 'venus-de-milo',
    title: 'Aphrodite holding Eros',
    url: 'https://api.vntana.com/assets/products/026577c4-3d0f-4aa1-bd6a-e952b252f495/organizations/The-Metropolitan-Museum-of-Art/clients/masters/eace2a12-a38f-41ad-b959-b51a75f1fd25.glb',
    size: '4.7 MB',
  },
  {
    id: 'winged-victory',
    title: 'Perseus with Medusa (Canova)',
    url: 'https://api.vntana.com/assets/products/3fcfb334-f595-4ace-a2dd-264834acfeb7/organizations/The-Metropolitan-Museum-of-Art/clients/masters/0ebe6e27-4a55-4bd7-a8d5-2f3f3107f6bd.glb',
    size: '3.6 MB',
  },
  {
    id: 'laocoon',
    title: 'Ugolino and His Sons (Carpeaux)',
    url: 'https://api.vntana.com/assets/products/93b7d97c-9333-4927-8dd1-293c8bf56eca/organizations/The-Metropolitan-Museum-of-Art/clients/masters/8acc969e-ec05-4f33-a906-442ba08a3533.glb',
    size: '6.2 MB',
  },
  {
    id: 'discobolus',
    title: 'Mourning Victory (D.C. French)',
    url: 'https://api.vntana.com/assets/products/35f5d75d-7032-4a77-aceb-ac479c78133d/organizations/The-Metropolitan-Museum-of-Art/clients/masters/cc930f9f-5073-4864-8105-8d6b8a4a7c65.glb',
    size: '4.6 MB',
  },
  {
    id: 'thinker',
    title: 'Limestone Priest',
    url: 'https://api.vntana.com/assets/products/4dc3978f-e140-4e52-bb42-34f664cf6ce7/organizations/The-Metropolitan-Museum-of-Art/clients/masters/6b4229aa-f192-4e8b-9263-2d8586b9ddac.glb',
    size: '6.9 MB',
  },
];

async function main() {
  console.log('=== Greek Sculpture Model Downloader ===\n');
  if (!existsSync(ASSETS_DIR)) mkdirSync(ASSETS_DIR, { recursive: true });
  let ok = 0, fail = 0;
  for (const model of MODELS) {
    const dest = join(ASSETS_DIR, `${model.id}.glb`);
    if (existsSync(dest)) { ok++; continue; }
    try {
      console.log(`  Downloading ${model.id}.glb (${model.size})...`);
      const resp = await fetch(model.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(60000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buf = await resp.arrayBuffer();
      writeFileSync(dest, Buffer.from(buf));
      console.log(`  [OK] ${(buf.byteLength / 1024 / 1024).toFixed(1)} MB`);
      ok++;
    } catch (err) { console.error(`  [FAIL] ${err.message}`); fail++; }
  }
  console.log(`\nDone: ${ok} ok, ${fail} fail`);
}
main().catch(console.error);
