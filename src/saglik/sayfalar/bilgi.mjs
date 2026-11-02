// H22 — Tüm yazılar: saglik-bilgi.html (dosya adı korunur; eski bağlantılar). Düzen: Dada Gourmet içerik listesi (yalnız DÜZEN) →
// görselli hero (kırıntı · eyebrow · başlık · giriş | sağda sayılar) · hero'ya binen beyaz süzgeç bandı (Tümü + 6 mod) ·
// bölüm başı + 3'lü kart ızgarası (her modun her yazısı). Kartlar saglik-yazi-<slug>.html'e gider.
// Süzme istemcide (varlik/saglik/js/okuma.js): ?mod=<kod> süzülü açılır · eski #<kod> süzer · eski #<slug> yazı sayfasına yönlenir.
import { yaziVerisi, yaziKart } from './yazi.mjs';

export default async function (o) {
  const { esc, ui, MODLAR } = o;
  const { yazilar } = yaziVerisi(o);
  const modlar = MODLAR.filter((M) => yazilar.some((y) => y.M.kod === M.kod));
  const kaynakSayisi = new Set(yazilar.flatMap((y) => (y.a.kaynaklar || []).map((k) => String(k).replace(/\s+[—-]\s+https?:\/\/\S+$/, '').trim()))).size;
  const sahne = o.HUB_SAHNE ? o.tarifSahne(o.HUB_SAHNE) : '';
  const chip = (M) => `<a class="sg-ok-suz__chip" href="saglik-bilgi.html?mod=${M.kod}" data-renk="${M.renk}" data-suz="${M.kod}" data-baslik="${esc(M.ad)} yazıları">${ui(M.ikon, 14)}${esc(o.SEKME[M.kod])}<span class="sg-ok-suz__n">${yazilar.filter((y) => y.M.kod === M.kod).length}</span></a>`;
  const main = o.sayfa(`<div class="sg-ok sg-ok--liste">
<section class="sg-ok-hero sg-ok-hero--liste">
 ${sahne ? `<img class="sg-ok-hero__gorsel" src="${sahne}" alt="" aria-hidden="true" width="1600" height="900" fetchpriority="high" decoding="async">` : ''}
 <span class="sg-ok-hero__katman" aria-hidden="true"></span>
 <div class="wrap">
  ${o.kirinti([['Dada Gastro Health', 'saglik.html'], ['Bilgi']])}
  <div class="sg-ok-hero__izgara">
   <div class="sg-ok-hero__ana">
    <span class="sg-ok-hero__kat">${ui('kitap', 14)}Dada Gastro Health · Bilgi</span>
    <h1>Mutfakta <span class="sg-ok-vurgu">okumaya değer</span></h1>
    <p class="sg-ok-hero__giris">Altı yaşam modu için mutfakta işe yarayan kısa yazılar: etiket okuma, ikame, düzen ve pişirme.</p>
    <p class="sg-ok-hero__not" role="note">${ui('uyari', 16)}<span>${o.UYARI}</span></p>
   </div>
   <dl class="sg-ok-hero__sayilar">
    <div><dt>Yazı</dt><dd>${yazilar.length}</dd><dd class="sg-ok-hero__alt">Kısa ve pratik</dd></div>
    <div><dt>Yaşam modu</dt><dd>${modlar.length}</dd><dd class="sg-ok-hero__alt">Her moda ayrı yazılar</dd></div>
    <div><dt>Kaynak</dt><dd>${kaynakSayisi}</dd><dd class="sg-ok-hero__alt">Kurum ve rehberler</dd></div>
   </dl>
  </div>
 </div>
</section>
<div class="sg-ok-yazilar" data-sg-okuma-liste>
 <section class="sg-ok-suz" aria-label="Yaşam moduna göre süz">
  <div class="wrap">
   <div class="sg-ok-suz__bar">
    <nav class="sg-ok-suz__chipler" aria-label="Yaşam modları">
     <a class="sg-ok-suz__chip sg-ok-suz__chip--tumu" href="saglik-bilgi.html" data-suz="" data-baslik="Tüm yazılar" aria-current="true">${ui('filtre', 14)}Tümü<span class="sg-ok-suz__n">${yazilar.length}</span></a>
     ${modlar.map(chip).join('\n     ')}
    </nav>
   </div>
  </div>
 </section>
 <section class="sg-ok-bolum" aria-labelledby="yazilar-bas">
  <div class="wrap">
   <div class="sg-ok-bas"><span class="sg-ok-ust">${ui('kitap', 14)}Bilgi</span><h2 id="yazilar-bas" data-sg-okuma-baslik>Tüm yazılar</h2><p class="sg-ok-bas__sayi" data-sg-okuma-sayi aria-live="polite">${yazilar.length} yazı</p></div>
   <div class="sg-ok-izgara">${yazilar.map((y, i) => yaziKart(o, y, { oncelik: i < 3 })).join('\n')}</div>
  </div>
 </section>
</div>
</div>`, 'bilgi');
  return [{ dosya: 'saglik-bilgi.html', baslik: 'Bilgi: tüm yazılar — Dada Gastro Health (prototip)', aciklama: 'Glutensiz, kan şekeri dostu, alerjen, sütsüz, düşük FODMAP ve kalp dostu mutfak için kısa yazılar.', main, css: ['okuma'], js: ['okuma'], gorsel: sahne }];
}
