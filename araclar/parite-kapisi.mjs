// Parite kapısı (Beyar 2 Kas): Health tarif kartı ve mod sekmesi = Gastro donörü BİREBİR (1440 ve 390).
// Kart: tarifler.html (Gastro tarif listesi, yerel donör) ilk .r-card ↔ saglik-colyak.html ilk .r-card.sg-tarif — aynı alt öğelerin
// hesaplanan stilleri (font, boy, satır, renk, dolgu, kenar, köşe, gölge). Genişliğe bağlı ölçüler (width/height) karşılaştırılmaz.
// Sekme: Gastro .disc-tabs/.dt sınıfı kullanılıyor mu + .dt/.dt.active stilleri Gastro portal CSS'indeki değerlerle aynı mı.
// Hover: Health kartında hover sonrası transform/gölge/medya ölçeği değişmez.
import { chromium } from 'playwright';
const TABAN = process.argv[2] || 'http://localhost:8790/DadaSaglik/';
const OZ = ['fontFamily', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing', 'color', 'backgroundColor', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginBottom', 'borderTopWidth', 'borderTopColor', 'borderTopLeftRadius', 'boxShadow', 'textTransform', 'display', 'gap', 'aspectRatio'];
const PARCA = ['', '.r-media-wrap', '.r-media', '.r-chip', '.r-diet', '.r-diet .rd-b', '.r-body', '.r-body h4', '.r-body h4 a', '.r-facts', '.r-facts > span', '.rf-txt', '.r-cost', '.r-foot', '.r-author', '.r-author .av', '.r-author b', '.r-stats', '.r-rate', '.r-views'];
const b = await chromium.launch();
let kirmizi = 0;
for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 1000 }, reducedMotion: 'reduce' });
  const olc = async (url, kart) => {
    const p = await ctx.newPage(); await p.goto(TABAN + url, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
    const r = await p.evaluate(([kart, PARCA, OZ]) => {
      const k = document.querySelector(kart); if (!k) return null;
      return Object.fromEntries(PARCA.map((s) => { const e = s ? k.querySelector(s) : k; if (!e) return [s, null]; const c = getComputedStyle(e); return [s, Object.fromEntries(OZ.map((o) => [o, c[o]]))]; }));
    }, [kart, PARCA, OZ]);
    return [p, r];
  };
  const [pg, g] = await olc('tarifler.html', '.lst-grid .r-card, .r-card');
  const [ps, s] = await olc('saglik-colyak.html', '.r-card.sg-tarif:not([hidden])');
  let fark = 0;
  for (const parca of PARCA) {
    if (!g[parca] && !s[parca]) continue;
    if (!g[parca] || !s[parca]) { console.log(`  ✗ ${w} ${parca || '.r-card'}: ${g[parca] ? 'Health kartında yok' : 'Gastro kartında yok (Health eki)'}`); fark++; continue; }
    for (const o of OZ) if (g[parca][o] !== s[parca][o]) { console.log(`  ✗ ${w} ${parca || '.r-card'} ${o}: Gastro ${g[parca][o]} ≠ Health ${s[parca][o]}`); fark++; }
  }
  // hover yok
  const kart = ps.locator('.r-card.sg-tarif:not([hidden])').first(); await kart.scrollIntoViewIfNeeded();
  const once = await kart.evaluate((e) => [getComputedStyle(e).transform, getComputedStyle(e).boxShadow, getComputedStyle(e.querySelector('.r-media')).transform].join(' | '));
  await kart.hover(); await ps.waitForTimeout(400);
  const sonra = await kart.evaluate((e) => [getComputedStyle(e).transform, getComputedStyle(e).boxShadow, getComputedStyle(e.querySelector('.r-media')).transform].join(' | '));
  const hoverOk = once === sonra; if (!hoverOk) fark++;
  // sekme: Gastro .disc-tabs/.dt
  const sek = await ps.evaluate(() => { const m = document.querySelector('.sg-ust__menu .disc-tabs'); const n = m && m.querySelector('.dt:not(.active):not(.sg-ust__ev)'); const a = m && m.querySelector('.dt.active'); const c = (e) => e && (({ fontSize, fontWeight, color, backgroundColor, paddingTop, paddingLeft, borderTopLeftRadius }) => ({ fontSize, fontWeight, color, backgroundColor, paddingTop, paddingLeft, borderTopLeftRadius }))(getComputedStyle(e)); return { kap: m && (({ backgroundColor, borderTopWidth, borderTopLeftRadius, paddingTop }) => ({ backgroundColor, borderTopWidth, borderTopLeftRadius, paddingTop }))(getComputedStyle(m)), normal: c(n), secili: c(a), sayi: m ? m.querySelectorAll('.dt').length : 0 }; });
  const BEK = { kap: { backgroundColor: 'rgb(255, 255, 255)', borderTopWidth: '1px', borderTopLeftRadius: '12px', paddingTop: '4px' }, normal: { fontSize: '13px', fontWeight: '700', color: 'rgb(111, 111, 111)', backgroundColor: 'rgba(0, 0, 0, 0)', paddingTop: '9px', paddingLeft: '16px', borderTopLeftRadius: '8px' }, secili: { fontSize: '13px', fontWeight: '700', color: 'rgb(255, 255, 255)', backgroundColor: 'rgb(220, 61, 23)', paddingTop: '9px', paddingLeft: '16px', borderTopLeftRadius: '8px' } };
  let sekFark = 0; for (const k of ['kap', 'normal', 'secili']) for (const [o, v] of Object.entries(BEK[k])) if (!sek[k] || sek[k][o] !== v) { console.log(`  ✗ ${w} sekme ${k} ${o}: Gastro ${v} ≠ Health ${sek[k] && sek[k][o]}`); sekFark++; }
  kirmizi += fark + sekFark;
  console.log(`${fark + sekFark ? '✗' : '✓'} ${w}: kart ${PARCA.length} parça × ${OZ.length} özellik fark ${fark - (hoverOk ? 0 : 1)} · hover ${hoverOk ? 'yok ✓' : 'VAR ✗ ' + once + ' → ' + sonra} · sekme .disc-tabs/.dt (${sek.sayi}) fark ${sekFark}`);
  await pg.screenshot({ path: `rapor/tmp/parite/gastro-kart-${w}.png`, clip: await pg.locator('.lst-grid .r-card, .r-card').first().boundingBox().then((x) => ({ x: Math.max(0, x.x - 8), y: x.y - 8, width: x.width + 16, height: x.height + 16 })) }).catch(() => {});
  await ps.screenshot({ path: `rapor/tmp/parite/health-kart-${w}.png`, clip: await kart.boundingBox().then((x) => ({ x: Math.max(0, x.x - 8), y: x.y - 8, width: x.width + 16, height: x.height + 16 })) }).catch(() => {});
  await ctx.close();
}
await b.close();
console.log(kirmizi ? `\nPARİTE KAPISI KIRMIZI (${kirmizi})` : '\nPARİTE KAPISI YEŞİL: kart Gastro ile birebir, hover yok, sekme Gastro .disc-tabs/.dt');
process.exit(kirmizi ? 1 : 0);
