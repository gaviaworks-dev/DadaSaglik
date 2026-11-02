// Font rol ölçümü (H13, Beyar 2 Kas): "Gilroy var" yetmez — Health'in her metin ROLÜ Gastro'daki aynı rolle yan yana ölçülür.
// Özellikler: ilk font-family · ÇİZİLEN yüz (CDP CSS.getPlatformFontsForNode → gerçek dosya; sentetik kalın = CSSOM @font-face
// eşleşmesi: istenen ağırlık ≥600 ve seçilen yüzün üst ağırlığı <600 → Blink kalınlığı sentezler) · font-weight · font-size ·
// line-height · letter-spacing · text-transform. 1440 ve 390. Her Health değişkeni için kazanan CSS kuralı (CDP
// CSS.getMatchedStylesForNode: dosya:satır + seçici + bildirilen değer; özellik mirassa "↑" ile ata kural) raporlanır.
// Çıktı: rapor/tmp/font-rol/rapor.md (rol başına tablo + kaynaklar + düzeltme taslağı) ve rapor.json; konsolda sayfa başına fark
// sayısı. Herhangi bir fark → çıkış kodu 1.
// Kullanım: node araclar/font-rol-olc.mjs [taban-url]   (varsayılan yerel sunucu http://localhost:8790/DadaSaglik/)
//
// Gastro referansları (yerel donör kopyaları). index.html ve tarifler.html sunucudan doğrudan gelir. src/donor/*.html sayfaları
// varlıklarını "varlik/…" göreli yoluyla ister; /DadaSaglik/src/donor/ altından açılınca CSS 404 olur (ölçtük). Bu yüzden donör HTML
// diskten okunur ve Playwright route ile TABAN + "__font-rol__<ad>.html" adresine (yani /DadaSaglik/ köküne) servis edilir:
// varlıklar yerel sunucudan 200 gelir, Gastro sayfası kendi CSS'iyle birebir çizilir. Kullanılan: giris.html (Mutfağa Giriş —
// bölüm başlığı/kart/düzyazı rolleri), tarif-balkabagi.html (tarif detayı), tarifler.html (liste hero'su), index.html (tümünü gör).
//
// ROL → SEÇİCİ EŞLEMESİ (gerekçe tek satır; G = Gastro sayfa · seçici, H = Health seçicileri; "tarif" = saglik-tarif.html'de
// Gastro tarif-detay işaretlemesinin kendisi ölçülür ve donör tarif-balkabagi.html'in aynı öğesiyle kıyaslanır)
//  menu          G giris · header .nav-item > a          H aynı + .sg-ust__menu > a — üst gezinme kabuğu iki sitede ortak (aynı olmalı);
//                  Health'in header altındaki mod menüsü (.sg-ust__menu) ikinci düzey site menüsü → Gastro header menü bağlantısıyla eş.
//                  Gastro header menüsü 390'da görünmez (çekmece); 390 kıyası 1440 Gastro değeriyle yapılır (.nav a sabit 15px).
//  mod-menu      G giris · SONDA .disc-tabs > a.dt       H .sg-ust__sekmeler > .dt, .sg-sekmeler > .dt, .sg-mod-bar__sekmeler > .dt
//                — Health mod menüsü Gastro .disc-tabs/.dt bileşenini kullanıyor; donörlerde .disc-tabs yok, bu yüzden Gastro portal
//                  CSS'i yüklü giris.html'in <main>'ine bir .disc-tabs sondası eklenir (Gastro CSS'inin Gastro bağlamındaki çıktısı).
//  kirinti-bag   G tarif-balkabagi · .rd-crumb > a       H .sg-kirinti > a  — kırıntı bağlantısı; Gastro kırıntısı (bağlantı +
//  kirinti-son   G tarif-balkabagi · .rd-crumb > b       H .sg-kirinti > b    geçerli sayfa) en eksiksiz tarif detayında.
//  h1            G tarifler · .lh-main h1                H .sg-sayfa h1     — Health hero'su (eyebrow+h1+lead+istatistik) Gastro
//                  liste hero'sunun (lh-main) karşılığı; giris/sirlar lh-main h1 aynı 44px. tarif: .rd-stage-info h1 ↔ aynı.
//  hero-ust      G tarifler · .lh-main .eyebrow          H .sg-eyebrow, .sg-ok-hero__kat — hero üst yazısı (aynı hero eşlemesi).
//  hero-lead     G tarifler · .lh-main .lead             H .sg-lead, .sg-ok-giris (yazı girişi) — hero giriş paragrafı. tarif: .rd-head .rd-sub.
//  hero-sayi     G tarifler · .lh-main .st > b           H .sg-st > b       — hero istatistik rakamı.
//  hero-sayi-et  G tarifler · .lh-main .st > span        H .sg-st > span    — hero istatistik etiketi.
//  h2            G giris · .sec-head h2                  H .sg-bas h2, .sg-dolap__bas h2, .sg-ok-bas h2 — bölüm başlığı. Gastro'da 5 değişken
//                  var (index 28/30/34/38px, giris 26/30/34px): standart .sec-head h2 = 34px (giris ×4, index "En yeni tarifler",
//                  tarif detayı "Bunları da seveceksin") seçildi; 26/30/38 özel bloklar (seo-prose, guide-head, comm). tarif: .sec-head h2.
//  ust-yazi      G giris · .sec-head .eyebrow            H .sg-ust-yazi, .sg-ok-bas .sg-ok-ust — bölüm üst yazısı (Gastro'da hero ile aynı).
//  bolum-lead    G giris · .sec-head .lead               H .sg-bas p        — bölüm başlığı altındaki giriş paragrafı.
//  govde         G giris · .seo-prose > p                H .sg-yazi__govde > p (özet/kaynak hariç), .sg-kural li, .sg-sss__cevap p,
//                  .sg-adim > p, yazı sayfası .sg-ok-kolon > p / li > span — düzyazı gövde metni; Gastro'nun bilgi/rehber düzyazısı giris seo-prose (bilgi sayfalarına en yakın).
//                  tarif: .step-card__body p ↔ aynı.
//  h2-yazi       G giris · .seo-prose > h2               H .sg-ok-kolon > h2 — yazı (saglik-yazi-*) gövdesindeki ara başlık = Gastro düzyazı h2.
//  h3            G giris · .seo-prose h3                 H .sg-yazi__govde h3, .sg-ok-kolon > h3 — düzyazı içi alt başlık.
//  kart-baslik   G giris · .topic-card h3                H .sg-kart h3 (mod/bilgi/partner/adım), .sg-kural__bas h3, .sg-ok-kart__baslik —
//                  görsel+başlık+metin+eylem kartı = Gastro konu kartı (giris/sirlar aynı 17px).
//  kart-metin    G giris · .topic-card > p               H .sg-kart__govde > p, .sg-bilgi-kart > p, .sg-partner__govde > p, .sg-ok-kart__ozet
//  kart-eylem    G giris · .topic-card .topic-go         H .sg-kart__alt, .sg-partner__site, .sg-ok-kart__git — kartın alt eylem bağlantısı.
//  tarif-kart    G tarifler · .r-card h4 a               H .sg-tarif h4 a   — tarif kartı başlığı (Gastro kart işaretlemesi).
//  tumunu-gor    G index · .sec-tools a.see-all          H .sg-bas a.sg-bag — bölüm başlığı yanındaki "Tümünü gör" bağlantısı.
//  dugme         G giris · .hero-ctas .btn-primary       H .sg-btn, .sg-dolap-bant__git — birincil düğme/CTA. tarif: .btn ↔ .btn.
//
// Notlar: yalnız görünür öğe ölçülür (≥2px kutu, ekranda, display/visibility açık). Bir rol bir genişlikte Gastro'da görünmüyorsa
// diğer genişliğin Gastro değeri kullanılır ve satırda "(Gastro N ref)" yazar; hiçbirinde yoksa kıyas yapılmaz ("Gastro ref yok"). Health'te eşleşen öğe yoksa satır çıkmaz (sayfada o rol yok).
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const TABAN = (process.argv[2] || 'http://localhost:8790/DadaSaglik/').replace(/\/?$/, '/');
const KOK = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CIKTI = path.join(KOK, 'rapor/tmp/font-rol');
const GEN = [1440, 390];
const KODLAR = ['colyak', 'diyabet', 'alerji', 'laktoz', 'ibs', 'kalp'];

