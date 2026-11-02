/* Mod sayfası tarif kataloğu: arama · kategori · mutfak · süre · zorluk · beslenme/tip · bütçe (Gastro grupları, H28) · "yalnız ikamesiz" · sıralama · sayfalama (12'şer) ·
   genel alerjen süzgeci (DadaSaglik.uygunMu) · boş durum · mobil filtre alt sayfası.
   İşaretleme = Gastro tarif listesi (H18): .lst-side süzgeç, .lst-bar (.lst-sum · .btn-filter/.fb-count · .sort-dd), .lst-empty.
   Gastro'nun sunucuya giden davranışları (form gönderimi, sıralama bağlantıları) burada istemci tarafında; aç/kapa kalıpları
   Gastro tarif-liste.js (sayfa + perde, Escape, sıralama menüsü) ve p1/filtre-paneli.js (masaüstü panel boyu = liste boyu) ile aynı.
   .fct-head aç/kapa, .fct-more ve Kafes/Liste düğmesi Gastro app.js'te (sayfada yüklü) kalır.
   Izgara kuralı (Kids): yarım satır yok — son sayfada eksik yuvalar tek yönlendirme kartıyla (Dolap) tamamlanır. */
(function () {
  'use strict';
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var ADIM = 12;
  var SURE = { '15': [0, 15], '15-30': [15, 30], '30-45': [30, 45], '45-60': [45, 60], '60-120': [60, 120], '120': [120, 1e9] };
  function kur(kok) {
    var S = window.DadaSaglik, iz = $('[data-sg-izgara]', kok), form = $('[data-sg-filtre]', kok), siralama = 'onerilen';
    var sayac = $('[data-sg-sonuc]', kok), bos = $('[data-sg-bos]', kok), pagi = $('[data-sg-sayfala]', kok), mod = kok.getAttribute('data-mod');
    var side = $('.lst-side', kok), main = $('.lst-main', kok), fbSay = $('.fb-count', kok);
    var qs = new URLSearchParams(location.search), boy = Math.min(999, Math.max(1, +qs.get('adet') || ADIM)), sayfa = Math.max(1, +qs.get('sayfa') || 1);
    var kartlar = $$('.sg-tarif', iz), ilk = kartlar.slice();
    var dolgu = document.createElement('a');
    dolgu.className = 'sg-kart sg-cta-kart sg-dolgu'; dolgu.href = 'saglik-dolap.html?mod=' + mod;
    dolgu.innerHTML = '<span class="sg-cta-kart__ikon"><i class="fa-solid fa-basket-shopping sg-fa" style="font-size:22px" aria-hidden="true"></i></span><h3>Dolapta ne var?</h3><p>Elindeki malzemelerle bu moda uygun tarif bul.</p><span class="sg-kart__alt">Dolabı aç →</span>';
    function d() {
      var f = new FormData(form);
      return { q: S.normal(f.get('q') || '').trim(), sure: f.getAll('sure'), ikamesiz: !!f.get('ikamesiz'), kat: f.getAll('kat'), mutfak: f.getAll('mutfak'), zorluk: f.getAll('zorluk'), beslenme: f.getAll('beslenme'), butce: f.getAll('butce') };
    }
    function uyar(k, x) {
      if (!S.uygunMu(k)) return false;
      // Gastro grupları (H28): grup içinde VEYA, gruplar arası VE. Süre aralıkları Gastro'nunki (dk): 15 · 15-30 · 30-45 · 45-60 · 60-120 · 120+
      if (x.sure.length) { var dk = +k.dataset.sure; if (!(dk < 999) || !x.sure.some(function (v) { var r = SURE[v] || [0, 0]; return dk >= r[0] && dk < r[1]; })) return false; }
      if (x.mutfak.length && x.mutfak.indexOf(k.dataset.mutfak) < 0) return false;
      if (x.zorluk.length && x.zorluk.indexOf(k.dataset.zorluk) < 0) return false;
      if (x.butce.length && x.butce.indexOf(k.dataset.butce) < 0) return false;
      if (x.beslenme.length) { var bs = (k.dataset.beslenme || '').split(' '); if (!x.beslenme.some(function (v) { return bs.indexOf(v) > -1; })) return false; }
      if (x.ikamesiz && +k.dataset.ikame > 0) return false;
      if (x.kat.length) { var ks = k.dataset.kat.split(' '); if (!x.kat.some(function (c) { return ks.indexOf(c) > -1; })) return false; }
      if (x.q && S.normal(k.dataset.ad + ' ' + k.textContent).indexOf(x.q) < 0) return false;
      return true;
    }
    function sutun() { var t = getComputedStyle(iz).gridTemplateColumns.split(' ').filter(Boolean).length; return Math.max(1, t); }
    // Sayfalama = Gastro tarif listesi kalıbı (nav.pagi · .pg · .pg.is-active · .pg-dots · .pagi-note); ?sayfa= adreste
    function pg(n, etiket, ozel) { return '<button type="button" class="pg' + (ozel || '') + '" data-sayfa="' + n + '"' + (etiket ? ' aria-label="' + etiket + '"' : '') + '>'; }
    function sayfalaCiz(n, toplamS) {
      if (toplamS <= 1) { pagi.innerHTML = n ? '<span class="pagi-note">' + n + ' tarif gösteriliyor</span>' : ''; return; }
      var h = '', dis = function (k) { return k ? ' is-disabled" disabled aria-disabled="true' : ''; };
      h += pg(1, 'İlk sayfa', ' arrow' + dis(sayfa === 1)) + '<i class="fa-solid fa-angles-left" aria-hidden="true"></i></button>';
      h += pg(Math.max(1, sayfa - 1), 'Önceki sayfa', ' arrow' + dis(sayfa === 1)) + '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>';
      var gor = [1, toplamS, sayfa - 1, sayfa, sayfa + 1].filter(function (x, i, d) { return x >= 1 && x <= toplamS && d.indexOf(x) === i; }).sort(function (x, y) { return x - y; });
      gor.forEach(function (x, i) { if (i && x - gor[i - 1] > 1) h += '<span class="pg-dots" aria-hidden="true">…</span>'; h += x === sayfa ? '<span class="pg is-active active" aria-current="page">' + x + '</span>' : pg(x, x + '. sayfa') + x + '</button>'; });
      h += pg(Math.min(toplamS, sayfa + 1), 'Sonraki sayfa', ' arrow' + dis(sayfa === toplamS)) + '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>';
      h += pg(toplamS, 'Son sayfa', ' arrow' + dis(sayfa === toplamS)) + '<i class="fa-solid fa-angles-right" aria-hidden="true"></i></button>';
      var bas = (sayfa - 1) * boy + 1, son = Math.min(n, sayfa * boy);
      h += '<span class="pagi-note">' + n + ' tariften ' + bas + '–' + son + ' arası gösteriliyor</span>';
      pagi.innerHTML = h;
    }
    function adres() { try { var p = new URLSearchParams(location.search); if (sayfa > 1) p.set('sayfa', sayfa); else p.delete('sayfa'); history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '') + location.hash); } catch (e) {} }
    function ciz(sifirla) {
      if (sifirla) sayfa = 1;
      var x = d(), s = ilk.slice(), m = siralama;
      if (m === 'puan') s.sort(function (a, b) { return b.dataset.puan - a.dataset.puan; });
      if (m === 'hizli') s.sort(function (a, b) { return a.dataset.sure - b.dataset.sure; });
      if (m === 'az') s.sort(function (a, b) { return a.dataset.ad.localeCompare(b.dataset.ad, 'tr'); });
      var uygun = s.filter(function (k) { return uyar(k, x); });
      var n = uygun.length, toplamS = Math.max(1, Math.ceil(n / boy));
      if (sayfa > toplamS) sayfa = toplamS;
      s.forEach(function (k) { k.hidden = true; iz.appendChild(k); });
      var dilim = uygun.slice((sayfa - 1) * boy, sayfa * boy);
      dilim.forEach(function (k) { k.hidden = false; k.classList.add('sg-gorundu'); iz.appendChild(k); });
      sayac.textContent = n.toLocaleString('tr') + ' tarif';
      bos.classList.toggle('show', !n);
      etkinler(x);
      // yarım satır: son sayfadaki boş yuvaları tek dolgu kartıyla tamamla
      if (dolgu.parentNode) dolgu.parentNode.removeChild(dolgu);
      var c = sutun(), kalan = dilim.length % c;
      if (n && kalan) { dolgu.style.gridColumn = 'span ' + (c - kalan); iz.insertBefore(dolgu, dilim[dilim.length - 1].nextSibling); }
      sayfalaCiz(n, toplamS); adres();
    }
    pagi.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-sayfa]'); if (!b || b.disabled) return;
      sayfa = +b.getAttribute('data-sayfa'); ciz(false);
      var ust = kok.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sg-bar-alt')) || 120) - 16;
      try { scrollTo({ top: ust, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } catch (er) { scrollTo(0, ust); }
      var a = $('.sg-tarif:not([hidden]) a', iz); if (a) a.focus({ preventScroll: true });
    });
    // Gastro .fct-dot / .has-active (grup başına seçili sayısı) ve .btn-filter .fb-count (toplam) — Gastro bunları sunucuda basar
    function etkinler(x) {
      var top = 0;
      $$('.fct', form).forEach(function (g) {
        var n = $$('input', g).filter(function (i) { return i.type === 'search' ? !!i.value.trim() : i.checked && i.value !== ''; }).length;
        var dot = $('.fct-dot', g); if (dot) dot.textContent = n;
        g.classList.toggle('has-active', n > 0); top += n;
      });
      if (fbSay) { fbSay.textContent = top; fbSay.hidden = !top; }
    }
    form.addEventListener('input', function () { ciz(true); });
    form.addEventListener('change', function () { ciz(true); });
    form.addEventListener('reset', function () { setTimeout(function () { ciz(true); }, 0); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    // Temizle / Tümünü Temizle: Gastro'da sayfa adresine bağlantı (süzgeçsiz sayfa); burada aynı bağlantı, JS ile yerinde sıfırlar
    $$('[data-sg-temizle]', kok).forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); form.reset(); }); });
    // Sıralama menüsü (Gastro tarif-liste.js: .sort-dd.open, dışarı tıklayınca kapanır)
    var dd = $('.sort-dd', kok), ddBtn = dd && $('.sort-btn', dd), ddCur = dd && $('#sortCur', dd);
    if (dd && ddBtn) {
      var ddKapat = function () { dd.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); };
      ddBtn.addEventListener('click', function (e) { e.stopPropagation(); var a = dd.classList.toggle('open'); ddBtn.setAttribute('aria-expanded', a ? 'true' : 'false'); });
      document.addEventListener('click', function (e) { if (!e.target.closest('.sort-dd')) ddKapat(); });
      $$('[data-sg-sirala]', dd).forEach(function (b) {
        b.addEventListener('click', function () {
          siralama = b.getAttribute('data-sg-sirala');
          $$('[data-sg-sirala]', dd).forEach(function (o) { o.classList.toggle('active', o === b); });
          if (ddCur) ddCur.textContent = b.textContent.trim();
          ddKapat(); ddBtn.focus(); ciz(true);
        });
      });
    }
    S.dinle(function () { ciz(true); });
    var r; addEventListener('resize', function () { clearTimeout(r); r = setTimeout(function () { ciz(false); }, 120); });
    // Kafes/Liste (Gastro app.js geçişi yapar) → dolgu kartı sütun sayısına göre yeniden
    $$('[data-view]', kok).forEach(function (b) { b.addEventListener('click', function () { setTimeout(function () { ciz(false); }, 0); }); });
    // Mobil süzgeç sayfası (Gastro tarif-liste.js birebir: .lst-side.open + .sheet-overlay.open, gövde kilidi, alt çubuk gizlenir).
    // Perdeye ayrıca Gastro token CSS'inin açık sınıfı .is-open: tokens .sheet-overlay{display:none} yalnız .is-open'da açılır, tarif-liste.js
    // ise .open verir → yerel Gastro donöründe perde hiç görünmüyor/tıklanmıyor (ölçüldü: 0×0). İki sınıf birlikte = perde karartır ve kapatır.
    var ac = $('.btn-filter', kok), perde = $('.sheet-overlay', kok), kapa = $('.sheet-close', kok);
    if (ac && side && perde) {
      var acik = false;
      var altlar = function (gizle) { var bn = document.querySelector('.bottom-nav'), mp = document.getElementById('mentorPanel'); if (bn) bn.classList.toggle('bn-hidden', gizle); if (mp) mp.classList.toggle('foot-hide', gizle); };
      var acF = function () { acik = true; side.classList.add('open'); perde.classList.add('open', 'is-open'); document.body.style.overflow = 'hidden'; document.body.classList.add('bn-lock'); altlar(true); ac.setAttribute('aria-expanded', 'true'); if (kapa) kapa.focus({ preventScroll: true }); };
      var kapat = function () { if (!acik) return; acik = false; side.classList.remove('open'); perde.classList.remove('open', 'is-open'); document.body.style.overflow = ''; document.body.classList.remove('bn-lock'); altlar(false); ac.setAttribute('aria-expanded', 'false'); ac.focus({ preventScroll: true }); };
      ac.addEventListener('click', acF); perde.addEventListener('click', kapat);
      if (kapa) kapa.addEventListener('click', kapat);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { kapat(); if (dd) { dd.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); } } });
    }
    // Masaüstü panel boyu = liste sütunu boyu (Gastro p1/filtre-paneli.js; satır içi stil yazılmaz, CSSOM kuralı)
    if (side && main && side.id) {
      var st = document.createElement('style'); document.head.appendChild(st);
      st.sheet.insertRule('@media (min-width:1025px) { #' + side.id + ' { max-height:none; overflow-y:auto; } }');
      var kural = st.sheet.cssRules[0].cssRules[0];
      var olc = function () { var h = main.getBoundingClientRect().height; if (h > 0) kural.style.maxHeight = h + 'px'; };
      if (window.ResizeObserver) new ResizeObserver(olc).observe(main);
      addEventListener('resize', olc); olc();
      // aria-expanded eşlemesi (Gastro filtre-paneli.js states(); aç/kapa Gastro app.js'te)
      var durum = function () { $$('.fct', side).forEach(function (g) { var h = $('.fct-head', g), m = $('.fct-more', g); if (h) h.setAttribute('aria-expanded', String(g.classList.contains('open'))); if (m) m.setAttribute('aria-expanded', String(g.classList.contains('more-open'))); }); };
      new MutationObserver(durum).observe(side, { subtree: true, attributes: true, attributeFilter: ['class'] }); durum();
    }
    ciz(false);
  }
  function basla() { $$('[data-sg-katalog]').forEach(kur); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();
