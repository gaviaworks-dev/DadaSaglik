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

export default async function (o) {
  const { bes, bayrak } = await gastroSozluk();
  // Detay sözlüğü (Gastro tarif listesi süzgeçlerinden): beslenme etiketi + ikonu, mutfak bayrağı. Tarif başı alanlar tarifler.json'da (ortak.istemciVerisi).
  // H20: Gastro detayının kalan blokları için tarif başı ek veri (araclar/veri-hazirla.py → veri/gastro-tarifler.json, yalnız modlarda kullanılan tarifler):
  //   e = etiketler (#), s = adım süreleri (dk, tarifler.json `a` ile aynı sıra), pd = pişirme derecesi,
  //   r = [değerlendirme, ortalama, 5★…1★ dağılımı (5), yorumsuz puan, yayındaki üst yorum, Ben de Yaptım, Eline Sağlık] — `degerlendirmeler`
  //       satırlarından (Gastro TarifDetayServisi: tarifler.ortalama_puan/degerlendirme_sayisi donmuş "sahte sayaç"),
  //   c = şef profili varsa [yayındaki tarif, takipçi, üyelik yılı]; yoksa 0 (Gastro: şefsiz tarifte bağ/şef kutusu basılmaz).
  const t = {};
  for (const x of o.TARIFLER) {
    if (!o.KULLANILAN.has(x.slug)) continue;
    const g = x.gercek || {}, c = x.sef_sayac;
    t[x.slug] = {
      e: x.etiketler || [], s: (x.adimlar || []).map((a) => a.sure_dk || 0), pd: x.pisirme_derecesi || '',
      r: [g.degerlendirme || 0, g.ortalama || 0, ...(g.dagilim || [0, 0, 0, 0, 0]), g.yorumsuz || 0, g.yorum || 0, g.deneme || 0, g.alkis || 0],
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
