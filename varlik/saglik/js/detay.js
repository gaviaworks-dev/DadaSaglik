/* Tarif detayı (?t=<slug>&mod=<kod>) — Gastro tarif detayının BİREBİR şablonu (donör: src/donor/tarif-balkabagi.html <main>):
   section.rd-top (rd-crumb · rd-gallery: rd-stage + kunye-col · rd-head) → section.rd-body (rd-cols: rd-main adımlar, hatırlatma,
   besin, paylaş, değerlendirme · rd-aside malzeme paneli) → section.sec.simrec (Benzer Tarifler, Gastro r-card).
   Tek ek: .rd-badges içinde Gastro'nun .tbadge.t-diyet rozetiyle mod etiketi. Akıllı ikame malzeme satırının içinde.
   Çizimden sonra Gastro'nun kendi detay betikleri (porsiyon, yazı boyu, işaretleme, kopyala, ray okları) yüklenir.
   Veri: varlik/saglik/veri/tarifler.json + detay-ek.json (kategori adı, puan, değerlendirme, besin, beslenme, mutfak bayrağı). */
(function () {
  'use strict';
  var yer = document.querySelector('[data-sg-detay]'); if (!yer) return;
  var q = new URLSearchParams(location.search), slug = q.get('t'), istenen = q.get('mod');
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var fa = function (ad, sinif) { return '<i class="' + (sinif || 'fa-solid') + ' fa-' + ad + '" aria-hidden="true"></i>'; };
  var MARKA = 'Dada Gastro Health';
  var KESIR = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
  function sayi(x) {
    if (x === '' || x == null) return ''; var n = Number(x); if (isNaN(n)) return String(x);
    var t = Math.floor(n), k = Math.round((n - t) * 4) / 4;
    if (n - t < 0.01) return String(t);
    if (KESIR[k] && Math.abs(n - t - k) < 0.01) return (t ? t + ' ' : '') + KESIR[k];
    return String(Number(n.toFixed(2))).replace('.', ',');
  }
  var trSlug = function (s) { return String(s || '').toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var ETIKET = { gram: 'g', ml: 'ml' };
  function yildiz(p) {
    var d = Math.floor(p), y = p - d >= 0.5 ? 1 : 0, h = '';
    for (var i = 0; i < d; i++) h += ' ' + fa('star');
    if (y) h += ' ' + fa('star-half-stroke');
    for (var j = d + y; j < 5; j++) h += ' ' + fa('star', 'fa-regular');
    return '<span class="stars">' + h + ' </span>';
  }
  var KURAL = '{"birimler":{"adet":"sayilabilir","dis":"sayilabilir","paket":"sayilabilir","dilim":"sayilabilir","demet":"sayilabilir","yemek-kasigi":"olcek","tatli-kasigi":"olcek","cay-kasigi":"olcek","su-bardagi":"olcek","cay-bardagi":"olcek","kahve-fincani":"olcek","gram":"kucuk","ml":"kucuk","kg":"buyuk","l":"buyuk","tutam":"olceklenmez"},"birimsiz":"sayilabilir","aciklama_birimleri":{"l":"ondalik","lt":"ondalik","litre":"ondalik"},"bilinmeyen":"olcek","kurallar":{"sayilabilir":{"adimlar":[[null,1]],"en_az":1},"olcek":{"adimlar":[[3,0.25],[10,0.5],[null,1]],"en_az":0.25},"kucuk":{"adimlar":[[10,1],[100,5],[null,10]],"en_az":1},"buyuk":{"adimlar":[[null,0.1]],"en_az":0.1,"alt_sinir":1,"alt_birim":{"kg":"gram","l":"ml"},"alt_carpan":1000},"ondalik":{"adimlar":[[null,0.1]],"en_az":0.1}},"olceklenmez_ifadeler":["göz kararı","isteğe göre"],"etiketler":{"gram":"g","ml":"ml"}}';
  var OLCU = '{"su-bardagi":[["1 su bardağı","≈ 200 ml"]],"cay-bardagi":[["1 çay bardağı","≈ 100 ml"]],"yemek-kasigi":[["1 yemek kaşığı","≈ 15 ml"]],"kahve-fincani":[["1 kahve fincanı","≈ 60 ml"]],"tatli-kasigi":[["1 tatlı kaşığı","≈ 5 ml"]],"cay-kasigi":[["1 çay kaşığı","≈ 4 ml"]]}';
  // Uyarı cümlesi Gastro tr-heceleme.js'in yumuşak tiresinden muaf ([data-a] onun DOKUNMA listesinde): metin taraması birebir bulur.
  var UYARI = 'Bu bilgiler genel bilgilendirme amaçlıdır; tanı ve tedavi için hekiminize danışın.';

  function betikler(liste) {
    // Gastro'nun kendi detay betikleri, donördeki sırayla; içerik çizildikten sonra (her biri öğesi yoksa sessizce döner)
    var i = 0;
    (function sonraki() {
      if (i >= liste.length) return;
      var s = document.createElement('script'); s.src = liste[i++]; s.onload = s.onerror = sonraki; document.body.appendChild(s);
    })();
  }

  var AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  function tarih(x) { var m = String(x || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? (+m[3]) + ' ' + AY[+m[2] - 1] + ' ' + m[1] : ''; }
  var bas = function (s) { return String(s || '').trim().charAt(0).toLocaleUpperCase('tr'); };

  Promise.all([
    fetch('varlik/saglik/veri/tarifler.json').then(function (r) { return r.json(); }),
    fetch('varlik/saglik/veri/detay-ek.json').then(function (r) { return r.json(); })
  ]).then(function (d) {
    var V = d[0], EK = d[1] || {}, t = V.tarifler[slug];
    if (!t) {
      yer.innerHTML = '<div class="wrap"><nav class="rd-crumb" aria-label="Sayfa yolu"><a href="index.html">' + fa('house') + '</a>' + fa('chevron-right') + ' <a href="saglik.html">' + MARKA + '</a>' + fa('chevron-right') + ' <b>Tarif</b></nav>'
        + '<div class="rd-head"><h1>Tarif bulunamadı</h1><p class="rd-sub">Bu tarif hiçbir modun kuralına uymuyor ya da adres hatalı.</p><p style="margin-top:18px"><a class="btn btn-primary" href="saglik.html">' + MARKA + ' ana sayfasına dön</a></p></div></div>';
      return;
    }
    var modlar = Object.keys(V.modlar).filter(function (k) { return V.modlar[k].t[slug]; });
    var mod = modlar.indexOf(istenen) > -1 ? istenen : modlar[0], M = V.modlar[mod], ik = M.t[slug] || [];
    var al = window.DadaSaglik && window.DadaSaglik.alerjenler ? window.DadaSaglik.alerjenler() : [];
    var gizliMi = function (x) { return !!(al && al.length && (x.pk || (x.al || []).some(function (a) { return al.indexOf(a) > -1 || (a === 'gluten-yulaf' && al.indexOf('gluten') > -1); }))); };
    var gizli = gizliMi(t);
    document.title = t.b.split('|')[0].trim() + ' — ' + M.uyum + ' · ' + MARKA + ' (prototip)';
    var sure = t.hz && t.pz ? t.hz + ' dk + ' + t.pz + ' dk' : (t.sure ? t.sure + ' dk' : '');
    var surEt = t.hz && t.pz ? 'Hazırlık + Pişirme' : 'Toplam Süre';
    var pu = t.pu ? Number(t.pu) / 10 : 0, kadlar = t.kad && t.kad.length ? t.kad : (t.ka ? [t.ka] : []);
    var bsl = (t.bsl || []).filter(function (x) { return EK.bes && EK.bes[x]; }).map(function (x) { return [EK.bes[x][0], EK.bes[x][1]]; });
    var bayrak = t.mt && EK.bayrak ? EK.bayrak[trSlug(t.mt)] || '' : '';
    var por = t.p ? t.p + ' ' + (t.pb || 'kişilik') : '';

    // ---------- section.rd-top ----------
    var sef = t.sa || '', sefUrl = t.sk ? 'https://dadagastro.com/sefler/' + encodeURIComponent(t.sk) : '';
    var byline = sef || t.ty ? ' <div class="art-hmeta">' + (sef ? ' <a class="art-hauthor"' + (sefUrl ? ' href="' + sefUrl + '"' : '') + ' title="' + esc(sef) + ' profilini gör"> <span class="av"><span class="av-ini" aria-hidden="true">' + esc(bas(sef)) + '</span></span> <div><b>' + esc(sef) + '</b>' + (t.su ? '<span>' + esc(t.su) + '</span>' : '') + '</div> </a>' : '')
      + (t.ty ? (sef ? ' <span class="art-hsep"></span>' : '') + ' <span class="art-hstat">' + fa('calendar') + ' ' + tarih(t.ty) + '</span>' : '')
      + (t.tg && t.tg !== t.ty ? ' <span class="art-hsep"></span> <span class="art-hstat">' + fa('pen-to-square') + ' Son güncelleme: ' + tarih(t.tg) + '</span>' : '') + ' </div>' : '';
    var rozet = '<span class="tbadge t-diyet">' + fa('circle-check') + ' ' + esc(M.uyum) + ' uygun</span>';
    var rate = pu || t.g ? '<div class="rd-rateline">' + (pu ? ' <span class="rd-stars"> ' + yildiz(pu) + ' <b>' + pu.toFixed(1) + '</b> ' + (t.dg ? '<a href="#yorumlar">' + t.dg + ' değerlendirme</a>' : '') + ' </span>' : '') + (t.g ? ' <span class="r-views">' + fa('eye') + ' ' + Number(t.g).toLocaleString('tr') + ' görüntülenme</span>' : '') + ' </div>' : '';
    var olgular = (por ? '<div class="rdf"> ' + fa('utensils') + ' <div><span>Porsiyon</span><b id="factServ">' + esc(por) + '</b></div> </div>' : '')
      + (sure ? '<div class="rdf"> ' + fa('clock') + ' <div><span>' + surEt + '</span><b> ' + sure + ' </b></div> </div>' : '')
      + (t.z ? '<div class="rdf"> ' + fa('gauge-simple') + ' <div><span>Zorluk</span><b>' + esc(t.z) + '</b></div> </div>' : '');
    var cipler = (kadlar.length ? '<div class="chip-row siniflandirma-cipleri"> ' + kadlar.map(function (k) { return '<a class="chip" href="tarifler.html">' + esc(k) + '</a>'; }).join(' ') + ' </div>' : '')
      + (t.mt ? ' <span class="kcl">Mutfak</span> <div class="chip-row cip-kaydir" data-cip-kaydir> <a class="chip cuisine" href="tarifler.html">' + (bayrak ? ' <img class="chip-flag" src="varlik/gastro/varliklar/flags/' + esc(bayrak) + '.svg" alt="' + esc(t.mt) + ' bayrağı"> ' : '') + esc(t.mt) + ' </a> </div>' : '')
      + (bsl.length ? ' <span class="kcl">Özellikler</span> <div class="chip-row cip-kaydir" data-cip-kaydir> ' + bsl.map(function (b) { return '<a class="chip" href="tarifler.html">' + (b[1] ? fa(b[1]) : '') + esc(b[0]) + '</a>'; }).join(' ') + ' </div>' : '');
    var ust = '<section data-revize="b1-medya" class="rd-top"> <div class="wrap">'
      + ' <nav class="rd-crumb" aria-label="Sayfa yolu"> <a href="index.html">' + fa('house') + '</a>' + fa('chevron-right') + ' <a href="saglik.html">' + MARKA + '</a>' + fa('chevron-right') + ' <a href="' + esc(M.dosya) + '">' + esc(M.kisa) + '</a>' + fa('chevron-right') + ' <b>' + esc(t.b) + '</b> </nav>'
      + ' <div class="rd-gallery"> <div class="rd-stage " id="rdStage" data-cap="' + esc(t.b) + '"> <img class="gastro-tarif-kapak" src="' + esc(t.k) + '" alt="' + esc(t.b) + '" fetchpriority="high" decoding="async">'
      + (t.ka ? ' <span class="r-chip">' + esc(t.ka) + '</span>' : '')
      + ' <div class="rd-stage-info"> <div class="rd-badges"> ' + rozet + ' </div> <h1>' + esc(t.b) + '</h1> ' + rate + ' </div> </div>'
      + ' <aside class="kunye-col" aria-label="Tarif künyesi"> <div class="kc-card"> <div class="kc-olgular" data-cip-kaydir> ' + olgular + ' </div> <div class="kc-chips" data-cip-kaydir> ' + cipler + ' </div> </div> </aside> </div>'
      + ' <div class="rd-head">' + byline + (t.o ? ' <p class="rd-sub">' + esc(t.o) + '</p>' : '') + ' </div> </div> </section>';

    // ---------- section.rd-body ----------
    var adimlar = t.a.map(function (a, i) {
      return '<article class="step-card no-img "> <div class="sc-body"> <span class="sc-num" data-step-label="' + esc(a[0] || (i + 1) + '. adım') + '" role="button">' + (i + 1) + '</span> <div class="step-card__body"> <div class="sc-top"> <h3>' + esc(a[0] || (i + 1) + '. adım') + '</h3> </div> <p>' + esc(a[1]) + '</p> </div> </div> </article>';
    }).join(' ');
    var hat = String(t.h || '').replace(/^\s*Hatırlatma\s*/i, '').trim();
    var notlar = '<div class="remind-box"> <span class="rb-ico">' + fa('bell') + '</span> <div class="rb-body"> <h4>Hatırlatma</h4> <p>' + (hat ? esc(hat) + ' ' : '') + '<span data-a="" data-sg-uyari>' + UYARI + '</span> Paketli ürünlerde etiketi her zaman kontrol edin; içerikler üreticiye göre değişebilir.</p> </div> </div>';
    if (istenen && istenen !== mod && V.modlar[istenen]) notlar += ' <div class="remind-box"> <span class="rb-ico">' + fa('circle-info') + '</span> <div class="rb-body"> <h4>Mod uyumu</h4> <p>Bu tarif <b>' + esc(V.modlar[istenen].kisa) + '</b> modunun kuralına uymuyor; <b>' + esc(M.kisa) + '</b> modundaki hâli gösteriliyor.</p> </div> </div>';
    if (gizli) notlar += ' <div class="remind-box"> <span class="rb-ico">' + fa('triangle-exclamation') + '</span> <div class="rb-body"> <h4>Alerjen süzgeci</h4> <p><b>Dikkat:</b> Bu tarif seçtiğin alerjen süzgecine uymuyor; listelerde gizleniyor.</p> </div> </div>';
    var besin = '';
    if (t.bs) {
      var bo = t.bs, b = [bo.kalori, bo.protein_g, bo.karbonhidrat_g, bo.yag_g, bo.lif_g, bo.seker_g, bo.sodyum_mg, bo.doymus_yag_g], kp = (b[1] || 0) * 4, kk = (b[2] || 0) * 4, ky = (b[3] || 0) * 9, top = kp + kk + ky || 1;
      var yp = Math.round(kp / top * 100), yk = Math.round(kk / top * 100), yy = Math.max(0, 100 - yp - yk);
      var hucre = function (v, br, ad) { return '<div class="nut-cell"><b>' + v + ' <small>' + br + '</small></b><span>' + ad + '</span></div>'; };
      besin = '<div class="nut-card" style="margin-top:34px"> <div class="nut-head"> <h3>' + '<i class="fa-solid fa-heart-pulse" style="color:var(--green)" aria-hidden="true"></i> Besin Değerleri <small class="nh-sub">· 1 porsiyon</small></h3> <span>Değerler tahminidir</span> </div>'
        + ' <div class="nut-grid"> <div class="nut-cell hero-cell"><b>' + b[0] + ' <small>kcal</small></b><span>Kalori</span></div> ' + hucre(b[1], 'g', 'Protein') + hucre(b[2], 'g', 'Karbonhidrat') + hucre(b[3], 'g', 'Yağ') + hucre(b[4], 'g', 'Lif') + hucre(b[5], 'g', 'Şeker') + hucre(b[6], 'mg', 'Sodyum') + hucre(b[7], 'g', 'Doymuş Yağ') + ' </div>'
        + ' <div class="nut-bar" aria-hidden="true"> <i class="nb-p" style="width:' + yp + '%"></i> <i class="nb-c" style="width:' + yk + '%"></i> <i class="nb-f" style="width:' + yy + '%"></i> </div>'
        + ' <div class="nut-legend"> <span><i class="nb-p"></i> Protein %' + yp + '</span> <span><i class="nb-c"></i> Karbonhidrat %' + yk + '</span> <span><i class="nb-f"></i> Yağ %' + yy + '</span> </div> </div>';
    }
    var u = encodeURIComponent(location.href), bt = encodeURIComponent(t.b);
    var paylas = '<div class="tagshare" id="paylas"> <div class="ts-tags"> </div> <div class="ts-share"> <span class="lbl">Paylaş</span>'
      + ' <a class="share-btn fb" href="https://www.facebook.com/sharer/sharer.php?u=' + u + '" target="_blank" rel="noopener" aria-label="Facebook\'ta paylaş">' + fa('facebook-f', 'fa-brands') + '</a>'
      + ' <a class="share-btn xx" href="https://twitter.com/intent/tweet?url=' + u + '&amp;text=' + bt + '" target="_blank" rel="noopener" aria-label="X\'te paylaş">' + fa('x-twitter', 'fa-brands') + '</a>'
      + ' <a class="share-btn wa" href="https://wa.me/?text=' + bt + '%20' + u + '" target="_blank" rel="noopener" aria-label="WhatsApp\'ta paylaş">' + fa('whatsapp', 'fa-brands') + '</a>'
      + ' <a class="share-btn tg" href="https://t.me/share/url?url=' + u + '&amp;text=' + bt + '" target="_blank" rel="noopener" aria-label="Telegram\'da paylaş">' + fa('telegram', 'fa-brands') + '</a>'
      + ' <a class="share-btn pin" href="https://pinterest.com/pin/create/button/?url=' + u + '&amp;description=' + bt + '" target="_blank" rel="noopener" aria-label="Pinterest\'te paylaş">' + fa('pinterest-p', 'fa-brands') + '</a>'
      + ' <a class="share-btn em" href="mailto:?subject=' + bt + '&amp;body=' + bt + '%20' + u + '" aria-label="E-posta ile paylaş" title="E-posta ile paylaş">' + fa('envelope') + '</a>'
      + ' <button class="share-btn cp" id="shareCopy" type="button" aria-label="Bağlantıyı kopyala" title="Bağlantıyı kopyala">' + fa('link') + '</button>'
      + ' <button class="share-btn ts-share-mobile" type="button" data-sg-paylas-ac aria-expanded="false" aria-label="Diğer paylaşım seçenekleri"><i class="fa-solid fa-ellipsis ts-ic-more" aria-hidden="true"></i><i class="fa-solid fa-share-nodes ts-ic-share" aria-hidden="true"></i></button> </div> </div>';
    var degerlendirme = pu ? '<div class="rd-sec-head" style="margin-top:26px;margin-bottom:14px" id="yorumlar"> <div> <span class="eyebrow">' + fa('comments') + ' Değerlendirmeler</span> <h2>Yorumlar (' + (t.yo || 0) + ')</h2> </div> </div>'
      + ' <div class="rev-summary sg-rev-tek" aria-label="Puan özeti"> <div class="rs-avg"> <b>' + pu.toFixed(1) + '</b> ' + yildiz(pu) + ' <span>' + (t.dg || 0) + ' değerlendirme</span> </div> </div>'
      + ' <div class="rev-login" id="revLogin"> <span class="rl-ico">' + fa('lock') + '</span> <div class="rl-body"> <b>Yorum yapmak için giriş yap</b> <p>Bu tarifi puanlamak, deneyimini paylaşmak ve yorumlara katılmak için Dada Gastro hesabına giriş yapman gerekiyor. Yorumları okumak serbest.</p> <div class="rl-acts"> <a class="btn btn-primary" href="https://dadagastro.com/giris" rel="nofollow">' + fa('user') + ' Giriş Yap</a> <a class="btn btn-ghost" href="https://dadagastro.com/kayit">Üye Ol</a> </div> </div> </div>'
      + (t.yo ? ' <div class="rev-empty-first">' + fa('comment-dots') + ' <p>Yorumlar bu prototipte gösterilmiyor; <a href="https://dadagastro.com/tarif/' + encodeURIComponent(slug) + '#yorumlar" rel="noopener">Dada Gastro\'daki tarif sayfasında</a> okunabilir.</p></div>' : '') : '';
    var ikAd = {}; ik.forEach(function (x) { ikAd[x[0]] = x; });
    var grupOnce = null, sayac = 0;
    var satirlar = t.m.map(function (x) {
      var g = ''; if (x[0] && x[0] !== grupOnce) { g = '<li class="ing-group">' + fa('circle-notch') + ' ' + esc(x[0]) + '</li> '; grupOnce = x[0]; }
      sayac++;
      var ad = String(x[3]).trim(), n = ad.toLocaleLowerCase('tr').replace(/̇/g, ''), yer2 = ikAd[n];
      var bs = trSlug(x[2]), bet = ETIKET[bs] || String(x[2] || '').toLocaleLowerCase('tr');
      var miktar = x[1] === '' || x[1] == null ? '' : '<span data-amount="" data-base-amount="' + Number(x[1]) + '">' + sayi(x[1]) + '</span>';
      var iq = '<span class="iq"' + (miktar ? ' data-q="' + Number(x[1]).toFixed(2) + '"' : '') + (bs ? ' data-u="' + bs + '"' : '') + '>' + miktar + (bet ? ' <span data-unit="">' + esc(bet) + '</span>' : '') + '</span>';
      var inn = yer2
        ? '<span class="in"><s>' + esc(ad) + '</s> ' + esc(yer2[1]) + ' <small>Akıllı ikame' + (yer2[2] ? ' · ' + esc(yer2[2]) : '') + '</small></span>'
        : '<span class="in">' + esc(ad) + (x[4] ? ' <small>' + esc(x[4]) + '</small>' : '') + '</span>';
      return g + '<li class="ing-row "> <label> <input type="checkbox"> ' + iq + ' ' + inn + ' </label> <div class="ing-acts"> </div> </li>';
    }).join(' ');
    var panelBas = Number.isSafeInteger(t.p) && t.p > 0;
    var malzeme = '<div class="ing-panel"' + (panelBas ? ' data-gastro-portion="" data-portion-base="' + t.p + '"' : '') + '> <script type="application/json" data-porsiyon-kurallari>' + KURAL + '<\/script>'
      + ' <div class="ing-head"> <h2>' + fa('basket-shopping') + ' Malzemeler</h2> <p class="ing-count">' + sayac + ' malzeme' + (panelBas ? ' · <span id="ingServEcho" data-portion-servings="">' + t.p + '</span> ' + esc(t.pb || 'kişilik') + ' için' : '') + '</p> </div>'
      + (panelBas ? ' <div class="serv-step" role="group" aria-label="Porsiyon sayısı"> <button type="button" id="servDown" data-portion-dec="" aria-label="Porsiyonu azalt">' + fa('minus') + '</button> <div class="sv"><b id="servVal" data-portion-servings="" data-portion-unit="' + esc(t.pb || 'kişilik') + '">' + esc(por) + '</b><span>Porsiyon</span></div> <button type="button" id="servUp" data-portion-inc="" aria-label="Porsiyonu artır">' + fa('plus') + '</button> </div>' : '')
      + ' <ul class="ing-list" id="ingList" data-olcu-balon="' + esc(OLCU) + '"> ' + satirlar + ' </ul>'
      + ' <div class="ing-foot"> <span class="ing-note">' + fa('circle-check') + ' Miktarlar porsiyona göre otomatik güncellenir</span> </div>'
      + (sef ? ' <div class="side-chef"> <div class="sc-head"> <a class="sc-top"' + (sefUrl ? ' href="' + sefUrl + '"' : '') + '> <div class="av"><span aria-hidden="true">' + esc(bas(sef)) + '</span></div> <div class="sc-id"> <h3>' + esc(sef) + '</h3>' + (t.su ? ' <span class="sc-deg">' + fa('award') + ' ' + esc(t.su) + '</span>' : '') + ' </div> </a> </div> </div>' : '')
      + ' </div>';
    var govde = '<section class="rd-body"> <div class="wrap">'
      + ' <div class="print-head" aria-hidden="true"> <div class="ph-baslik">' + esc(t.b) + '</div> <p>' + esc(t.o || '') + '</p> <div class="ph-meta">' + (por ? ' <span>' + fa('utensils') + ' ' + esc(por) + '</span>' : '') + (sure ? ' <span>' + fa('clock') + ' ' + sure + '</span>' : '') + (t.z ? ' <span>' + fa('gauge-simple') + ' ' + esc(t.z) + '</span>' : '') + ' </div> </div>'
      + ' <div class="rd-cols" style="--ts: 1;"> <div class="rd-main">'
      + ' <div class="rd-sec-head"> <div> <span class="eyebrow">' + fa('list-ol') + ' Adım Adım</span> <h2>Nasıl yapılır?</h2> </div> <div class="rd-tools"> <div class="font-ctl" role="group" aria-label="Yazı boyutu"> <button id="rdFontDown" type="button" aria-label="Yazıyı küçült">A−</button> <button id="rdFontUp" type="button" aria-label="Yazıyı büyüt">A+</button> </div> <button class="icon-btn" type="button" data-sg-yazdir title="Tarifi yazdır" aria-label="Tarifi yazdır">' + fa('print') + '</button> </div> </div>'
      + ' <div class="steps-flow"> ' + adimlar + ' </div>'
      + ' <div class="note-duo"> ' + notlar + ' </div> '
      + besin + ' ' + paylas + degerlendirme
      + ' </div> <aside class="rd-aside"> ' + malzeme + ' </aside> </div> </div> </section>';

    // ---------- section.sec.simrec ----------
    var adaylar = Object.keys(M.t).filter(function (s) { return s !== slug && V.tarifler[s] && !gizliMi(V.tarifler[s]); }); // alerjen süzgecine uymayan benzer tarif önerilmez
    var ayniKat = adaylar.filter(function (s) { return t.ka && V.tarifler[s].ka === t.ka; });
    var secim = ayniKat.concat(adaylar.filter(function (s) { return ayniKat.indexOf(s) < 0; })).slice(0, 4);
    var benzer = secim.length ? '<section class="sec simrec"> <div class="wrap"> <div class="sec-head"> <div> <span class="eyebrow">' + fa('bowl-food') + ' Benzer Tarifler</span> <h2>Bunları da seveceksin</h2> <p class="lead">' + esc(M.kisa) + ' modunun kuralına uyan, aynı sofraya yakışan tarifler.</p> </div>'
      + ' <div class="sec-tools"> <a class="see-all" href="' + esc(M.dosya) + '">Tamamını Gör ' + fa('arrow-right') + '</a> <div class="row-nav"> <button data-slider-dir="prev" data-slider-for="simTrack" aria-label="Önceki">' + fa('chevron-left') + '</button> <button data-slider-dir="next" data-slider-for="simTrack" aria-label="Sonraki">' + fa('chevron-right') + '</button> </div> </div> </div>'
      + ' <div class="grid-4 row-track drag-scroll" id="simTrack"> ' + secim.map(function (s) { return window.DadaSaglik && window.DadaSaglik.gastroKart ? window.DadaSaglik.gastroKart(V, s, mod) : ''; }).join(' ') + ' </div> </div> </section>' : '';

    yer.outerHTML = ust + govde + benzer;
    // Paylaş "…" (Gastro'da #rdSharePop açar; prototipte popover yok): aynı satırdaki kanal düğmelerini açar/kapatır
    var pa = document.querySelector('[data-sg-paylas-ac]');
    if (pa) pa.addEventListener('click', function () { var k = pa.closest('.ts-share'), ac = !k.classList.contains('sg-acik'); k.classList.toggle('sg-acik', ac); pa.setAttribute('aria-expanded', String(ac)); });
    var yz = document.querySelector('[data-sg-yazdir]'); if (yz) yz.addEventListener('click', function () { window.print(); });
    // ray okları: Gastro app.js ms() işleyicisinin birebiri (çizim app.js'ten sonra olduğu için burada bağlanır; data-bound aynı kontrat)
    Array.prototype.forEach.call(document.querySelectorAll('[data-slider-dir]'), function (b) {
      if (b.dataset.bound) return; b.dataset.bound = '1';
      b.addEventListener('click', function () { var r = document.getElementById(b.dataset.sliderFor); if (!r) return; r.scrollBy({ left: (b.dataset.sliderDir === 'prev' ? -1 : 1) * r.clientWidth * 0.85, behavior: 'smooth' }); });
    });
    betikler(['varlik/gastro/gastro/porsiyon-yuvarlama.js', 'varlik/gastro/varliklar/reference/tarif-detay/tarif-detay.js', 'varlik/gastro/revize/tur5/tr-heceleme.js', 'varlik/gastro/revize/p1/tarif-malzeme.js', 'varlik/gastro/revize/p1/tarif-liste-veri.js']);
  }).catch(function (er) {
    yer.innerHTML = '<div class="wrap"><div class="rd-head"><p class="rd-sub">Tarif yüklenemedi; sayfayı yenileyin.</p></div></div>';
    if (window.console) console.warn('[DadaSaglik detay]', er);
  });
})();
