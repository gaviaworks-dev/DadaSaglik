// Teslim görüntüleri (Beyar 2 Kas H12–H22): madde başına öğe kırpımı + tam sayfa, 1440/390.
// Kullanım: node araclar/teslim-goruntu.mjs <once|sonra> [taban-url]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const ASAMA = process.argv[2] || 'once';
const TABAN = process.argv[3] || 'http://localhost:8790/DadaSaglik/';
const CIKTI = `rapor/tmp/teslim-h/${ASAMA}`; await mkdir(CIKTI, { recursive: true });
// [madde, sayfa, seçici (ilk eşleşen; boşsa tam sayfa üst kısmı)]
const IS = [
  ['H12-menu', 'saglik-colyak.html', '.sg-ust'],
  ['H12-menu-ev', 'saglik.html', '.sg-ust'],
  ['H13-bilgi-sayfa', 'saglik-colyak-bilgi.html', ''],
  ['H14-15-ana-okumalar', 'saglik.html', 'section:has(#bk), #bk'],
  ['H16-ana-modlar', 'saglik.html', '#modlar'],
  ['H17-kurumlar-ana', 'saglik.html', '.sg-kurum-kutu, [data-h="kurumlar"]'],
  ['H17-kurumlar-mod', 'saglik-colyak.html', '.sg-logo-serit, [data-h="kurumlar"]'],
  ['H18-filtre', 'saglik-colyak.html', '.lst-layout, .sg-liste'],
  ['H19-kart', 'saglik-colyak.html', '.lst-grid .r-card:not([hidden]), .r-card'],
  ['H20-detay', 'saglik-tarif.html?t=__ILK__&mod=colyak', ''],
  ['H21-yazi-detay', '__YAZI__', ''],
  ['H22-tum-yazilar', 'saglik-bilgi.html', ''],
];
const b = await chromium.launch();
let ilk = null, yazi = null;
for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, reducedMotion: 'reduce' });
  for (const [ad, s0, sec] of IS) {
    const p = await ctx.newPage();
    let s = s0;
    if (s.includes('__ILK__')) { if (!ilk) { await p.goto(TABAN + 'saglik-colyak.html', { waitUntil: 'networkidle' }); ilk = await p.$eval('.sg-tarif', (e) => e.dataset.slug); } s = s.replace('__ILK__', ilk); }
    if (s === '__YAZI__') { if (!yazi) { await p.goto(TABAN + 'saglik-colyak-bilgi.html', { waitUntil: 'networkidle' }); yazi = await p.$eval('.sg-makale, [data-sg-yazi-kart]', (e) => (e.tagName === 'A' ? e : e.querySelector('a')).getAttribute('href')).catch(() => 'saglik-bilgi.html'); } s = yazi; }
    await p.goto(TABAN + s, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    const yol = `${CIKTI}/${ad}-${w}.png`;
    try {
      if (sec) {
        const el = await p.$(sec.split(', ').map((x) => x).join(', '));
        if (el && (await el.boundingBox())) {
          // tam sayfa kırpımı: yapışkan başlık/menü öğenin üstüne binmez (sayfa başında durur)
          await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150);
          const k = await el.evaluate((e) => { const r = e.getBoundingClientRect(); return { x: Math.max(0, r.left + scrollX - 8), y: Math.max(0, r.top + scrollY - 8), width: Math.min(document.documentElement.clientWidth, r.width + 16), height: Math.min(r.height + 16, 2400) }; });
          await p.screenshot({ path: yol, fullPage: true, clip: k }); console.log('✓', yol); await p.close(); continue; }
      }
      await p.screenshot({ path: yol, fullPage: true, clip: undefined }); console.log('✓ (sayfa)', yol, s);
    } catch (e) { console.log('✗', yol, String(e).slice(0, 120)); }
    await p.close();
  }
  await ctx.close();
}
await b.close();
