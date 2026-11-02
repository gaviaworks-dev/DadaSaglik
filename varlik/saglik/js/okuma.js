/* Dada Gastro Health — okuma sayfaları (saglik-bilgi.html listesi + saglik-yazi-*.html detayı).
   Liste: mod süzgeci istemcide. saglik-bilgi.html?mod=<kod> süzülü açılır · eski #<kod> süzer (adres ?mod=<kod> olur) ·
   eski #<yazı slug> → saglik-yazi-<slug>.html (location.replace). Detay: Paylaş (navigator.share → yoksa bağlantıyı kopyala). */
(function () {
  'use strict';

  var liste = document.querySelector('[data-sg-okuma-liste]');
  if (liste) {
    var kartlar = [].slice.call(liste.querySelectorAll('.sg-ok-kart[data-slug]'));
    var chipler = [].slice.call(liste.querySelectorAll('[data-suz]'));
    var baslik = liste.querySelector('[data-sg-okuma-baslik]');
    var sayi = liste.querySelector('[data-sg-okuma-sayi]');
    var modVar = function (k) { return !!k && chipler.some(function (c) { return c.getAttribute('data-suz') === k; }); };
    var hash = '';
    try { hash = decodeURIComponent((location.hash || '').slice(1)); } catch (e) { hash = ''; }

    // Eski bağlantı: #<yazı slug> → yazı sayfası
    if (hash && kartlar.some(function (k) { return k.getAttribute('data-slug') === hash; })) {
      location.replace('saglik-yazi-' + encodeURIComponent(hash) + '.html');
      return;
    }

    var uygula = function (mod, adresYaz) {
      if (!modVar(mod)) mod = '';
      var n = 0;
      kartlar.forEach(function (k) { var g = !mod || k.getAttribute('data-mod') === mod; k.hidden = !g; if (g) n++; });
      var secili = null;
      chipler.forEach(function (c) {
        var on = c.getAttribute('data-suz') === mod;
        if (on) { c.setAttribute('aria-current', 'true'); secili = c; } else c.removeAttribute('aria-current');
      });
      if (baslik && secili) baslik.textContent = secili.getAttribute('data-baslik') || baslik.textContent;
      if (sayi) sayi.textContent = n + ' yazı';
      if (secili && secili.scrollIntoView && secili.parentNode.scrollWidth > secili.parentNode.clientWidth) {
        var p = secili.parentNode, sol = secili.offsetLeft - p.offsetLeft;
        if (sol < p.scrollLeft || sol + secili.offsetWidth > p.scrollLeft + p.clientWidth) p.scrollLeft = Math.max(0, sol - 16);
      }
      if (adresYaz) {
        try { history.replaceState(null, '', mod ? '?mod=' + mod : location.pathname.split('/').pop() || 'saglik-bilgi.html'); } catch (e) { /* yok say */ }
      }
    };

    var q = '';
    try { q = new URLSearchParams(location.search).get('mod') || ''; } catch (e) { q = ''; }
    if (modVar(q)) uygula(q, false);
    else if (modVar(hash)) uygula(hash, true); // eski #<kod> → ?mod=<kod>
    else uygula('', false);

    chipler.forEach(function (c) {
      c.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return; // yeni sekmede açma serbest
        e.preventDefault();
        uygula(c.getAttribute('data-suz') || '', true);
      });
    });
    addEventListener('popstate', function () {
      var m = ''; try { m = new URLSearchParams(location.search).get('mod') || ''; } catch (e) { m = ''; }
      uygula(m, false);
    });
  }

  // Paylaş
  [].forEach.call(document.querySelectorAll('[data-sg-paylas]'), function (b) {
    var etiket = b.querySelector('span');
    var ilk = etiket ? etiket.textContent : '';
    var bildir = function (t) { if (!etiket) return; etiket.textContent = t; setTimeout(function () { etiket.textContent = ilk; }, 2200); };
    b.addEventListener('click', function () {
      var veri = { title: document.title, url: location.href };
      if (navigator.share) { navigator.share(veri).catch(function () { /* iptal */ }); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(function () { bildir('Bağlantı kopyalandı'); }, function () { bildir('Kopyalanamadı'); });
      } else bildir('Kopyalanamadı');
    });
  });
})();
