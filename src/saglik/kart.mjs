// Tarif kartı + süzgeç satırı (ortak.mjs'ten ayrıldı, Beyar 2 Kas H18/H19: kart/filtre sahipliği tek dosyada).
import { esc, katAd, ALERJENLER, tarifGorsel, modUyumAdi } from './ortak.mjs';

/* ---------- Tarif kartı (tüm listelerin tek bileşeni) ---------- */
export const tarifHref = (t, mod) => `saglik-tarif.html?t=${encodeURIComponent(t.slug)}${mod ? `&mod=${mod}` : ''}`;
const sure = (t) => (t.hazirlik_dk || 0) + (t.pisirme_dk || 0);
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
  // Başlık Gastro kartındaki gibi TAM ("Ad | Alt başlık"): Gastro h4 iki satıra kilitli (1440 min-height, 390 line-clamp 2);
  // kısaltılmış başlık 390'da tek satır kalıp kartı Gastro'dan 16 px kısa bırakıyordu (H19).
  const baslik = t.baslik.trim();
  const modRozet = rozetMod ? (() => { const [sin, fa] = RD_MOD[M.kod]; const ad = `${modUyumAdi(M)} uyumlu`; return `<span class="rd-b${sin ? ' ' + sin : ''}" title="${esc(ad)}" aria-label="${esc(ad)}"><i class="fa-solid fa-${fa}" aria-hidden="true"></i></span>`; })() : '';
  const ikRozet = ik.length ? (() => { const ad = `Akıllı ikame: ${ik.map((x) => `${x.ad} yerine ${x.yerine}`).join(', ')}`; return `<span class="rd-b" title="${esc(ad)}" aria-label="${esc(ad)}"><i class="fa-solid fa-right-left" aria-hidden="true"></i></span>`; })() : '';
  const butce = t.butce ? `<span class="r-cost" title="${esc(t.butce_ad || '')}"> ${[1, 2, 3].map((n) => `<b class="${n <= t.butce ? 'rc-on' : 'rc-off'}">₺</b>`).join(' ')} </span>` : '';
  const sefAd = t.sef_ad || t.sef || '';
  const sefHtml = sefAd ? `<a class="r-author" href="https://dadagastro.com/sefler/${esc(t.sef || '')}" title="${esc(sefAd)} profilini gör"> <div class="av"><span aria-hidden="true">${esc(sefAd.trim().charAt(0).toLocaleUpperCase('tr'))}</span></div> <span><b>${esc(sefAd)}</b></span> </a>` : '';
  const puan = t.puan ? `<span class="r-rate"><i class="fa-solid fa-star" aria-hidden="true"></i> ${(Number(t.puan) / 10).toFixed(1)}</span>` : '';
  const goz = `<span class="r-views"><i class="fa-solid fa-eye" aria-hidden="true"></i> ${Number(t.goruntulenme || 0).toLocaleString('tr')}</span>`;
  return `<article class="r-card sg-tarif" data-renk="${M.renk}" data-slug="${esc(t.slug)}" data-alerjen="${t._b.alerjen.join(' ')}" data-paketli="${t._b.paketli ? 1 : 0}" data-kat="${esc(t.kategori.join(' '))}" data-sure="${dk || 999}" data-ikame="${ik.length}" data-ikameler="${esc(ik.map((x) => x.ad + '→' + x.yerine).join('|'))}" data-puan="${t.puan || 0}" data-ad="${esc(t.baslik.toLocaleLowerCase('tr'))}" data-sira="${sira}" data-mutfak="${esc(SLUG(t.mutfak || ''))}" data-zorluk="${ZORLUK[t.zorluk] || ''}" data-butce="${t.butce || 0}" data-beslenme="${esc((t.beslenme || []).join(' '))}">
 <div class="r-media-wrap"> <div class="r-media " role="img" aria-label="${esc(baslik)}" style="background-image:url('${tarifGorsel(t)}')"> <span class="r-chip">${esc(katAd(t.kategori[0] || ''))}</span> ${modRozet || ikRozet ? `<div class="r-diet">${modRozet}${ikRozet}</div>` : ''} <div class="m-types"> </div> </div> </div>
 <div class="r-body"> <h4><a class="sg-tarif__bag" href="${tarifHref(t, M.kod)}">${esc(baslik)}</a></h4>
  <div class="r-facts">${dk ? ` <span><i class="fa-solid fa-clock" aria-hidden="true"></i> <span class="rf-txt">${dk} dk</span></span>` : ''}${t.zorluk ? ` <span><i class="fa-solid fa-gauge-simple" aria-hidden="true"></i> <span class="rf-txt">${rfMetin(t.zorluk, ZORLUK_KISA[t.zorluk])}</span></span>` : ''}${t.porsiyon ? ` <span class="f-serv"><i class="fa-solid fa-utensils" aria-hidden="true"></i> <span class="rf-txt">${rfMetin(`${t.porsiyon} ${t.porsiyon_birimi || 'kişilik'}`, (t.porsiyon_birimi || 'kişilik') === 'kişilik' ? `${t.porsiyon} kişi` : '')}</span></span>` : ''} ${butce} </div>
  <div class="r-foot"> ${sefHtml} <div class="r-stats"> ${puan} ${goz} </div> </div>
 </div>
</article>`;
}
// Künye kısa biçimi = Gastro kart-meta parçası (H19): yalnız "N kişilik" → "N kişi" ve "Ustalık Gerektirir" → "Ustalık" uzun/kısa çift taşır;
// "N dilim" ve diğer zorluklar düz metin. Kısa biçim yoksa porsiyon "8 kişi"ye çevrilmez (önce her birim "kişi" oluyordu).
const ZORLUK_KISA = { 'Ustalık Gerektirir': 'Ustalık' };
const rfMetin = (uzun, kisa) => kisa ? `<span class="rf-uzun">${esc(uzun)}</span><span class="rf-kisa" aria-hidden="true">${esc(kisa)}</span>` : esc(uzun);
// Mod → Gastro rozet sınıfı + ikon (Gastro'da karşılığı olanlar: rd-glutensiz, rd-laktozsuz; diğerleri Gastro .rd-b tabanı)
const RD_MOD = { colyak: ['rd-glutensiz', 'wheat-awn-circle-exclamation'], laktoz: ['rd-laktozsuz', 'glass-water'], diyabet: ['', 'droplet'], alerji: ['', 'shield-halved'], ibs: ['', 'leaf'], kalp: ['', 'heart-pulse'] };

