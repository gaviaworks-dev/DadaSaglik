// Derleme: src/donor/*.html (Gastro'nun yerel donör kopyası) + Sağlık sayfa modülleri → kökte statik HTML.
// Kids build.mjs'in Sağlık uyarlaması. Gastro sayfaları (index, tarifler) olduğu gibi alınır, yalnız giriş kapıları eklenir.
// Sağlık sayfaları: Gastro tarif detayının kabuğu + <main> içinde .sg-sayfa.
// Görseller: eşleşen tariflerin kapakları gastro-mysql/public/varliklar/media YEREL kopyasından 640px webp (kart) ve
// 1600px (hero sahnesi) olarak üretilir; şeffaf malzeme ikonları Kids urun-pixar setinden kopyalanır. Canlıya istek yok.
//
// Kullanım: node araclar/build.mjs [modül …]
import { readFile, writeFile, readdir, access, mkdir, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import * as ortak0 from '../src/saglik/ortak.mjs';
import * as kart from '../src/saglik/kart.mjs';
const ortak = { ...ortak0, ...kart };
import { kabukTemizle, tokenTaramasi } from './temizle.mjs';

const KOK = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const oku = (p) => readFile(path.join(KOK, p), 'utf8');
const varMi = async (p) => { try { await access(p.startsWith('/') ? p : path.join(KOK, p)); return true; } catch { return false; } };
const SURUM = Date.now().toString(36);
const { esc } = ortak;
const GASTRO = process.env.GASTRO_KOK || path.join(os.homedir(), 'Developer/Revenge Projects/DadaMentor/gastro-mysql');
const KIDS = process.env.KIDS_KOK || path.join(os.homedir(), 'Developer/Projects/dadakids-prototip');

function zorunlu(html, eski, yeni, etiket) {
  const sayi = typeof eski === 'string' ? html.split(eski).length - 1 : (html.match(eski) || []).length;
  if (sayi < 1) throw new Error(`Ekleme noktası bulunamadı: ${etiket}`);
  return html.replace(eski, yeni);
}

/* ---------- Görsel hazırlığı (yalnız eksikse; yerel kaynaklardan) ---------- */
async function gorseller() {
  await mkdir(path.join(KOK, 'varlik/saglik/tarif'), { recursive: true });
  await mkdir(path.join(KOK, 'varlik/saglik/sahne'), { recursive: true });
  await mkdir(path.join(KOK, 'varlik/saglik/ikon'), { recursive: true });
  let yeni = 0;
  const sahneler = new Set(ortak.SAHNE_SLUGLARI || []);
  for (const t of ortak.TARIFLER) {
    if (!ortak.KULLANILAN.has(t.slug)) continue;
    const kaynak = path.join(GASTRO, 'public', t.kapak);
    const hedef = path.join(KOK, ortak.tarifGorsel(t));
    if (!(await varMi(hedef))) {
      if (!(await varMi(kaynak))) throw new Error(`Yerel görsel yok: ${kaynak}`);
      execFileSync('cwebp', ['-quiet', '-q', '74', '-resize', '640', '0', kaynak, '-o', hedef]); yeni++;
    }
    if (sahneler.has(t.slug)) {
      const sh = path.join(KOK, ortak.tarifSahne(t));
      if (!(await varMi(sh))) { execFileSync('cwebp', ['-quiet', '-q', '72', '-resize', '1600', '0', kaynak, '-o', sh]); yeni++; }
    }
  }
  // şeffaf malzeme ikonları (Kids urun-pixar, yerel kopya)
  const ikonlar = new Set(ortak.KULLANILAN_IKON || []);
  for (const a of ikonlar) for (const b of ['k', 'b']) {
    const h = path.join(KOK, `varlik/saglik/ikon/${a}-${b}.webp`); const k = path.join(KIDS, `varlik/kids/gorsel/urun-pixar/${a}-${b}.webp`);
    if (!(await varMi(h)) && (await varMi(k))) { await copyFile(k, h); yeni++; }
  }
  // partner logoları (kurumların kendi sitesinden ham, değiştirilmeden): SVG aynen; raster → webp, en çok 160px yükseklik (CSS 80px × 2), büyütme yok
  const ham = path.join(KOK, 'varlik/saglik/partner/ham');
  if (await varMi(ham)) for (const f of await readdir(ham)) {
    const k = path.join(ham, f), ad = f.replace(/\.[a-z0-9]+$/i, '');
    if (/\.svg$/i.test(f)) { if (f === 'turkiye-diyetisyenler-dernegi.svg') continue; const h = path.join(KOK, 'varlik/saglik/partner', f); if (!(await varMi(h))) { await copyFile(k, h); yeni++; } continue; }
    const h = path.join(KOK, 'varlik/saglik/partner', ad + '.webp');
    if (await varMi(h)) continue;
    const yuk = Number(execFileSync('sips', ['-g', 'pixelHeight', k]).toString().match(/pixelHeight: (\d+)/)[1]);
    execFileSync('cwebp', ['-quiet', '-q', '90', '-alpha_q', '100', ...(yuk > 160 ? ['-resize', '0', '160'] : []), k, '-o', h]); yeni++;
  }
  if (yeni) console.log('görsel hazırlandı:', yeni);
}

/* ---------- Kabuk eklemeleri ---------- */
// Mega menü yuvası: Dada Gastro Health ↔ Dada Gastro Kids şeritleri sırayla (Beyar 2 Kas). Davranış: saglik.js megaDonguKur
// (6 sn'de bir yumuşak geçiş; fare/odakta durur; reduced-motion'da otomatik geçiş yok, nokta düğmeleriyle elle). Kids prototipi ayrı repo.
const KIDS_URL = 'https://gaviaworks-dev.github.io/DadaKids/v2/';
const KIDS_CHIP = [['6–8 Ay', 6, '#FFC4A3'], ['9–12 Ay', 9, '#A6E3CB'], ['1–3 Yaş', 12, '#FFDF7E']];
const MEGA_SERIT = `<div class="sg-mega-yuva" data-sg-dongu>
<div class="sg-mega-serit" role="group" aria-label="Dada Gastro Health" data-sg-dongu-oge="saglik">
${ortak.saglikLogoSvg({ sinif: 'sg-mega-serit__logo' })}<span class="sg-mega-serit__metin">Yaşam modlarına göre tarifler</span><span class="sg-mega-serit__chipler">${ortak.MODLAR.filter((M) => ['colyak', 'diyabet', 'kalp'].includes(M.kod)).map((M) => `<a class="sg-mega-serit__chip" data-renk="${M.renk}" href="${M.dosya}">${esc(ortak.SEKME[M.kod])}</a>`).join('')}</span><a class="sg-mega-serit__kesfet" href="saglik.html" aria-label="Dada Gastro Health'i keşfet">Keşfet <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
</div>
<div class="sg-mega-serit sg-mega-serit--kids" role="group" aria-label="Dada Gastro Kids" data-sg-dongu-oge="kids">
${ortak.saglikLogoSvg({ sinif: 'sg-mega-serit__logo', etiket: 'Dada Gastro Kids', rozet: 'kids' })}<span class="sg-mega-serit__metin">Yaşa göre bebek ve çocuk tarifleri</span><span class="sg-mega-serit__chipler">${KIDS_CHIP.map(([a, y, r]) => `<a class="sg-mega-serit__chip" style="--r-a:${r}" href="${KIDS_URL}kids-tarifler.html?yas=${y}">${a}</a>`).join('')}</span><a class="sg-mega-serit__kesfet" href="${KIDS_URL}kids.html" aria-label="Dada Gastro Kids'i keşfet">Keşfet <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
</div>
<span class="sg-mega-nokta" role="group" aria-label="Şerit seç"><button type="button" data-sg-dongu-git="saglik" aria-label="Dada Gastro Health şeridi"></button><button type="button" data-sg-dongu-git="kids" aria-label="Dada Gastro Kids şeridi"></button></span>
</div>`;
const CEKMECE_BAG = `<a href="saglik.html"><i class="fa-solid fa-heart-pulse" aria-hidden="true"></i> <span>Dada Gastro Health · Yaşam modları</span></a>`;

function markaYazimi(html) {
  return html.replace(/DadaGastro(?![a-z.\/])/g, 'Dada Gastro').replace(/>Dada<\/(b|strong)>Gastro/g, '>Dada</$1> Gastro');
}
function tariflerIcerde(html) {
  return html.replace(/href="https:\/\/dadagastro\.com\/tarifler(?:\/kategori\/[a-z0-9-]+)?(?:\?[^"]*)?"/g, 'href="tarifler.html"');
}
async function kabukEkle(html, { css = [], js = [] } = {}) {
  html = tariflerIcerde(markaYazimi(html));
  html = zorunlu(html, /<div class="mega-feat">/, (t) => `${MEGA_SERIT}\n${t}`, 'mega-feat');
  html = zorunlu(html, /(<div class="d-sub">\s*<a href="tarifler\.html">[\s\S]*?<\/a>)/, `$1\n ${CEKMECE_BAG}`, 'çekmece');
  const cssEk = [`<link rel="stylesheet" href="varlik/saglik/saglik.css?v=${SURUM}">`];
  for (const c of css) if (await varMi(`varlik/saglik/css/${c}.css`)) cssEk.push(`<link rel="stylesheet" href="varlik/saglik/css/${c}.css?v=${SURUM}">`);
  const jsEk = [`<script src="varlik/saglik/saglik.js?v=${SURUM}" defer></script>`];
  for (const j of js) if (await varMi(`varlik/saglik/js/${j}.js`)) jsEk.push(`<script src="varlik/saglik/js/${j}.js?v=${SURUM}" defer></script>`);
  html = zorunlu(html, '</head>', `${cssEk.join('\n')}\n</head>`, 'head');
  html = zorunlu(html, /<\/body>(?![\s\S]*<\/body>)/, `${jsEk.join('\n')}\n</body>`, 'body');
  return html;
}

