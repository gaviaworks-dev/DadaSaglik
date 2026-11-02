// Gölge kapısı (Beyar 2 Kas): Health kartları, logo karoları, paneller ve sekme çubuğu — hesaplanan box-shadow = none,
// hover sonrası da none ve transform = none. Sayfalar 1440 ve 390. Kullanım: node araclar/golge-kapisi.mjs [taban-url]
import { chromium } from 'playwright';
const TABAN = process.argv[2] || 'http://localhost:8790/DadaSaglik/';
const SAYFALAR = ['saglik.html', 'saglik-colyak.html', 'saglik-colyak-bilgi.html', 'saglik-kalp.html', 'saglik-dolap.html', 'saglik-bilgi.html'];
const SEC = '.sg-mkart, .sg-konu-kart, .sg-kaydirici__ok button, .sg-kart, .sg-cta-kart, .sg-secki-kutu, .sg-bilgi-kart, .sg-kimler__kart, .sg-sss__oge, .sg-alerjen-sec, .sg-dolap, .sg-logo-serit a, .sg-kurum-kutu__izgara a, .sg-riskli__oge, .sg-dkat, .sg-mz, .sg-mod-sec__oge, .pg-saglik .r-card, .sg-ust, .sg-ust .disc-tabs, .sg-sekmeler, .sg-sekme-bolum';
const b = await chromium.launch(); let kirmizi = 0;
for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  for (const s of SAYFALAR) {
    const p = await ctx.newPage(); await p.goto(TABAN + s, { waitUntil: 'networkidle' });
    const n = await p.$$eval(SEC, (l) => l.filter((e) => e.getBoundingClientRect().width).length);
    const kotu = await p.$$eval(SEC, (l) => l.filter((e) => e.getBoundingClientRect().width).map((e) => [e.className.toString().split(' ')[0], getComputedStyle(e).boxShadow, getComputedStyle(e).transform]).filter(([, g, t]) => g !== 'none' || t !== 'none'));
    // hover: görünür ilk 8 öğe
    const hov = [];
    const loc = p.locator(SEC); const say = Math.min(await loc.count(), 40);
    for (let i = 0, h = 0; i < say && h < 8; i++) { const e = loc.nth(i); if (!(await e.isVisible())) continue; h++; await e.hover({ force: true }).catch(() => {}); await p.waitForTimeout(250); const r = await e.evaluate((x) => [x.className.toString().split(' ')[0], getComputedStyle(x).boxShadow, getComputedStyle(x).transform]); if (r[1] !== 'none' || r[2] !== 'none') hov.push(r); }
    const k = kotu.length + hov.length; kirmizi += k;
    console.log(`${k ? '✗' : '✓'} ${w} ${s.padEnd(28)} öğe ${n} · gölge/transform ${kotu.length} · hover ${hov.length}${k ? '  ' + JSON.stringify([...kotu, ...hov].slice(0, 3)) : ''}`);
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log(kirmizi ? `\nGÖLGE KAPISI KIRMIZI (${kirmizi})` : '\nGÖLGE KAPISI YEŞİL: box-shadow none, hover dahil');
process.exit(kirmizi ? 1 : 0);