const G = { giris: 'src/donor/giris.html', tarif: 'src/donor/tarif-balkabagi.html', liste: 'tarifler.html', ana: 'index.html' };
const SONDA_DT = '<div class="disc-tabs" data-font-rol-sonda style="margin:8px 0"><a class="dt" href="#">Sonda</a><a class="dt active" href="#">Sonda</a></div>';

const ROLLER = [
  { id: 'menu', ad: 'Menü · üst gezinme', g: [G.giris, ['header .nav-item > a']], h: ['header .nav-item > a', '.sg-ust__menu > a'] },
  { id: 'mod-menu', ad: 'Menü · mod sekmeleri (.dt)', g: [G.giris, ['[data-font-rol-sonda] > a.dt'], SONDA_DT], h: ['.sg-ust__sekmeler > .dt', '.sg-sekmeler > .dt', '.sg-mod-bar__sekmeler > .dt'] },
  { id: 'kirinti-bag', ad: 'Kırıntı · bağlantı', g: [G.tarif, ['.rd-crumb > a']], h: ['.sg-kirinti > a'], tarif: [['.rd-crumb > a'], ['.rd-crumb > a']] },
  { id: 'kirinti-son', ad: 'Kırıntı · geçerli sayfa', g: [G.tarif, ['.rd-crumb > b']], h: ['.sg-kirinti > b'], tarif: [['.rd-crumb > b'], ['.rd-crumb > b']] },
  { id: 'h1', ad: 'H1 · sayfa başlığı', g: [G.liste, ['.lh-main h1']], h: ['.sg-sayfa h1'], tarif: [['.rd-stage-info h1'], ['.rd-stage-info h1']] },
  { id: 'hero-ust', ad: 'Hero üst yazısı (eyebrow)', g: [G.liste, ['.lh-main .eyebrow']], h: ['.sg-eyebrow', '.sg-ok-hero__kat'] },
  { id: 'hero-lead', ad: 'Hero giriş paragrafı', g: [G.liste, ['.lh-main .lead']], h: ['.sg-lead', '.sg-ok-giris'], tarif: [['.rd-head .rd-sub'], ['.rd-head .rd-sub']] },
  { id: 'hero-sayi', ad: 'Hero istatistik rakamı', g: [G.liste, ['.lh-main .st > b', '.lst-hero .st > b']], h: ['.sg-st > b'] },
  { id: 'hero-sayi-et', ad: 'Hero istatistik etiketi', g: [G.liste, ['.lh-main .st > span', '.lst-hero .st > span']], h: ['.sg-st > span'] },
  { id: 'h2', ad: 'H2 · bölüm başlığı', g: [G.giris, ['.sec-head h2']], h: ['.sg-bas h2', '.sg-dolap__bas h2', '.sg-ok-bas h2'], tarif: [['.sec-head h2'], ['.sec-head h2']] },
  { id: 'ust-yazi', ad: 'Bölüm üst yazısı (eyebrow)', g: [G.giris, ['.sec-head .eyebrow']], h: ['.sg-bas .sg-ust-yazi', '.sg-ust-yazi', '.sg-ok-bas .sg-ok-ust'], tarif: [['.eyebrow'], ['.eyebrow']] },
  { id: 'bolum-lead', ad: 'Bölüm giriş paragrafı', g: [G.giris, ['.sec-head .lead']], h: ['.sg-bas p'], tarif: [['.sec-head .lead'], ['.sec-head .lead']] },
  { id: 'govde', ad: 'Gövde metni (düzyazı)', g: [G.giris, ['.seo-prose > p']], h: ['.sg-yazi__govde > p:not(.sg-yazi__ozet):not(.sg-yazi__kaynak)', '.sg-kural li', '.sg-sss__cevap p', '.sg-adim > p', '.sg-ok-kolon > p:not(.sg-ok-giris):not(.sg-ok-uyari)', '.sg-ok-kolon > ul:not(.sg-ok-kaynak) li > span', '.sg-ok-kolon > ol li > span'], tarif: [['.step-card__body p'], ['.step-card__body p']] },
  { id: 'h2-yazi', ad: 'H2 · düzyazı içi başlık', g: [G.giris, ['.seo-prose > h2']], h: ['.sg-ok-kolon > h2'] },
  { id: 'h3', ad: 'H3 · düzyazı alt başlığı', g: [G.giris, ['.seo-prose h3']], h: ['.sg-yazi__govde h3', '.sg-ok-kolon > h3'] },
  { id: 'kart-baslik', ad: 'Kart başlığı', g: [G.giris, ['.topic-card h3']], h: ['.sg-kart__govde h3', '.sg-bilgi-kart > h3', '.sg-partner__govde h3', '.sg-adim > h3', '.sg-kural__bas h3', '.sg-kart h3', '.sg-ok-kart__baslik'] },
  { id: 'kart-metin', ad: 'Kart metni', g: [G.giris, ['.topic-card > p']], h: ['.sg-kart__govde > p:not(.sg-mod-kart__sayi)', '.sg-bilgi-kart > p', '.sg-partner__govde > p', '.sg-ok-kart__ozet'] },
  { id: 'kart-eylem', ad: 'Kart eylem bağlantısı', g: [G.giris, ['.topic-card .topic-go']], h: ['.sg-kart__alt', '.sg-partner__site', '.sg-ok-kart__git'] },
  { id: 'tarif-kart', ad: 'Tarif kartı başlığı', g: [G.liste, ['.r-card h4 a']], h: ['.sg-tarif h4 a'], tarif: [['.r-card h4 a'], ['.r-card h4 a']] },
  { id: 'tumunu-gor', ad: '"Tümünü gör" bağlantısı', g: [G.ana, ['.sec-tools a.see-all']], h: ['.sg-bas a.sg-bag'], tarif: [['.sec-tools a.see-all'], ['.sec-tools a.see-all']] },
  { id: 'dugme', ad: 'Düğme / birincil CTA', g: [G.giris, ['.hero-ctas .btn-primary']], h: ['.sg-btn', '.sg-dolap-bant__git'], tarif: [['.rl-acts .btn-primary'], ['.rl-acts .btn-primary']] },
];

