// Denge + ızgara kapısı (Kids denge-kapisi / izgara-kapisi kurallarının Sağlık uyarlaması).
//  a) Yan yana kartlar (aynı ızgaranın aynı satırı) eşit boy: fark ≤ 1px
//  b) CTA alt hizası: aynı satırdaki kartların .sg-kart__alt / .sg-partner__site alt kenarı farkı ≤ 2px
//  c) Yarım satır yok: sabit sütunlu ızgarada son satır dolu (dolgu kartı .sg-dolgu sayılır) ya da .sg-ortala ile ortalanmış.
//     Muaf: veri listeleri (<li> çocuklu ızgaralar: riskli malzeme listesi), yatay kaydırma şeritleri.
// 1440 ve 1024 (a, b, c) · 768 ve 390 (c). Kullanım: node araclar/denge-kapisi.mjs [sayfa…]  BOZ=1 → bir kartı uzatır (kırmızı vermeli)
import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';
const TABAN = process.env.TABAN || 'http://localhost:8790/DadaSaglik/';
const GENISLIK = (process.env.GENISLIK || '1440,1024,768,390').split(',').map(Number);
const SAYFALAR = process.argv.slice(2).length ? process.argv.slice(2) : [...readdirSync('.').filter((f) => /^saglik(-.+)?\.html$/.test(f) && f !== 'saglik-tarif.html').sort(), 'saglik-dolap.html?mod=kalp&m=domates,sogan,biber,patlican,tavuk,limon,patates', 'saglik-tarif.html?t=babagannus-tahinli-patlican-mezesi&mod=kalp'];
const t = await chromium.launch();
let kirmizi = 0, toplam = 0;
for (const w of GENISLIK) {
  const ctx = await t.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  for (const s of SAYFALAR) {
    const p = await ctx.newPage();
    await p.goto(TABAN + s, { waitUntil: 'networkidle' });
    if (process.env.BOZ) await p.addStyleTag({ content: '.sg-mod-kart:first-child .sg-kart__govde, .sg-kural:first-child { padding-bottom: 80px !important; } .sg-esit > * { height: auto !important; } .sg-izgara { align-items: start !important; }' });
    await p.waitForTimeout(250);
    const r = await p.evaluate((w) => {
      const out = [];
      const gorunur = (e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
      const ad = (e) => (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : e.tagName);
      for (const g of document.querySelectorAll('.sg-sayfa .sg-izgara, .sg-sayfa .sg-ortala')) {
        if (!gorunur(g) || g.closest('[hidden]')) continue;
        const ck = [...g.children].filter((x) => !x.hidden && gorunur(x));
        if (!ck.length) continue;
        const veri = ck.some((x) => x.tagName === 'LI' && !x.classList.contains('sg-kart'));
        // satırlara ayır
        const satirlar = [];
        for (const x of ck) { const b = x.getBoundingClientRect(); let sat = satirlar.find((r) => Math.abs(r.top - b.top) <= 2); if (!sat) satirlar.push(sat = { top: b.top, ogeler: [] }); sat.ogeler.push(x); }
        const ortalanmis = getComputedStyle(g).display === 'flex' && getComputedStyle(g).justifyContent === 'center';
        // c) yarım satır
        if (!veri && satirlar.length > 1 && getComputedStyle(g).display === 'grid') {
          const kol = getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length;
          const son = satirlar[satirlar.length - 1].ogeler;
          const dolu = son.reduce((n, x) => { const m = (x.style.gridColumn || '').match(/span (\d+)/); return n + (m ? +m[1] : 1); }, 0);
          if (dolu < kol) out.push(`yarım satır ${ad(g)} (${dolu}/${kol})`);
        }
        if (!veri && ortalanmis && satirlar.length > 1) { /* ortalanmış son satır geçerli */ }
        if (w < 1000) continue;
        for (const sat of satirlar) {
          if (sat.ogeler.length < 2) continue;
          const boy = sat.ogeler.map((x) => x.getBoundingClientRect().height);
          if (Math.max(...boy) - Math.min(...boy) > 1) out.push(`eşit olmayan boy ${ad(g)} → ${boy.map(Math.round).join('/')}`);
          const cta = sat.ogeler.map((x) => x.querySelector(':scope > .sg-kart__alt, :scope .sg-kart__govde > .sg-kart__alt, :scope .sg-partner__site')).filter(Boolean).map((c) => c.getBoundingClientRect().bottom);
          if (cta.length === sat.ogeler.length && Math.max(...cta) - Math.min(...cta) > 2) out.push(`CTA hizasız ${ad(g)} → ${cta.map(Math.round).join('/')}`);
        }
      }
      return [...new Set(out)];
    }, w);
    toplam++;
    if (r.length) { kirmizi++; console.log(`✗ ${w} ${s}: ${r.slice(0, 5).join(' | ')}`); } else console.log(`✓ ${w} ${s}`);
    await p.close();
  }
  await ctx.close();
}
await t.close();
console.log(`\ndenge kapısı: ${toplam - kirmizi}/${toplam} yeşil`);
process.exit(kirmizi ? 1 : 0);
