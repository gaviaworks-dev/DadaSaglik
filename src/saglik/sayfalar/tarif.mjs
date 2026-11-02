// Tarif detayı: saglik-tarif.html?t=<slug>&mod=<kod> — istemci tarafında varlik/saglik/veri/tarifler.json'dan çizilir.
// Mod uyum rozeti, uygulanan ikameler, ikameyle uyarlanmış malzeme listesi, adımlar. Uyarı satırı sayfada bir kez.
export default async function (o) {
  const main = o.sayfa(`<section class="sg-hero-sade sg-detay-hero">
 <div class="wrap">
  ${o.kirinti([['Dada Gastro Sağlık', 'saglik.html'], ['Tarif']])}
  <div data-sg-detay aria-live="polite"><p class="sg-ikincil">Tarif yükleniyor…</p></div>
  <noscript><p>Tarif ayrıntıları için JavaScript gerekir. <a href="saglik.html">Sağlık ana sayfasına dön</a>.</p></noscript>
 </div>
</section>
${o.uyariSeridi()}
<section class="sg-bolum" data-sg-detay-govde hidden>
 <div class="wrap sg-detay-izgara">
  <div class="sg-kart sg-detay-malzeme"><h2>Malzemeler</h2><div data-sg-malzeme></div><p class="sg-ikincil sg-not">Paketli ürünlerde etiketi her zaman kontrol edin; içerikler üreticiye göre değişebilir.</p></div>
  <div class="sg-kart sg-detay-adim"><h2>Hazırlanışı</h2><ol data-sg-adim></ol></div>
 </div>
</section>`, 'tarif');
  return [{ dosya: 'saglik-tarif.html', baslik: 'Tarif — Dada Gastro Sağlık (prototip)', aciklama: 'Sağlık moduna göre uyarlanmış Dada Gastro tarifi: uyum rozeti, akıllı ikameler, malzeme ve adımlar.', main, css: ['mod'], js: ['detay'] }];
}
