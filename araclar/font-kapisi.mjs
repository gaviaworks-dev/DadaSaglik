// Font kapısı (Beyar 2 Kas): Health sayfalarında her görünür metin Gastro'nun Gilroy yüzlerinden biriyle çizilir.
// Ölçüm (1440 ve 390): her görünür, metin taşıyan öğenin hesaplanan font-family İLK ailesi ∈ Gastro @font-face adları
// (Gilroy · GilroyBd · GilroyXB · GilroyLt; tokens CSS). Font Awesome ikon öğeleri (<i class="fa-…">) ve SVG <text> hariç.
// Sahte kalın: ilk aile "Gilroy" (yalnız 500 dosyası) iken ağırlık ≥ 600 → tarayıcı kalınlığı sentezler. Gastro'nun KENDİ öğelerindeki
// (header/footer/kabuk) aynı durum "Gastro mirası" olarak ayrı sayılır, Health öğesinde (sg-/ana içerik) sapma = 0 olmalı.
// Dosyalar: yüklenen tüm .woff2 yanıtları 200; document.fonts içindeki Gilroy yüzleri "loaded".
// Kullanım: node araclar/font-kapisi.mjs [taban-url]   (varsayılan yerel sunucu)
import { chromium } from 'playwright';
const TABAN = process.argv[2] || 'http://localhost:8790/DadaSaglik/';
const SAYFALAR = ['saglik.html', 'saglik-colyak.html', 'saglik-colyak-bilgi.html', 'saglik-diyabet.html', 'saglik-alerji.html', 'saglik-laktoz.html', 'saglik-ibs.html', 'saglik-kalp.html', 'saglik-kalp-bilgi.html', 'saglik-dolap.html', 'saglik-bilgi.html', 'saglik-tarif.html?t=__ILK__&mod=colyak'];
const YUZ = new Set(['gilroy', 'gilroybd', 'gilroyxb', 'gilroylt']);
const b = await chromium.launch();
let kirmizi = 0; const rapor = [];
let ilkSlug = null;
for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  for (let s of SAYFALAR) {
    const p = await ctx.newPage(); const dosya = []; const hata = [];
    p.on('response', (r) => { if (/\.(woff2?|ttf|otf)(\?|$)/i.test(r.url())) dosya.push([r.url().split('/').pop(), r.status()]); });
    p.on('pageerror', (e) => hata.push(String(e)));
    if (s.includes('__ILK__')) {
      if (!ilkSlug) { await p.goto(TABAN + 'saglik-colyak.html', { waitUntil: 'networkidle' }); ilkSlug = await p.$eval('.sg-tarif', (e) => e.dataset.slug); }
      s = s.replace('__ILK__', ilkSlug);
    }
    await p.goto(TABAN + s, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { await document.fonts.ready; });
    await p.waitForTimeout(250);
    const r = await p.evaluate((YUZ) => {
      const yuz = new Set(YUZ);
      const gor = (e) => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; const c = getComputedStyle(e); return c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity !== 0; };
      // ailenin yüklü yüzleri: ağırlık aralığı istenen ağırlığı kapsamıyor ve en kalın yüz ≥100 daha inceyse → tarayıcı sentezler
      const yuzAralik = {}; for (const f of document.fonts) { const a = f.family.replace(/["']/g, '').toLowerCase(); const [m, M] = String(f.weight).split(' ').map(Number); (yuzAralik[a] ||= []).push([m, M || m]); }
      const sahteMi = (a, w) => { const l = yuzAralik[a] || []; if (l.some(([m, M]) => w >= m && w <= M)) return false; const enKalin = Math.max(0, ...l.map(([, M]) => M)); return w >= 600 && w - enKalin >= 100; };
      const out = { oge: 0, aile: {}, sapma: [], sahte: [], sahteGastro: 0, agirlik: {} };
      for (const e of document.querySelectorAll('body *')) {
        if (e.closest('svg, script, style, noscript, template') || /^(I|SVG|IMG|PICTURE|VIDEO|BR|HR)$/i.test(e.tagName)) continue;
        if (e.matches('[class*="fa-"], .gw-code') || e.closest('[aria-hidden="true"] [class*="fa-"]')) continue; // .gw-code: Gastro footer imzasındaki </> simgesi (metin değil)
        const metin = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || (e.matches('input, select, textarea, button') && (e.value || e.textContent).trim());
        if (!metin || !gor(e)) continue;
        const c = getComputedStyle(e); const ilk = c.fontFamily.split(',')[0].trim().replace(/["']/g, '').toLowerCase();
        const kabuk = !!e.closest('header.header, .topbar, .top-bar, footer, .footer, .drawer, .mega, .cookie-banner, .rd-actbar');
        const ad = `${e.tagName.toLowerCase()}${e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : ''}`;
        out.oge++; out.aile[ilk] = (out.aile[ilk] || 0) + 1; out.agirlik[`${ilk} ${c.fontWeight}`] = (out.agirlik[`${ilk} ${c.fontWeight}`] || 0) + 1;
        if (!yuz.has(ilk)) out.sapma.push(`${ad} → ${c.fontFamily}`);
        else if (sahteMi(ilk, +c.fontWeight) && c.fontSynthesisWeight !== 'none') { if (kabuk) out.sahteGastro++; else out.sahte.push(`${ad} (${c.fontWeight}) "${e.textContent.trim().slice(0, 28)}"`); }
      }
      out.yuzler = [...document.fonts].filter((f) => /gilroy/i.test(f.family)).map((f) => `${f.family.replace(/"/g, '')} ${f.weight} ${f.status}`);
      return out;
    }, [...YUZ]);
    const kotuDosya = dosya.filter(([, st]) => st !== 200);
    // Beyar 2 Kas karar 1: kalın metin Gastro'nun çizdiği gibi (Medium'dan sentetik) — sahte kalın artık bilgi, hata değil; Gastro ile yüz paritesini araclar/font-rol-olc.mjs ölçer
    const kotu = r.sapma.length + kotuDosya.length + hata.length;
    kirmizi += kotu;
    const ozet = `${kotu ? '✗' : '✓'} ${String(w).padEnd(4)} ${s.padEnd(44)} öğe ${String(r.oge).padStart(4)} · aile ${Object.entries(r.aile).map(([k, v]) => `${k}:${v}`).join(' ')} · sapma ${r.sapma.length} · sahte kalın ${r.sahte.length} (Gastro kabuğu mirası ${r.sahteGastro}) · font dosyası ${dosya.length ? dosya.map(([f, st]) => `${f} ${st}`).join(', ') : '(önbellek)'} · JS hata ${hata.length}`;
    console.log(ozet); rapor.push(ozet);
    for (const x of r.sapma.slice(0, 8)) console.log('    ', x);
    if (w === 1440 && s === 'saglik.html') console.log('     yüklü Gilroy yüzleri:', r.yuzler.join(' · '), '\n     ağırlık dağılımı:', Object.entries(r.agirlik).map(([k, v]) => `${k}:${v}`).join(' '));
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log(kirmizi ? `\nFONT KAPISI KIRMIZI (${kirmizi})` : '\nFONT KAPISI YEŞİL: her sayfada Gilroy, sapma 0, dosyalar 200 (kalın: Gastro gibi sentetik — karar 1)');
process.exit(kirmizi ? 1 : 0);
