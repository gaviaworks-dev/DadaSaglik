// Hub: saglik.html — 6 modun kartları, "Modunu seç" girişi, nasıl çalışır, öne çıkan tarifler, bilgi kartları.
export default async function (o) {
  const { esc, ui, MODLAR, ESLESME, SAHNE, icerik } = o;
  const hub = icerik.hub || {};
  const toplam = o.KULLANILAN.size;
  const ikameToplam = new Set(MODLAR.flatMap((M) => ESLESME[M.kod].filter((x) => x.r.ikameler.length).map((x) => x.t.slug))).size;
  const hubSahne = o.HUB_SAHNE;
  const sahneSlug = new Set(o.SAHNE_SLUGLARI);

  const sec = `<aside class="sg-secki-kutu sg-mod-sec" aria-labelledby="msec">
   <h2 id="msec">Modunu seç</h2>
   <p class="sg-ikincil">Bir mod seç; tarifler, ikameler ve Dolap bu moda göre süzülsün.</p>
   <div class="sg-mod-sec__liste">${MODLAR.map((M) => `<a class="sg-mod-sec__oge" href="${M.dosya}" data-renk="${M.renk}" data-sg-mod-sec="${M.kod}"><span class="sg-mod-sec__ikon">${o.modIkon(M, 24)}</span><span>${esc(o.SEKME[M.kod])}</span>${ui('ok', 16)}</a>`).join('')}</div>
  </aside>`;

  const hero = o.seckiHero({
    M: null, sahne: hubSahne ? o.tarifSahne(hubSahne) : '', sahneAlt: hubSahne ? `${hubSahne.baslik.split('|')[0].trim()} — altı modun beşine uyan bir Dada Gastro tarifi` : '',
    kirinti: [['Dada Gastro Sağlık']], eyebrow: 'Dada Gastro Sağlık', baslik: esc(hub.baslik || 'Sofranı yaşam moduna göre kur'),
    giris: esc(hub.giris || 'Çölyak, diyabet, gıda alerjisi, süt hassasiyeti, hassas bağırsak ya da kalp sağlığı: Dada Gastro tariflerini senin moduna göre süzer, gerekirse malzemeyi akıllıca değiştirir.'),
    istatistik: [['6', 'yaşam modu'], [String(toplam), 'uyumlu tarif'], [String(ikameToplam), 'akıllı ikameli']], not: o.UYARI, logolar: o.logoSeridi(MODLAR.map((M) => o.partnerListe(M.kod).find((p) => o.partnerLogo(p))).filter(Boolean)),
  });

  const modKart = (M) => {
    const t = SAHNE[M.kod];
    return `<a class="sg-kart sg-mod-kart sg-gir" href="${M.dosya}" data-renk="${M.renk}">
   <div class="sg-mod-kart__medya">${t ? o.foto(o.tarifGorsel(t), `${t.baslik.split('|')[0].trim()} — ${M.ad} moduna uygun`) : ''}<span class="sg-mod-kart__ikon">${o.modIkon(M, 36)}</span></div>
   <div class="sg-kart__govde"><h3>${esc(M.ad)}</h3><p>${esc(M.slogan)}</p><p class="sg-mod-kart__sayi"><b>${ESLESME[M.kod].length}</b> uyumlu tarif · <b>${M.ikameKart.length}</b> akıllı ikame</p><span class="sg-kart__alt">Moda git ${ui('ok', 18)}</span></div>
  </a>`;
  };
  const modlar = `<section class="sg-bolum" id="modlar" aria-labelledby="mh">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Altı mod', baslik: 'Hangi mod senin için?', alt: 'Her mod kendi kuralıyla çalışır: neyin gizleneceğini, neyin önerileceğini ve hangi malzemenin neyle değiştirileceğini bilir.', id: 'mh' })}
  <div class="sg-izgara sg-izgara--3 sg-esit">${MODLAR.map(modKart).join('')}</div>
 </div>
</section>`;

  const adimlar = (hub.nasil && hub.nasil.length === 3) ? hub.nasil : [
    { baslik: 'Modunu seç', metin: 'Altı moddan sana uyanı seç; alerjin varsa alerjenini de işaretle.' },
    { baslik: 'Uygun tarifleri gör', metin: 'Her tarifin malzemesi modun kuralına göre tek tek kontrol edilir; emin olunamayan tarif listelenmez.' },
    { baslik: 'İkameyle pişir', metin: 'Gerekiyorsa kart hangi malzemenin neyle değiştirildiğini söyler; tarif detayında liste buna göre gelir.' },
  ];
  const nasil = `<section class="sg-bolum sg-bolum--beyaz" aria-labelledby="ns">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Nasıl çalışır', baslik: 'Üç adımda moduna uygun sofra', id: 'ns' })}
  <ol class="sg-izgara sg-izgara--3s sg-esit sg-adimlar">${adimlar.map((a, i) => `<li class="sg-kart sg-adim"><span class="sg-adim__ust"><span class="sg-adim__no" aria-hidden="true">${i + 1}</span><span class="sg-adim__ikon">${ui(['kalkan', 'ara', 'arti'][i], 28)}</span></span><h3>${esc(a.baslik)}</h3><p>${esc(a.metin)}</p></li>`).join('')}</ol>
 </div>
</section>`;

  // öne çıkan: modlardan sırayla, tekrarsız 8 tarif
  const one = []; const al = new Set(); let i = 0;
  while (one.length < 8 && i < 40) { for (const M of MODLAR) { const x = ESLESME[M.kod].filter((y) => !al.has(y.t.slug) && !sahneSlug.has(y.t.slug))[Math.floor(i / 1)]; if (x && one.length < 8 && !al.has(x.t.slug)) { al.add(x.t.slug); one.push([x, M]); } } i++; }
  const oneCikan = `<section class="sg-bolum" aria-labelledby="oc">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Öne çıkanlar', baslik: 'Modlardan seçilmiş tarifler', alt: 'Her kart hangi moda uyduğunu ve uygulanan ikameyi gösterir.', id: 'oc' })}
  <div class="sg-izgara sg-izgara--4">${one.map(([x, M], n) => o.tarifKart(x.t, x.r, M, { sira: n })).join('')}</div>
 </div>
</section>`;

  const bilgiKart = MODLAR.map((M) => [M, ((icerik.modlar || {})[M.kod] || {}).makaleler?.[0]]).filter(([, a]) => a);
  const bilgi = bilgiKart.length ? `<section class="sg-bolum sg-bolum--beyaz" aria-labelledby="bk">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Bilgi kartları', baslik: 'Her mod için kısa okumalar', id: 'bk', sag: '<a class="sg-bag" href="saglik-bilgi.html">Tüm yazılar</a>' })}
  <div class="sg-izgara sg-izgara--3 sg-esit">${bilgiKart.map(([M, a]) => `<a class="sg-kart sg-bilgi-kart" href="saglik-bilgi.html#${esc(a.slug)}" data-renk="${M.renk}"><span class="sg-bilgi-kart__mod">${ui(M.ikon, 18)}${esc(o.SEKME[M.kod])}</span><h3>${esc(a.baslik)}</h3><p>${esc(a.ozet)}</p><span class="sg-kart__alt">${esc(a.okuma_dk || 3)} dk okuma ${ui('ok', 18)}</span></a>`).join('')}</div>
 </div>
</section>` : '';

  const dolapBant = `<aside class="sg-dolap-bant"><div class="wrap"><a href="saglik-dolap.html">${ui('dolap', 22)}<span>Elindeki malzemelerle moduna uygun ne yapabilirsin?</span><span class="sg-dolap-bant__git">Dolabı aç ${ui('ok', 18)}</span></a></div></aside>`;

  return [{
    dosya: 'saglik.html', baslik: 'Dada Gastro Sağlık — yaşam modlarına göre tarifler (prototip)',
    aciklama: 'Glutensiz, kan şekeri dostu, alerjene göre, sütsüz, düşük FODMAP ve kalp dostu Dada Gastro tarifleri; akıllı ikamelerle.',
    main: o.sayfa([hero, modlar, nasil, oneCikan, dolapBant, bilgi].join('\n'), 'hub'),
    css: ['mod'], js: [], gorsel: hubSahne ? o.tarifSahne(hubSahne) : '',
  }];
}
