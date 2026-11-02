/* Tarif detayı (?t=<slug>&mod=<kod>) — Gastro tarif detayının BİREBİR şablonu (donör: src/donor/tarif-balkabagi.html <main>;
   donör kopyasında olmayan bloklar Gastro'nun kendi parçalarından: gastro-mysql resources/views/parcalar/tarif-detay/
   {malzemeler, paylas, yorumlar, aksiyon-cubugu, pisirme-modu}.blade.php + ana tarif blade'i):
   section.rd-top (rd-crumb · rd-gallery: rd-stage [r-chip · r-save] + kunye-col [Porsiyon · Süre · Zorluk · Pişirme Derecesi ·
   çipler] · rd-head) → section.rd-body (rd-cols: rd-main [adımlar + Pişirme Moduna Geç + adım süreleri, hatırlatma, besin,
   etiketler + paylaş, değerlendirme: puan özeti + dağılım + puan formu + boş durum] · rd-aside [malzeme paneli + Listeye ekle,
   şef kutusu]) → section.sec.simrec (Benzer Tarifler) → main dışında rd-actbar + rdSharePop, lightbox, cookmode, lgGate.
   Tek ek: .rd-badges içinde Gastro'nun .tbadge.t-diyet rozetiyle mod etiketi. Akıllı ikame malzeme satırının içinde.
   Çizimden sonra Gastro'nun kendi detay betikleri (donör sırasıyla) yüklenir. app.js DOMContentLoaded'da bağladığı ve geç
   çizilen içerik için tekrar çağrılamayan üç işleyicinin birebiri burada: pişirme modu (_s), giriş kapısı ($t/fs), ray okları (ms).
   Yerel davranış (ağ yok): alışveriş listesi localStorage (try/catch); hesap gerektiren eylemler Gastro'nun misafir giriş kapısını açar.
   Veri: varlik/saglik/veri/tarifler.json + detay-ek.json (etiket, adım süresi, gerçek puan/değerlendirme, şef sayaçları). */
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
  // Gastro TarifDetayServisi::yildiz: tam kısım dolu, artık ≥ 0,25 → yarım yıldız
  function yildiz(p) {
    var d = Math.floor(p), y = p - d >= 0.25 ? 1 : 0, h = '';
    for (var i = 0; i < d; i++) h += ' ' + fa('star');
    if (y) h += ' ' + fa('star-half-stroke');
    for (var j = d + y; j < 5; j++) h += ' ' + fa('star', 'fa-regular');
    return '<span class="stars">' + h + ' </span>';
  }
  // Gastro SunumHaritasi::IKON — detaydaki "Özellikler" çipinin ikonu beslenme ADINDAN (yoksa fa-circle-check)
  var OZ_IKON = { 'Süt İçermez': 'ban', 'Düşük Kalorili': 'chart-line', 'Şeker İlavesiz': 'cube', 'Az Yağlı': 'droplet-slash', 'Protein Ağırlıklı': 'drumstick-bite', 'Yumurta İçermez': 'egg', 'Laktozsuz': 'glass-water', 'Kalp Dostu': 'heart-pulse', 'Vejetaryen': 'leaf', 'Baharatlı': 'mortar-pestle', 'Acılı': 'pepper-hot', 'Vegan': 'seedling', 'Yüksek Lifli': 'seedling', 'Diyabete Uygun': 'syringe', 'Glutensiz': 'wheat-awn-circle-exclamation', 'Tam Tahıllı': 'wheat-awn-circle-exclamation' };
  // Gastro TurkceEk::ayrilma — yıl + ayrılma eki ("2026'dan beri üye")
  function ayrilma(y) {
    var n = Number(y), son = n % 10, on = n % 100, ek;
    if (son) ek = ['', 'den', 'den', 'ten', 'ten', 'ten', 'dan', 'den', 'den', 'dan'][son];
    else if (on) ek = ['', 'dan', 'den', 'dan', 'tan', 'den', 'tan', 'ten', 'den', 'dan'][on / 10];
    else ek = n % 1000 ? 'den' : 'den';
    return y + '\'' + ek;
  }
  // Gastro BasHarf::kelimeler (tr): her kelimenin baş harfi büyük; ilk kelime dışındaki bağlaçlar (ve, veya, ile, ya da) ve parantez içi olduğu gibi
  function basHarf(m) {
    var ilk = true;
    return String(m || '').split(/(\([^)]*(?:\)|$))/).map(function (p) {
      if (!p) return p; if (p.charAt(0) === '(') { ilk = false; return p; }
      return p.replace(/(^|[^\p{L}\p{M}\p{N}'’])(ya\s+da|\p{L}[\p{L}\p{M}'’]*)/gu, function (t, on, k) {
        var baglac = !ilk && /^(ve|veya|ile|ya\s+da)$/.test(k); ilk = false;
        if (baglac || !/^\p{Ll}/u.test(k)) return on + k;
        var c = k.charAt(0); c = c === 'i' ? 'İ' : c === 'ı' ? 'I' : c.toLocaleUpperCase('tr');
        return on + c + k.slice(1);
      });
    }).join('');
  }
  var KURAL = '{"birimler":{"adet":"sayilabilir","dis":"sayilabilir","paket":"sayilabilir","dilim":"sayilabilir","demet":"sayilabilir","yemek-kasigi":"olcek","tatli-kasigi":"olcek","cay-kasigi":"olcek","su-bardagi":"olcek","cay-bardagi":"olcek","kahve-fincani":"olcek","gram":"kucuk","ml":"kucuk","kg":"buyuk","l":"buyuk","tutam":"olceklenmez"},"birimsiz":"sayilabilir","aciklama_birimleri":{"l":"ondalik","lt":"ondalik","litre":"ondalik"},"bilinmeyen":"olcek","kurallar":{"sayilabilir":{"adimlar":[[null,1]],"en_az":1},"olcek":{"adimlar":[[3,0.25],[10,0.5],[null,1]],"en_az":0.25},"kucuk":{"adimlar":[[10,1],[100,5],[null,10]],"en_az":1},"buyuk":{"adimlar":[[null,0.1]],"en_az":0.1,"alt_sinir":1,"alt_birim":{"kg":"gram","l":"ml"},"alt_carpan":1000},"ondalik":{"adimlar":[[null,0.1]],"en_az":0.1}},"olceklenmez_ifadeler":["göz kararı","isteğe göre"],"etiketler":{"gram":"g","ml":"ml"}}';
  var OLCU = '{"su-bardagi":[["1 su bardağı","≈ 200 ml"]],"cay-bardagi":[["1 çay bardağı","≈ 100 ml"]],"yemek-kasigi":[["1 yemek kaşığı","≈ 15 ml"]],"kahve-fincani":[["1 kahve fincanı","≈ 60 ml"]],"tatli-kasigi":[["1 tatlı kaşığı","≈ 5 ml"]],"cay-kasigi":[["1 çay kaşığı","≈ 4 ml"]]}';
  // Uyarı cümlesi Gastro tr-heceleme.js'in yumuşak tiresinden muaf ([data-a] onun DOKUNMA listesinde): metin taraması birebir bulur.
  var UYARI = 'Bu bilgiler genel bilgilendirme amaçlıdır; tanı ve tedavi için hekiminize danışın.';
  var GASTRO = 'https://dadagastro.com';
  var LISTE_ANAHTAR = 'dadaSaglik.alisverisListesi';

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
    var X = (EK.t && EK.t[slug]) || { e: [], s: [], pd: '', r: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], c: 0 };
    var R = X.r || [], dgN = R[0] || 0, ort = Number(R[1]) || 0, dag = [R[2] || 0, R[3] || 0, R[4] || 0, R[5] || 0, R[6] || 0];
    var yorumsuz = R[7] || 0, yorumN = R[8] || 0, deneme = R[9] || 0, alkis = R[10] || 0;
    var modlar = Object.keys(V.modlar).filter(function (k) { return V.modlar[k].t[slug]; });
    var mod = modlar.indexOf(istenen) > -1 ? istenen : modlar[0], M = V.modlar[mod], ik = M.t[slug] || [];
    var al = window.DadaSaglik && window.DadaSaglik.alerjenler ? window.DadaSaglik.alerjenler() : [];
    var gizliMi = function (x) { return !!(al && al.length && (x.pk || (x.al || []).some(function (a) { return al.indexOf(a) > -1 || (a === 'gluten-yulaf' && al.indexOf('gluten') > -1); }))); };
    var gizli = gizliMi(t);
    document.title = t.b.split('|')[0].trim() + ' — ' + M.uyum + ' · ' + MARKA + ' (prototip)';
    // Süre: Gastro kuralı — hazırlık/pişirme ayrı ayrı NULL değilse basılır (0 da bir değer); ikisi varsa "Hazırlık + Pişirme"
    var sureP = []; if (t.hz != null) sureP.push(t.hz); if (t.pz != null) sureP.push(t.pz);
    var sure = sureP.map(function (x) { return x + ' dk'; }).join(' + ');
    var surEt = sureP.length === 2 ? 'Hazırlık + Pişirme' : (t.hz != null ? 'Hazırlık' : 'Pişirme');
    var pd = X.pd || '', pdSekil = pd && pd.indexOf('°') < 0, pdGoster = pdSekil ? pd.charAt(0).toLocaleUpperCase('tr') + pd.slice(1) : pd;
    var kadlar = t.kad && t.kad.length ? t.kad : (t.ka ? [t.ka] : []);
    var bsl = (t.bsl || []).filter(function (x) { return EK.bes && EK.bes[x]; }).map(function (x) { return EK.bes[x][0]; });
    var bayrak = t.mt && EK.bayrak ? EK.bayrak[trSlug(t.mt)] || '' : '';
    var por = t.p ? t.p + ' ' + (t.pb || 'kişilik') : '';
    var sefVar = !!X.c, sef = t.sa || '', sefUrl = sefVar && t.sk ? GASTRO + '/sefler/' + encodeURIComponent(t.sk) : '';
    var kapakTam = new URL(t.k, location.href).href;

    // ---------- section.rd-top ----------
    var yazar = sef ? '<span class="av"><span class="av-ini" aria-hidden="true">' + esc(bas(sef)) + '</span></span> <div><b>' + esc(sef) + '</b>' + (t.su ? '<span>' + esc(t.su) + '</span>' : '') + '</div>' : '';
    var byline = sef || t.ty ? ' <div class="art-hmeta">' + (sef ? (sefUrl ? ' <a class="art-hauthor" href="' + sefUrl + '" title="' + esc(sef) + ' profilini gör"> ' + yazar + ' </a>' : ' <div class="art-hauthor"> ' + yazar + ' </div>') : '')
      + (t.ty ? ' <span class="art-hsep"></span> <span class="art-hstat">' + fa('calendar') + ' ' + tarih(t.ty) + '</span>' : '')
      + (t.tg ? ' <span class="art-hsep"></span> <span class="art-hstat">' + fa('pen-to-square') + ' Son güncelleme: ' + tarih(t.tg) + '</span>' : '') + ' </div>' : '';
    var rozet = '<span class="tbadge t-diyet">' + fa('circle-check') + ' ' + esc(M.uyum) + ' uygun</span>';
    var rate = '<div class="rd-rateline"> <span class="rd-stars"> ' + yildiz(ort) + ' <b>' + ort.toFixed(1) + '</b> <a href="#yorumlar">' + dgN + ' değerlendirme</a> </span>'
      + ' <span class="r-views">' + fa('eye') + ' ' + Number(t.g || 0).toLocaleString('tr') + ' görüntülenme</span> </div>';
    var olgular = (por ? '<div class="rdf"> ' + fa('utensils') + ' <div><span>Porsiyon</span><b id="factServ" data-portion-servings="" data-portion-unit="' + esc(t.pb || 'kişilik') + '">' + esc(por) + '</b></div> </div>' : '')
      + (sure ? '<div class="rdf"> ' + fa('clock') + ' <div><span>' + surEt + '</span><b> ' + sure + ' </b></div> </div>' : '')
      + (t.z ? '<div class="rdf"> ' + fa('gauge-simple') + ' <div><span>Zorluk</span><b>' + esc(t.z) + '</b></div> </div>' : '')
      + (pd ? '<div class="rdf"> ' + fa('temperature-three-quarters') + ' <div><span>' + (pdSekil ? 'Pişirme Şekli' : 'Pişirme Derecesi') + '</span><b>' + esc(pdGoster) + '</b></div> </div>' : '');
    var ozellik = bsl.map(function (b) { return '<a class="chip" href="tarifler.html">' + fa(OZ_IKON[b] || 'circle-check') + esc(b) + '</a>'; });
    if (t.bta) ozellik.push('<a class="chip" href="tarifler.html">' + fa('wallet') + esc(t.bta) + ' (' + new Array(Math.max(t.bt || 1, 1) + 1).join('₺') + ')</a>');
    var cipler = (kadlar.length ? '<div class="chip-row siniflandirma-cipleri"> ' + kadlar.map(function (k, i) { return '<a class="chip" href="tarifler.html"' + (i === 0 ? ' data-ust-rozet=""' : '') + '>' + esc(k) + '</a>'; }).join(' ') + ' </div>' : '')
      + (t.mt ? ' <span class="kcl">Mutfak</span> <div class="chip-row cip-kaydir" data-cip-kaydir> <a class="chip cuisine" href="tarifler.html">' + (bayrak ? ' <img class="chip-flag" src="varlik/gastro/varliklar/flags/' + esc(bayrak) + '.svg" alt="' + esc(t.mt) + ' bayrağı"> ' : '') + esc(t.mt) + ' </a> </div>' : '')
      + (ozellik.length ? ' <span class="kcl">Özellikler</span> <div class="chip-row cip-kaydir" data-cip-kaydir> ' + ozellik.join(' ') + ' </div>' : '');
    var kaydet = ' <form onclick="event.stopPropagation()" data-sg-yerel> <button class="r-save" type="submit" aria-label="Kaydet" data-lg-gate="" data-save-toggle="" data-lg-title="Kaydetmek için giriş yap" data-lg-desc="Tarifleri kaydetmek için DadaGastro hesabına giriş yapman gerekiyor."> ' + fa('heart', 'fa-regular') + ' </button> </form>';
    var ust = '<section data-revize="b1-medya" class="rd-top"> <div class="wrap">'
      + ' <nav class="rd-crumb" aria-label="Sayfa yolu"> <a href="index.html">' + fa('house') + '</a>' + fa('chevron-right') + ' <a href="saglik.html">' + MARKA + '</a>' + fa('chevron-right') + ' <a href="' + esc(M.dosya) + '">' + esc(M.kisa) + '</a>' + fa('chevron-right') + ' <b>' + esc(t.b) + '</b> </nav>'
      + ' <div class="rd-gallery"> <div class="rd-stage " id="rdStage" data-cap="' + esc(t.b) + '" data-gallery="' + esc(JSON.stringify([kapakTam])) + '"> <img class="gastro-tarif-kapak" src="' + esc(t.k) + '" alt="' + esc(t.b) + '" fetchpriority="high" decoding="async">'
      + (t.ka ? ' <span class="r-chip">' + esc(t.ka) + '</span>' : '') + kaydet
      + ' <div class="rd-stage-info"> <div class="rd-badges"> ' + rozet + ' </div> <h1>' + esc(t.b) + '</h1> ' + rate + ' </div> </div>'
      + ' <aside class="kunye-col" aria-label="Tarif künyesi"> <div class="kc-card"> <div class="kc-olgular" data-cip-kaydir> ' + olgular + ' </div> <div class="kc-chips" data-cip-kaydir> ' + cipler + ' </div> </div> </aside> </div>'
      + ' <div class="rd-head">' + byline + (t.o ? ' <p class="rd-sub">' + esc(t.o) + '</p>' : '') + ' </div> </div> </section>';

    // ---------- section.rd-body ----------
    var sureler = X.s || [];
    var adimlar = t.a.map(function (a, i) {
      var dk = sureler[i] ? ' <span class="step-time">' + fa('clock') + ' ' + sureler[i] + ' dk</span>' : '';
      return '<article class="step-card no-img "> <div class="sc-body"> <span class="sc-num" data-step-label="' + esc(a[0] || (i + 1) + '. adım') + '" role="button">' + (i + 1) + '</span> <div class="step-card__body"> <div class="sc-top"> <h3>' + esc(a[0] || (i + 1) + '. adım') + '</h3>' + dk + ' </div> <p>' + esc(a[1]) + '</p> </div> </div> </article>';
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
    var kanallar = function () {
      return ' <a class="share-btn fb" href="https://www.facebook.com/sharer/sharer.php?u=' + u + '" target="_blank" rel="noopener" aria-label="Facebook\'ta paylaş">' + fa('facebook-f', 'fa-brands') + '</a>'
        + ' <a class="share-btn xx" href="https://twitter.com/intent/tweet?url=' + u + '&amp;text=' + bt + '" target="_blank" rel="noopener" aria-label="X\'te paylaş">' + fa('x-twitter', 'fa-brands') + '</a>'
        + ' <a class="share-btn wa" href="https://wa.me/?text=' + bt + '%20' + u + '" target="_blank" rel="noopener" aria-label="WhatsApp\'ta paylaş">' + fa('whatsapp', 'fa-brands') + '</a>'
        + ' <a class="share-btn tg" href="https://t.me/share/url?url=' + u + '&amp;text=' + bt + '" target="_blank" rel="noopener" aria-label="Telegram\'da paylaş">' + fa('telegram', 'fa-brands') + '</a>'
        + ' <a class="share-btn pin" href="https://pinterest.com/pin/create/button/?url=' + u + '&amp;description=' + bt + '" target="_blank" rel="noopener" aria-label="Pinterest\'te paylaş">' + fa('pinterest-p', 'fa-brands') + '</a>'
        + ' <a class="share-btn em" href="mailto:?subject=' + bt + '&amp;body=' + encodeURIComponent(t.b + ' — bu tarife göz at: ' + location.href) + '" aria-label="E-posta ile paylaş" title="E-posta ile paylaş">' + fa('envelope') + '</a>';
    };
    var etiketler = (X.e || []).map(function (e) { return '<span class="chip">#' + esc(e) + '</span>'; }).join(' ');
    var paylas = '<div class="tagshare" id="paylas"> <div class="ts-tags"> ' + etiketler + ' </div> <div class="ts-share"> <span class="lbl">Paylaş</span>' + kanallar()
      + ' <button class="share-btn cp" id="shareCopy" type="button" aria-label="Bağlantıyı kopyala" title="Bağlantıyı kopyala">' + fa('link') + '</button>'
      + ' <button class="share-btn ts-share-mobile" type="button" data-share-toggle="" aria-haspopup="true" aria-expanded="false" aria-label="Diğer paylaşım seçenekleri"><i class="fa-solid fa-ellipsis ts-ic-more" aria-hidden="true"></i><i class="fa-solid fa-share-nodes ts-ic-share" aria-hidden="true"></i></button> </div> </div>';

    // Değerlendirme (parcalar/tarif-detay/yorumlar.blade.php): sayılar gerçek `degerlendirmeler` satırlarından; sahte yorum yok.
    var tavsiye = dgN ? Math.round((dag[0] + dag[1]) * 100 / dgN) : 0;
    var cubuklar = [5, 4, 3, 2, 1].map(function (k, i) { return '<div class="rs-bar"> <span class="lbl">' + k + ' ' + fa('star') + '</span> <span class="track"><i style="width:' + (dgN ? Math.round(dag[i] * 100 / dgN) : 0) + '%"></i></span> <span class="cnt">' + dag[i] + '</span> </div>'; }).join(' ');
    var yildizDugme = [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" aria-label="' + n + ' yıldız">' + fa('star') + '</button>'; }).join(' ');
    var degerlendirme = '<div class="rd-sec-head" style="margin-top:26px;margin-bottom:14px" id="yorumlar"> <div> <span class="eyebrow">' + fa('comments') + ' Değerlendirmeler</span> <h2>Yorumlar (' + yorumN + ')</h2> </div> </div>'
      + ' <div class="rev-summary" aria-label="Puan özeti"> <div class="rs-avg"> <b>' + ort.toFixed(1) + '</b> ' + yildiz(ort) + ' <span>' + dgN + ' değerlendirme</span> <span class="rs-rec">' + fa('thumbs-up') + ' %' + tavsiye + '\'si tavsiye ediyor</span>'
      + (yorumsuz > 0 ? ' <span>' + yorumsuz + ' kişi yorum yazmadan puan verdi</span>' : '') + ' </div> <div class="rs-bars"> ' + cubuklar + ' </div> </div>'
      + ' <div class="rev-login" id="revLogin"> <span class="rl-ico">' + fa('lock') + '</span> <div class="rl-body"> <b>Yorum yapmak için giriş yap</b> <p>Bu tarifi puanlamak, deneyimini paylaşmak ve yorumlara katılmak için DadaGastro hesabına giriş yapman gerekiyor. Yorumları okumak serbest.</p> <div class="rl-acts"> <a class="btn btn-primary" href="' + GASTRO + '/giris" rel="nofollow">' + fa('user') + ' Giriş Yap</a> <a class="btn btn-ghost" href="' + GASTRO + '/kayit">Üye Ol</a> </div> </div> </div>'
      // Gastro'nun üye puan formu (#revForm): yıldız seçimi + "Puan zorunlu" kuralı Gastro tarif-detay.js'te; gönderim yerelde giriş kapısını açar (yorum yayımlanmaz)
      + ' <form class="rev-form" id="revForm" data-sg-yerel> <input type="hidden" name="puan" id="rfRatingInput" value=""> <div class="av av-init">' + fa('user') + '</div> <div class="rf-body"> <div class="rf-top"> <span class="t">Tarifi değerlendir</span> <span class="rf-stars" id="rfStars" role="radiogroup" aria-label="Yıldız puanı"> ' + yildizDugme + ' </span> <span class="rf-hint" id="rfHint" role="status">Puan zorunlu</span> </div>'
      + ' <textarea class="rf-text" name="govde" placeholder="Bu tarifi denedin mi? Deneyimini, küçük dokunuşlarını yaz..." aria-label="Yorumun"></textarea> <div class="rf-foot"> <button class="btn btn-primary" id="rfSubmit" type="submit">' + fa('paper-plane', 'fa-regular') + ' Yorumu Paylaş</button> </div>'
      + ' <p class="rf-disc">Yorumlar denetim sonrası yayınlanır. Yazılan yorumlar hiçbir şekilde DadaGastro\'nun görüş ve düşüncelerini yansıtmaz.</p> </div> </form>'
      + (yorumN ? '' : ' <div class="rev-empty-first"> ' + fa('comment-dots') + ' <p>Bu tarife henüz yorum yapılmamış. İlk yorumu sen yaz.</p> </div>');

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
        ? '<span class="in"><s>' + esc(basHarf(ad)) + '</s> ' + esc(yer2[1]) + ' <small>Akıllı ikame' + (yer2[2] ? ' · ' + esc(yer2[2]) : '') + '</small></span>'
        : '<span class="in">' + esc(basHarf(ad)) + (x[4] ? ' <small>' + esc(x[4]) + '</small>' : '') + '</span>';
      // Listeye eklenen ad: akıllı ikame varsa yerine geçen malzeme
      var listeAd = (yer2 ? yer2[1] : ad).toLocaleLowerCase('tr');
      var ekle = '<form onclick="event.stopPropagation()" data-m-bagli="1" data-sg-yerel> <button class="ing-add " type="submit" title="Alışveriş listesine ekle" aria-label="Alışveriş listesine ekle" data-m-bagli="1" data-tarif-eylem="liste-ekle" data-liste-kod="alisveris-listem" data-liste-ad="Alışveriş Listem" data-ad="' + esc(listeAd) + '" data-kaynak="' + esc(slug) + '">' + fa('cart-plus') + '</button> </form>';
      return g + '<li class="ing-row "> <label> <input type="checkbox"> ' + iq + ' ' + inn + ' </label> <div class="ing-acts"> ' + ekle + ' </div> </li>';
    }).join(' ');
    var panelBas = Number.isSafeInteger(t.p) && t.p > 0;
    var C = sefVar ? X.c : null;
    var sefKutu = sef && sefVar ? ' <div class="side-chef"> <div class="sc-head"> <a class="sc-top"' + (sefUrl ? ' href="' + sefUrl + '"' : '') + '> <div class="av"><span aria-hidden="true">' + esc(bas(sef)) + '</span></div> <div class="sc-id"> <h3>' + esc(sef) + '</h3>'
      + (t.su ? ' <span class="sc-deg">' + fa('award') + ' ' + esc(t.su) + '</span>' : '') + (C[2] ? ' <span class="sc-since">' + ayrilma(C[2]) + ' beri üye</span>' : '') + ' </div> </a>'
      + ' <form class="sc-follow" data-sg-yerel> <button class="btn btn-primary rd-follow-big" aria-pressed="false" type="submit" data-lg-gate="" data-etiket-acik="Takip Ediliyor" data-lg-title="Takip etmek için giriş yap" data-lg-desc="Şefleri takip etmek için DadaGastro hesabına giriş yapman gerekiyor."> ' + fa('plus') + ' Takip Et </button> </form> </div>'
      + ' <div class="sc-meta"> <div class="scs">' + fa('bowl-food') + '<div><span>Tarif</span><b>' + Number(C[0]).toLocaleString('tr') + '</b></div></div> <div class="scs">' + fa('users') + '<div><span>Takipçi</span><b>' + Number(C[1]).toLocaleString('tr') + '</b></div></div> </div> </div>' : '';
    var malzeme = '<div class="ing-panel"' + (panelBas ? ' data-gastro-portion="" data-portion-base="' + t.p + '"' : '') + '> <script type="application/json" data-porsiyon-kurallari>' + KURAL + '<\/script>'
      + ' <div class="ing-head"> <h2>' + fa('basket-shopping') + ' Malzemeler</h2> <p class="ing-count">' + sayac + ' malzeme' + (panelBas ? ' · <span id="ingServEcho" data-portion-servings="">' + t.p + '</span> ' + esc(t.pb || 'kişilik') + ' için' : '') + '</p> </div>'
      + (panelBas ? ' <div class="serv-step" role="group" aria-label="Porsiyon sayısı"> <button type="button" id="servDown" data-portion-dec="" aria-label="Porsiyonu azalt">' + fa('minus') + '</button> <div class="sv"><b id="servVal" data-portion-servings="" data-portion-unit="' + esc(t.pb || 'kişilik') + '">' + esc(por) + '</b><span>Porsiyon</span></div> <button type="button" id="servUp" data-portion-inc="" aria-label="Porsiyonu artır">' + fa('plus') + '</button> </div>' : '')
      + ' <ul class="ing-list" id="ingList" data-olcu-balon="' + esc(OLCU) + '"> ' + satirlar + ' </ul>'
      + ' <div class="ing-foot"> <form data-m-bagli="1" data-sg-yerel> <button class="btn btn-primary" id="addAllBtn" type="submit" data-m-bagli="1" data-tarif-eylem="liste-ekle-tumu" data-liste-kod="alisveris-listem" data-liste-ad="Alışveriş Listem" data-kaynak="' + esc(slug) + '">' + fa('cart-plus') + ' Tümünü Listeye Ekle</button> </form>'
      + ' <div id="listeGeriBildirim" class="liste-geri-bildirim" role="status" aria-live="polite" hidden><a class="btn btn-ghost liste-gor-dugme" href="' + GASTRO + '/hesabim/menulerim#alisveris"><span class="liste-gor-durum">' + fa('circle-check') + ' <span>Listende <b data-liste-adet>0</b> malzeme</span></span><span class="liste-gor-git">Listeyi Gör ' + fa('arrow-right') + '</span></a></div>'
      + ' <span class="ing-note">' + fa('circle-check') + ' Miktarlar porsiyona göre otomatik güncellenir</span> </div>'
      + sefKutu + ' </div>';
    var govde = '<section class="rd-body"> <div class="wrap">'
      + ' <div class="print-head" aria-hidden="true"> <div class="ph-baslik">' + esc(t.b) + '</div> <p>' + esc(t.o || '') + '</p> <div class="ph-meta">' + (por ? ' <span>' + fa('utensils') + ' ' + esc(por) + '</span>' : '') + (sure ? ' <span>' + fa('clock') + ' ' + sure + '</span>' : '') + (t.z ? ' <span>' + fa('gauge-simple') + ' ' + esc(t.z) + '</span>' : '') + (pd ? ' <span>' + fa('temperature-three-quarters') + ' ' + esc(pd) + '</span>' : '') + ' </div> </div>'
      + ' <div class="rd-cols" style="--ts: 1;"> <div class="rd-main">'
      + ' <div class="rd-sec-head"> <div> <span class="eyebrow">' + fa('list-ol') + ' Adım Adım</span> <h2>Nasıl yapılır?</h2> </div> <div class="rd-tools"> <div class="font-ctl" role="group" aria-label="Yazı boyutu"> <button id="rdFontDown" type="button" aria-label="Yazıyı küçült">A−</button> <button id="rdFontUp" type="button" aria-label="Yazıyı büyüt">A+</button> </div> <button class="icon-btn" type="button" data-sg-yazdir title="Tarifi yazdır" aria-label="Tarifi yazdır">' + fa('print') + '</button> </div> </div>'
      + ' <button class="cook-cta cook-cta-big" type="button" data-cook-open="">' + fa('fire-burner') + ' Pişirme Moduna Geç <span class="cc-sub">tam ekran · adım sayaçlı</span></button>'
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

    // ---------- main dışı: aksiyon çubuğu + paylaş menüsü, lightbox, pişirme modu (Gastro'da </main>'den sonra) ----------
    var thumb = ' style="background-image:url(\'' + esc(t.k) + '\')"';
    var disari = '<div class="rd-actbar" id="rdActbar" role="toolbar" aria-label="Tarif aksiyonları" data-bc-bar=""> <div class="rd-actbar__name"> <span class="rd-actbar__thumb"' + thumb + '></span> <b>' + esc(t.b) + '</b> </div>'
      + ' <button class="rd-actbar__act" type="button" aria-pressed="false" data-act="made" data-engagement-toggle="" data-active="0" data-lg-title="Bu tarifi yaptığını paylaşmak için giriş yap" data-lg-desc="&quot;Ben de Yaptım&quot; paylaşmak için DadaGastro hesabına giriş yapman gerekiyor."> ' + fa('utensils') + ' Ben de Yaptım <b id="madeCount" data-engagement-count="">' + deneme + '</b> </button>'
      + ' <button class="rd-actbar__act" type="button" aria-pressed="false" data-act="clap" data-engagement-toggle="" data-active="0" data-lg-title="Alkışlamak için giriş yap" data-lg-desc="Tarifi alkışlamak için DadaGastro hesabına giriş yapman gerekiyor."> ' + fa('hands-clapping') + ' Eline Sağlık <b id="clapCount" data-engagement-count="">' + alkis + '</b> </button>'
      + ' <button class="rd-actbar__act" type="button" data-act="comments">' + fa('comment-dots') + ' Yorumlar</button>'
      + ' <button type="button" data-act="save" data-lg-gate="" data-acik-sinif="on" data-active="0" class="rd-actbar__act" aria-pressed="false" data-icon-on="fa-solid fa-heart" data-icon-off="fa-regular fa-heart" data-lg-title="Kaydetmek için giriş yap" data-lg-desc="Tarifleri kaydetmek için DadaGastro hesabına giriş yapman gerekiyor."> ' + fa('heart', 'fa-regular') + ' Kaydet </button>'
      + ' <button class="rd-actbar__act" type="button" data-act="share" id="rdShareBtn" aria-haspopup="true" aria-expanded="false">' + fa('share-nodes') + ' Paylaş</button> </div>'
      + '<div class="rd-sharepop" id="rdSharePop" role="menu" aria-label="Paylaşım seçenekleri">' + kanallar() + ' <button class="share-btn cp" type="button" data-share-copy="" aria-label="Bağlantıyı kopyala" title="Bağlantıyı kopyala">' + fa('link') + '</button> </div>'
      + '<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Görsel önizleme"> <span class="lb-cap" id="lbCap"></span> <img class="lb-img" id="lbImg" alt="Tarif görseli"> <button class="lb-close" id="lbClose" type="button" aria-label="Kapat">' + fa('xmark') + '</button> <button class="lb-prev" id="lbPrev" type="button" aria-label="Önceki görsel">' + fa('chevron-left') + '</button> <button class="lb-next" id="lbNext" type="button" aria-label="Sonraki görsel">' + fa('chevron-right') + '</button> <span class="lb-count" id="lbCount"></span> </div>'
      + '<div class="cookmode" id="cookmode" role="dialog" aria-modal="true" aria-label="Pişirme Modu" hidden="" data-l-step="Adım" data-l-next="Sonraki Adım" data-l-finish="Tarifi Bitir" data-l-done-title="Afiyet olsun, tarifiniz hazır!" data-l-done-text="' + esc(t.b) + ' adım adım tamamlandı. Sofranı kur, keyfini çıkar." data-l-done-count="Tamamlandı" data-l-restart="Baştan Başla" data-l-close="Kapat">'
      + ' <div class="cm-top"> <div class="cm-name"> <span class="cm-name__th"' + thumb + '></span> <b>' + esc(t.b) + '</b> </div> <div class="cm-prog"> <span class="cm-count" data-cm-count="">Adım 1 / ' + t.a.length + '</span> <span class="bar"><i data-cm-bar="" style="width:' + (t.a.length ? Math.round(100 / t.a.length) : 0) + '%"></i></span> </div> <button class="cm-close" type="button" data-cook-close="" aria-label="Pişirme modundan çık">' + fa('xmark') + '</button> </div>'
      + ' <div class="cm-stage"> <div class="cm-inner" data-cm-inner=""></div> </div>'
      + ' <div class="cm-bottom"> <div class="cm-dots" data-cm-dots=""></div> <div class="cm-timer" data-cm-timer="" aria-label="Adım zamanlayıcısı"> <button class="ct-btn" data-cm-start="" type="button" aria-label="Sayacı başlat / durdur">' + fa('play') + '</button> <b data-cm-time="">00:00</b> <button class="ct-btn" data-cm-reset="" type="button" aria-label="Sayacı sıfırla">' + fa('rotate-left') + '</button> <label class="ct-auto" title="Süre dolunca sonraki adıma kendiliğinden geçer"> <input type="checkbox" data-cm-auto=""> <span>Bitince otomatik geç</span> </label> </div>'
      + ' <div class="cm-nav"> <button class="btn btn-ghost" data-cm-prev="" type="button">' + fa('chevron-left') + ' Önceki</button> <button class="btn btn-primary" data-cm-next="" type="button">Sonraki Adım ' + fa('chevron-right') + '</button> </div> </div> </div>';
    // Gastro'nun misafir giriş kapısı (kabukta yoksa): "Giriş Yap" / "Üye Ol" yalnız bağlantı, ağ isteği yok
    if (!document.getElementById('lgGate')) disari += '<div class="lg-overlay" id="lgOverlay"></div><div class="lg-gate" id="lgGate" role="dialog" aria-modal="true" aria-labelledby="lgGateTitle" data-def-title="Bu işlem için giriş yap" data-def-desc="Kaydetmek, yorum yapmak ve takip etmek için DadaGastro hesabına giriş yapman gerekiyor."> <div class="lg-panel"> <button class="lg-close" id="lgClose" type="button" aria-label="Kapat" data-lg-close="">' + fa('xmark') + '</button> <span class="lg-ico">' + fa('lock') + '</span> <h4 id="lgGateTitle" data-lg-title="">Bu işlem için giriş yap</h4> <p id="lgGateDesc" data-lg-desc="">Kaydetmek, yorum yapmak ve takip etmek için DadaGastro hesabına giriş yapman gerekiyor.</p> <div class="lg-acts"> <a class="btn btn-primary" data-lg-login="" href="' + GASTRO + '/giris" rel="nofollow">' + fa('user') + ' Giriş Yap</a> <a class="btn btn-ghost" data-lg-register="" href="' + GASTRO + '/kayit">Üye Ol</a> </div> </div> </div>';

    yer.outerHTML = ust + govde + benzer;
    var ana = document.querySelector('main') || document.body;
    ana.insertAdjacentHTML('afterend', disari);

    // Yerel formlar hiçbir yere gönderilmez (Gastro'da POST uçları; prototipte ağ yok)
    Array.prototype.forEach.call(document.querySelectorAll('form[data-sg-yerel]'), function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); }); });
    var yz = document.querySelector('[data-sg-yazdir]'); if (yz) yz.addEventListener('click', function () { window.print(); });
    // ray okları: Gastro app.js ms() işleyicisinin birebiri (çizim app.js'ten sonra olduğu için burada bağlanır; data-bound aynı kontrat)
    Array.prototype.forEach.call(document.querySelectorAll('[data-slider-dir]'), function (b) {
      if (b.dataset.bound) return; b.dataset.bound = '1';
      b.addEventListener('click', function () { var r = document.getElementById(b.dataset.sliderFor); if (!r) return; r.scrollBy({ left: (b.dataset.sliderDir === 'prev' ? -1 : 1) * r.clientWidth * 0.85, behavior: 'smooth' }); });
    });
    girisKapisi();
    pisirmeModu();
    alisverisListesi();
    // Puan formu: yıldız seçimi ve "Puan vermeden yorum gönderilemez" Gastro tarif-detay.js'te; puan seçiliyken gönderim giriş kapısını açar
    var rf = document.getElementById('revForm');
    if (rf) rf.addEventListener('submit', function () {
      var p = document.getElementById('rfRatingInput');
      if (p && p.value) kapiAc('Yorum yapmak için giriş yap', 'Bu tarifi puanlamak, deneyimini paylaşmak ve yorumlara katılmak için DadaGastro hesabına giriş yapman gerekiyor. Yorumları okumak serbest.');
    });
    betikler(['varlik/gastro/gastro/porsiyon-yuvarlama.js', 'varlik/gastro/varliklar/reference/tarif-detay/tarif-detay.js', 'varlik/gastro/revize/tur5/tr-heceleme.js', 'varlik/gastro/revize/p1/tarif-malzeme.js', 'varlik/gastro/revize/p1/tarif-pisirme.js', 'varlik/gastro/gastro/alt-eylem-cubugu.js', 'varlik/gastro/revize/p1/tarif-liste-veri.js']);
  }).catch(function (er) {
    yer.innerHTML = '<div class="wrap"><div class="rd-head"><p class="rd-sub">Tarif yüklenemedi; sayfayı yenileyin.</p></div></div>';
    if (window.console) console.warn('[DadaSaglik detay]', er);
  });

  // ---------- Giriş kapısı: Gastro app.js $t() + fs() + ps()/ws() misafir dalının birebiri ----------
  function kapiAc(baslik, aciklama) {
    var g = document.getElementById('lgGate'); if (!g) return;
    var ov = document.getElementById('lgOverlay'), b = g.querySelector('[data-lg-title]'), a = g.querySelector('[data-lg-desc]');
    if (!g.dataset.defTitle && b) g.dataset.defTitle = b.textContent;
    if (!g.dataset.defDesc && a) g.dataset.defDesc = a.textContent;
    if (b) b.textContent = baslik || g.dataset.defTitle;
    if (a) a.textContent = aciklama || g.dataset.defDesc;
    g.classList.add('show'); if (ov) ov.classList.add('show');
    document.body.style.overflow = 'hidden';
    var l = g.querySelector('[data-lg-login]'); if (l) l.focus();
  }
  function girisKapisi() {
    var g = document.getElementById('lgGate'); if (!g) return;
    var ov = document.getElementById('lgOverlay');
    if (!g.dataset.sgBound) {
      g.dataset.sgBound = '1';
      var kapat = function () { g.classList.remove('show'); if (ov) ov.classList.remove('show'); document.body.style.overflow = ''; };
      Array.prototype.forEach.call(g.querySelectorAll('[data-lg-close]'), function (x) { x.addEventListener('click', kapat); });
      if (ov) ov.addEventListener('click', kapat);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && g.classList.contains('show')) kapat(); });
    }
    // app.js'in DOMContentLoaded'da bağlayamadığı (geç çizilen) kapı düğmeleri — misafir: varsayılanı kes, kapıyı aç
    Array.prototype.forEach.call(document.querySelectorAll('[data-lg-gate], [data-engagement-toggle]'), function (el) {
      if (el.dataset.bound) return; el.dataset.bound = '1';
      el.addEventListener('click', function (e) { if (document.body.classList.contains('is-auth')) return; e.preventDefault(); kapiAc(el.dataset.lgTitle, el.dataset.lgDesc); });
    });
  }

  // ---------- Pişirme modu: Gastro app.js _s() işleyicisinin birebiri (aynı #cookmode / [data-cm-*] kontratı, dataset.bound) ----------
  function pisirmeModu() {
    var t = document.getElementById('cookmode'); if (!t || t.dataset.bound) return;
    var kartlar = Array.prototype.slice.call(document.querySelectorAll('.step-card')); if (!kartlar.length) return;
    t.dataset.bound = '1';
    var n = { step: t.dataset.lStep || 'Adım', next: t.dataset.lNext || 'Sonraki Adım', finish: t.dataset.lFinish || 'Tarifi Bitir', doneTitle: t.dataset.lDoneTitle || 'Afiyet olsun, tarifiniz hazır!', doneText: t.dataset.lDoneText || 'Tüm adımları tamamladın. Sofranı kur, keyfini çıkar.', doneCount: t.dataset.lDoneCount || 'Tamamlandı', restart: t.dataset.lRestart || 'Baştan Başla', close: t.dataset.lClose || 'Kapat' };
    var r = kartlar.map(function (O) {
      var z = O.querySelector('.step-time'), x = z ? z.textContent.trim() : '', C = x.match(/(\d+)\s*(?:dk|min)\b/);
      var p = O.querySelector('.step-card__body p');
      return { text: (p ? p.textContent : '').trim(), time: x, secs: C ? parseInt(C[1], 10) * 60 : 0, imgs: Array.prototype.slice.call(O.querySelectorAll('.step-img')).map(function (T) { return T.style.backgroundImage; }).filter(Boolean) };
    });
    var s = t.querySelector('[data-cm-inner]'), o = t.querySelector('[data-cm-count]'), a = t.querySelector('[data-cm-bar]'), i = t.querySelector('[data-cm-dots]'), l = t.querySelector('[data-cm-prev]'), d = t.querySelector('[data-cm-next]'),
      u = t.querySelector('[data-cm-timer]'), f = t.querySelector('[data-cm-time]'), g = t.querySelector('[data-cm-start]'), y = t.querySelector('[data-cm-reset]'), A = t.querySelector('[data-cm-auto]'), Rr = document.querySelector('[data-cook-open]');
    var h = 0, p = false, b = [];
    var E = function (O) { var x = document.createElement('div'); x.textContent = O; return x.innerHTML; };
    r.forEach(function (O, k) { var x = document.createElement('i'); x.addEventListener('click', function () { h = k; w(); }); i.appendChild(x); });
    function w() {
      p = false; d.style.display = '';
      var O = r[h], x = '<div class="cm-num"><span class="cm-num__n">' + (h + 1) + '</span>';
      if (O.time) x += '<span class="cm-num__time"><i class="fa-regular fa-clock" aria-hidden="true"></i> ' + E(O.time) + '</span>';
      x += '</div><p class="cm-text">' + E(O.text) + '</p>'; s.innerHTML = x;
      if (O.imgs.length) { var fg = document.createElement('div'); fg.className = 'cm-figs'; O.imgs.forEach(function (C) { var T = document.createElement('div'); T.className = 'cm-fig'; T.style.backgroundImage = C; fg.appendChild(T); }); s.appendChild(fg); }
      s.scrollTop = 0; o.textContent = n.step + ' ' + (h + 1) + ' / ' + r.length; a.style.width = Math.round((h + 1) / r.length * 100) + '%';
      Array.prototype.forEach.call(i.children, function (x2, C) { x2.className = C === h ? 'on' : b.indexOf(C) > -1 ? 'done' : ''; });
      l.disabled = h === 0;
      d.innerHTML = h === r.length - 1 ? E(n.finish) + ' <i class="fa-solid fa-check" aria-hidden="true"></i>' : E(n.next) + ' <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
      X();
    }
    function k() {
      p = true; B(); r.forEach(function (O, x) { if (b.indexOf(x) < 0) b.push(x); });
      s.innerHTML = '<div class="cm-done"><div class="cd-ico"><i class="fa-solid fa-champagne-glasses" aria-hidden="true"></i></div><h2>' + E(n.doneTitle) + '</h2><p>' + E(n.doneText) + '</p><div class="cd-acts"><button class="btn btn-primary" type="button" data-cm-restart><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> ' + E(n.restart) + '</button><button class="btn btn-ghost" type="button" data-cm-doneclose><i class="fa-solid fa-xmark" aria-hidden="true"></i> ' + E(n.close) + '</button></div></div>';
      s.scrollTop = 0; o.textContent = n.doneCount; a.style.width = '100%';
      Array.prototype.forEach.call(i.children, function (O) { O.className = 'done'; });
      l.disabled = false; d.style.display = 'none'; u.style.visibility = 'hidden';
      s.querySelector('[data-cm-restart]').addEventListener('click', function () { h = 0; b.length = 0; w(); d.focus(); });
      s.querySelector('[data-cm-doneclose]').addEventListener('click', kapat);
    }
    var v = 0, I = null, K = false;
    var le = function (O) { var x = Math.floor(O / 60), C = O % 60; return (x < 10 ? '0' : '') + x + ':' + (C < 10 ? '0' : '') + C; };
    var H = function () { f.textContent = le(Math.max(0, v)); };
    function B() { K = false; clearInterval(I); I = null; g.querySelector('i').className = 'fa-solid fa-play'; u.classList.remove('running'); }
    function X() { B(); u.classList.remove('cm-timer--alarm'); v = r[h].secs; u.style.visibility = v ? 'visible' : 'hidden'; H(); }
    function be() {
      try {
        var O = window._cmAC || (window._cmAC = new (window.AudioContext || window.webkitAudioContext)());
        [0, 0.35, 0.7].forEach(function (x) { var C = O.createOscillator(), T = O.createGain(); C.connect(T); T.connect(O.destination); C.frequency.value = 880; T.gain.setValueAtTime(0.35, O.currentTime + x); T.gain.exponentialRampToValueAtTime(0.001, O.currentTime + x + 0.28); C.start(O.currentTime + x); C.stop(O.currentTime + x + 0.3); });
      } catch (e) { /* ses yoksa sessiz */ }
    }
    function Mm() { B(); be(); u.classList.add('cm-timer--alarm'); if (A.checked && h < r.length - 1) setTimeout(function () { if (b.indexOf(h) < 0) b.push(h); h++; w(); }, 1400); }
    g.addEventListener('click', function () {
      if (K) { B(); return; }
      if (v <= 0) v = r[h].secs;
      if (v <= 0) return;
      K = true; u.classList.remove('cm-timer--alarm'); u.classList.add('running'); g.querySelector('i').className = 'fa-solid fa-pause';
      I = setInterval(function () { v--; H(); if (v <= 0) Mm(); }, 1000);
    });
    y.addEventListener('click', X);
    l.addEventListener('click', function () { if (p) { w(); return; } if (h > 0) { h--; w(); } });
    d.addEventListener('click', function () { if (b.indexOf(h) < 0) b.push(h); if (h < r.length - 1) { h++; w(); } else k(); });
    function ac() { h = 0; b.length = 0; w(); t.hidden = false; document.body.style.overflow = 'hidden'; d.focus(); }
    function kapat() { B(); t.hidden = true; document.body.style.overflow = ''; if (Rr) Rr.focus(); }
    if (Rr) Rr.addEventListener('click', ac);
    Array.prototype.forEach.call(t.querySelectorAll('[data-cook-close]'), function (O) { O.addEventListener('click', kapat); });
    document.addEventListener('keydown', function (O) {
      if (t.hidden) return;
      if (O.key === 'Escape') kapat();
      else if (O.key === 'ArrowRight') { if (p) return; if (b.indexOf(h) < 0) b.push(h); if (h < r.length - 1) { h++; w(); } else k(); }
      else if (O.key === 'ArrowLeft') { if (p) w(); else if (h > 0) { h--; w(); } }
    });
  }

  // ---------- Alışveriş listesi: Gastro f6/tarif-eylem.js üye akışının yerel karşılığı (uç yerine localStorage, try/catch) ----------
  function listeOku() { try { var x = JSON.parse(localStorage.getItem(LISTE_ANAHTAR) || '[]'); return Array.isArray(x) ? x : []; } catch (e) { return []; } }
  function listeYaz(l) { try { localStorage.setItem(LISTE_ANAHTAR, JSON.stringify(l)); return true; } catch (e) { return false; } }
  function alisverisListesi() {
    var dugmeler = Array.prototype.slice.call(document.querySelectorAll('[data-tarif-eylem="liste-ekle"]'));
    var tumu = document.getElementById('addAllBtn');
    if (!dugmeler.length) return;
    var anahtar = function (b) { return (b.getAttribute('data-kaynak') || '') + '|' + (b.getAttribute('data-ad') || ''); };
    function etiketYaz(dugme, metin) {
      for (var i = dugme.childNodes.length - 1; i >= 0; i--) { var c = dugme.childNodes[i]; if (c.nodeType === 3 && c.nodeValue.trim()) { c.nodeValue = (c.nodeValue.charAt(0) === ' ' ? ' ' : '') + metin; return; } }
      dugme.appendChild(document.createTextNode(' ' + metin));
    }
    function satirMiktari(dugme) {
      var satir = dugme.closest('.ing-row'), iq = satir && satir.querySelector('.iq'); if (!iq) return '';
      var kopya = iq.cloneNode(true), m = kopya.querySelector('[data-current-amount]');
      if (m) m.textContent = m.dataset.currentAmount.replace('.', ',');
      return kopya.textContent.trim().replace(/\s+/g, ' ');
    }
    function eklendiIsaretle(dugme) {
      dugme.classList.add('added'); dugme.setAttribute('aria-pressed', 'true');
      dugme.title = 'Alışveriş listene eklendi'; dugme.setAttribute('aria-label', dugme.title); dugme.disabled = true;
    }
    function geriBildir() {
      var panel = document.getElementById('listeGeriBildirim'), l = listeOku();
      if (panel && l.length) { panel.querySelector('[data-liste-adet]').textContent = String(l.length); panel.hidden = false; }
      if (tumu && dugmeler.every(function (b) { return b.classList.contains('added'); })) {
        etiketYaz(tumu, 'Tümü Listede'); var ik = tumu.querySelector('i'); if (ik) ik.className = 'fa-solid fa-check'; tumu.disabled = true;
      }
    }
    function ekle(dugme) {
      if (dugme.classList.contains('added')) return true;
      var l = listeOku(), k = anahtar(dugme);
      if (!l.some(function (x) { return x.kaynak + '|' + x.ad === k; })) l.push({ ad: dugme.getAttribute('data-ad') || '', miktar: satirMiktari(dugme), kaynak: dugme.getAttribute('data-kaynak') || '' });
      if (!listeYaz(l)) { dugme.title = 'Listeye eklenemedi'; return false; }
      eklendiIsaretle(dugme); return true;
    }
    // Açılış: bu tarifin listede olan satırları işaretli gelir
    var kayitli = listeOku().map(function (x) { return x.kaynak + '|' + x.ad; });
    dugmeler.forEach(function (b) { if (kayitli.indexOf(anahtar(b)) > -1) eklendiIsaretle(b); });
    geriBildir();
    dugmeler.forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); if (ekle(b)) geriBildir(); }); });
    if (tumu) tumu.addEventListener('click', function (e) {
      e.preventDefault();
      var tamam = dugmeler.filter(function (b) { return !b.classList.contains('added'); }).map(ekle).every(Boolean);
      geriBildir();
      if (tamam) { etiketYaz(tumu, 'Listeye Eklendi'); tumu.disabled = true; }
    });
  }
})();
