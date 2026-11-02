// Dolapta Ne Var — Kids Bebek Dolabı kalıbı (Gastro /dolapta-ne-var akışı): sayaç başlığı → seçilenler şeridi → arama →
// mod süzgeci anahtarı → kategori akordeonu (ilk ikisi açık) → şeffaf ikonlu malzeme kartları → "Hemen yapabilirsin" / "1 malzeme eksik".
// Yaş barı yerine yapışkan MOD barı. Mod seçiliyken riskli malzemeler dışlanır (kartta kısa neden; ikamesi varsa söylenir).
// Davranış: varlik/saglik/js/dolap.js · veri: varlik/saglik/veri/tarifler.json (build üretir).
export default async function (o) {
  const { esc, ui, MODLAR } = o;
  const modBar = `<div class="sg-mod-bar" role="radiogroup" aria-label="Sağlık modu" data-sg-mod-bar>
   <button type="button" role="radio" class="sg-mod-bar__oge" data-mod="" aria-checked="false">Modsuz</button>
   ${MODLAR.map((M) => `<button type="button" role="radio" class="sg-mod-bar__oge" data-mod="${M.kod}" data-renk="${M.renk}" aria-checked="false">${ui(M.ikon, 18)}${esc(o.SEKME[M.kod])}</button>`).join('')}
  </div>`;
  const kartlar = o.DOLAP_KATEGORI.map(([kat, ad], i) => {
    const l = o.DOLAP_KARTLAR.filter((x) => x.kat === kat);
    if (!l.length) return '';
    return `<details class="sg-dkat"${i < 2 ? ' open' : ''}><summary><span>${esc(ad)}</span><small>${l.length}</small>${ui('ok', 18)}</summary>
     <div class="sg-dkat__izgara">${l.map((x) => `<button type="button" class="sg-mz" data-k="${esc(x.k)}" aria-pressed="false" aria-describedby="mzn-${esc(x.k)}">
      <span class="sg-mz__ikon">${o.malzemeIkon(x.k, 64)}</span><span class="sg-mz__ad">${esc(x.ad)}</span><span class="sg-mz__not" id="mzn-${esc(x.k)}"></span><span class="sg-mz__tik" aria-hidden="true">${ui('tik', 14)}</span>
     </button>`).join('')}</div></details>`;
  }).join('');
  const main = o.sayfa(`<section class="sg-hero-sade">
 <div class="wrap">
  ${o.kirinti([['Dada Gastro Sağlık', 'saglik.html'], ['Dolapta Ne Var?']])}
  <div class="sg-hero-sade__izgara"><div>
  <h1>Dolapta Ne Var?</h1>
  <p class="sg-lead">Elindeki malzemeleri seç; moduna uygun ve hemen yapabileceğin tarifleri bulalım. Mod seçiliyken o modda riskli malzemeler dışlanır.</p>
  </div><div class="sg-hero-ikonlar" aria-hidden="true">${['domates', 'havuc', 'limon', 'tavuk', 'ispanak'].map((k) => o.malzemeIkon(k, 96)).join('')}</div></div>
 </div>
</section>
${o.uyariSeridi()}
<div class="sg-yapiskan-bar"><div class="wrap">${modBar}</div></div>
<section class="sg-bolum sg-bolum--sikisik">
 <div class="wrap">
  <div class="sg-dolap" data-sg-dolap>
   <div class="sg-dolap__bas"><h2 data-sg-dolap-sayac>Dolapta 0 malzeme</h2><button type="button" class="sg-bag" data-sg-dolap-temizle hidden>Tümünü temizle</button></div>
   <div class="sg-dolap__secilen" data-sg-dolap-secilen aria-live="polite"><p class="sg-ikincil">Henüz malzeme seçmedin. Aşağıdan seç ya da ara.</p></div>
   <label class="sg-ara sg-ara--genis"><span class="sg-gizli">Malzeme ara</span>${ui('ara', 18)}<input type="search" data-sg-dolap-ara placeholder="Malzeme ara (ör. domates, tavuk)" autocomplete="off"></label>
   <div class="sg-anahtar-satir"><label class="sg-anahtar"><input type="checkbox" role="switch" data-sg-mod-suzgec checked><span class="sg-anahtar__iz" aria-hidden="true"></span><span data-sg-mod-suzgec-metin>Mod süzgeci · riskli malzemeleri dışlar</span></label></div>
   <p class="sg-dolap__durum" data-sg-dolap-durum role="status" aria-live="polite"></p>
   <div class="sg-dolap__kategoriler">${kartlar}</div>
  </div>
 </div>
</section>
<section class="sg-bolum sg-bolum--beyaz" aria-labelledby="dsonuc">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Sonuçlar', baslik: 'Bu malzemelerle', id: 'dsonuc' })}
  <div data-sg-dolap-sonuc><p class="sg-ikincil sg-bos-satir">${ui('dolap', 24)}Malzeme seçtikçe sonuçlar burada görünür. Tuz, su, yağ ve baharatlar evde var sayılır.</p></div>
 </div>
</section>`, 'dolap');
  return [{ dosya: 'saglik-dolap.html', baslik: 'Dolapta Ne Var? — Dada Gastro Sağlık (prototip)', aciklama: 'Elindeki malzemelerle sağlık moduna uygun tarifler; riskli malzemeler mod süzgeciyle dışlanır.', main, css: ['mod'], js: ['dolap'] }];
}
