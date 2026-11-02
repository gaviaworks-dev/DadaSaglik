/* =====================================================================
   DADA GASTRO SAĞLIK — ortak davranış (Kids kids.js'in Sağlık karşılığı; bağımlılıksız)
   · html.sg-js · .sg-gir görünür alana girince .sg-gorundu
   · Yapışkan tek katman (Kids R3): aşağı kayınca yalnız Gastro header.header gizlenir (siyah üst bant + Sağlık barı kalır),
     mini kilit görünür; yukarıda geri gelir. --sg-ust-bosluk / --sg-gastro-alt; sayfa barları top: var(--sg-bar-alt)
   · SSS tek-açık akordeon (Kids sssKur birebir; #hash açar)
   · Alerjen süzgeci: localStorage 'dadagastrosaglik.alerjen.v1' (try/catch). Seçili alerjeni içeren ve paketli (aynı bant
     riski) malzemeli her .sg-tarif kartı TÜM sayfalarda gizlenir; durum şeridi her sayfada görünür.
   · Son mod: 'dadagastrosaglik.mod.v1' (Dolap varsayılanı).
   · window.DadaSaglik = { alerjenler(), alerjenAyarla(liste), dinle(fn), mod(), modAyarla(kod), uygunMu(kart), normal }
   ===================================================================== */
