// Bilgilendirme yazıları: saglik-bilgi.html — mod başına 3 kısa yazı (veri/icerik.json). Kartlar #slug ile buraya bağlanır.
export default async function (o) {
  const { esc, ui, MODLAR, icerik, ESLESME } = o;
  const gruplar = MODLAR.map((M) => [M, ((icerik.modlar || {})[M.kod] || {}).makaleler || []]).filter(([, l]) => l.length);
  const icindekiler = `<nav class="sg-icindekiler" aria-label="Modlara göre yazılar">${gruplar.map(([M]) => `<a href="#${M.kod}" data-renk="${M.renk}">${o.modIkon(M, 20)}${esc(o.SEKME[M.kod])}</a>`).join('')}</nav>`;
  const yazi = (M, a, i) => {
    const g = ESLESME[M.kod][5 + i * 4];
    return `<article class="sg-kart sg-yazi" id="${esc(a.slug)}" data-renk="${M.renk}">
   ${g ? `<div class="sg-yazi__medya">${o.foto(o.tarifGorsel(g.t), '')}</div>` : ''}
   <div class="sg-yazi__govde">
    <p class="sg-yazi__ust"><span class="sg-uyum" data-renk="${M.renk}">${ui(M.ikon, 14)}${esc(o.SEKME[M.kod])}</span><span class="sg-ikincil">${esc(a.okuma_dk || 3)} dk okuma</span></p>
    <h3>${esc(a.baslik)}</h3>
    <p class="sg-yazi__ozet">${esc(a.ozet)}</p>
    ${(a.govde || []).map((p) => `<p>${esc(p)}</p>`).join('')}
    ${(a.maddeler || []).length ? `<ul class="sg-tikli">${a.maddeler.map((x) => `<li>${ui('tik', 18)}<span>${esc(x)}</span></li>`).join('')}</ul>` : ''}
    ${(a.kaynaklar || []).length ? `<p class="sg-yazi__kaynak"><b>Kaynak:</b> ${a.kaynaklar.map((k) => { const m = String(k).match(/^(.*?)\s+[—-]\s+(https?:\/\/\S+)$/); return m ? `<a href="${esc(m[2])}" target="_blank" rel="noopener nofollow">${esc(m[1])}</a>` : esc(k); }).join(' · ')}</p>` : ''}
    <p><a class="sg-bag" href="${M.dosya}">${esc(M.ad)} moduna dön</a></p>
   </div>
  </article>`;
  };
  const main = o.sayfa(`<section class="sg-hero-sade">
 <div class="wrap">
  ${o.kirinti([['Dada Gastro Sağlık', 'saglik.html'], ['Bilgi']])}
  <h1>Okumaya değer</h1>
  <p class="sg-lead">Altı mod için mutfakta işe yarayan kısa yazılar: etiket okuma, ikame, düzen ve pişirme.</p>
  ${icindekiler}
 </div>
</section>
${o.uyariSeridi()}
${gruplar.map(([M, l]) => `<section class="sg-bolum" id="${M.kod}" aria-labelledby="bh-${M.kod}">
 <div class="wrap sg-dar">
  ${o.bolumBasi({ ust: o.SEKME[M.kod], baslik: esc(M.ad), id: `bh-${M.kod}` })}
  <div class="sg-yazilar">${l.map((a, i) => yazi(M, a, i)).join('')}</div>
 </div>
</section>`).join('\n')}`, 'bilgi');
  return [{ dosya: 'saglik-bilgi.html', baslik: 'Bilgi — Dada Gastro Sağlık (prototip)', aciklama: 'Glutensiz, kan şekeri dostu, alerjen, sütsüz, düşük FODMAP ve kalp dostu mutfak için kısa yazılar.', main, css: ['mod'], js: [] }];
}
