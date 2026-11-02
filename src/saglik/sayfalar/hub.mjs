// Hub: saglik.html — "Modunu seç" girişi, 6 mod kaydırıcısı, nasıl çalışır, Dolap bandı, kısa okumalar (dama tahtası).
export default async function (o) {
  const { esc, ui, MODLAR, ESLESME, SAHNE, icerik } = o;
  const hub = icerik.hub || {};
  const toplam = o.KULLANILAN.size;
  const ikameToplam = new Set(MODLAR.flatMap((M) => ESLESME[M.kod].filter((x) => x.r.ikameler.length).map((x) => x.t.slug))).size;
  const hubSahne = o.HUB_SAHNE;

  const sec = `<aside class="sg-secki-kutu sg-mod-sec" aria-labelledby="msec">
   <h2 id="msec">Modunu seç</h2>
   <p class="sg-ikincil">Bir mod seç; tarifler, ikameler ve Dolap bu moda göre süzülsün.</p>
   <div class="sg-mod-sec__liste">${MODLAR.map((M) => `<a class="sg-mod-sec__oge" href="${M.dosya}" data-renk="${M.renk}" data-sg-mod-sec="${M.kod}"><span class="sg-mod-sec__ikon">${o.modIkon(M, 24)}</span><span>${esc(o.SEKME[M.kod])}</span>${ui('ok', 16)}</a>`).join('')}</div>
  </aside>`;

  const hero = o.seckiHero({
    M: null, sahne: hubSahne ? o.tarifSahne(hubSahne) : '', sahneAlt: hubSahne ? `${hubSahne.baslik.split('|')[0].trim()} — altı modun beşine uyan bir Dada Gastro tarifi` : '',
    kirinti: [['Dada Gastro Health']], eyebrow: 'Dada Gastro Health', baslik: esc(hub.baslik || 'Sofranı yaşam moduna göre kur'),
    giris: esc(hub.giris || 'Çölyak, diyabet, gıda alerjisi, süt hassasiyeti, hassas bağırsak ya da kalp sağlığı: Dada Gastro tariflerini senin moduna göre süzer, gerekirse malzemeyi akıllıca değiştirir.'),
    istatistik: [['6', 'yaşam modu'], [String(toplam), 'uyumlu tarif'], [String(ikameToplam), 'akıllı ikameli']], not: o.UYARI, sag: o.kurumKutusu(MODLAR.map((M) => o.partnerListe(M.kod).find((p) => o.partnerLogo(p))).filter(Boolean)),
  });

  // H16: 6 mod tek satır kaydırıcı (Gastro .row-track/.row-nav kalıbı; ok + yatay kaydırma + scroll-snap). Kompakt kart: görsel, kurum ikonu, ad, kısa slogan, sayılar.
  const modKart = (M) => {
    const t = SAHNE[M.kod];
    return `<li><a class="sg-mkart" href="${M.dosya}" data-renk="${M.renk}" data-sg-mod-sec="${M.kod}">
    <span class="sg-mkart__medya">${t ? o.foto(o.tarifGorsel(t), `${t.baslik.split('|')[0].trim()} — ${M.ad} moduna uygun`, { gen: 480, yuk: 300 }) : ''}<span class="sg-mkart__ikon">${o.modIkon(M, 26)}</span></span>
    <span class="sg-mkart__govde"><span class="sg-mkart__ad">${esc(M.ad)}</span><span class="sg-mkart__slogan">${esc(M.slogan)}</span><span class="sg-mkart__sayi"><b>${ESLESME[M.kod].length}</b> tarif · <b>${M.ikameKart.length}</b> ikame</span></span>
   </a></li>`;
  };
  const modlar = `<section class="sg-bolum sg-modlar" id="modlar" aria-labelledby="mh">
 <div class="wrap sg-kaydirici" data-sg-kaydirici>
  ${o.bolumBasi({ ust: 'Altı mod', baslik: 'Hangi mod senin için?', alt: 'Her mod kendi kuralıyla çalışır: neyin gizleneceğini, neyin önerileceğini ve hangi malzemenin neyle değiştirileceğini bilir.', id: 'mh', sag: o.kaydirOklari('sg-mod-iz', 'modlar') })}
  <ul class="sg-kaydirici__iz sg-mkart-iz" id="sg-mod-iz">${MODLAR.map(modKart).join('')}</ul>
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

  const bilgiKart = MODLAR.map((M) => [M, ((icerik.modlar || {})[M.kod] || {}).makaleler?.[0]]).filter(([, a]) => a);
  // H15: Gastro mutfağa giriş "konu" ızgarası (.topic-grid/.topic-card) — dama tahtası: dolu kart kendi modunun kurum renginin açık tonu (--r-a), diğeri beyaz.
  const bilgi = bilgiKart.length ? `<section class="sg-bolum sg-okumalar" aria-labelledby="bk">
 <div class="wrap">
  ${o.bolumBasi({ ust: 'Bilgi kartları', baslik: 'Her mod için kısa okumalar', id: 'bk', sag: '<a class="sg-bag" href="saglik-bilgi.html">Tüm yazılar</a>' })}
  <div class="sg-konu-izgara">${bilgiKart.map(([M, a]) => `<a class="sg-konu-kart" href="saglik-yazi-${esc(a.slug)}.html" data-renk="${M.renk}">
    <span class="sg-konu-kart__mod">${ui(M.ikon, 16)}${esc(o.SEKME[M.kod])}</span>
    <h3>${esc(a.baslik)}</h3>
    <p>${esc(a.ozet)}</p>
    <div class="disc-meta"><span><i class="fa-solid fa-clock" aria-hidden="true"></i> ${esc(a.okuma_dk || 3)} dk okuma</span></div>
    <span class="sg-konu-kart__git">Yazıyı oku <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
   </a>`).join('')}</div>
 </div>
</section>` : '';

  const dolapBant = `<aside class="sg-dolap-bant"><div class="wrap"><a href="saglik-dolap.html">${ui('dolap', 22)}<span>Elindeki malzemelerle moduna uygun ne yapabilirsin?</span><span class="sg-dolap-bant__git">Dolabı aç ${ui('ok', 18)}</span></a></div></aside>`;

  return [{
    dosya: 'saglik.html', baslik: 'Dada Gastro Health — yaşam modlarına göre tarifler (prototip)',
    aciklama: 'Glutensiz, kan şekeri dostu, alerjene göre, sütsüz, düşük FODMAP ve kalp dostu Dada Gastro tarifleri; akıllı ikamelerle.',
    main: o.sayfa([hero, modlar, nasil, dolapBant, bilgi].join('\n'), 'hub'),
    css: ['mod', 'ana'], js: [], gorsel: hubSahne ? o.tarifSahne(hubSahne) : '',
  }];
}