// ---- Health sayfaları
const yazilar = (await readdir(KOK)).filter((f) => /^saglik-yazi-.+\.html$/.test(f)).sort();
const ilkSlug = await (async () => { const h = await readFile(path.join(KOK, 'saglik-colyak.html'), 'utf8'); return (h.match(/class="r-card sg-tarif"[^>]*data-slug="([^"]+)"/) || h.match(/data-slug="([^"]+)"/) || [])[1]; })();
const SAYFALAR = ['saglik.html', ...KODLAR.map((k) => `saglik-${k}.html`), ...KODLAR.map((k) => `saglik-${k}-bilgi.html`), 'saglik-dolap.html', 'saglik-bilgi.html', `saglik-tarif.html?t=${ilkSlug}&mod=colyak`, ...yazilar];
const kisa = (s) => s === 'saglik.html' ? 'hub' : s.startsWith('saglik-tarif') ? 'tarif' : s.replace(/^saglik-/, '').replace(/\.html.*$/, '');
const turu = (s) => (s.startsWith('saglik-tarif') ? 'tarif' : 'genel');

// ---- sayfa içi ölçüm (tarayıcıda çalışır)
function olcSayfa(roller) {
  const yuzler = [];
  const gez = (rules) => { for (const r of rules) { if (r instanceof CSSFontFaceRule) { const s = r.style; const [a, b] = (s.getPropertyValue('font-weight') || '400').trim().split(/\s+/).map((x) => (x === 'normal' ? 400 : x === 'bold' ? 700 : +x)); const m = (s.getPropertyValue('src').match(/url\(["']?([^"')]+)/) || [])[1] || ''; yuzler.push({ aile: s.getPropertyValue('font-family').replace(/["']/g, '').trim().toLowerCase(), min: a, max: b || a, dosya: m.split('/').pop() }); } else if (r.cssRules) gez(r.cssRules); } };
  for (const sh of document.styleSheets) { try { gez(sh.cssRules); } catch { /* çapraz köken */ } }
  const yuzSec = (aile, w) => { // CSS Fonts 4 §5.2 ağırlık eşleşmesi
    const l = yuzler.filter((f) => f.aile === aile); if (!l.length) return null;
    const ic = l.find((f) => w >= f.min && w <= f.max); if (ic) return ic;
    const ust = (lim = Infinity) => l.filter((f) => f.min > w && f.min <= lim).sort((a, b) => a.min - b.min)[0];
    const alt = () => l.filter((f) => f.max < w).sort((a, b) => b.max - a.max)[0];
    if (w > 500) return ust() || alt(); if (w < 400) return alt() || ust(); return ust(500) || alt() || ust();
  };
  const gor = (e) => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.right <= 0 || r.left >= innerWidth) return false; const c = getComputedStyle(e); return c.display !== 'none' && c.visibility !== 'hidden' && +c.opacity !== 0 && !e.closest('[hidden], details:not([open]) > :not(summary)'); };
  const sonuc = {}; let no = 0;
  for (const rol of roller) {
    const gruplar = new Map(); const alinan = new Set();
    for (const sec of rol.secler) {
      for (const e of document.querySelectorAll(sec)) {
        if (alinan.has(e) || !e.textContent.trim() || !gor(e)) continue; alinan.add(e);
        const c = getComputedStyle(e); const aile = c.fontFamily.split(',')[0].trim().replace(/["']/g, ''); const w = +c.fontWeight; const fs = parseFloat(c.fontSize);
        const y = yuzSec(aile.toLowerCase(), w); const sentetik = !!y && w >= 600 && y.max < 600 && c.fontSynthesisWeight !== 'none';
        const stil = { aile, agirlik: w, boyut: fs, satir: c.lineHeight === 'normal' ? 'normal' : parseFloat(c.lineHeight), harf: c.letterSpacing === 'normal' ? 0 : parseFloat(c.letterSpacing), donusum: c.textTransform, yuzDosya: y ? y.dosya : '(yerel/yok)', sentetik };
        const k = sec + '|' + JSON.stringify(stil);
        if (!gruplar.has(k)) { const fro = `f${no++}`; e.setAttribute('data-font-rol', fro); gruplar.set(k, { sec, n: 0, metin: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 36), stil, fro }); }
        gruplar.get(k).n++;
      }
    }
    sonuc[rol.id] = [...gruplar.values()];
  }
  return sonuc;
}

