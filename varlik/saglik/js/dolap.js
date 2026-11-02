/* Dolapta Ne Var (Kids Bebek Dolabı kalıbı): mod barı · seçilenler şeridi · arama · mod süzgeci · kategori kartları ·
   "Hemen yapabilirsin" / "1 malzeme eksik". Seçim URL'de (?mod=…&m=a,b) taşınır; depolanmaz.
   Mod seçiliyken o modda riskli malzeme (ikamesi yoksa) süzgeç açıkken eklenemez; seçiliyse "dışlandı" olur ve eşleşmeye katılmaz.
   Alerjen süzgeci (DadaSaglik) açıksa seçili alerjeni taşıyan ya da paketli malzeme de riskli sayılır. */
(function () {
  'use strict';
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var kok = $('[data-sg-dolap]'); if (!kok) return;
  var S = window.DadaSaglik, V = null;
  var q = new URLSearchParams(location.search);
  var durum = { mod: q.has('mod') ? q.get('mod') : S.mod(), sec: (q.get('m') || '').split(',').filter(Boolean), suzgec: true };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var svg = function (ic, b) { return '<svg viewBox="0 0 24 24" width="' + (b || 16) + '" height="' + (b || 16) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ic + '</svg>'; };
  var TIK = '<path d="M5 12.5l4.5 4.5L19 7.5"/>', SAAT = '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>';

  function malzemeDurumu(k) {
    if (!V) return { d: 'uygun' };
    var al = S.alerjenler(), dk = V.dk[k] || { al: [], p: 0 };
    if (al.length && (dk.p || dk.al.some(function (a) { return al.indexOf(a) > -1; }))) return { d: 'riskli', n: 'alerjen süzgecin' };
    if (!durum.mod || !V.modlar[durum.mod]) return { d: 'uygun' };
    return V.modlar[durum.mod].d[k] || { d: 'uygun' };
  }
  function adresYaz() {
    var p = new URLSearchParams(location.search);
    if (durum.mod) p.set('mod', durum.mod); else p.delete('mod');
    if (durum.sec.length) p.set('m', durum.sec.join(',')); else p.delete('m');
    try { history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '') + location.hash); } catch (e) {}
  }
  function renkAyarla() {
    var M = durum.mod && V && V.modlar[durum.mod];
    if (M) document.querySelector('.sg-sayfa').setAttribute('data-renk', M.renk); else document.querySelector('.sg-sayfa').removeAttribute('data-renk');
    $$('[data-sg-mod-bar] .sg-mod-bar__oge').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-mod') === (durum.mod || ''))); b.tabIndex = b.getAttribute('data-mod') === (durum.mod || '') ? 0 : -1; });
    $('[data-sg-mod-suzgec-metin]').textContent = M ? M.kisa + ' süzgeci · bu modda riskli malzemeleri dışlar' : (S.alerjenler().length ? 'Alerjen süzgeci · seçtiğin alerjenleri dışlar' : 'Mod süzgeci · önce bir mod seç');
  }
  function kartCiz() {
    $$('.sg-mz', kok).forEach(function (b) {
      var k = b.getAttribute('data-k'), m = malzemeDurumu(k), sec = durum.sec.indexOf(k) > -1;
      b.setAttribute('data-durum', m.d);
      b.setAttribute('aria-pressed', String(sec));
      var kilit = m.d === 'riskli' && durum.suzgec;
      if (kilit) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      $('.sg-mz__not', b).textContent = m.d === 'riskli' ? 'Riskli: ' + m.n : (m.d === 'ikameli' ? 'İkame: ' + m.i : '');
    });
  }
  function etkin() { return durum.sec.filter(function (k) { return !(durum.suzgec && malzemeDurumu(k).d === 'riskli'); }); }
  function seritCiz() {
    var e = etkin(), kap = $('[data-sg-dolap-secilen]');
    $('[data-sg-dolap-sayac]').textContent = 'Dolapta ' + e.length + ' malzeme';
    $('[data-sg-dolap-temizle]').hidden = !durum.sec.length;
    if (!durum.sec.length) { kap.innerHTML = '<p class="sg-ikincil">Henüz malzeme seçmedin. Aşağıdan seç ya da ara.</p>'; return; }
    kap.innerHTML = durum.sec.map(function (k) {
      var dis = e.indexOf(k) < 0, ad = (V.dk[k] || {}).ad || k;
      return '<button type="button" class="sg-dcip' + (dis ? ' sg-dcip--disli' : '') + '" data-k="' + esc(k) + '" aria-label="' + esc(ad) + (dis ? ' (bu modda dışlandı)' : '') + ' — çıkar"><img src="varlik/saglik/ikon/' + esc(k) + '-k.webp" alt="" width="32" height="32">' + esc(ad) + '<span class="sg-dcip__x" aria-hidden="true">×</span></button>';
    }).join('');
  }
  function kart(slug, ik, eksik) {
    var t = V.tarifler[slug], M = durum.mod && V.modlar[durum.mod];
    var ikH = M ? (ik.length ? '<p class="sg-tarif__ikame"><span class="sg-tarif__ikame-bas">Akıllı ikame</span> ' + ik.slice(0, 2).map(function (x) { return '<span class="sg-tarif__ikame-oge">' + esc(x[0]) + ' → <b>' + esc(x[1]) + '</b></span>'; }).join('') + '</p>' : '<p class="sg-tarif__ikame sg-tarif__ikame--yok">' + svg(TIK) + '<span>İkame gerekmez</span></p>') : '';
    return '<article class="sg-kart sg-tarif"' + (M ? ' data-renk="' + M.renk + '"' : '') + ' data-alerjen="' + esc(t.al.join(' ')) + '" data-paketli="' + t.pk + '">'
      + '<div class="sg-tarif__medya"><img src="' + esc(t.k) + '" alt="' + esc(t.b) + ' — Dada Gastro tarif fotoğrafı" width="640" height="429" loading="lazy" decoding="async">' + (M ? '<span class="sg-uyum">' + svg(TIK, 14) + esc(M.uyum) + '</span>' : '') + '<span class="sg-eslesme">' + (eksik ? 'Eksik: ' + esc((V.dk[eksik] || {}).ad || eksik) : '✓ Hepsi dolapta') + '</span></div>'
      + '<div class="sg-kart__govde"><h3><a class="sg-tarif__bag" href="saglik-tarif.html?t=' + encodeURIComponent(slug) + (durum.mod ? '&mod=' + durum.mod : '') + '">' + esc(t.b.split('|')[0].trim()) + '</a></h3>' + ikH
      + '<p class="sg-tarif__meta">' + (t.sure ? '<span>' + svg(SAAT) + t.sure + ' dk</span>' : '') + (t.z ? '<span>' + esc(t.z) + '</span>' : '') + '</p></div></article>';
  }
  function grup(baslik, liste, eksikli) {
    if (!liste.length) return '';
    var g = liste.slice(0, 8);
    return '<div class="sg-dsonuc-grup"><h3>' + esc(baslik) + ' <span class="sg-ikincil">(' + liste.length + ')</span></h3><div class="sg-ortala">' + g.map(function (x) { return kart(x[0], x[1], eksikli ? x[2] : null); }).join('') + '</div>' + (liste.length > 8 ? '<p class="sg-ikincil">+' + (liste.length - 8) + ' tarif daha; malzeme ekledikçe liste daralır.</p>' : '') + '</div>';
  }
  function sonucCiz() {
    var kap = $('[data-sg-dolap-sonuc]'), e = etkin();
    if (!e.length) { kap.innerHTML = '<p class="sg-ikincil sg-bos-satir">' + svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 10h14M9 6.5v1M9 13.5v2"/>', 24) + 'Malzeme seçtikçe sonuçlar burada görünür. Tuz, su, yağ ve baharatlar evde var sayılır.</p>'; return; }
    var M = durum.mod && V.modlar[durum.mod];
    var aday = M ? Object.keys(M.t) : Object.keys(V.tarifler), hemen = [], bir = [];
    var al = S.alerjenler();
    aday.forEach(function (slug) {
      var t = V.tarifler[slug]; if (!t) return;
      if (al.length && (t.pk || t.al.some(function (a) { return al.indexOf(a) > -1 || (a === 'gluten-yulaf' && al.indexOf('gluten') > -1); }))) return;
      var gerek = []; t.m.forEach(function (x) { if (x[5] && gerek.indexOf(x[5]) < 0) gerek.push(x[5]); });
      if (!gerek.some(function (k) { return e.indexOf(k) > -1; })) return;
      var eksik = gerek.filter(function (k) { return e.indexOf(k) < 0; });
      var ik = M ? M.t[slug] : [];
      if (!eksik.length) hemen.push([slug, ik]); else if (eksik.length === 1) bir.push([slug, ik, eksik[0]]);
    });
    kap.innerHTML = (hemen.length || bir.length) ? grup('Hemen yapabilirsin', hemen, false) + grup('1 malzeme eksik', bir, true)
      : '<div class="sg-bos">' + svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 10h14M9 6.5v1M9 13.5v2"/>', 32) + '<h3>Bu malzemelerle eşleşen tarif yok</h3><p>Bir iki malzeme daha ekle' + (M ? ' ya da modu değiştir' : '') + '.</p></div>';
  }
  function hepsi() { renkAyarla(); kartCiz(); seritCiz(); sonucCiz(); adresYaz(); }
  function durumYaz(t) { $('[data-sg-dolap-durum]').textContent = t; }

  kok.addEventListener('click', function (e) {
    var b = e.target.closest('.sg-mz');
    if (b) {
      var k = b.getAttribute('data-k'), i = durum.sec.indexOf(k), m = malzemeDurumu(k);
      if (i < 0 && b.getAttribute('aria-disabled') === 'true') { durumYaz((V.dk[k] || {}).ad + ' bu modda dışlanır: ' + m.n + '.'); return; }
      if (i < 0) durum.sec.push(k); else durum.sec.splice(i, 1);
      durumYaz(''); hepsi(); return;
    }
    var c = e.target.closest('.sg-dcip');
    if (c) { durum.sec = durum.sec.filter(function (x) { return x !== c.getAttribute('data-k'); }); hepsi(); var n = $('.sg-dcip') || $('[data-sg-dolap-ara]'); if (n) n.focus(); }
  });
  $('[data-sg-dolap-temizle]').addEventListener('click', function () { durum.sec = []; hepsi(); });
  $('[data-sg-mod-suzgec]').addEventListener('change', function (e) { durum.suzgec = e.target.checked; hepsi(); });
  var ara = $('[data-sg-dolap-ara]');
  ara.addEventListener('input', function () {
    var n = S.normal(ara.value.trim());
    $$('.sg-dkat', kok).forEach(function (d) {
      var gor = 0; $$('.sg-mz', d).forEach(function (b) { var u = !n || S.normal($('.sg-mz__ad', b).textContent).indexOf(n) > -1; b.hidden = !u; if (u) gor++; });
      d.hidden = !gor; if (n && gor) d.open = true;
    });
  });
  var bar = $('[data-sg-mod-bar]');
  bar.addEventListener('click', function (e) { var b = e.target.closest('.sg-mod-bar__oge'); if (!b) return; durum.mod = b.getAttribute('data-mod'); S.modAyarla(durum.mod); hepsi(); });
  bar.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var bs = $$('.sg-mod-bar__oge', bar), i = bs.indexOf(document.activeElement), n = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length];
    n.focus(); n.click(); e.preventDefault();
  });
  S.dinle(hepsi);
  fetch('varlik/saglik/veri/tarifler.json').then(function (r) { return r.json(); }).then(function (v) {
    V = v; if (durum.mod && !V.modlar[durum.mod]) durum.mod = '';
    durum.sec = durum.sec.filter(function (k) { return V.dk[k]; });
    hepsi();
  }).catch(function () { durumYaz('Veri yüklenemedi; sayfayı yenileyin.'); });
})();
