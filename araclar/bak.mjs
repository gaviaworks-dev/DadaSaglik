// Görsel bakış: sayfaların ekran görüntüsü (tam sayfa ya da ilk ekran) + JS hataları. rapor/tmp/bak/
// Kullanım: node araclar/bak.mjs <sayfa…> [GENISLIK=1440,390] [TAM=1] [TABAN=…]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const TABAN = process.env.TABAN || 'http://localhost:8790/DadaSaglik/';
const G = (process.env.GENISLIK || '1440,390').split(',').map(Number);
const DIZIN = process.env.DIZIN || 'rapor/tmp/bak';
await mkdir(DIZIN, { recursive: true });
const t = await chromium.launch();
for (const w of G) {
  const c = await t.newContext({ viewport: { width: w, height: w < 500 ? 844 : 900 }, reducedMotion: 'reduce' });
  for (const s of process.argv.slice(2)) {
    const p = await c.newPage(); const h = [];
    p.on('pageerror', (e) => h.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') h.push(m.text()); });
    await p.goto(TABAN + s, { waitUntil: 'networkidle' });
    if (process.env.TAM) { const b = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < b; y += 800) { await p.mouse.wheel(0, 800); await p.waitForTimeout(40); } await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300); }
    const ad = s.replace(/[?&=]/g, '_').replace('.html', '');
    await p.screenshot({ path: `${DIZIN}/${ad}-${w}.png`, fullPage: !!process.env.TAM });
    console.log(w, s, h.length ? 'HATA: ' + h.slice(0, 3).join(' | ') : 'ok');
    await p.close();
  }
  await c.close();
}
await t.close();