// ---- CDP: çizilen yüz + kazanan kural
const OZ = ['font-family', 'font-weight', 'font-size', 'line-height', 'letter-spacing', 'text-transform'];
function kazanan(m, ozellik) {
  const ara = (kurallar = [], satirici) => {
    let n = null, imp = null;
    for (const r of kurallar) for (const d of r.rule.style.cssProperties) if (d.name === ozellik && d.disabled !== true && d.parsedOk !== false) {
      const x = { sec: r.rule.selectorList.text, sheet: r.rule.styleSheetId, origin: r.rule.origin, deger: d.value, satir: (r.rule.style.range?.startLine ?? -1) + 1 };
      if (d.important) imp = x; else n = x;
    }
    let sn = null, simp = null;
    for (const d of satirici?.cssProperties || []) if (d.name === ozellik && d.disabled !== true && d.value) { const x = { sec: 'style=""', deger: d.value, origin: 'inline', satir: 0 }; if (d.important) simp = x; else sn = x; }
    return simp || imp || sn || n;
  };
  const oz = ara(m.matchedCSSRules, m.inlineStyle); if (oz) return oz;
  for (const [i, ata] of (m.inherited || []).entries()) { const x = ara(ata.matchedCSSRules, ata.inlineStyle); if (x) return { ...x, miras: i + 1 }; }
  return null;
}