// Süzgeç verisi (H28: Gastro sol filtre grupları — mutfak · zorluk · bütçe · beslenme/tip)
export const SLUG = (x) => String(x || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/â/g, 'a').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const ZORLUK = { 'Çok Kolay': 'cok_kolay', Kolay: 'kolay', Orta: 'orta', Zor: 'zor', 'Ustalık Gerektirir': 'ustalik' };

/** Süzgeç satırı = Gastro tarif listesi süzgeci (.fct-row > input + .cbx + [.cn-thumb] + .ft + .fcnt) BİREBİR (H18).
 *  Stil Gastro tarif-liste.css'ten gelir; Sağlık'a özel satır stili yok. susle: Gastro satır süsü (mutfak bayrağı .chip-flag, beslenme .fct-ico) donörden.
 *  Kategori satırı resimsiz (Beyar H28a: checkbox + ad + sayı). */
export const satir = ({ tur = 'checkbox', ad, deger, etiket, sayi = null, secili = false, susle = '', xtra = false }) =>
  `<label class="fct-row${xtra ? ' xtra' : ''}"><input type="${tur}" name="${esc(ad)}" value="${esc(deger)}"${secili ? ' checked' : ''}><span class="cbx"></span>${susle}<span class="ft">${esc(etiket)}</span>${sayi !== null ? `<span class="fcnt">${Number(sayi).toLocaleString('tr')}</span>` : ''}</label>`;
