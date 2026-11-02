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
    var sayac = $('[data-sg-sonuc]', kok), bos = $('[data-sg-bos]', kok), daha = $('[data-sg-daha]', kok), mod = kok.getAttribute('data-mod');
    var kartlar = $$('.sg-tarif', iz), ilk = kartlar.slice(), goster = ADIM;
    var dolgu = document.createElement('a');
    dolgu.className = 'sg-kart sg-cta-kart sg-dolgu'; dolgu.href = 'saglik-dolap.html?mod=' + mod;
    dolgu.innerHTML = '<span class="sg-cta-kart__ikon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 10h14M9 6.5v1M9 13.5v2"/></svg></span><h3>Dolapta ne var?</h3><p>Elindeki malzemelerle bu moda uygun tarif bul.</p><span class="sg-kart__alt">Dolabı aç →</span>';
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
    function ciz(sifirla) {
      if (sifirla) goster = ADIM;
      var x = d(), s = ilk.slice(), m = sirala.value;
      if (m === 'hizli') s.sort(function (a, b) { return a.dataset.sure - b.dataset.sure; });
      if (m === 'az') s.sort(function (a, b) { return a.dataset.ad.localeCompare(b.dataset.ad, 'tr'); });
      var uygun = s.filter(function (k) { return uyar(k, x); });
      s.forEach(function (k) { k.hidden = true; iz.appendChild(k); });
      uygun.slice(0, goster).forEach(function (k) { k.hidden = false; k.classList.add('sg-gorundu'); });
      var n = uygun.length, gor = Math.min(n, goster);
      sayac.textContent = n + ' tarif';
      bos.hidden = n > 0; daha.parentNode.hidden = gor >= n;
      daha.textContent = 'Daha fazla göster (' + (n - gor) + ')';
      // yarım satır: son satırdaki boş yuvaları tek dolgu kartıyla tamamla (yalnız tüm sonuçlar gösterildiğinde)
      if (dolgu.parentNode) dolgu.parentNode.removeChild(dolgu);
      var c = sutun(), kalan = gor % c;
      if (n && gor >= n && kalan) { dolgu.style.gridColumn = 'span ' + (c - kalan); iz.appendChild(dolgu); }
    }
    form.addEventListener('input', function () { ciz(true); });
    form.addEventListener('change', function () { ciz(true); });
    form.addEventListener('reset', function () { setTimeout(function () { ciz(true); }, 0); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    sirala.addEventListener('change', function () { ciz(true); });
    daha.addEventListener('click', function () { var once = goster; goster += ADIM; ciz(false); var k = $$('.sg-tarif:not([hidden])', iz)[once]; if (k) { var a = k.querySelector('a'); if (a) a.focus({ preventScroll: false }); } });
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
    ciz(true);
  }
  function basla() { $$('[data-sg-katalog]').forEach(kur); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();
