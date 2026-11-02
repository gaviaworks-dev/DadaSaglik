// Hızlı duman: her sayfa 200 · JS hatası 0 · başarısız istek 0 · 1440/390 ekran görüntüsü (göz kontrolü).
// Kullanım: node araclar/duman.mjs [taban-url] [çıktı-klasörü]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const TABAN = process.argv[2] || 'http://localhost:8790/DadaSaglik/';
const CIKTI = process.argv[3] || 'rapor/tmp/duman';
await mkdir(CIKTI, { recursive: true });
const SAYFALAR = ['index.html', 'tarifler.html', 'saglik.html', ...['colyak', 'diyabet', 'alerji', 'laktoz', 'ibs', 'kalp'].flatMap((k) => [`saglik-${k}.html`, `saglik-${k}-bilgi.html`]), 'saglik-dolap.html', 'saglik-bilgi.html', 'saglik-tarif.html?t=__ILK__&mod=colyak'];
const b = await chromium.launch();
let kirmizi = 0, ilk = null;
for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, reducedMotion: 'reduce' });
  for (let s of SAYFALAR) {
    const p = await ctx.newPage(); const js = []; const ag = [];
    p.on('pageerror', (e) => js.push(String(e).slice(0, 160)));
    p.on('console', (m) => { if (m.type() === 'error') js.push(m.text().slice(0, 160)); });
    p.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(TABAN)) ag.push(`${r.status()} ${r.url().replace(TABAN, '')}`); });
    p.on('requestfailed', (r) => { if (r.url().startsWith(TABAN)) ag.push(`FAIL ${r.url().replace(TABAN, '')}`); });
    if (s.includes('__ILK__')) { if (!ilk) { const q = await ctx.newPage(); await q.goto(TABAN + 'saglik-colyak.html', { waitUntil: 'networkidle' }); ilk = await q.$eval('.sg-tarif', (e) => e.dataset.slug); await q.close(); } s = s.replace('__ILK__', ilk); }
    const r = await p.goto(TABAN + s, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    const kod = r ? r.status() : 0;
    const ad = s.replace(/\?.*/, '').replace('.html', '');
    await p.screenshot({ path: `${CIKTI}/${ad}-${w}.png` });
    const kotu = (kod !== 200) + js.length + ag.length; kirmizi += kotu;
    console.log(`${kotu ? '✗' : '✓'} ${w} ${String(kod)} ${s.padEnd(56)} JS ${js.length} · istek hatası ${ag.length}${js.length ? '  ' + js.slice(0, 2).join(' | ') : ''}${ag.length ? '  ' + ag.slice(0, 3).join(' | ') : ''}`);
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log(kirmizi ? `\nDUMAN KIRMIZI (${kirmizi})` : '\nDUMAN YEŞİL: tüm sayfalar 200, JS 0, istek hatası 0');
process.exit(kirmizi ? 1 : 0);
