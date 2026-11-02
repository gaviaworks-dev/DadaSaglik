// Titreme kaydı: mod sekmeleri arasında gerçek tıklamalarla geçişin videosu (1440 + 390). Kullanım: node araclar/titreme-kayit.mjs <taban> <ad>
import { chromium } from 'playwright';
import { mkdir, rename, readdir } from 'node:fs/promises';
const TABAN = process.argv[2], AD = process.argv[3], O = 'rapor/tmp/titreme-kayit';
await mkdir(O, { recursive: true });
const b = await chromium.launch();
for (const w of [1440, 390]) {
  const h = 260; const dir = `${O}/_${AD}-${w}`;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, recordVideo: { dir, size: { width: w, height: h } } });
  const p = await ctx.newPage(); await p.goto(TABAN + 'saglik-colyak.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
  for (const t of ['Kan Şekeri', 'Alerjen', 'Sütsüz', 'Düşük FODMAP', 'Kalp Dostu', 'Glutensiz']) { await p.locator('.sg-ust__menu > a', { hasText: t }).first().click(); await p.waitForLoadState('networkidle'); await p.waitForTimeout(700); }
  await ctx.close();
  const f = (await readdir(dir)).find((x) => x.endsWith('.webm')); await rename(`${dir}/${f}`, `${O}/${AD}-${w}.webm`);
}
await b.close(); console.log('ok');
