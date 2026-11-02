// Titreme ölçümü: mod sekmesine GERÇEK tıklama → yeni sayfa yüklenirken her ~16 ms'de header/sekme çubuğu konumları + kare.
// Kullanım: node araclar/titreme-olc.mjs [taban] [çıktı-klasörü]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const TABAN = process.argv[2] || 'http://localhost:8790/DadaSaglik/';
const O = process.argv[3] || 'rapor/tmp/titreme'; await mkdir(O, { recursive: true });
const b = await chromium.launch();
const ADIM = [['saglik-colyak.html', 'Kan Şekeri'], ['saglik-diyabet.html', 'Alerjen'], ['saglik-alerji.html', 'Sütsüz']];
const SEC = { brand: 'header.header .brand', header: 'header.header', ust: '.sg-ust', sekmeler: '.sg-ust__menu', aktif: '.sg-ust__menu > a[aria-current="page"]', ev: '.sg-ust__ev' };
for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 } });
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__cls = 0; window.__ls = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__cls += e.value; window.__ls.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), src: (e.sources || []).map((s) => (s.node && s.node.className ? String(s.node.className).slice(0, 40) : s.node && s.node.nodeName) + ` ${Math.round(s.previousRect.y)}→${Math.round(s.currentRect.y)} x${Math.round(s.previousRect.x)}→${Math.round(s.currentRect.x)} w${Math.round(s.previousRect.width)}→${Math.round(s.currentRect.width)}`) }); } }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {} });
  await p.goto(TABAN + ADIM[0][0], { waitUntil: 'networkidle' });
  let n = 0;
  for (const [, hedef] of ADIM) {
    const izler = [];
    const tik = p.locator('.sg-ust__menu > a', { hasText: hedef }).first();
    const t0 = Date.now();
    await tik.click({ noWaitAfter: true });
    for (let i = 0; i < 70; i++) {
      try {
        const r = await p.evaluate((SEC) => { const o = { hazir: document.readyState, f: document.fonts ? document.fonts.status : '' }; for (const [k, s] of Object.entries(SEC)) { const e = document.querySelector(s); if (e) { const r = e.getBoundingClientRect(); o[k] = `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}x${Math.round(r.height)}`; } } o.sb = innerWidth - document.documentElement.clientWidth; o.url = location.pathname.split('/').pop(); return o; }, SEC);
        r.t = Date.now() - t0; izler.push(r);
        if (i % 4 === 0 && n < 400) await p.screenshot({ path: `${O}/${w}-${String(n++).padStart(3, '0')}.png`, clip: { x: 0, y: 0, width: w, height: 190 } });
      } catch (e) { izler.push({ t: Date.now() - t0, hata: 'gezinme' }); }
      await p.waitForTimeout(12);
    }
    await p.waitForLoadState('networkidle');
    // farklı değerleri yazdır
    const ozet = {}; for (const r of izler) for (const k of [...Object.keys(SEC), 'sb']) if (r[k] != null) (ozet[k] ||= new Set()).add(String(r[k]));
    const cls = await p.evaluate(() => ({ cls: +window.__cls.toFixed(4), ls: window.__ls }));
    console.log(`\n${w} → ${hedef}: CLS ${cls.cls}`);
    for (const [k, v] of Object.entries(ozet)) console.log(`  ${k.padEnd(9)} ${[...v].join('  |  ')}`);
    for (const l of cls.ls.slice(0, 6)) console.log('   shift', JSON.stringify(l));
  }
  await ctx.close();
}
await b.close();