(function () {
  'use strict';
  document.documentElement.classList.add('sg-js');
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var normal = function (s) { return String(s || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/â/g, 'a'); };
  var ALERJEN_AD = { gluten: 'Gluten', sut: 'Süt', yumurta: 'Yumurta', yerfistigi: 'Yer fıstığı', sertkabuklu: 'Sert kabuklu', susam: 'Susam', balik: 'Balık', kabuklu: 'Kabuklu deniz ürünü', yumusakca: 'Yumuşakça', soya: 'Soya', hardal: 'Hardal', kereviz: 'Kereviz', sulfit: 'Sülfit' };

  /* ---------- Depolama (her erişim try/catch; kapalıyken yalnız bu sayfa) ---------- */
  var A_ANAHTAR = 'dadagastrosaglik.alerjen.v1', M_ANAHTAR = 'dadagastrosaglik.mod.v1', bellek = {};
  function oku(k) { try { var v = localStorage.getItem(k); return v === null ? (k in bellek ? bellek[k] : null) : v; } catch (e) { return k in bellek ? bellek[k] : null; } }
  function yaz(k, v) { bellek[k] = v; try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* depolama kapalı */ } }
  function alerjenler() { try { var x = JSON.parse(oku(A_ANAHTAR) || '[]'); return Array.isArray(x) ? x.filter(function (a) { return ALERJEN_AD[a]; }) : []; } catch (e) { return []; } }
  var dinleyiciler = [];
  function alerjenAyarla(l) { yaz(A_ANAHTAR, l.length ? JSON.stringify(l) : null); uygula(); dinleyiciler.forEach(function (f) { try { f(l); } catch (e) {} }); }
  function mod() { return oku(M_ANAHTAR) || ''; }
  function modAyarla(k) { yaz(M_ANAHTAR, k || null); }

  /** Kart alerjen süzgecine göre görünebilir mi? (gluten seçiliyse sertifikasız yulaf da gider) */
  function uygunMu(kart) {
    var sec = alerjenler(); if (!sec.length) return true;
    if (kart.getAttribute('data-paketli') === '1') return false;
    var al = (kart.getAttribute('data-alerjen') || '').split(' ');
    for (var i = 0; i < sec.length; i++) { if (al.indexOf(sec[i]) > -1) return false; if (sec[i] === 'gluten' && al.indexOf('gluten-yulaf') > -1) return false; }
    return true;
  }
  function uygula() {
    var sec = alerjenler();
    // katalog kendi görünürlüğünü yönetir (sayfalama); diğer listelerde kartı doğrudan gizle
    $$('.sg-tarif').forEach(function (k) { if (k.closest('[data-sg-katalog]')) return; k.hidden = !uygunMu(k); });
    var d = $('#sgAlerjenDurum');
    if (d) {
      d.hidden = !sec.length;
      if (sec.length) d.innerHTML = '<div class="wrap"><span>Alerjen süzgeci açık: <b>' + sec.map(function (a) { return ALERJEN_AD[a]; }).join(', ') + '</b> içeren ve aynı bantta üretilmiş olabilecek ürünlü tarifler gizleniyor.</span> <a href="saglik-alerji.html#alsec">Değiştir</a></div>';
    }
  }
  /* Gastro tarif kartı BİREBİR (istemci; ortak.mjs tarifKart ile aynı işaretleme). V = varlik/saglik/veri/tarifler.json */
  var RD_MOD = { colyak: ['rd-glutensiz', 'wheat-awn-circle-exclamation'], laktoz: ['rd-laktozsuz', 'glass-water'], diyabet: ['', 'droplet'], alerji: ['', 'shield-halved'], ibs: ['', 'leaf'], kalp: ['', 'heart-pulse'] };
  function e_(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function gastroKart(V, slug, modKod, ek) {
    ek = ek || {}; var t = V.tarifler[slug]; if (!t) return '';
    var M = modKod && V.modlar[modKod], ik = M ? (M.t[slug] || []) : [], b = t.b.split('|')[0].trim(), rozet = '';
    if (M) { var r = RD_MOD[modKod] || ['', 'circle-check'], ad = M.uyum + ' uyumlu'; rozet += '<span class="rd-b' + (r[0] ? ' ' + r[0] : '') + '" title="' + e_(ad) + '" aria-label="' + e_(ad) + '"><i class="fa-solid fa-' + r[1] + '" aria-hidden="true"></i></span>'; }
    if (ik.length) { var ia = 'Akıllı ikame: ' + ik.map(function (x) { return x[0] + ' yerine ' + x[1]; }).join(', '); rozet += '<span class="rd-b" title="' + e_(ia) + '" aria-label="' + e_(ia) + '"><i class="fa-solid fa-right-left" aria-hidden="true"></i></span>'; }
    if (ek.rozet) rozet += ek.rozet;
    var sef = t.sa || t.sk || '';
    return '<article class="r-card sg-tarif"' + (M ? ' data-renk="' + M.renk + '"' : '') + ' data-slug="' + e_(slug) + '" data-alerjen="' + e_((t.al || []).join(' ')) + '" data-paketli="' + (t.pk || 0) + '" data-ikameler="' + e_(ik.map(function (x) { return x[0] + '→' + x[1]; }).join('|')) + '">'
      + ' <div class="r-media-wrap"> <div class="r-media " role="img" aria-label="' + e_(b) + '" style="background-image:url(\'' + e_(t.k) + '\')"> <span class="r-chip">' + e_(t.ka || '') + '</span> ' + (rozet ? '<div class="r-diet">' + rozet + '</div>' : '') + ' <div class="m-types"> </div> </div> </div>'
      + ' <div class="r-body"> <h4><a class="sg-tarif__bag" href="saglik-tarif.html?t=' + encodeURIComponent(slug) + (modKod ? '&mod=' + modKod : '') + '">' + e_(b) + '</a></h4>'
      + ' <div class="r-facts">' + (t.sure ? ' <span><i class="fa-solid fa-clock" aria-hidden="true"></i> <span class="rf-txt">' + t.sure + ' dk</span></span>' : '') + (t.z ? ' <span><i class="fa-solid fa-gauge-simple" aria-hidden="true"></i> <span class="rf-txt">' + e_(t.z) + '</span></span>' : '')
      + (t.p ? ' <span class="f-serv"><i class="fa-solid fa-utensils" aria-hidden="true"></i> <span class="rf-txt"><span class="rf-uzun">' + t.p + ' ' + e_(t.pb || 'kişilik') + '</span><span class="rf-kisa" aria-hidden="true">' + t.p + ' kişi</span></span></span>' : '')
      + (t.bt ? ' <span class="r-cost" title="' + e_(t.bta || '') + '"> ' + [1, 2, 3].map(function (n) { return '<b class="' + (n <= t.bt ? 'rc-on' : 'rc-off') + '">₺</b>'; }).join(' ') + ' </span>' : '') + ' </div>'
      + ' <div class="r-foot"> ' + (sef ? '<a class="r-author" href="https://dadagastro.com/sefler/' + e_(t.sk || '') + '" title="' + e_(sef) + ' profilini gör"> <div class="av"><span aria-hidden="true">' + e_(sef.trim().charAt(0).toLocaleUpperCase('tr')) + '</span></div> <span><b>' + e_(sef) + '</b></span> </a>' : '')
      + ' <div class="r-stats"> ' + (t.pu ? '<span class="r-rate"><i class="fa-solid fa-star" aria-hidden="true"></i> ' + (Number(t.pu) / 10).toFixed(1) + '</span>' : '') + ' <span class="r-views"><i class="fa-solid fa-eye" aria-hidden="true"></i> ' + Number(t.g || 0).toLocaleString('tr') + '</span> </div> </div>'
      + ' </div></article>';
  }
  window.DadaSaglik = { alerjenler: alerjenler, alerjenAyarla: alerjenAyarla, dinle: function (f) { dinleyiciler.push(f); }, mod: mod, modAyarla: modAyarla, uygunMu: uygunMu, normal: normal, gastroKart: gastroKart, ALERJEN_AD: ALERJEN_AD, oku: oku, yaz: yaz };

  /* ---------- Kart girişi ---------- */
  function girisKur() {
    var o = $$('.sg-gir'); if (!o.length) return;
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { o.forEach(function (x) { x.classList.add('sg-gorundu'); }); return; }
    var io = new IntersectionObserver(function (g) { g.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('sg-gorundu'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: .05 });
    o.forEach(function (x) { io.observe(x); });
    setTimeout(function () { o.forEach(function (x) { if (x.getBoundingClientRect().top < innerHeight) x.classList.add('sg-gorundu'); }); }, 2000);
    window.DadaSaglik.gozle = function (x) { if (x.classList.contains('sg-gorundu')) return; io.observe(x); };
  }

  /* ---------- Yapışkan tek katman (Kids yapiskanKur birebir) ---------- */
  function yapiskanKur() {
    var kok = document.documentElement, bar = $('.sg-ust');
    var gastro = $$('header.header, .topbar, .ust-bant').filter(function (e, i, d) { return d.indexOf(e) === i; });
    var sayfa = document.body.classList.contains('pg-saglik') && bar;
    var alt = 0, bant = 0, gizli = false, sonY = Math.max(0, scrollY), birikim = 0, bekliyor = false;
    function olc() {
      alt = 0; bant = 0;
      gastro.forEach(function (el) {
        var cs = getComputedStyle(el); if (cs.display === 'none' || !el.offsetHeight) return;
        if (cs.position === 'fixed' || cs.position === 'sticky') {
          var a = (parseFloat(cs.top) || 0) + el.offsetHeight; alt = Math.max(alt, a);
          if (!el.matches('header.header')) bant = Math.max(bant, a);
        }
      });
      alt = Math.round(alt); bant = Math.round(bant); kok.style.setProperty('--sg-gastro-alt', alt + 'px'); uygulaUst();
    }
    function uygulaUst() { kok.style.setProperty('--sg-ust-bosluk', (gizli ? bant : alt) + 'px'); kok.classList.toggle('sg-ust-gizli', gizli); }
    function acikMi() { return !!document.querySelector('.has-mega:hover, .has-mega:focus-within, .drawer.open, header.header:focus-within, .topbar:focus-within'); }
    function ayarla(y) { if (y !== gizli) { gizli = y; birikim = 0; uygulaUst(); } }
    function kaydir() {
      bekliyor = false;
      var y = Math.max(0, scrollY), dy = y - sonY; sonY = y;
      if (!sayfa) return;
      if (y <= alt + 24 || acikMi()) { ayarla(false); return; }
      birikim = (dy > 0) === (birikim > 0) ? birikim + dy : dy;
      if (birikim > 10) ayarla(true); else if (birikim < -10) ayarla(false);
    }
    addEventListener('scroll', function () { if (!bekliyor) { bekliyor = true; requestAnimationFrame(kaydir); } }, { passive: true });
    addEventListener('resize', olc);
    gastro.forEach(function (el) { el.addEventListener('focusin', function () { ayarla(false); }); });
    olc(); setTimeout(olc, 400);
    if (sayfa) kaydir();
  }
  function menuAktifKur() {
    var m = $('.sg-ust__menu'); if (!m) return;
    function tasma() { m.classList.toggle('sg-tasma-sag', m.scrollLeft + m.clientWidth < m.scrollWidth - 2); m.classList.toggle('sg-tasma-sol', m.scrollLeft > 2); }
    m.addEventListener('scroll', tasma, { passive: true }); addEventListener('resize', tasma); tasma();
    var a = $('[aria-current="page"]:not(.sg-ust__ev)', m); if (!a) return;
    function goster() { var mr = m.getBoundingClientRect(), ar = a.getBoundingClientRect(); if (ar.left < mr.left + 8 || ar.right > mr.right - 8) m.scrollLeft += (ar.left + ar.width / 2) - (mr.left + mr.width / 2); }
    goster(); addEventListener('resize', goster);
  }

  /* ---------- SSS ---------- */
  function sssKur() {
    var gruplar = $$('[data-sg-sss]'); if (!gruplar.length) return;
    function ayarla(o, acik) { var d = $('.sg-sss__dugme', o); if (!d) return; d.setAttribute('aria-expanded', String(acik)); if (acik) o.setAttribute('data-acik', ''); else o.removeAttribute('data-acik'); }
    function ac(o, kaydir) {
      var g = o.closest('[data-sg-sss]'); $$('.sg-sss__oge[data-acik]', g).forEach(function (x) { if (x !== o) ayarla(x, false); }); ayarla(o, true);
      if (kaydir) { try { o.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } catch (e) { o.scrollIntoView(); } }
    }
    gruplar.forEach(function (g) {
      $$('.sg-sss__oge', g).forEach(function (o) { ayarla(o, false); });
      g.addEventListener('click', function (e) { var d = e.target.closest('.sg-sss__dugme'); if (!d) return; var o = d.closest('.sg-sss__oge'); if (o.hasAttribute('data-acik')) ayarla(o, false); else ac(o, false); });
    });
    function hashAc() { var h = decodeURIComponent((location.hash || '').slice(1)); if (!h) return; var el = document.getElementById(h); if (!el) return; var o = el.closest('.sg-sss__oge'); if (o) ac(o, true); }
    hashAc(); addEventListener('hashchange', hashAc);
  }

  /* ---------- Alerjen seçici (Alerji modu sayfası) ---------- */
  function alerjenSeciciKur() {
    var k = $('[data-sg-alerjen-sec]'); if (!k) return;
    var kutular = $$('input[name="alerjen"]', k), ozet = $('[data-sg-alerjen-ozet]', k);
    function ciz() {
      var s = alerjenler(); kutular.forEach(function (i) { i.checked = s.indexOf(i.value) > -1; });
      ozet.textContent = s.length ? 'Seçili: ' + s.map(function (a) { return ALERJEN_AD[a]; }).join(', ') + '. Bu alerjenler ve aynı bant riski taşıyan ürünlü tarifler tüm listelerden kalktı.' : 'Henüz alerjen seçilmedi. Liste, paketli ürün içermeyen tüm tarifleri gösteriyor.';
    }
    k.addEventListener('change', function () { alerjenAyarla(kutular.filter(function (i) { return i.checked; }).map(function (i) { return i.value; })); ciz(); });
    var t = $('[data-sg-alerjen-temizle]', k); if (t) t.addEventListener('click', function () { alerjenAyarla([]); ciz(); });
    ciz();
  }

  /* ---------- Mod hafızası: mod sayfası ya da hub seçimi ---------- */
  function modHafiza() {
    var s = $('.sg-sayfa[data-mod]'); if (s) modAyarla(s.getAttribute('data-mod'));
    $$('[data-sg-mod-sec]').forEach(function (a) { a.addEventListener('click', function () { modAyarla(a.getAttribute('data-sg-mod-sec')); }); });
  }

  /* Mega menü yuvası: Sağlık ↔ Kids şeritleri 6 sn'de bir; fare/odakta durur; reduced-motion'da otomatik geçiş yok (noktalarla elle) */
  function megaDonguKur() {
    $$('[data-sg-dongu]').forEach(function (y) {
      var ogeler = $$('[data-sg-dongu-oge]', y), i = 0, dur = false, sure = null;
      if (ogeler.length < 2) return;
      function goster(n) {
        i = (n + ogeler.length) % ogeler.length;
        ogeler.forEach(function (o, k) { o.classList.toggle('sg-dongu-aktif', k === i); if (k === i) o.removeAttribute('aria-hidden'); else o.setAttribute('aria-hidden', 'true'); $$('a', o).forEach(function (a) { if (k === i) a.removeAttribute('tabindex'); else a.setAttribute('tabindex', '-1'); }); });
        $$('[data-sg-dongu-git]', y).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-sg-dongu-git') === ogeler[i].getAttribute('data-sg-dongu-oge'))); });
      }
      $$('[data-sg-dongu-git]', y).forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); goster(ogeler.map(function (o) { return o.getAttribute('data-sg-dongu-oge'); }).indexOf(b.getAttribute('data-sg-dongu-git'))); }); });
      y.addEventListener('mouseenter', function () { dur = true; }); y.addEventListener('mouseleave', function () { dur = false; });
      y.addEventListener('focusin', function () { dur = true; }); y.addEventListener('focusout', function () { dur = false; });
      goster(0);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) sure = setInterval(function () { if (!dur && !document.hidden) goster(i + 1); }, 6000);
      y._sgDongu = goster;
    });
  }
  /* Mod sekmeleri: Tarifler ↔ Bilgilendirme aynı sayfada; tıklayınca panel değişir (yenileme yok), adres pushState ile güncellenir */
  function sekmeKur() {
    var bag = $$('.sg-sekmeler a[data-sg-sekme]'); if (!bag.length || !$('[data-sg-sekme-panel]')) return;
    function goster(ad, kaydir) {
      bag.forEach(function (a) { var on = a.getAttribute('data-sg-sekme') === ad; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      $$('[data-sg-sekme-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-sg-sekme-panel') !== ad; if (!p.hidden) $$('.sg-gir', p).forEach(function (x) { x.classList.add('sg-gorundu'); }); });
      dispatchEvent(new Event('resize'));
      if (kaydir) { var s = $('.sg-sekme-bolum'); if (s) { var ust = s.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sg-bar-alt')) || 120); if (scrollY > ust) scrollTo(0, ust); } }
    }
    bag.forEach(function (a) { a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault(); var ad = a.getAttribute('data-sg-sekme');
      if (a.getAttribute('aria-current') === 'page') return;
      try { history.pushState({ sgSekme: ad }, '', a.getAttribute('href')); } catch (er) {}
      goster(ad, true); a.focus();
    }); });
    addEventListener('popstate', function () { goster(/-bilgi\.html$/.test(location.pathname) ? 'bilgi' : 'tarif', false); });
  }
  function basla() { sekmeKur(); megaDonguKur(); modHafiza(); sssKur(); uygula(); alerjenSeciciKur(); girisKur(); yapiskanKur(); menuAktifKur(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();