async function sayfaAc(ctx, adres) {
  const p = await ctx.newPage(); const hata = [];
  p.on('pageerror', (e) => hata.push(String(e)));
  p.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(TABAN)) hata.push(`${r.status()} ${r.url().slice(TABAN.length)}`); });
  let url = TABAN + adres;
  if (adres.startsWith('src/donor/')) { url = TABAN + '__font-rol__' + path.basename(adres); const html = await readFile(path.join(KOK, adres), 'utf8'); await p.route(url, (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html })); }
  const cdp = await ctx.newCDPSession(p); const sayfalar = {};
  cdp.on('CSS.styleSheetAdded', (e) => { sayfalar[e.header.styleSheetId] = e.header; });
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.waitForTimeout(200);
  return { p, cdp, sayfalar, hata };
}

async function olc(ctx, adres, roller, sonda) {
  const { p, cdp, sayfalar, hata } = await sayfaAc(ctx, adres);
  if (sonda) await p.evaluate((h) => { (document.querySelector('main') || document.body).insertAdjacentHTML('afterbegin', h); }, sonda);
  if (sonda) await p.evaluate(async () => { await document.fonts.ready; });
  const r = await p.evaluate(olcSayfa, roller);
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const dosyaAdi = (id) => { const h = sayfalar[id]; if (!h) return 'UA'; const u = h.sourceURL || ''; if (h.isInline || u.split('?')[0].endsWith('.html') || u.includes('__font-rol__')) return `<style> ${u.split('/').pop().split('?')[0]}`; return u.startsWith(TABAN) ? u.slice(TABAN.length).split('?')[0] : u; };
  for (const liste of Object.values(r)) for (const g of liste) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-font-rol="${g.fro}"]` });
    if (!nodeId) continue;
    let fonts = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId })).fonts;
    if (!fonts.length) { // metin alt öğedeyse ilk metinli torunu dene
      const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId, selector: '*' });
      for (const id of nodeIds) { fonts = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId: id })).fonts; if (fonts.length) break; }
    }
    const ana = fonts.sort((a, b) => b.glyphCount - a.glyphCount)[0];
    g.stil.yuz = (ana ? ana.postScriptName || ana.familyName : g.stil.yuzDosya.replace(/\.woff2?$/, '') + ' (CSSOM)') + (g.stil.sentetik ? ' +sentetik kalın' : '');
    const m = await cdp.send('CSS.getMatchedStylesForNode', { nodeId });
    g.kaynak = {};
    for (const o of OZ) { const k = kazanan(m, o); g.kaynak[o] = k ? { ...k, dosya: k.origin === 'user-agent' ? 'UA' : k.origin === 'inline' ? 'inline' : dosyaAdi(k.sheet) } : null; delete g.kaynak[o]?.sheet; }
  }
  await p.close();
  return { r, hata };
}

// ---- kıyas
const ALAN = [['aile', 'aile', 'font-family'], ['yuz', 'yüz', null], ['agirlik', 'ağırlık', 'font-weight'], ['boyut', 'boyut', 'font-size'], ['satir', 'satır', 'line-height'], ['harf', 'harf', 'letter-spacing'], ['donusum', 'dönüşüm', 'text-transform']];
const sayi = (x) => (typeof x === 'number' ? +x.toFixed(2) : x);
const bicim = (k, s) => {
  const v = s[k];
  if (k === 'boyut') return `${sayi(v)}px`;
  if (k === 'satir') return v === 'normal' ? 'normal' : `${sayi(v)}px (${(v / s.boyut).toFixed(3)})`;
  if (k === 'harf') return v ? `${sayi(v)}px (${(v / s.boyut).toFixed(3)}em)` : '0';
  return String(v);
};
// satır ORAN (line-height/font-size, ±0.005) ve harf EM (letter-spacing/font-size, ±0.001) olarak kıyaslanır: boyut farkının px'e
// yansıması ikinci kez sayılmaz; boyut aynıysa sonuç px kıyasıyla aynıdır.
const oran = (k, s) => (k === 'satir' ? (s.satir === 'normal' ? 'normal' : s.satir / s.boyut) : k === 'harf' ? s.harf / s.boyut : s[k]);
const TOL = { boyut: 0.05, satir: 0.005, harf: 0.001 };
// yüz: Gastro "Gilroy 700"ü Gilroy-Medium'dan SENTETİK kalın çizer; Health css/yazi.css aynı isteği Gastro'nun ExtraBold dosyasına bağlar
// (Beyar: sahte kalın yok; Gastro kanon §5 "700/800 → ExtraBold"). Hesaplanan değerler aynı olduğundan bu bilinçli fark sayılmaz.
const yuzNorm = (s) => String(s.yuz || '').replace(' +sentetik kalın', '').replace(/^Gilroy-Medium$/, s.agirlik >= 600 ? 'Gilroy-ExtraBold' : 'Gilroy-Medium');
// Beyar karar 1: çizilen yüz de Gastro ile aynı olmalı (sentetik kalın dahil)
const esit = (k, a, b) => { if (k === 'yuz') return String(a.yuz) === String(b.yuz); const x = oran(k, a), y = oran(k, b); return typeof x === 'number' && typeof y === 'number' ? Math.abs(x - y) < (TOL[k] ?? 0.05) : String(x) === String(y); };
const isaret = (x, n) => `${x > 0 ? '+' : ''}${+x.toFixed(n)}`;
const delta = (k, g, h) => (k === 'boyut' ? `${isaret(h.boyut - g.boyut, 2)}px` : k === 'satir' && g.satir !== 'normal' && h.satir !== 'normal' ? `${(g.satir / g.boyut).toFixed(3)}→${(h.satir / h.boyut).toFixed(3)}` : k === 'harf' ? `${(g.harf / g.boyut).toFixed(3)}em→${(h.harf / h.boyut).toFixed(3)}em` : `${g[k]}→${h[k]}`);
const kisaStil = (s) => `${s.aile} ${s.agirlik} ${sayi(s.boyut)}px/${s.satir === 'normal' ? 'normal' : (s.satir / s.boyut).toFixed(2)}/${s.harf ? (s.harf / s.boyut).toFixed(3) + 'em' : '0'}/${s.donusum} [${s.yuz}]`;

// ---- çalıştır
await mkdir(CIKTI, { recursive: true });
const b = await chromium.launch();
const ref = {}; const sag = {}; const hatalar = [];
for (const w of GEN) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  // Gastro referansları: sayfa başına bir kez (sondalı rol ayrı sayfa açar)
  const gSayfa = new Map();
  for (const rol of ROLLER) { const anahtar = rol.g[0] + (rol.g[2] ? '#sonda' : ''); if (!gSayfa.has(anahtar)) gSayfa.set(anahtar, { adres: rol.g[0], sonda: rol.g[2], roller: [] }); gSayfa.get(anahtar).roller.push({ id: rol.id, secler: rol.g[1] }); }
  const tarifG = ROLLER.filter((r) => r.tarif).map((r) => ({ id: r.id, secler: r.tarif[0] }));
  gSayfa.set('tarif#ozel', { adres: G.tarif, roller: tarifG, tarif: true });
  for (const [, x] of gSayfa) {
    const { r, hata } = await olc(ctx, x.adres, x.roller, x.sonda);
    if (hata.length) hatalar.push(`${w} ${x.adres}: ${hata.slice(0, 4).join(' · ')}`);
    for (const [id, l] of Object.entries(r)) ref[`${w}|${x.tarif ? 'tarif' : 'genel'}|${id}`] = { sayfa: x.adres, degisken: l };
  }
  for (const s of SAYFALAR) {
    const tur = turu(s);
    const roller = ROLLER.map((r) => ({ id: r.id, secler: tur === 'tarif' && r.tarif ? r.tarif[1] : r.h }));
    const { r, hata } = await olc(ctx, s, roller);
    if (hata.length) hatalar.push(`${w} ${s}: ${hata.slice(0, 4).join(' · ')}`);
    sag[`${w}|${s}`] = r;
  }
  await ctx.close();
}
await b.close();

// ---- kıyas + rapor
const ozet = {}; const satirlar = {}; const kaynakNot = {}; const oneriler = {};
const refAl = (w, s, id) => { const tur = turu(s) === 'tarif' && ROLLER.find((r) => r.id === id).tarif ? 'tarif' : 'genel'; const x = ref[`${w}|${tur}|${id}`]; if (x?.degisken?.length) return x; for (const o of GEN) { const y = ref[`${o}|${tur}|${id}`]; if (o !== w && y?.degisken?.length) return { ...y, sayfa: `${y.sayfa} (Gastro ${o} ref)` }; } return x; };
for (const w of GEN) for (const s of SAYFALAR) {
  const anahtar = `${w}|${s}`; ozet[anahtar] = { fark: 0, roller: {} };
  for (const rol of ROLLER) {
    const hl = sag[anahtar][rol.id] || []; if (!hl.length) continue;
    const rf = refAl(w, s, rol.id); const g = rf?.degisken?.[0];
    for (const h of hl) {
      const farklar = g ? ALAN.filter(([k]) => !esit(k, g.stil, h.stil) && !(rol.id === 'menu' && k === 'boyut' && h.sec.includes('sg-ust__menu'))).map(([k]) => k) : null; // istisna: Health mod menüsü Kids alt menüsünün birebir kopyası (Beyar H12) → boyut Kids'ten (14.5/13.5px), Gastro header .nav a 15px
      const sat = { w, sayfa: s, sec: h.sec, n: h.n, metin: h.metin, stil: h.stil, farklar, kaynak: h.kaynak, ref: rf ? rf.sayfa : null };
      (satirlar[rol.id] ||= []).push(sat);
      if (farklar?.length) {
        ozet[anahtar].fark += farklar.length; ozet[anahtar].roller[rol.id] = (ozet[anahtar].roller[rol.id] || 0) + farklar.length;
        for (const k of farklar) {
          const css = ALAN.find((a) => a[0] === k)[2] || 'font-weight'; const kn = h.kaynak?.[css];
          const kk = kn ? `${kn.miras ? `↑${kn.miras} ` : ''}\`${kn.sec.slice(0, 110)}\` @ ${kn.dosya}${kn.satir ? ':' + kn.satir : ''} → \`${css}: ${kn.deger}\`` : `(kural yok) ${css}`;
          (kaynakNot[rol.id] ||= new Map()).set(kk, ((kaynakNot[rol.id].get(kk)) || new Set()).add(`${w}/${kisa(s)}`));
          if (k !== 'yuz') {
            const gk = g.kaynak?.[css];
            const ok = kn && !kn.miras && kn.origin !== 'user-agent' ? `${kn.sec.slice(0, 110)}  /* ${kn.dosya}${kn.satir ? ':' + kn.satir : ''} */` : `(yeni kural) ${h.sec}`;
            const bildirim = `${css}: ${gk ? gk.deger : '?'}`;
            const m = (oneriler[rol.id] ||= new Map()).get(ok) || oneriler[rol.id].set(ok, new Map()).get(ok);
            if (!m.has(bildirim)) m.set(bildirim, { kaynak: gk ? `${gk.sec.slice(0, 60)} @ ${gk.dosya}` : '', olcu: new Set() });
            m.get(bildirim).olcu.add(`${w}: ${bicim(k, g.stil)}`);
          }
        }
      }
    }
  }
}

