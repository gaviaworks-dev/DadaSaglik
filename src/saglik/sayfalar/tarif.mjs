// Tarif detayı: saglik-tarif.html?t=<slug>&mod=<kod> — Gastro tarif detayının BİREBİR şablonu (src/donor/tarif-balkabagi.html <main>:
// section.rd-top → section.rd-body → section.sec.simrec; donör kopyasında eksik kalan Gastro blokları — Pişirme Moduna Geç + #cookmode,
// adım süreleri, etiketler, puan dağılımı + puan formu + boş durum, Listeye ekle / Tümünü Listeye Ekle, şef takip/sayaçları, #rdActbar,
// #rdSharePop, #lightbox — Gastro'nun kendi blade parçalarından), istemci tarafında varlik/saglik/veri/tarifler.json + detay-ek.json'dan çizilir.
// Tek fark: başlık bölgesinde (.rd-badges) Gastro'nun kendi .tbadge.t-diyet rozetiyle mod etiketi ("Glutensiz uygun").
// Akıllı ikame Gastro malzeme satırının içinde (.ing-row .in: eski üstü çizili + yeni, <small>Akıllı ikame</small>).
// Uyarı cümlesi sayfada bir kez: Gastro .remind-box "Hatırlatma" içinde.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const KOK = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const temiz = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().replace(/\s[\d.]+$/, '');
const slugla = (s) => String(s || '').toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Gastro tarif listesi süzgeçlerinden (yerel donör) kategori adları, beslenme etiketi + ikonu, mutfak bayrağı. */
async function gastroSozluk() {
  const s = await readFile(path.join(KOK, 'src/donor/tarifler.html'), 'utf8');
  const kat = {}, bes = {}, bayrak = {};
  for (const m of s.matchAll(/name="kategori\[\]" value="([^"]+)">\s*<span class="cbx"><\/span>([\s\S]*?)<\/label>/g)) kat[m[1]] = temiz(m[2]);
  for (const m of s.matchAll(/name="beslenme\[\]" value="([^"]+)">\s*<span class="cbx"><\/span>([\s\S]*?)<\/label>/g)) {
    const ic = m[2].match(/fa-([a-z0-9-]+)"/); bes[m[1]] = [temiz(m[2]), ic && ic[1] !== 'circle' ? ic[1] : ''];
  }
  for (const m of s.matchAll(/name="mutfak\[\]" value="([^"]+)">[\s\S]{0,300}?flags\/([a-z]+)\.svg/g)) bayrak[m[1]] = m[2];
  return { kat, bes, bayrak };
}