const YAYIN = 'https://gaviaworks-dev.github.io/DadaSaglik/';
function basliklar(html, baslik, aciklama, { dosya = '', gorsel = '', tur = 'website', site = 'Dada Gastro Health (prototip)' } = {}) {
  html = html.replace(/<meta (property|name)="(og:[^"]*|twitter:[^"]*|description)"[^>]*>\s*/g, '');
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(baslik)}</title>
<meta name="description" content="${esc(aciklama)}">
<meta property="og:site_name" content="${esc(site)}">
<meta property="og:locale" content="tr_TR">
<meta property="og:type" content="${tur}">
<meta property="og:url" content="${YAYIN}${dosya}">
<meta property="og:title" content="${esc(baslik)}">
<meta property="og:description" content="${esc(aciklama)}">${gorsel ? `\n<meta property="og:image" content="${YAYIN}${gorsel}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(baslik)}">
<meta name="twitter:description" content="${esc(aciklama)}">`);
  return html;
}
const yorum = (donor, not) => `<!-- Dada Gastro Health prototipi · ${not} · donör: ${donor} (yerel kopya) · araclar/build.mjs ile üretildi, elle düzenlenmez -->\n`;

/* ---------- Sağlık sayfası kabuğu: Gastro tarif detayı ---------- */
const KABUK_HAM = kabukTemizle(await oku('src/donor/tarif-balkabagi.html'));
async function saglikSayfasi({ dosya, baslik, aciklama, main, css = [], js = [], gorsel, detay = false }) {
  let html = KABUK_HAM;
  const a = html.indexOf('<main'); const ac = html.indexOf('>', a) + 1; const b = html.indexOf('</main>', ac);
  html = html.slice(0, ac) + '\n' + main + '\n' + html.slice(b);
  html = html.replace(/<body([^>]*) class="([^"]*)"/, (t, n, s) => `<body${n} class="pg-saglik ${detay ? s.trim() : s.replace('pg-tarif-detay', '').trim()}"`);
  html = html.replace(/(<a class="(?:brand|drawer-brand)" href=")index\.html(" aria-label=")[^"]*"/g, '$1saglik.html$2Dada Gastro Health ana sayfa"');
  html = basliklar(html, baslik, aciklama, { dosya, gorsel });
  html = html.replace(/\s*<a href="https:\/\/dadagastro\.com\/tarif-ekle"[^>]*>[^<]*<\/a>/g, '');
  // Tarif kartı Gastro tarif listesi CSS'iyle çizilir (kart + .lst-grid ızgarası birebir); detay sayfası Gastro detay CSS'inde kalır
  // Titreme önleme: Gilroy dosyaları <head> başında preload (Gastro tokens CSS'teki aynı URL'ler; ilk boyamada font hazır)
  html = zorunlu(html, '<head>', `<head>\n${['Gilroy-Medium', 'Gilroy-ExtraBold'].map((f) => `<link rel="preload" href="varlik/gastro/varliklar/fonts/gilroy/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join('\n')}\n<link rel="preload" href="varlik/gastro/varliklar/fontawesome/webfonts/fa-solid-900.woff2" as="font" type="font/woff2" crossorigin>`, 'font preload');
  if (!detay) html = zorunlu(html, '</head>', '<link rel="stylesheet" href="varlik/gastro/varliklar/reference/tarif-liste/tarif-liste.css">\n</head>', 'tarif-liste css');
  return yorum('https://dadagastro.com (kabuk: tarif detayı)', 'Health sayfası') + await kabukEkle(html, { css: ['yazi', ...css, 'rol'], js });
}

/* ---------- index.html — Gastro ana sayfa + Sağlık bandı (kapı A) ---------- */
function saglikBandi() {
  const chip = ortak.MODLAR.map((M) => `<a class="sg-chip" data-renk="${M.renk}" href="${M.dosya}">${ortak.ui(M.ikon, 18)}${esc(ortak.SEKME[M.kod])}</a>`).join('');
  const g = ortak.BANT_GORSEL;
  return `<section class="sg-bant-sec" aria-label="Dada Gastro Health">
 <div class="wrap">
  <div class="sg-bant">
   ${g ? `<a class="sg-bant__gorsel" href="saglik.html" tabindex="-1" aria-hidden="true"><img src="${g}" alt="" width="240" height="240" loading="lazy" decoding="async"></a>` : ''}
   <div class="sg-bant__metin">
    ${ortak.saglikLogoSvg({ sinif: 'sg-bant__logo' })}
    <b class="sg-bant__baslik">Sofranı yaşam moduna göre kur</b>
    <p>Glutensiz, kan şekeri dostu, alerjene göre, sütsüz, düşük FODMAP ve kalp dostu tarifler; akıllı ikamelerle.</p>
    <div class="sg-bant__chipler">${chip}</div>
   </div>
   <a class="sg-btn" href="saglik.html">Modunu seç <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
  </div>
 </div>
</section>`;
}
async function indexSayfasi() {
  let html = kabukTemizle(await oku('src/donor/ana.html'));
  html = zorunlu(html, /(<section class="findbar-sec">[\s\S]*?<\/section>)/, `$1\n${saglikBandi()}`, 'findbar-sec');
  html = basliklar(html, 'Dada Gastro ana sayfası + Dada Gastro Health bandı (prototip)', 'Dada Gastro ana sayfasının prototip kopyası; Dada Gastro Health giriş bandı eklenmiştir.', { dosya: 'index.html', site: 'Dada Gastro (prototip)' });
  return yorum('https://dadagastro.com/', 'yalnız Sağlık bandı eklendi (kapı A)') + await kabukEkle(html);
}
const BESLENME_MOD = { glutensiz: 'colyak', 'diyabete-uygun': 'diyabet', laktozsuz: 'laktoz', 'sut-icermez': 'laktoz', 'kalp-dostu': 'kalp' };
/** tarifler.html Beslenme süzgeci: Glutensiz / Diyabete Uygun / Laktozsuz / Süt İçermez / Kalp Dostu satırı ilgili Sağlık moduna bağ (onay kutusu yerine ok). */
function beslenmeSaglik(html) {
  let n = 0;
  for (const [v, kod] of Object.entries(BESLENME_MOD)) {
    const M = ortak.MOD[kod];
    html = html.replace(new RegExp(`<label class="fct-row([^"]*)">\\s*<input type="checkbox" name="beslenme\\[\\]" value="${v}">\\s*<span class="cbx"></span>([\\s\\S]*?)</label>`), (t, ek, ic) => { n++;
      return `<a class="fct-row ${ek.trim()} sg-fct-saglik" href="${M.dosya}" data-renk="${M.renk}" aria-label="${esc(ic.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim())}: Dada Gastro Health ${esc(M.ad)} moduna git">${ic.trim()}<span class="sg-fct-saglik__etiket">Health</span><i class="fa-solid fa-arrow-right sg-fct-saglik__ok" aria-hidden="true"></i></a>`; });
  }
  if (n !== Object.keys(BESLENME_MOD).length) throw new Error('Beslenme süzgeci satırları bulunamadı: ' + n);
  return html;
}
async function tariflerSayfasi() {
  let html = beslenmeSaglik(kabukTemizle(await oku('src/donor/tarifler.html')));
  html = zorunlu(html, /(<span class="lbl">Popüler:<\/span>)/, `$1\n <a class="chip sg-chip-gastro" href="saglik.html"><i class="fa-solid fa-heart-pulse" aria-hidden="true"></i> Health modları</a>`, 'lh-chips');
  html = basliklar(html, 'Tarifler — Dada Gastro (prototip, Dada Gastro Health girişli)', 'Dada Gastro tarif listesinin prototip kopyası; Health modları chip\'i eklenmiştir.', { dosya: 'tarifler.html', site: 'Dada Gastro (prototip)' });
  return yorum('https://dadagastro.com/tarifler', 'yalnız Sağlık modları chip\'i eklendi (kapı B)') + await kabukEkle(html);
}

/* ---------- Derle ---------- */
await gorseller();
const istenen = process.argv.slice(2);
const cikti = [];
cikti.push(['index.html', await indexSayfasi()]);
cikti.push(['tarifler.html', await tariflerSayfasi()]);
const modulKlasoru = path.join(KOK, 'src/saglik/sayfalar');
const moduller = (await readdir(modulKlasoru)).filter((f) => f.endsWith('.mjs')).sort();
for (const f of moduller) {
  const ad = f.replace('.mjs', '');
  if (istenen.length && !istenen.includes(ad)) continue;
  const mod = await import(path.join(modulKlasoru, f) + `?v=${SURUM}`);
  for (const s of await mod.default(ortak)) {
    if (!s.dosya || !s.main) throw new Error(`${f}: dosya/main eksik`);
    cikti.push([s.dosya, await saglikSayfasi(s)]);
  }
}
for (const [ad, html] of cikti) {
  const kalan = tokenTaramasi(html);
  if (kalan.length) throw new Error(`${ad}: token taraması kırmızı → ${kalan.join(', ')}`);
  await writeFile(path.join(KOK, ad), html);
  console.log('✓', ad.padEnd(28), (html.length / 1024).toFixed(0) + ' KB');
}
// İstemci verisi: tarif detayı + Dolap (yalnız en az bir modda uyumlu tarifler)
await mkdir(path.join(KOK, 'varlik/saglik/veri'), { recursive: true });
await writeFile(path.join(KOK, 'varlik/saglik/veri/tarifler.json'), JSON.stringify(ortak.istemciVerisi()));
console.log('✓ varlik/saglik/veri/tarifler.json');