const md = [];
const tarih = new Date().toISOString().slice(0, 16).replace('T', ' ');
md.push(`# Font rol ölçümü — Gastro ↔ Health (H13)`, '', `Ölçüm: ${tarih} · taban ${TABAN} · genişlik ${GEN.join(' / ')} · araç \`araclar/font-rol-olc.mjs\``, '');
md.push('Değer biçimi: satır = px (oran), harf = px (em); satır ORAN, harf EM olarak kıyaslanır (boyut farkı iki kez sayılmaz). **yüz** = gerçekten çizilen font dosyası (CDP), "+sentetik kalın" = tarayıcı kalınlığı sentezliyor (istenen ağırlık ≥600, yüzün üst ağırlığı <600). Farklı hücreler **kalın** ve Δ ile.', '');
md.push('## Rol → seçici eşlemesi', '', '| Rol | Gastro (sayfa · seçici) | Health seçicileri | tarif sayfasında |', '|---|---|---|---|');
for (const r of ROLLER) md.push(`| ${r.ad} | ${r.g[0]} · \`${r.g[1].join(', ')}\`${r.g[2] ? ' (sonda)' : ''} | \`${r.h.join('`, `')}\` | ${r.tarif ? `\`${r.tarif[1].join(', ')}\` ↔ tarif-balkabagi` : '—'} |`);
md.push('', '## Özet (sayfa × genişlik → farklı özellik sayısı)', '', '| Sayfa | ' + GEN.map((w) => `${w} fark`).join(' | ') + ' | farklı roller (1440) |', '|---|' + GEN.map(() => '---:').join('|') + '|---|');
for (const s of SAYFALAR) md.push(`| ${kisa(s)} | ${GEN.map((w) => ozet[`${w}|${s}`].fark).join(' | ')} | ${Object.entries(ozet[`1440|${s}`].roller).map(([k, v]) => `${k}:${v}`).join(' ') || '—'} |`);
md.push('', '## Gastro referans değerleri', '', '| Rol | gen | Gastro sayfası | değer | kaynak (font-size) | Gastro\'daki diğer değişkenler |', '|---|---|---|---|---|---|');
for (const r of ROLLER) for (const tur of ['genel', 'tarif']) for (const w of GEN) {
  const x = ref[`${w}|${tur}|${r.id}`]; if (!x) continue; const g = x.degisken[0];
  md.push(`| ${r.id}${tur === 'tarif' ? ' (tarif)' : ''} | ${w} | ${x.sayfa} | ${g ? kisaStil(g.stil) : '— görünmüyor'} | ${g?.kaynak?.['font-size'] ? `\`${g.kaynak['font-size'].sec.slice(0, 50)}\` → ${g.kaynak['font-size'].deger}` : ''} | ${x.degisken.slice(1).map((v) => `${kisaStil(v.stil)} ×${v.n}`).join('; ') || '—'} |`);
}
for (const r of ROLLER) {
  const l = satirlar[r.id]; if (!l) continue;
  md.push('', `## ${r.ad} (\`${r.id}\`)`, '');
  md.push('| gen | sayfa(lar) | Health seçici | n | ' + ALAN.map((a) => a[1]).join(' | ') + ' | Δ |', '|---|---|---|---:|' + ALAN.map(() => '---').join('|') + '|---|');
  for (const w of GEN) {
    const gr = new Map();
    for (const tur of ['genel', 'tarif']) {
      const ornek = l.find((y) => y.w === w && (turu(y.sayfa) === 'tarif' && r.tarif ? 'tarif' : 'genel') === tur); if (!ornek) continue;
      const x = refAl(w, ornek.sayfa, r.id); if (!x) continue;
      const g = x.degisken[0]; md.push(`| ${w} | **GASTRO** ${x.sayfa}${tur === 'tarif' ? ' (tarif)' : ''} | \`${g ? g.sec : '—'}\` | ${g ? g.n : 0} | ${g ? ALAN.map(([k]) => bicim(k, g.stil)).join(' | ') : ALAN.map(() => '—').join(' | ')} | ${g ? 'referans' : 'Gastro ref yok'} |`);
    }
    for (const x of l.filter((y) => y.w === w)) { const k = x.sec + JSON.stringify(x.stil) + (x.farklar || []).join(); if (!gr.has(k)) gr.set(k, { ...x, sayfalar: [], n: 0 }); gr.get(k).sayfalar.push(kisa(x.sayfa)); gr.get(k).n += x.n; }
    for (const x of gr.values()) {
      const g = refAl(w, x.sayfa, r.id)?.degisken?.[0];
      md.push(`| ${w} | ${x.sayfalar.join(', ')} | \`${x.sec}\` | ${x.n} | ${ALAN.map(([k]) => (x.farklar?.includes(k) ? `**${bicim(k, x.stil)}**` : bicim(k, x.stil))).join(' | ')} | ${x.farklar === null ? 'Gastro ref yok' : x.farklar.length ? x.farklar.map((k) => `${ALAN.find((a) => a[0] === k)[1]} ${delta(k, g.stil, x.stil)}`).join('; ') : '✓'} |`);
    }
  }
  if (kaynakNot[r.id]) { md.push('', 'Health kazanan kuralları (farklı özellikler):', ''); for (const [k, v] of kaynakNot[r.id]) md.push(`- ${k} — ${[...v].slice(0, 8).join(', ')}${v.size > 8 ? ` (+${v.size - 8})` : ''}`); }
  if (oneriler[r.id]) { md.push('', 'Düzeltme taslağı (Gastro\'nun bildirilen değerini Health kuralına taşı):', '', '```css'); for (const [sec, hs] of oneriler[r.id]) md.push(`${sec} {`, ...[...hs].map(([d, x]) => `  ${d};  /* Gastro ${[...x.olcu].join(' · ')}${x.kaynak ? ` ← ${x.kaynak}` : ''} */`), '}'); md.push('```'); }
}
if (hatalar.length) md.push('', '## Yükleme uyarıları', '', ...hatalar.map((h) => `- ${h}`));
await writeFile(path.join(CIKTI, 'rapor.md'), md.join('\n') + '\n');
await writeFile(path.join(CIKTI, 'rapor.json'), JSON.stringify({ tarih, TABAN, ROLLER, ref, sag, ozet }, null, 1));

let toplam = 0;
for (const w of GEN) for (const s of SAYFALAR) {
  const o = ozet[`${w}|${s}`]; toplam += o.fark;
  console.log(`${o.fark ? '✗' : '✓'} ${String(w).padEnd(4)} ${kisa(s).padEnd(14)} fark ${String(o.fark).padStart(3)}  ${Object.entries(o.roller).map(([k, v]) => `${k}:${v}`).join(' ')}`);
}
if (hatalar.length) console.log('\nYükleme uyarıları:\n  ' + hatalar.join('\n  '));
console.log(`\nRapor: ${path.relative(KOK, path.join(CIKTI, 'rapor.md'))}`);
console.log(toplam ? `FONT ROL ÖLÇÜMÜ KIRMIZI: ${toplam} farklı özellik` : 'FONT ROL ÖLÇÜMÜ YEŞİL: tüm roller Gastro ile aynı');
process.exit(toplam ? 1 : 0);
