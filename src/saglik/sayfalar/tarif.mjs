// Tarif detayı: saglik-tarif.html?t=<slug>&mod=<kod> — Gastro tarif detayının BİREBİR şablonu (src/donor/tarif-balkabagi.html <main>:
// section.rd-top → section.rd-body → section.sec.simrec), istemci tarafında varlik/saglik/veri/tarifler.json + detay-ek.json'dan çizilir.
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
  const ek = { bes, bayrak };
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
