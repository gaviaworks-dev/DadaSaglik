// Altı mod × iki sekme (Beyar 2 Kas): Tarifler (saglik-<kod>.html) · Bilgilendirme (saglik-<kod>-bilgi.html).
// Kids alt sekmesi × Gastro reklam seçki sayfası hibriti (tasks/saglik-plan.md §4). Hero iki sekmede aynı; sekme çubuğu hero'nun hilal girişinde.
import { readFile } from 'node:fs/promises';

// Gastro kategori süzgecinin küçük görselleri (.cat-fct .cn-thumb) — Gastro tarif listesi donöründen, kategori slug'ı → görsel (H18)
const KAT_THUMB = await readFile(new URL('../../donor/tarifler.html', import.meta.url), 'utf8')
  .then((h) => Object.fromEntries([...h.matchAll(/name="kategori\[\]" value="([^"]+)">\s*<span class="cbx"><\/span>\s*<span class="cn-thumb" style="background-image:url\('([^']+)'\)"/g)].map((m) => [m[1], m[2]])))
  .catch(() => ({}));

export default async function (o) {
  const { esc, ui, MODLAR, ESLESME, SAHNE, icerik } = o;
  return MODLAR.flatMap((M) => {
    const liste = ESLESME[M.kod];
    const ic = (icerik.modlar || {})[M.kod] || {};
    const sahne = SAHNE[M.kod];
    const ikameli = liste.filter((x) => x.r.ikameler.length).length;
    const kategoriler = [...new Set(liste.map((x) => x.t.kategori[0]).filter(Boolean))]
      .map((k) => [k, liste.filter((x) => x.t.kategori[0] === k).length]).sort((a, b) => b[1] - a[1]);

    // "Kimler için?" — hero'nun sağ kartı (Beyar 2 Kas: dar sol sütun + sağ kart düzeni korunur); her kitle ikonlu satır
    const KITLE_IKON = ['kisi', 'kalkan', 'kalp', 'arti'];
    const kimler = `<aside class="sg-secki-kutu sg-kimler-kutu" data-renk="${M.renk}" aria-labelledby="km-${M.kod}">
     <h2 id="km-${M.kod}">Kimler için?</h2>
     <ul class="sg-kimler-kutu__liste">${M.kimler.map((k, i) => `<li><span class="sg-kimler-kutu__ikon">${ui(KITLE_IKON[i % 4], 18)}</span><span>${esc(k)}</span></li>`).join('')}</ul>
    </aside>`;

    const hero = o.seckiHero({
      M, sahne: sahne ? o.tarifSahne(sahne) : '', sahneAlt: sahne ? `${sahne.baslik.split('|')[0].trim()} — bu moda uygun bir Dada Gastro tarifi` : '',
      kirinti: [['Dada Gastro Health', 'saglik.html'], [M.ad]], eyebrow: 'Yaşam modu', baslik: esc(M.ad),
      giris: esc(ic.giris || M.slogan),
      istatistik: [[String(liste.length), 'uyumlu tarif'], [String(ikameli), 'akıllı ikameli'], [String(M.riskli.length), 'riskli malzeme grubu']],
      sag: kimler, not: o.UYARI, logolar: o.logoSeridi(o.partnerListe(M.kod)),
    });

    const alerjenSecici = M.kod === 'alerji' ? `<section class="sg-bolum sg-bolum--sikisik sg-alerjen-bolum" aria-labelledby="alsec">
 <div class="wrap"><div class="sg-alerjen-sec" data-sg-alerjen-sec>
  <div class="sg-alerjen-sec__bas"><h2 id="alsec" class="sg-ikonlu-baslik">${ui('kalkan', 28)}Alerjenini seç</h2><p>Seçtiğin alerjen ve türevlerini içeren tarifler; aynı bantta üretilmiş olabilecek paketli ürün içerenlerle birlikte <b>tüm Sağlık sayfalarındaki listelerden</b> kalkar. Seçim yalnız bu cihazda saklanır.</p></div>
  <div class="sg-alerjen-sec__liste" role="group" aria-label="Alerjenler">${o.ALERJENLER.map(([, k, a]) => o.satir({ tur: 'checkbox', ad: 'alerjen', deger: k, etiket: a })).join('')}</div>
  <div class="sg-alerjen-sec__alt"><p class="sg-alerjen-sec__ozet" data-sg-alerjen-ozet role="status" aria-live="polite">Henüz alerjen seçilmedi.</p><button type="button" class="sg-btn sg-btn--hafif sg-btn--kucuk" data-sg-alerjen-temizle>Seçimi temizle</button></div>
 </div></div>
</section>` : '';

    const kural = `<section class="sg-bolum" aria-labelledby="kr-${M.kod}">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Sistem kuralı', baslik: 'Bu modda neler gizlenir, neler önerilir?', alt: 'Listeler her tarifin malzemelerine tek tek bakılarak kurulur; emin olunamayan tarif gösterilmez.', id: `kr-${M.kod}` })}
  <div class="sg-izgara sg-izgara--2 sg-esit">
   <div class="sg-kart sg-kural sg-kural--gizle"><div class="sg-kural__bas"><span class="sg-kural__ikon">${ui('gizle', 24)}</span><h3>Gizlenir</h3></div><ul>${M.gizlenir.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
   <div class="sg-kart sg-kural sg-kural--oner" data-renk="${M.renk}"><div class="sg-kural__bas"><span class="sg-kural__ikon">${ui('tik', 24)}</span><h3>Önerilir</h3></div><ul>${M.onerilir.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
  </div>
 </div>
</section>`;

    const riskli = `<section class="sg-bolum sg-bolum--beyaz" aria-labelledby="rs-${M.kod}">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Dikkat listesi', baslik: 'Yasaklı ve riskli malzemeler', alt: M.kod === 'alerji' ? 'Seçtiğin alerjene ek olarak şu ürünler aynı bantta üretim ya da gizli içerik nedeniyle listeden çıkarılır.' : 'Bu malzemeleri içeren tarifler, tanımlı bir ikame yoksa listede yer almaz.', id: `rs-${M.kod}` })}
  <ul class="sg-riskli" data-renk="${M.renk}">${M.riskli.map(([a, n]) => `<li class="sg-riskli__oge"><span class="sg-riskli__ikon">${ui('uyari', 22)}</span><span class="sg-riskli__ad">${esc(a)}</span><span class="sg-riskli__neden">${esc(n)}</span></li>`).join('')}</ul>
 </div>
</section>`;

    const ikame = `<section class="sg-bolum sg-zebra" data-renk="${M.renk}" aria-labelledby="ik-${M.kod}">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Akıllı İkame', baslik: M.kod === 'alerji' ? 'Alerjen dostu karşılıklar' : 'Yerine ne kullanılır?', alt: M.kod === 'alerji' ? 'Bu modda tariflere otomatik ikame uygulanmaz (sıfır hata); karşılıklar kendi mutfağın için öneridir.' : 'Tarif kartında hangi ikamenin uygulandığı yazar; tarif detayında malzeme listesi ikameyle birlikte gösterilir.', id: `ik-${M.kod}` })}
  <div class="sg-izgara sg-izgara--ikame">${M.ikameKart.map(([a, b, ik]) => `<div class="sg-kart sg-ikame">
   <div class="sg-ikame__gorsel">${ik && o.ikonVar(ik) ? o.malzemeIkon(ik, 72) : `<span class="sg-ikame__yer">${ui(M.ikon, 32)}</span>`}</div>
   <div class="sg-ikame__metin"><p class="sg-ikame__once"><span class="sg-gizli">Yerine: </span>${esc(a)}</p><p class="sg-ikame__ok" aria-hidden="true">${ui('ok', 18)}</p><p class="sg-ikame__sonra"><span class="sg-gizli">Kullanılacak: </span>${esc(b)}</p></div>
  </div>`).join('')}</div>
 </div>
</section>`;

    const dolapBant = `<aside class="sg-dolap-bant" data-renk="${M.renk}"><div class="wrap"><a href="saglik-dolap.html?mod=${M.kod}">${ui('dolap', 22)}<span>Elindeki malzemelerle <b>${esc(o.SEKME[M.kod])}</b> modunda ne yapabilirsin?</span><span class="sg-dolap-bant__git">Dolabı aç ${ui('ok', 18)}</span></a></div></aside>`;

    // Süzgeç = Gastro tarif listesi sol paneli BİREBİR (H18): .lst-side > .sheet-head · form > .sheet-body (.fil-top · .fct …) · .sheet-foot;
    // ≤1024 alttan açılan sayfa (.lst-side.open + .sheet-overlay.open). Stil tamamen Gastro tarif-liste.css (+ p1/tarifler.css, p4-f);
    // davranış katalog.js (sunucusuz). data-bound="1": Gastro app.js'in "onay kutusu değişince formu gönder" bağını kurmaması için.
    const sureN = (dk) => liste.filter((x) => { const s = (x.t.hazirlik_dk || 0) + (x.t.pisirme_dk || 0); return s && s <= dk; }).length;
    const fct = ({ grup, ad, ikon = '', govde, sinif = '' }) => `<div class="fct${sinif ? ' ' + sinif : ''} open" data-group="${grup}">
    <button class="fct-head" type="button" aria-expanded="true">${ikon ? `<i class="fa-solid fa-${ikon} fct-head-ico" aria-hidden="true"></i>` : ''} ${ad} <span class="fct-dot">0</span><i class="fa-solid fa-chevron-down fct-car" aria-hidden="true"></i></button>
    <div class="fct-body">${govde}</div>
   </div>`;
    const GORUNEN = 8; // Gastro: grup başına 8 satır, kalanı "N seçenek daha"
    const katGovde = kategoriler.map(([k, n], i) => o.satir({ tur: 'checkbox', ad: 'kat', deger: k, etiket: o.katAd(k), sayi: n, thumb: KAT_THUMB[k] || '', xtra: i >= GORUNEN })).join('')
      + (kategoriler.length > GORUNEN ? `<button class="fct-more" type="button" data-more="${kategoriler.length - GORUNEN} seçenek daha" data-less="Daha az göster">${kategoriler.length - GORUNEN} seçenek daha <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>` : '');
    const temizle = (ek = '') => `<a class="fil-clear" href="${M.dosya}" data-sg-temizle${ek}>`;
    const filtre = `<aside class="lst-side" id="lstSide" aria-label="Tarif filtreleri">
  <div class="sheet-head">
   <h3><i class="fa-solid fa-sliders" aria-hidden="true"></i> Filtrele</h3>
   <div class="sh-right">${temizle()}Temizle</a><button class="sheet-close" id="sheetClose" type="button" aria-label="Filtre panelini kapat"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>
  </div>
  <form method="GET" action="${M.dosya}" data-facet-form data-bound="1" data-sg-filtre>
   <div class="sheet-body">
   <div class="fil-top"><h3><i class="fa-solid fa-sliders" aria-hidden="true"></i> Filtreler</h3></div>
   ${fct({ grup: 'ara', ad: 'Ara', ikon: 'magnifying-glass', sinif: 'sg-fct-ara', govde: `<label class="sg-fct-ara__alan"><span class="sg-gizli">Tariflerde ara</span><input type="search" name="q" placeholder="Tarif adı ya da malzeme" autocomplete="off"></label>` })}
   ${fct({ grup: 'kategori', ad: 'Kategori', sinif: 'cat-fct', govde: katGovde })}
   ${fct({ grup: 'sure', ad: 'Süre', ikon: 'clock', govde: [['', 'Tümü', liste.length], ['30', '30 dk ve altı', sureN(30)], ['60', '60 dk ve altı', sureN(60)]].map(([v, a, n], i) => o.satir({ tur: 'radio', ad: 'sure', deger: v, etiket: a, sayi: n, secili: i === 0 })).join('') })}
   ${M.kod !== 'alerji' ? fct({ grup: 'ikame', ad: 'Akıllı İkame', ikon: 'right-left', govde: o.satir({ tur: 'checkbox', ad: 'ikamesiz', deger: '1', etiket: 'Yalnız ikame gerektirmeyenler', sayi: liste.length - ikameli }) }) : ''}
   </div>
   <div class="sheet-foot">${temizle(' data-f-ayak')}Tümünü Temizle</a></div>
  </form>
 </aside>
 <div class="sheet-overlay" id="sheetOverlay"></div>`;

    const SIRA = [['onerilen', 'Önerilen', 'wand-magic-sparkles'], ['puan', 'En Çok Puanlanan', 'star'], ['hizli', 'En Hızlı', 'bolt'], ['az', 'A–Z', 'arrow-down-a-z']];
    const izgara = `<section class="sg-liste-sec" data-renk="${M.renk}" aria-labelledby="tf-${M.kod}">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Tarifler', baslik: `${esc(o.SEKME[M.kod])} moduna uygun tarifler`, alt: 'Dada Gastro tariflerinden bu modun kuralına uyanlar. Karttaki rozetler mod uyumunu ve uygulanan akıllı ikameyi gösterir.', id: `tf-${M.kod}` })}
  <div class="lst-layout" data-sg-katalog data-mod="${M.kod}">
   ${filtre}
   <div class="lst-main">
    <div class="lst-bar">
     <p class="lst-sum" id="lstSum" role="status" aria-live="polite"><b data-sg-sonuc>${liste.length} tarif</b> bulundu</p>
     <div class="lst-tools">
      <button class="btn-filter" id="btnFilter" type="button" aria-controls="lstSide" aria-expanded="false"><i class="fa-solid fa-sliders" aria-hidden="true"></i> Filtrele <span class="fb-count" id="filCount" hidden>0</span></button>
      <div class="vw-seg" id="vwSeg" data-view-seg role="group" aria-label="Görünüm"><button class="vs-btn is-on" type="button" data-view="grid" data-view-target="lstGrid" aria-label="Kafes görünümü" aria-pressed="true"><i class="fa-solid fa-table-cells-large" aria-hidden="true"></i></button><button class="vs-btn" type="button" data-view="list" data-view-target="lstGrid" aria-label="Liste görünümü" aria-pressed="false"><i class="fa-solid fa-list" aria-hidden="true"></i></button></div>
      <div class="sort-dd" id="sortDd">
       <button class="sort-btn" id="sortBtn" type="button" aria-haspopup="true" aria-expanded="false"><i class="fa-solid fa-arrow-down-wide-short" aria-hidden="true"></i><span class="sb-lbl">Sıralama:</span> <span id="sortCur">${SIRA[0][1]}</span> <i class="fa-solid fa-chevron-down sb-car" aria-hidden="true"></i></button>
       <div class="sort-menu" role="menu">${SIRA.map(([v, a, ik], i) => `<button type="button"${i ? '' : ' class="active"'} role="menuitem" data-sg-sirala="${v}"><i class="fa-solid fa-${ik}" aria-hidden="true"></i> ${a}</button>`).join('')}</div>
      </div>
     </div>
    </div>
    <div class="lst-grid" id="lstGrid" data-sg-izgara>${liste.map((x, i) => o.tarifKart(x.t, x.r, M, { sira: i })).join('')}</div>
    <div class="lst-empty" data-sg-bos><h3>Bu süzgeçle tarif kalmadı</h3><p>Filtreleri gevşetin ya da alerjen seçiminizi gözden geçirin.</p>${temizle()}Filtreleri temizle</a></div>
    <nav class="pagi sg-pagi" data-sg-sayfala aria-label="Sayfalama"></nav>
   </div>
  </div>
 </div>
</section>`;

    const makaleler = (ic.makaleler || []).slice(0, 3);
    const gorselHavuzu = liste.filter((x) => x.t.slug !== sahne?.slug).slice(3, 30);
    const bilgi = makaleler.length ? `<section class="sg-bolum sg-bolum--beyaz" aria-labelledby="bl-${M.kod}">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Bilgi', baslik: 'Okumaya değer', alt: 'Mutfakta işe yarayan kısa notlar.', id: `bl-${M.kod}`, sag: `<a class="sg-bag" href="saglik-bilgi.html?mod=${M.kod}">Tüm yazılar</a>` })}
  <div class="sg-izgara sg-izgara--3s sg-esit">${makaleler.map((a, i) => {
    const g = gorselHavuzu[i * 7] || gorselHavuzu[0];
    return `<a class="sg-kart sg-makale" href="saglik-yazi-${esc(a.slug)}.html" data-renk="${M.renk}">
     <div class="sg-makale__medya">${g ? o.foto(o.tarifGorsel(g.t), '') : ''}<span class="sg-makale__sure">${esc(a.okuma_dk || 3)} dk okuma</span></div>
     <div class="sg-kart__govde"><h3>${esc(a.baslik)}</h3><p>${esc(a.ozet)}</p><span class="sg-kart__alt">Oku ${ui('ok', 18)}</span></div>
    </a>`; }).join('')}</div>
 </div>
</section>` : '';

    const ss = (ic.sss || []).length ? `<section class="sg-bolum" data-varlik-serbest="SSS akordeonu: yardımcı metin bölümü (Kids V2 kararı)" aria-labelledby="ss-${M.kod}">
 <div class="wrap sg-dar">
  ${o.bolumBasi({ ust: 'SSS', baslik: 'Sık sorulan sorular', id: `ss-${M.kod}` })}
  ${o.sss(ic.sss, { onek: `${M.kod}-sss`, renk: M.renk })}
 </div>
</section>` : '';

    const bilgiDosya = M.dosya.replace('.html', '-bilgi.html');
    const sekmeler = (aktif) => `<section class="sg-sekme-bolum" aria-label="${esc(M.ad)} sekmeleri"><div class="wrap"><nav class="disc-tabs sg-sekmeler">`
      + `<a class="dt${aktif === 'tarif' ? ' active' : ''}" data-renk="${M.renk}" href="${M.dosya}" data-sg-sekme="tarif"${aktif === 'tarif' ? ' aria-current="page"' : ''}><i class="fa-solid fa-utensils" aria-hidden="true"></i>Tarifler (${liste.length})</a>`
      + `<a class="dt${aktif === 'bilgi' ? ' active' : ''}" data-renk="${M.renk}" href="${bilgiDosya}" data-sg-sekme="bilgi"${aktif === 'bilgi' ? ' aria-current="page"' : ''}><i class="fa-solid fa-circle-info" aria-hidden="true"></i>Bilgilendirme</a>`
      + `</nav></div></section>`;
    const bilgiSonu = `<aside class="sg-dolap-bant" data-renk="${M.renk}"><div class="wrap"><a href="${M.dosya}">${ui('kitap', 22)}<span><b>${esc(o.SEKME[M.kod])}</b> moduna uygun ${liste.length} tarif</span><span class="sg-dolap-bant__git">Tariflere git ${ui('ok', 18)}</span></a></div></aside>`;
    // İki sekmenin içeriği iki sayfada da var; sekme tıklanınca sayfa yenilenmeden panel değişir (saglik.js sekmeKur), adres paylaşılabilir kalır
    const paneller = (aktif) => `<div class="sg-sekme-panel" data-sg-sekme-panel="tarif"${aktif === 'tarif' ? '' : ' hidden'}>\n${[alerjenSecici, dolapBant, izgara].join('\n')}\n</div>\n`
      + `<div class="sg-sekme-panel" data-sg-sekme-panel="bilgi"${aktif === 'bilgi' ? '' : ' hidden'}>\n${[kural, riskli, ikame, bilgi, o.partnerBolumu(M), ss, bilgiSonu].join('\n')}\n</div>`;
    return [{
      dosya: M.dosya, baslik: `${M.ad} — Tarifler · Dada Gastro Health (prototip)`,
      aciklama: `${M.slogan} ${liste.length} uyumlu Dada Gastro tarifi ve akıllı ikameler.`,
      main: o.sayfa([hero, sekmeler('tarif'), paneller('tarif')].join('\n'), M.kod),
      css: ['mod'], js: ['katalog'], gorsel: sahne ? o.tarifSahne(sahne) : '',
    }, {
      dosya: bilgiDosya, baslik: `${M.ad} — Bilgilendirme · Dada Gastro Health (prototip)`,
      aciklama: `${M.slogan} Kimler için, sistem kuralı, riskli malzemeler, akıllı ikame, yazılar ve sık sorulan sorular.`,
      main: o.sayfa([hero, sekmeler('bilgi'), paneller('bilgi')].join('\n'), M.kod),
      css: ['mod'], js: ['katalog'], gorsel: sahne ? o.tarifSahne(sahne) : '',
    }];
  });
}
