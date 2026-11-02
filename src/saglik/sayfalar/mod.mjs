// Altı mod sayfası (alt sekme). Kids alt sekmesi × Gastro reklam seçki sayfası hibriti (tasks/saglik-plan.md §4).
export default async function (o) {
  const { esc, ui, MODLAR, ESLESME, SAHNE, icerik } = o;
  return MODLAR.map((M) => {
    const liste = ESLESME[M.kod];
    const ic = (icerik.modlar || {})[M.kod] || {};
    const sahne = SAHNE[M.kod];
    const ikameli = liste.filter((x) => x.r.ikameler.length).length;
    const kategoriler = [...new Set(liste.map((x) => x.t.kategori[0]).filter(Boolean))]
      .map((k) => [k, liste.filter((x) => x.t.kategori[0] === k).length]).sort((a, b) => b[1] - a[1]);

    const kimler = `<aside class="sg-secki-kutu" aria-labelledby="km-${M.kod}">
     <h2 id="km-${M.kod}">Kimler için?</h2>
     <ul class="sg-tikli">${M.kimler.map((k) => `<li>${ui('tik', 18)}<span>${esc(k)}</span></li>`).join('')}</ul>
    </aside>`;

    const hero = o.seckiHero({
      M, sahne: sahne ? o.tarifSahne(sahne) : '', sahneAlt: sahne ? `${sahne.baslik.split('|')[0].trim()} — bu moda uygun bir Dada Gastro tarifi` : '',
      kirinti: [['Dada Gastro Sağlık', 'saglik.html'], [M.ad]], eyebrow: 'Sağlık modu', baslik: esc(M.ad),
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
  <ul class="sg-riskli" data-renk="${M.renk}">${M.riskli.map(([a, n]) => `<li class="sg-riskli__oge"><span class="sg-riskli__ikon">${ui('uyari', 18)}</span><span class="sg-riskli__ad">${esc(a)}</span><span class="sg-riskli__neden">${esc(n)}</span></li>`).join('')}</ul>
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

    const filtre = `<aside class="sg-filtre" id="sgFiltre-${M.kod}" aria-label="Tarif filtreleri">
  <div class="sg-filtre__ust"><h2>${ui('filtre', 20)} Filtrele</h2><button type="button" class="sg-filtre__kapat sg-btn sg-btn--hafif sg-btn--kucuk">Kapat</button></div>
  <form data-sg-filtre>
   <label class="sg-ara"><span class="sg-gizli">Tariflerde ara</span>${ui('ara', 18)}<input type="search" name="q" placeholder="Tariflerde ara" autocomplete="off"></label>
   <fieldset><legend>Süre</legend><div class="sg-satirlar">${[['', 'Tümü'], ['30', '30 dk ve altı'], ['60', '60 dk ve altı']].map(([v, a], i) => o.satir({ tur: 'radio', ad: 'sure', deger: v, etiket: a, secili: i === 0 })).join('')}</div></fieldset>
   ${M.kod !== 'alerji' ? `<fieldset><legend>İkame</legend><div class="sg-satirlar">${o.satir({ tur: 'checkbox', ad: 'ikamesiz', deger: '1', etiket: 'Yalnız ikame gerektirmeyenler' })}</div></fieldset>` : ''}
   <fieldset><legend>Kategori</legend><div class="sg-satirlar">${kategoriler.map(([k, n]) => o.satir({ tur: 'checkbox', ad: 'kat', deger: k, etiket: o.katAd(k), sayi: n })).join('')}</div></fieldset>
   <button type="reset" class="sg-btn sg-btn--hafif sg-btn--kucuk sg-filtre__temizle">Filtreleri temizle</button>
  </form>
 </aside>`;

    const izgara = `<section class="sg-liste-sec" data-renk="${M.renk}" aria-labelledby="tf-${M.kod}">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Tarifler', baslik: `${esc(o.SEKME[M.kod])} moduna uygun tarifler`, alt: 'Dada Gastro tariflerinden bu modun kuralına uyanlar. Kartta uyum rozeti ve uygulanan ikame yazar.', id: `tf-${M.kod}` })}
  <div class="sg-liste" data-sg-katalog data-mod="${M.kod}">
   ${filtre}
   <div class="sg-liste__ana">
    <div class="sg-sonuc-bar"><b data-sg-sonuc>${liste.length} tarif</b><div><button type="button" class="sg-filtre-ac sg-btn sg-btn--hafif sg-btn--kucuk" aria-controls="sgFiltre-${M.kod}" aria-expanded="false">${ui('filtre', 18)} Filtrele</button><label><span class="sg-gizli">Sırala</span><select class="sg-sec" data-sg-sirala><option value="onerilen">Önerilen</option><option value="hizli">En hızlı</option><option value="az">A–Z</option></select></label></div></div>
    <div class="sg-izgara sg-izgara--tarif" data-sg-izgara>${liste.map((x, i) => o.tarifKart(x.t, x.r, M, { alerjenGoster: M.kod === 'alerji', sira: i })).join('')}</div>
    <div class="sg-bos" data-sg-bos hidden><h3>Bu süzgeçle tarif kalmadı</h3><p>Filtreleri gevşetin ya da alerjen seçiminizi gözden geçirin.</p></div>
    <div class="sg-daha"><button type="button" class="sg-btn" data-sg-daha>Daha fazla göster</button></div>
   </div>
  </div>
 </div>
</section>`;

    const makaleler = (ic.makaleler || []).slice(0, 3);
    const gorselHavuzu = liste.filter((x) => x.t.slug !== sahne?.slug).slice(3, 30);
    const bilgi = makaleler.length ? `<section class="sg-bolum sg-bolum--beyaz" aria-labelledby="bl-${M.kod}">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Bilgi', baslik: 'Okumaya değer', alt: 'Mutfakta işe yarayan kısa notlar.', id: `bl-${M.kod}`, sag: `<a class="sg-bag" href="saglik-bilgi.html#${M.kod}">Tüm yazılar</a>` })}
  <div class="sg-izgara sg-izgara--3s sg-esit">${makaleler.map((a, i) => {
    const g = gorselHavuzu[i * 7] || gorselHavuzu[0];
    return `<a class="sg-kart sg-makale" href="saglik-bilgi.html#${esc(a.slug)}" data-renk="${M.renk}">
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

    const main = o.sayfa([hero, alerjenSecici, kural, riskli, ikame, dolapBant, izgara, bilgi, o.partnerBolumu(M), ss].join('\n'), M.kod);
    return {
      dosya: M.dosya, baslik: `${M.ad} — Dada Gastro Sağlık (prototip)`,
      aciklama: `${M.slogan} ${liste.length} uyumlu Dada Gastro tarifi, akıllı ikameler ve sık sorulan sorular.`,
      main, css: ['mod'], js: ['katalog'], gorsel: sahne ? o.tarifSahne(sahne) : '',
    };
  });
}