/** Slug'dan belirlenimci sayı üreteci (FNV-1a → mulberry32); detay.js'teki örnek yorum üreteciyle aynı. */
export function tohum(metin) {
  let h = 2166136261; for (const c of String(metin)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return () => { h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** PROTOTİP ÖRNEĞİ — kayıtlı sayı ve ortalamaya uyan 5★…1★ dağılımı (toplam = n, ortalama ≈ ort); gerçek kullanıcı puanı değil. */
function ornekDagilim(slug, n, ort) {
  if (!n) return [0, 0, 0, 0, 0];
  const r = tohum(slug + '|puan'), toplam = Math.max(n, Math.min(5 * n, Math.round(ort * n)));
  const p = Array(n).fill(Math.floor(toplam / n)); for (let i = 0; i < toplam % n; i++) p[i]++;
  // doğal görünüm: toplamı koruyan birkaç ± kaydırma (biri +1, öbürü −1), 1…5 içinde
  for (let k = 0; k < Math.floor(n / 3); k++) { const i = Math.floor(r() * n), j = Math.floor(r() * n); if (i !== j && p[i] < 5 && p[j] > 1) { p[i]++; p[j]--; } }
  return [5, 4, 3, 2, 1].map((y) => p.filter((x) => x === y).length);
}

export default async function (o) {
  const { bes, bayrak } = await gastroSozluk();
  // Detay sözlüğü (Gastro tarif listesi süzgeçlerinden): beslenme etiketi + ikonu, mutfak bayrağı. Tarif başı alanlar tarifler.json'da (ortak.istemciVerisi).
  // H20: Gastro detayının kalan blokları için tarif başı ek veri (araclar/veri-hazirla.py → veri/gastro-tarifler.json, yalnız modlarda kullanılan tarifler):
  //   e = etiketler (#), s = adım süreleri (dk, tarifler.json `a` ile aynı sıra), pd = pişirme derecesi,
  //   r = [değerlendirme, ortalama, 5★…1★ dağılımı (5), yorumsuz puan, yorum, Ben de Yaptım, Eline Sağlık] — Beyar H31 (son karar): prototip,
  //       canlı Gastro gibi KAYITLI değerler (kartla aynı: tarifler.puan/10 · degerlendirme · yorum). 5★…1★ dağılımı PROTOTİP ÖRNEĞİ: tarif
  //       slug'ıyla tohumlanan belirlenimci dağılım; toplamı kayıtlı değerlendirme sayısı, ortalaması kayıtlı puana en yakın. Gerçek veri değil;
  //       Gastro'ya taşınırken `degerlendirmeler` satırlarıyla değiştirilir. Değerlendirmesi 0 olan tarifte dağılım boş (Gastro boş durumu).
  //   o = malzeme satırı başına [malzeme id, o satırın ölçüsünün gram karşılığı] (Gastro SunumHaritasi::olcuMalzemeBalonlari → #ingList[data-olcu-malzeme]).
  //   c = şef profili varsa [yayındaki tarif, takipçi, üyelik yılı]; yoksa 0 (Gastro: şefsiz tarifte bağ/şef kutusu basılmaz).
  const t = {};
  for (const x of o.TARIFLER) {
    if (!o.KULLANILAN.has(x.slug)) continue;
    const g = x.gercek || {}, c = x.sef_sayac;
    t[x.slug] = {
      e: x.etiketler || [], s: (x.adimlar || []).map((a) => a.sure_dk || 0), pd: x.pisirme_derecesi || '',
      r: (() => { const n = x.degerlendirme || 0, y = Math.min(x.yorum || 0, n); return [n, (x.puan || 0) / 10, ...ornekDagilim(x.slug, n, (x.puan || 0) / 10), n - y, y, g.deneme || 0, g.alkis || 0]; })(),
      o: (x.malzemeler || []).map((m) => [m.malzeme_id || 0, m.gram || 0]),
      c: c ? [c.tarif || 0, c.takipci || 0, c.yil || ''] : 0,
    };
  }
  const ek = { bes, bayrak, t };
  await writeFile(path.join(KOK, 'varlik/saglik/veri/detay-ek.json'), JSON.stringify(ek));

  // Sağlık alt menüsü main'in doğrudan çocuğu: yapışkanlık tüm sayfa boyunca sürer; .sg-sayfa sarmalı yok (Gastro detay stilleri değişmesin).
  const main = `${o.altMenu('tarif')}
<div class="sg-alerjen-durum" id="sgAlerjenDurum" hidden></div>
<section class="rd-top" data-sg-detay aria-live="polite">
 <div class="wrap">
  <nav class="rd-crumb" aria-label="Sayfa yolu"><a href="index.html"><i class="fa-solid fa-house" aria-hidden="true"></i></a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i> <a href="saglik.html">${o.esc(o.MARKA)}</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i> <b>Tarif</b></nav>
  <p class="rd-sub">Tarif yükleniyor…</p>
  <noscript><p class="rd-sub">Tarif ayrıntıları için JavaScript gerekir. <a href="saglik.html">${o.esc(o.MARKA)} ana sayfasına dön</a>.</p></noscript>
 </div>
</section>`;
  return [{ dosya: 'saglik-tarif.html', baslik: `Tarif — ${o.MARKA} (prototip)`, aciklama: `Sağlık moduna göre uyarlanmış Dada Gastro tarifi: mod rozeti, akıllı ikameler, malzeme ve adımlar.`, main, css: ['detay'], js: ['detay'], detay: true }];
}
