// Dada Gastro Sağlık — ortak bileşenler (Kids ortak.mjs'in Sağlık karşılığı; sınıf öneki sg-).
// Sayfa modülü sözleşmesi: export default async function (o) → [{ dosya, baslik, aciklama, main, css:[], js:[], gorsel }]
//   main = o.sayfa(icerik, aktif)  (Sağlık alt menüsü + zemin)
import { readFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { MODLAR, MOD, eslestir, tarifBilgi } from './modlar.mjs';
import { ALERJENLER, siniflandir } from './malzeme.mjs';
export { MODLAR, MOD, eslestir, tarifBilgi, ALERJENLER, siniflandir };

const KOK = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const jsonOku = async (p, yedek) => { try { return JSON.parse(await readFile(path.join(KOK, p), 'utf8')); } catch { return yedek; } };
export const var_ = (p) => existsSync(path.join(KOK, p));

export const MARKA = 'Dada Gastro Health';
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- Veri ---------- */
const HAM = await jsonOku('veri/gastro-tarifler.json', { tarifler: [] });
export const icerik = await jsonOku('veri/icerik.json', { hub: {}, modlar: {} });
export const kaynaklar = await (async () => {
  try {
    const md = await readFile(path.join(KOK, 'tasks/saglik-kaynaklar.md'), 'utf8');
    const m = md.match(/```json\s*([\s\S]*?)```(?![\s\S]*```json)/);
    return m ? JSON.parse(m[1]) : {};
  } catch { return {}; }
})();
export const TARIFLER = HAM.tarifler.map((t) => ({ ...t, _b: tarifBilgi(t) }));
/** Mod → [{ t, r }] uyumlu tarifler (deterministik sıra: puan, değerlendirme, ad). */
export const ESLESME = Object.fromEntries(MODLAR.map((M) => [M.kod, TARIFLER.map((t) => ({ t, r: eslestir(t, M, t._b) })).filter((x) => x.r.uyum)
  .sort((a, b) => (b.t.puan || 0) - (a.t.puan || 0) || (b.t.degerlendirme || 0) - (a.t.degerlendirme || 0) || a.t.baslik.localeCompare(b.t.baslik, 'tr'))]));
/** Herhangi bir modda yer alan tarifler (görsel kopyalama + detay JSON). */
export const KULLANILAN = new Set(Object.values(ESLESME).flatMap((l) => l.map((x) => x.t.slug)));

/* ---------- Görseller ---------- */
export const tarifGorsel = (t) => `varlik/saglik/tarif/${t.slug}.webp`;
export const tarifSahne = (t) => `varlik/saglik/sahne/${t.slug}.webp`;
// Şeffaf malzeme ikonu (Kids urun-pixar seti, yerel kopya): -k 192px (render ≤ 96) · -b 560px
export const ikonYol = (ad, boy = 48) => `varlik/saglik/ikon/${ad}-${boy > 96 ? 'b' : 'k'}.webp`;
export const ikonVar = (ad) => !!ad && var_(ikonYol(ad, 48));
export const malzemeIkon = (ad, boy = 48, alt = '') => ikonVar(ad)
  ? `<img class="sg-ikon-seffaf" src="${ikonYol(ad, boy)}" width="${boy}" height="${boy}" alt="${esc(alt)}"${alt ? '' : ' aria-hidden="true"'} loading="lazy" decoding="async">`
  : '';
export const foto = (yol, alt, { gen = 640, yuk = 429, oncelik = false, sinif = '' } = {}) =>
  `<img${sinif ? ` class="${sinif}"` : ''} src="${yol}" alt="${esc(alt)}"${alt ? '' : ' aria-hidden="true"'} width="${gen}" height="${yuk}" ${oncelik ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

/* ---------- Çizgisel UI ikonları (mod simgeleri, inline SVG; currentColor) ---------- */
const _s = (ic, boy = 24) => `<svg viewBox="0 0 24 24" width="${boy}" height="${boy}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ic}</svg>`;
const UI = {
  basak: '<path d="M12 21V8"/><path d="M12 12c-2.6 0-4-1.6-4-4 2.6 0 4 1.6 4 4zM12 12c2.6 0 4-1.6 4-4-2.6 0-4 1.6-4 4zM12 16.5c-2.6 0-4-1.6-4-4 2.6 0 4 1.6 4 4zM12 16.5c2.6 0 4-1.6 4-4-2.6 0-4 1.6-4 4zM12 8c-1.2-1-1.2-3 0-5 1.2 2 1.2 4 0 5z"/>',
  damla: '<path d="M12 3.5s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>',
  kalkan: '<path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
  sut: '<path d="M9 3h6M9.5 3v3L7 9.5V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5L14.5 6V3"/><path d="M7 13h10"/>',
  yaprak: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19l8-8"/>',
  kalp: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M8.5 12h2l1-2 1.5 4 1-2h1.5"/>',
  ok: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  saat: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  kisi: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  tik: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  uyari: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
  gizle: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
  arti: '<path d="M12 5v14M5 12h14"/>',
  dolap: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 10h14M9 6.5v1M9 13.5v2"/>',
  kitap: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>',
  bag: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  ara: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  filtre: '<path d="M4 6h16M7 12h10M10 18h4"/>',
};
// Beyar 2 Kas: ikonlar Gastro'daki gibi DOLU (Font Awesome 6 solid; Gastro kabuğu all.min.css'i zaten yükler). Eski çizgisel SVG yolu: uiCizgi.
const FA = { basak: 'wheat-awn', damla: 'droplet', kalkan: 'shield-halved', sut: 'glass-water', yaprak: 'leaf', kalp: 'heart-pulse', ok: 'arrow-right', saat: 'clock', kisi: 'user', tik: 'check', uyari: 'triangle-exclamation', gizle: 'ban', arti: 'plus', dolap: 'basket-shopping', kitap: 'utensils', bag: 'link', ara: 'magnifying-glass', filtre: 'sliders', bilgi: 'circle-info', zorluk: 'gauge-simple', porsiyon: 'utensils', degistir: 'right-left', yildiz: 'star' };
export const ui = (ad, boy = 24) => `<i class="fa-solid fa-${FA[ad] || 'circle'} sg-fa" style="font-size:${Math.round(boy * 0.78)}px" aria-hidden="true"></i>`;
export const uiCizgi = (ad, boy = 24) => _s(UI[ad] || '', boy);

/* ---------- Mod meta ---------- */
// Menü sekme adları (kısa); sıra = MODLAR sırası
// Mod ikonu = modun öncü kurumunun resmî site ikonu (Beyar 2 Kas 2. EK; kaynak tasks/saglik-kaynaklar.md "Mod ikonları").
// Logo alanı kuralı gereği yalnız admin bayraklı: canlıda admin değilse çizgisel mod ikonu (ui(M.ikon)) gösterilecek.
export const MOD_IKON_KURUM = { colyak: 'Çölyakla Yaşam Derneği', diyabet: 'Türkiye Diyabet Vakfı', alerji: 'Türkiye Ulusal Alerji ve Klinik İmmünoloji Derneği', laktoz: 'Alerji ile Yaşam Derneği', ibs: 'Türk Gastroenteroloji Derneği', kalp: 'Türk Kalp Vakfı' };
export const modIkon = (M, boy = 20) => `<img class="sg-mod-ikon" src="varlik/saglik/partner/ikon/${M.kod}.webp" width="${boy}" height="${boy}" alt="" aria-hidden="true" title="${esc(MOD_IKON_KURUM[M.kod])}" data-yalniz-admin="1" loading="lazy" decoding="async">`;
export const SEKME = { colyak: 'Glutensiz', diyabet: 'Kan Şekeri', alerji: 'Alerjen', laktoz: 'Sütsüz', ibs: 'Düşük FODMAP', kalp: 'Kalp Dostu' };
export const modUyumAdi = (M) => ({ colyak: 'Glutensiz', diyabet: 'Kan şekeri dostu', alerji: 'Alerjene göre', laktoz: 'Sütsüz', ibs: 'Düşük FODMAP', kalp: 'Kalp dostu' })[M.kod];
export const UYARI = 'Bu bilgiler genel bilgilendirme amaçlıdır; tanı ve tedavi için hekiminize danışın.';
export const uyariSeridi = () => `<aside class="sg-uyari" role="note"><div class="wrap"><p>${ui('uyari', 18)}<span>${UYARI}</span></p></div></aside>`;

/* ---------- Logo: Dada Gastro logosu AYNEN + sade "health" rozeti ---------- */
const _gastroLogo = (() => {
  try {
    const s = readFileSync(path.join(KOK, 'src/donor/ana.html'), 'utf8');
    const i = s.indexOf('<span class="brand-word"><svg'); const ac = s.indexOf('>', s.indexOf('<svg', i)) + 1; const j = s.indexOf('</svg>', ac);
    return s.slice(ac, j).replace(/<title>[\s\S]*?<\/title>/g, '');
  } catch { return ''; }
})();
const ROZET = { x: 2700, y: 300, g: 640 };
const ROZET_RENK = { health: [['health', '#2E7D5B']], kids: [['k', '#D4557C'], ['i', '#3F82C4'], ['d', '#D9783A'], ['s', '#23906C']] };
export function saglikLogoSvg({ sinif = '', etiket = MARKA, rozet = 'health' } = {}) {
  const g = rozet === "kids" ? 470 : ROZET.g;
  const vb = `921.855 214.449 ${(ROZET.x + g + 8 - 921.855).toFixed(3)} 348.042`;
  const erisim = etiket ? `role="img" aria-label="${esc(etiket)}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="sg-logo-svg ${sinif}" viewBox="${vb}" ${erisim} xmlns="http://www.w3.org/2000/svg">${_gastroLogo}<text class="sg-logo-rozet" aria-hidden="true" x="${ROZET.x}" y="${ROZET.y + 196}" font-family="GilroyXB, Gilroy, sans-serif" font-weight="800" font-size="250" textLength="${rozet === 'kids' ? 470 : ROZET.g}" lengthAdjust="spacingAndGlyphs">${ROZET_RENK[rozet].map(([h, r]) => `<tspan fill="${r}">${h}</tspan>`).join('')}</text></svg>`;
}

/* ---------- Alt menü (Kids altMenu birebir davranış; ev ikonu + 6 mod) ---------- */
const _EV_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false"><path d="M11.3 3.27a1.1 1.1 0 0 1 1.4 0l8.4 7.06c.78.66.32 1.94-.71 1.94H19v7.63c0 .61-.49 1.1-1.1 1.1h-3.6v-5.4a.9.9 0 0 0-.9-.9h-2.8a.9.9 0 0 0-.9.9V21H6.1c-.61 0-1.1-.49-1.1-1.1v-7.63H3.61c-1.03 0-1.49-1.28-.71-1.94z"/></svg>';
export function altMenu(aktif) {
  const ev = `<a class="dt${aktif === 'hub' ? ' active' : ''} sg-ust__ev" href="saglik.html" aria-label="${MARKA} ana sayfa"${aktif === 'hub' ? ' aria-current="page"' : ''}><i class="fa-solid fa-house" aria-hidden="true"></i></a>`;
  // Gastro sekme bileşeni birebir: .disc-tabs > .dt / .dt.active (portal CSS) — kopya stil yok (Beyar 2 Kas)
  const linkler = MODLAR.map((M) => `<a class="dt${M.kod === aktif ? ' active' : ''}" href="${M.dosya}" data-renk="${M.renk}"${M.kod === aktif ? ' aria-current="page"' : ''}>${esc(SEKME[M.kod])}</a>`).join('');
  return `<nav class="sg-ust" aria-label="${MARKA} menüsü"><div class="wrap">`
    + `<a class="sg-ust__logo" href="saglik.html" tabindex="-1" aria-hidden="true">${saglikLogoSvg({ sinif: 'sg-ust__logo-svg', etiket: '' })}</a>`
    + `<div class="sg-ust__menu"><div class="disc-tabs sg-ust__sekmeler">${ev}${linkler}</div></div>`
    + `</div></nav>`;
}
export const sayfa = (icerik, aktif) => `<div class="sg-sayfa"${MOD[aktif] ? ` data-renk="${MOD[aktif].renk}" data-mod="${aktif}"` : ''}>\n${altMenu(aktif)}\n<div class="sg-alerjen-durum" id="sgAlerjenDurum" hidden></div>\n${icerik}\n</div>`;

export function kirinti(parcalar) {
  const ok = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
  return `<nav class="sg-kirinti" aria-label="Sayfa yolu"><a href="index.html" aria-label="Dada Gastro ana sayfa"><i class="fa-solid fa-house" aria-hidden="true"></i></a>${parcalar.map(([ad, href]) => ok + (href ? `<a href="${href}">${esc(ad)}</a>` : `<b>${esc(ad)}</b>`)).join('')}</nav>`;
}

/** Bölüm başı */
export const bolumBasi = ({ ust, baslik, alt, sag = '', id = '' }) =>
  `<div class="sg-bas"><div>${ust ? `<span class="sg-ust-yazi">${esc(ust)}</span>` : ''}<h2${id ? ` id="${id}"` : ''}>${baslik}</h2>${alt ? `<p>${alt}</p>` : ''}</div>${sag}</div>`;

/* ---------- Tarif kartı (tüm listelerin tek bileşeni) ---------- */
export const tarifHref = (t, mod) => `saglik-tarif.html?t=${encodeURIComponent(t.slug)}${mod ? `&mod=${mod}` : ''}`;
const sure = (t) => (t.hazirlik_dk || 0) + (t.pisirme_dk || 0);
const KAT_AD = { 'kofte-ve-kebap': 'Köfte ve kebap', pilav: 'Pilav', icecek: 'İçecek', atistirmalik: 'Atıştırmalık', corba: 'Çorba', 'tavuk-ve-hindi': 'Tavuk ve hindi', 'kirmizi-et': 'Kırmızı et', tatli: 'Tatlı', 'sandvic-burger-ve-durum': 'Sandviç ve dürüm', 'meyve-tarifleri': 'Meyve', 'balik-ve-deniz-urunleri': 'Balık ve deniz ürünleri', kahvaltilik: 'Kahvaltılık', meze: 'Meze', sebze: 'Sebze yemekleri', zeytinyaglilar: 'Zeytinyağlılar', 'yumurta-tarifleri': 'Yumurta', 'dondurma-ve-soguk-tatlilar': 'Soğuk tatlı', bakliyat: 'Bakliyat', salata: 'Salata', makarna: 'Makarna', ekmek: 'Ekmek', 'dolma-ve-sarma': 'Dolma ve sarma', 'pizza-ve-pide': 'Pizza ve pide', 'manti-ve-dolgulu-hamurlar': 'Mantı ve hamurlar', 'cocuk-tarifleri': 'Çocuk', 'hamur-isi': 'Hamur işi', sakatat: 'Sakatat', 'kek-ve-pasta': 'Kek ve pasta', 'tursu-ve-konserve': 'Turşu ve konserve', sos: 'Sos', kurabiye: 'Kurabiye', recel: 'Reçel' };
export const katAd = (k) => (HAM.kategori_adlari || {})[k] || KAT_AD[k] || k; // Gastro'nun kendi kategori adı (eksen_degerleri)
export const ALERJEN_AD = Object.fromEntries(ALERJENLER.map(([, k, a]) => [k, a]));
const ALERJEN_KISA = { gluten: 'Gluten', sut: 'Süt', yumurta: 'Yumurta', yerfistigi: 'Yer fıstığı', sertkabuklu: 'Sert kabuklu', susam: 'Susam', balik: 'Balık', kabuklu: 'Kabuklu', yumusakca: 'Yumuşakça', soya: 'Soya', hardal: 'Hardal', kereviz: 'Kereviz', sulfit: 'Sülfit' };
export const alerjenKisa = (k) => ALERJEN_KISA[k] || k;

/**
 * tarifKart(t, r, M, { alerjenGoster, sira })
 * data-alerjen / data-paketli: saglik.js genel alerjen süzgeci (seçilen alerjen + aynı bant riski tüm listelerden kalkar).
 */
export function tarifKart(t, r, M, { sira = 0, rozetMod = true } = {}) {
  // Gastro tarif kartı BİREBİR (Beyar 2 Kas): .r-card > .r-media-wrap > .r-media (.r-chip kategori · .r-diet rozetleri · .m-types)
  // > .r-body (h4 · .r-facts süre/zorluk/porsiyon/bütçe · .r-foot şef + puan/görüntülenme). Sağlık'a özel kutu/çerçeve/gölge yok.
  // Mod uyumu ve uygulanan Akıllı İkame Gastro'nun kendi rozet öğesiyle (.r-diet .rd-b, title/aria-label) taşınır.
  const ik = r.ikameler || [];
  const dk = sure(t);
  const baslik = t.baslik.split('|')[0].trim();
  const modRozet = rozetMod ? (() => { const [sin, fa] = RD_MOD[M.kod]; const ad = `${modUyumAdi(M)} uyumlu`; return `<span class="rd-b${sin ? ' ' + sin : ''}" title="${esc(ad)}" aria-label="${esc(ad)}"><i class="fa-solid fa-${fa}" aria-hidden="true"></i></span>`; })() : '';
  const ikRozet = ik.length ? (() => { const ad = `Akıllı ikame: ${ik.map((x) => `${x.ad} yerine ${x.yerine}`).join(', ')}`; return `<span class="rd-b" title="${esc(ad)}" aria-label="${esc(ad)}"><i class="fa-solid fa-right-left" aria-hidden="true"></i></span>`; })() : '';
  const butce = t.butce ? `<span class="r-cost" title="${esc(t.butce_ad || '')}"> ${[1, 2, 3].map((n) => `<b class="${n <= t.butce ? 'rc-on' : 'rc-off'}">₺</b>`).join(' ')} </span>` : '';
  const sefAd = t.sef_ad || t.sef || '';
  const sefHtml = sefAd ? `<a class="r-author" href="https://dadagastro.com/sefler/${esc(t.sef || '')}" title="${esc(sefAd)} profilini gör"> <div class="av"><span aria-hidden="true">${esc(sefAd.trim().charAt(0).toLocaleUpperCase('tr'))}</span></div> <span><b>${esc(sefAd)}</b></span> </a>` : '';
  const puan = t.puan ? `<span class="r-rate"><i class="fa-solid fa-star" aria-hidden="true"></i> ${(Number(t.puan) / 10).toFixed(1)}</span>` : '';
  const goz = `<span class="r-views"><i class="fa-solid fa-eye" aria-hidden="true"></i> ${Number(t.goruntulenme || 0).toLocaleString('tr')}</span>`;
  return `<article class="r-card sg-tarif" data-renk="${M.renk}" data-slug="${esc(t.slug)}" data-alerjen="${t._b.alerjen.join(' ')}" data-paketli="${t._b.paketli ? 1 : 0}" data-kat="${esc(t.kategori.join(' '))}" data-sure="${dk || 999}" data-ikame="${ik.length}" data-ikameler="${esc(ik.map((x) => x.ad + '→' + x.yerine).join('|'))}" data-puan="${t.puan || 0}" data-ad="${esc(t.baslik.toLocaleLowerCase('tr'))}" data-sira="${sira}">
 <div class="r-media-wrap"> <div class="r-media " role="img" aria-label="${esc(baslik)}" style="background-image:url('${tarifGorsel(t)}')"> <span class="r-chip">${esc(katAd(t.kategori[0] || ''))}</span> ${modRozet || ikRozet ? `<div class="r-diet">${modRozet}${ikRozet}</div>` : ''} <div class="m-types"> </div> </div> </div>
 <div class="r-body"> <h4><a class="sg-tarif__bag" href="${tarifHref(t, M.kod)}">${esc(baslik)}</a></h4>
  <div class="r-facts">${dk ? ` <span><i class="fa-solid fa-clock" aria-hidden="true"></i> <span class="rf-txt">${dk} dk</span></span>` : ''}${t.zorluk ? ` <span><i class="fa-solid fa-gauge-simple" aria-hidden="true"></i> <span class="rf-txt">${esc(t.zorluk)}</span></span>` : ''}${t.porsiyon ? ` <span class="f-serv"><i class="fa-solid fa-utensils" aria-hidden="true"></i> <span class="rf-txt"><span class="rf-uzun">${t.porsiyon} ${esc(t.porsiyon_birimi || 'kişilik')}</span><span class="rf-kisa" aria-hidden="true">${t.porsiyon} kişi</span></span></span>` : ''} ${butce} </div>
  <div class="r-foot"> ${sefHtml} <div class="r-stats"> ${puan} ${goz} </div> </div>
 </div>
</article>`;
}
// Mod → Gastro rozet sınıfı + ikon (Gastro'da karşılığı olanlar: rd-glutensiz, rd-laktozsuz; diğerleri Gastro .rd-b tabanı)
const RD_MOD = { colyak: ['rd-glutensiz', 'wheat-awn-circle-exclamation'], laktoz: ['rd-laktozsuz', 'glass-water'], diyabet: ['', 'droplet'], alerji: ['', 'shield-halved'], ibs: ['', 'leaf'], kalp: ['', 'heart-pulse'] };

/** Süzgeç satırı — Gastro tarif listesi süzgeci (.fct-row + .cbx) kalıbı: onay kutusu + ad + sayı. */
export const satir = ({ tur = 'checkbox', ad, deger, etiket, sayi = null, secili = false }) =>
  `<label class="sg-satir"><input type="${tur}" name="${esc(ad)}" value="${esc(deger)}"${secili ? ' checked' : ''}><span class="sg-cbx${tur === 'radio' ? ' sg-cbx--radyo' : ''}" aria-hidden="true"></span><span class="sg-satir__ad">${esc(etiket)}</span>${sayi !== null ? `<span class="sg-satir__n">${sayi}</span>` : ''}</label>`;

/** Izgara son yuvasını dolduran yönlendirme kartı (uydurma içerik yok). */
export const ctaKart = ({ href, baslik, metin, etiket, renk = '', ikonAd = 'ok', sinif = '' }) =>
  `<a class="sg-kart sg-cta-kart ${sinif}" href="${href}"${renk ? ` data-renk="${renk}"` : ''}><span class="sg-cta-kart__ikon">${ui(ikonAd, 28)}</span><h3>${esc(baslik)}</h3><p>${esc(metin)}</p><span class="sg-kart__alt">${esc(etiket)} ${ui('ok', 18)}</span></a>`;

/* ---------- Seçki tipi hero (Gastro reklam seçki kalıbı; marka yerine mod) ---------- */
export function seckiHero({ M, sahne, sahneAlt = '', kirinti: k = [], eyebrow, baslik, giris, istatistik = [], sag = '', not = '', logolar = '' }) {
  return `<section class="sg-secki-hero" data-renk="${M ? M.renk : 'adacayi'}">
 ${sahne ? `<img class="sg-secki-sahne" src="${sahne}" alt="${esc(sahneAlt)}"${sahneAlt ? '' : ' aria-hidden="true"'} width="1600" height="900" fetchpriority="high" decoding="async">` : ''}
 <span class="sg-secki-katman" aria-hidden="true"></span>
 <div class="wrap">
  ${k.length ? kirinti(k) : ''}
  <div class="sg-secki-izgara">
   <div class="sg-secki-ana">
    ${eyebrow ? `<span class="sg-eyebrow">${M ? ui(M.ikon, 18) : ''}${esc(eyebrow)}</span>` : ''}
    <h1>${baslik}</h1>
    ${giris ? `<p class="sg-lead">${giris}</p>` : ''}
    ${istatistik.length ? `<div class="sg-stats">${istatistik.map(([b, s]) => `<div class="sg-st"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div>` : ''}
    ${logolar}
    ${not ? `<p class="sg-secki-not" role="note">${ui('uyari', 18)}<span>${esc(not)}</span></p>` : ''}
   </div>
   ${sag}
  </div>
 </div>
</section>`;
}

/* ---------- SSS (Kids sss.mjs birebir; sg- sınıfları) ---------- */
export function sss(sorular, { onek = 'sss', renk = '' } = {}) {
  const liste = (sorular || []).filter((x) => x && x.s && x.c);
  if (!liste.length) return '';
  return `<div class="sg-sss" data-sg-sss${renk ? ` data-renk="${renk}"` : ''}><div class="sg-sss__liste">${liste.map((x, i) => {
    const id = x.id || `${onek}-${i + 1}`;
    const cevap = (Array.isArray(x.c) ? x.c : [x.c]).map((p) => `<p>${esc(p)}</p>`).join('');
    return `<div class="sg-sss__oge" id="${id}"><h3 class="sg-sss__soru"><button type="button" class="sg-sss__dugme" id="${id}-d" aria-expanded="true" aria-controls="${id}-c"><span>${esc(x.s)}</span><i class="sg-sss__ikon" aria-hidden="true"></i></button></h3><div class="sg-sss__cevap" id="${id}-c" role="region" aria-labelledby="${id}-d"><div class="sg-sss__ic">${cevap}</div></div></div>`;
  }).join('')}</div></div>`;
}

/* ---------- Partner (Gastro seçki kalıbı: logo + ad + tanım + resmî site; yalnız admin) ----------
   Beyar 2 Kas (2. EK): logolar banner'larda da kullanılır; kartlardaki "Olası iş birliği" etiketi kaldırıldı.
   Başlık "Bizimle iş birliği yapan kurumlar" (Beyar 2 Kas; canlı öncesi yazılı iş birliği + logo izni şart, yoksa "Bu alanda çalışan kurumlar"a döner); hepsi data-yalniz-admin. */
export const partnerLogoYol = (p) => (p.logo ? `varlik/saglik/partner/${String(p.logo).replace(/\.[a-z0-9]+$/i, '')}.webp` : null);
export const partnerListe = (kod) => (kaynaklar[kod] || []).filter((p) => p && p.ad && p.site && !/çıkar/i.test(p.durum || ''));
export function partnerLogo(p) {
  const ly = partnerLogoYol(p);
  const svg = p.logo && /\.svg$/i.test(p.logo) && var_(`varlik/saglik/partner/${p.logo}`) ? `varlik/saglik/partner/${p.logo}` : null;
  return svg || (ly && var_(ly) ? ly : null);
}
/** Banner logo şeridi: logolu kurumlar beyaz karolarda; tıklanınca resmî site. */
export function logoSeridi(liste, { sinif = '', baslik = 'Bizimle iş birliği yapan kurumlar' } = {}) {
  const l = liste.filter((p) => partnerLogo(p));
  if (!l.length) return '';
  return `<div class="sg-logo-serit ${l.length >= 5 ? 'sg-logo-serit--yay ' : ''}${sinif}" data-yalniz-admin="1"><span class="sg-logo-serit__bas">${esc(baslik)}</span><ul>${l.map((p) => `<li><a href="${esc(p.site)}" target="_blank" rel="noopener nofollow" title="${esc(p.ad)}"><img src="${partnerLogo(p)}" alt="${esc(p.ad)} logosu" loading="lazy" decoding="async"></a></li>`).join('')}</ul></div>`;
}
/** Hub hero sağ kartı: "Bizimle iş birliği yapan kurumlar" logo ızgarası (yalnız admin bayraklı). */
export function kurumKutusu(liste) {
  const l = liste.filter((p) => partnerLogo(p));
  if (!l.length) return '';
  return `<aside class="sg-secki-kutu sg-kurum-kutu" data-yalniz-admin="1" aria-labelledby="kurum-bas"><h2 id="kurum-bas">Bizimle iş birliği yapan kurumlar</h2><ul class="sg-kurum-kutu__izgara">${l.map((p) => `<li><a href="${esc(p.site)}" target="_blank" rel="noopener nofollow" title="${esc(p.ad)}"><img src="${partnerLogo(p)}" alt="${esc(p.ad)} logosu" loading="lazy" decoding="async"></a></li>`).join('')}</ul></aside>`;
}
export function partnerBolumu(M) {
  const liste = partnerListe(M.kod);
  if (!liste.length) return '';
  const kart = (p) => {
    const src = partnerLogo(p);
    const logo = src
      ? `<span class="sg-partner__logo"><img src="${src}" alt="${esc(p.ad)} logosu" loading="lazy" decoding="async"></span>`
      : `<span class="sg-partner__logo sg-partner__logo--yer" aria-hidden="true"><span>${esc(p.ad)}</span></span>`;
    return `<article class="sg-kart sg-partner" data-logo="${src ? 'var' : 'yok'}">${logo}<div class="sg-partner__govde"><h3>${esc(p.ad)}</h3><p>${esc(p.tanim || '')}</p><a class="sg-partner__site" href="${esc(p.site)}" target="_blank" rel="noopener nofollow">${ui('bag', 16)}Resmî site <span class="sg-gizli">(yeni sekmede açılır)</span></a></div></article>`;
  };
  return `<section class="sg-bolum sg-partnerler" data-yalniz-admin="1" aria-labelledby="pt-${M.kod}">
 <div class="wrap">
  <p class="sg-admin-not">${ui('kalkan', 16)}<span><b>Yalnız yönetici görür.</b> Bu alan prototipte görünür; canlıda yönetici yetkisine bağlanacaktır.</span></p>
  ${bolumBasi({ ust: 'İş birliği', baslik: 'Bizimle iş birliği yapan kurumlar', alt: 'Bizimle iş birliği yapan dernek, vakıf ve meslek kuruluşları.', id: `pt-${M.kod}` })}
  <div class="sg-ortala sg-kol-3 sg-izgara--partner">${liste.map(kart).join('')}</div>
 </div>
</section>`;
}

/* ---------- Sahne (hero) seçimi: her moda farklı, uyumlu ve görsel olarak güçlü bir tarif ---------- */
const SAHNE_KAT_DIS = new Set(['icecek', 'sos', 'tursu-ve-konserve', 'recel']);
export const SAHNE = (() => {
  const alinan = new Set(); const s = {};
  for (const M of MODLAR) {
    const x = ESLESME[M.kod].find(({ t }) => !alinan.has(t.slug) && !t.kategori.some((k) => SAHNE_KAT_DIS.has(k)));
    if (x) { alinan.add(x.t.slug); s[M.kod] = x.t; }
  }
  return s;
})();
export const HUB_SAHNE = (() => {
  const sayi = new Map(); for (const M of MODLAR) for (const { t } of ESLESME[M.kod]) sayi.set(t.slug, (sayi.get(t.slug) || 0) + 1);
  const al = new Set(Object.values(SAHNE).map((t) => t.slug));
  return TARIFLER.filter((t) => (sayi.get(t.slug) || 0) >= 5 && !al.has(t.slug) && !t.kategori.some((k) => SAHNE_KAT_DIS.has(k)))
    .sort((a, b) => sayi.get(b.slug) - sayi.get(a.slug) || (b.puan || 0) - (a.puan || 0))[0] || null;
})();
export const SAHNE_SLUGLARI = [...Object.values(SAHNE), HUB_SAHNE].filter(Boolean).map((t) => t.slug);
export const BANT_GORSEL = SAHNE.kalp ? tarifGorsel(SAHNE.kalp) : '';

/* ---------- Dolap / istemci verisi ---------- */
const TEMEL_AD = /^(su|soğuk su|sıcak su|ılık su|buz|soda)$/;
export const temelMi = (s) => s.kategori === 'baharat' || s.kategori === 'yag' || TEMEL_AD.test(s.ad);
export const dolapAnahtar = (s) => s.ikon || s.ad;
export const DOLAP_KATEGORI = [['sebze', 'Sebzeler'], ['meyve', 'Meyveler'], ['protein', 'Et, tavuk, balık ve yumurta'], ['tahil', 'Tahıllar ve bakliyat'], ['sut', 'Süt ürünleri'], ['diger', 'Diğer']];
const IKON_AD = { 'dana-kusbasi': 'Kırmızı et', kiyma: 'Kıyma', tavuk: 'Tavuk', somon: 'Somon', yumurta: 'Yumurta', sogan: 'Soğan', biber: 'Biber', domates: 'Domates', 'domates-salcasi': 'Salça', patates: 'Patates', havuc: 'Havuç', kabak: 'Kabak', ispanak: 'Ispanak', salatalik: 'Salatalık', pirasa: 'Pırasa', karnabahar: 'Karnabahar', enginar: 'Enginar', kereviz: 'Kereviz', pancar: 'Pancar', 'tatli-patates': 'Tatlı patates', balkabagi: 'Balkabağı', bezelye: 'Bezelye', elma: 'Elma', armut: 'Armut', karpuz: 'Karpuz', seftali: 'Şeftali', nar: 'Nar', avokado: 'Avokado', muz: 'Muz', incir: 'İncir', limon: 'Limon', portakal: 'Portakal', mandalina: 'Mandalina', cilek: 'Çilek', uzum: 'Üzüm', kavun: 'Kavun', ayva: 'Ayva', pirinc: 'Pirinç', bulgur: 'Bulgur', makarna: 'Makarna', un: 'Un', yulaf: 'Yulaf', nohut: 'Nohut', 'kirmizi-mercimek': 'Kırmızı mercimek', sut: 'Süt', yogurt: 'Yoğurt', 'lor-peyniri': 'Lor, taze peynir', kasar: 'Kaşar, beyaz peynir', tereyagi: 'Tereyağı', tahin: 'Tahin', 'butun-kuruyemis': 'Kuruyemiş', bal: 'Bal', seker: 'Şeker', 'kakao-cikolata': 'Kakao' };
export const ikonAdi = (k) => IKON_AD[k] || k;

/** Bir modda tek malzemenin dolap durumu (miktardan bağımsız): uygun · ikameli · riskli */
export function malzemeDurum(s, M) {
  const yasak = M.yasakBayrak.filter((b) => s.bayrak.has(b));
  if (!yasak.length) return { d: 'uygun' };
  const i = M.ikame.find((x) => { try { return x.eslesme(s.ad, s.bayrak, { miktar: 1, birim: 'Yemek Kaşığı' }, { kategori: [] }); } catch { return false; } });
  if (i) return { d: 'ikameli', i: typeof i.yerine === 'function' ? i.yerine(s.ad) : i.yerine };
  const NEDEN = { G: 'gluten', YU: 'sertifikasız yulaf', P: 'paketli ürün, aynı bant riski', SEK: 'eklenmiş şeker', GI: 'yüksek glisemik indeks', S: 'süt ürünü', L: 'laktoz', F: 'yüksek FODMAP', NA: 'yüksek sodyum', DY: 'doymuş yağ', SA: 'sakatat' };
  return { d: 'riskli', n: [...new Set(yasak.map((b) => NEDEN[b] || b))].join(', ') };
}

/** Dolap kartları: ikonu olan ve kategorisi belli malzemeler (fotoğrafsız/ikonsuz kart çizilmez — Kids kararı). */
export const DOLAP_KARTLAR = (() => {
  const m = new Map();
  for (const t of TARIFLER) if (KULLANILAN.has(t.slug)) for (const { s } of t._b.malz) {
    if (temelMi(s) || !s.ikon) continue;
    const k = s.ikon; if (!m.has(k)) m.set(k, { k, ad: ikonAdi(k), kat: ['sebze', 'meyve', 'protein', 'tahil', 'sut'].includes(s.kategori) ? s.kategori : 'diger', ornek: s });
  }
  return [...m.values()].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
})();
export const KULLANILAN_IKON = [...new Set([...DOLAP_KARTLAR.map((x) => x.k), ...MODLAR.flatMap((M) => M.ikameKart.map((x) => x[2]).filter(Boolean)), 'limon', 'zeytinyagi', 'un', 'sut', 'tuz', 'domates'])];

export function istemciVerisi() {
  const tarifler = {};
  for (const t of TARIFLER) {
    if (!KULLANILAN.has(t.slug)) continue;
    tarifler[t.slug] = {
      b: t.baslik, o: t.ozet, k: tarifGorsel(t), kat: t.kategori, sure: (t.hazirlik_dk || 0) + (t.pisirme_dk || 0), hz: t.hazirlik_dk, pz: t.pisirme_dk,
      p: t.porsiyon, pb: t.porsiyon_birimi, z: t.zorluk, mt: t.mutfak, al: t._b.alerjen, pk: t._b.paketli ? 1 : 0,
      m: t.malzemeler.map((x, i) => { const s = t._b.malz[i].s; return [x.grup || '', x.miktar ?? '', x.birim || '', x.ad, x.aciklama || '', temelMi(s) ? '' : dolapAnahtar(s)]; }),
      a: t.adimlar.map((x) => [x.baslik, x.metin]),
      // Gastro kart/detay paritesi: kategori adı, şef, puan (×10), görüntülenme, bütçe, değerlendirme/yorum sayısı, hatırlatma, besin, tarihler, mutfak
      ka: katAd(t.kategori[0] || ''), kad: t.kategori.map(katAd), sa: t.sef_ad || t.sef || '', sk: t.sef || '', su: t.sef_unvan || '', pu: t.puan || 0, dg: t.degerlendirme || 0, yo: t.yorum || 0,
      g: t.goruntulenme || 0, bt: t.butce || 0, bta: t.butce_ad || '', h: t.hatirlatma || '', bs: t.besin && t.besin.hesaplanabildi ? t.besin : null, ty: t.yayin || '', tg: t.guncelleme || '', bsl: t.beslenme || [],
    };
  }
  const modlar = {};
  for (const M of MODLAR) modlar[M.kod] = {
    ad: M.ad, kisa: SEKME[M.kod], uyum: modUyumAdi(M), renk: M.renk, dosya: M.dosya,
    t: Object.fromEntries(ESLESME[M.kod].map(({ t, r }) => [t.slug, r.ikameler.map((x) => [x.ad, x.yerine, x.not || ''])])),
    d: Object.fromEntries(DOLAP_KARTLAR.map((x) => [x.k, malzemeDurum(x.ornek, M)])),
  };
  const dk = Object.fromEntries(DOLAP_KARTLAR.map((x) => [x.k, { ad: x.ad, al: ALERJENLER.filter(([b]) => x.ornek.bayrak.has(b)).map(([, k]) => k), p: x.ornek.bayrak.has('P') ? 1 : 0 }]));
  return { modlar, tarifler, dk, alerjen: ALERJENLER.map(([, k, a]) => [k, a]) };
}
