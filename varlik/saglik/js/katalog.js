/* Mod sayfası tarif kataloğu: arama · süre · kategori · "yalnız ikamesiz" · sıralama · sayfalama (12'şer) ·
   genel alerjen süzgeci (DadaSaglik.uygunMu) · boş durum · mobil filtre alt sayfası.
   Izgara kuralı (Kids): yarım satır yok — son sayfada eksik yuvalar tek yönlendirme kartıyla (Dolap) tamamlanır. */
(function () {
  'use strict';
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  var ADIM = 12;
  function kur(kok) {
    var S = window.DadaSaglik, iz = $('[data-sg-izgara]', kok), form = $('[data-sg-filtre]', kok), sirala = $('[data-sg-sirala]', kok);
    var sayac = $('[data-sg-sonuc]', kok), bos = $('[data-sg-bos]', kok), pagi = $('[data-sg-sayfala]', kok), mod = kok.getAttribute('data-mod');
    var qs = new URLSearchParams(location.search), boy = Math.min(999, Math.max(1, +qs.get('adet') || ADIM)), sayfa = Math.max(1, +qs.get('sayfa') || 1);
    var kartlar = $$('.sg-tarif', iz), ilk = kartlar.slice();
    var dolgu = document.createElement('a');
    dolgu.className = 'sg-kart sg-cta-kart sg-dolgu'; dolgu.href = 'saglik-dolap.html?mod=' + mod;
    dolgu.innerHTML = '<span class="sg-cta-kart__ikon"><i class="fa-solid fa-basket-shopping sg-fa" style="font-size:22px" aria-hidden="true"></i></span><h3>Dolapta ne var?</h3><p>Elindeki malzemelerle bu moda uygun tarif bul.</p><span class="sg-kart__alt">Dolabı aç →</span>';
    function d() {
      var f = new FormData(form);
      return { q: S.normal(f.get('q') || '').trim(), sure: +(f.get('sure') || 0), ikamesiz: !!f.get('ikamesiz'), kat: f.getAll('kat') };
    }
    function uyar(k, x) {
      if (!S.uygunMu(k)) return false;
      if (x.sure && +k.dataset.sure > x.sure) return false;
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
      var x = d(), s = ilk.slice(), m = sirala.value;
      if (m === 'hizli') s.sort(function (a, b) { return a.dataset.sure - b.dataset.sure; });
      if (m === 'az') s.sort(function (a, b) { return a.dataset.ad.localeCompare(b.dataset.ad, 'tr'); });
      var uygun = s.filter(function (k) { return uyar(k, x); });
      var n = uygun.length, toplamS = Math.max(1, Math.ceil(n / boy));
      if (sayfa > toplamS) sayfa = toplamS;
      s.forEach(function (k) { k.hidden = true; iz.appendChild(k); });
      var dilim = uygun.slice((sayfa - 1) * boy, sayfa * boy);
      dilim.forEach(function (k) { k.hidden = false; k.classList.add('sg-gorundu'); iz.appendChild(k); });
      sayac.textContent = n + ' tarif';
      bos.hidden = n > 0;
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
    form.addEventListener('input', function () { ciz(true); });
    form.addEventListener('change', function () { ciz(true); });
    form.addEventListener('reset', function () { setTimeout(function () { ciz(true); }, 0); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    sirala.addEventListener('change', function () { ciz(true); });
    S.dinle(function () { ciz(true); });
    var r; addEventListener('resize', function () { clearTimeout(r); r = setTimeout(function () { ciz(false); }, 120); });
    // mobil filtre alt sayfası
    var ac = $('.sg-filtre-ac', kok), panel = ac && document.getElementById(ac.getAttribute('aria-controls'));
    if (ac && panel) {
      var perde = document.createElement('div'); perde.className = 'sg-perde'; document.body.appendChild(perde);
      var acF = function () { panel.classList.add('sg-acik'); perde.classList.add('sg-acik'); ac.setAttribute('aria-expanded', 'true'); var i = $('input', panel); if (i) i.focus(); };
      var kapat = function () { panel.classList.remove('sg-acik'); perde.classList.remove('sg-acik'); ac.setAttribute('aria-expanded', 'false'); };
      ac.addEventListener('click', acF); perde.addEventListener('click', kapat);
      $$('.sg-filtre__kapat', panel).forEach(function (b) { b.addEventListener('click', kapat); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') kapat(); });
    }
    ciz(false);
  }
  function basla() { $$('[data-sg-katalog]').forEach(kur); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();
