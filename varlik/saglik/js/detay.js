/* Tarif detayı (?t=<slug>&mod=<kod>): mod uyum rozeti (tarifin uyduğu tüm modlar), uygulanan ikameler,
   ikameyle uyarlanmış malzeme listesi (orijinal üstü çizili + karşılığı), adımlar. Veri: varlik/saglik/veri/tarifler.json */
(function () {
  'use strict';
  var kok = document.querySelector('[data-sg-detay]'); if (!kok) return;
  var q = new URLSearchParams(location.search), slug = q.get('t'), istenen = q.get('mod');
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var svg = function (ic, b) { return '<svg viewBox="0 0 24 24" width="' + (b || 16) + '" height="' + (b || 16) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ic + '</svg>'; };
  var TIK = '<path d="M5 12.5l4.5 4.5L19 7.5"/>';
  var sayi = function (x) { if (x === '' || x == null) return ''; var n = Number(x); if (isNaN(n)) return String(x); var t = Math.floor(n), k = n - t, kes = { 0.25: '¼', 0.5: '½', 0.75: '¾' }[Math.round(k * 4) / 4]; return k < 0.01 ? String(t) : ((t ? t + ' ' : '') + (kes || n.toLocaleString('tr'))); };
  fetch('varlik/saglik/veri/tarifler.json').then(function (r) { return r.json(); }).then(function (V) {
    var t = V.tarifler[slug];
    if (!t) { kok.innerHTML = '<h1>Tarif bulunamadı</h1><p class="sg-lead">Bu tarif hiçbir modun kuralına uymuyor ya da adres hatalı.</p><p><a class="sg-btn" href="saglik.html">Sağlık ana sayfasına dön</a></p>'; return; }
    var modlar = Object.keys(V.modlar).filter(function (k) { return V.modlar[k].t[slug]; });
    var mod = modlar.indexOf(istenen) > -1 ? istenen : modlar[0], M = V.modlar[mod], ik = M.t[slug] || [];
    var al = window.DadaSaglik && window.DadaSaglik.alerjenler();
    document.querySelector('.sg-sayfa').setAttribute('data-renk', M.renk);
    document.title = t.b.split('|')[0].trim() + ' — ' + M.uyum + ' · Dada Gastro Sağlık (prototip)';
    var gizli = al && al.length && window.DadaSaglik && (t.pk || t.al.some(function (a) { return al.indexOf(a) > -1 || (a === 'gluten-yulaf' && al.indexOf('gluten') > -1); }));
    kok.innerHTML = '<div class="sg-detay-ust"><div>'
      + '<span class="sg-uyum">' + svg(TIK, 14) + esc(M.uyum) + ' uyumlu</span>'
      + '<h1>' + esc(t.b.split('|')[0].trim()) + '</h1>'
      + (t.o ? '<p class="sg-lead">' + esc(t.o) + '</p>' : '')
      + '<div class="sg-detay-meta">' + (t.sure ? '<span><b>' + t.sure + ' dk</b> toplam</span>' : '') + (t.p ? '<span><b>' + t.p + '</b> ' + esc(t.pb || 'kişilik') + '</span>' : '') + (t.z ? '<span>' + esc(t.z) + '</span>' : '') + (t.mt ? '<span>' + esc(t.mt) + '</span>' : '') + '</div>'
      + (modlar.length > 1 ? '<p class="sg-ikincil" style="margin:16px 0 0">Bu tarif şu modlara da uyuyor:</p><div class="sg-detay-modlar">' + modlar.map(function (k) { var x = V.modlar[k]; return '<a class="sg-chip" data-renk="' + x.renk + '" href="?t=' + encodeURIComponent(slug) + '&mod=' + k + '"' + (k === mod ? ' aria-current="true"' : '') + '>' + esc(x.kisa) + '</a>'; }).join('') + '</div>' : '')
      + (istenen && istenen !== mod && V.modlar[istenen] ? '<p class="sg-detay-ikame" style="background:#F7E9E6">Bu tarif <b>' + esc(V.modlar[istenen].kisa) + '</b> modunun kuralına uymuyor; ' + esc(M.kisa) + ' modundaki hâli gösteriliyor.</p>' : '')
      + (gizli ? '<p class="sg-detay-ikame" style="background:#F7E9E6"><b>Dikkat:</b> Bu tarif seçtiğin alerjen süzgecine uymuyor; listelerde gizleniyor.</p>' : '')
      + (ik.length ? '<div class="sg-detay-ikame"><h2>' + esc(M.kisa) + ' için akıllı ikame</h2><ul>' + ik.map(function (x) { return '<li><b>' + esc(x[0]) + '</b> yerine <b>' + esc(x[1]) + '</b>' + (x[2] ? ' — ' + esc(x[2]) : '') + '</li>'; }).join('') + '</ul></div>' : '<div class="sg-detay-ikame"><h2>İkame gerekmez</h2><p style="margin:0">Malzemeler ' + esc(M.kisa) + ' modunun kuralına olduğu gibi uyuyor.</p></div>')
      + '</div><img src="' + esc(t.k) + '" alt="' + esc(t.b.split('|')[0].trim()) + ' — Dada Gastro tarif fotoğrafı" width="640" height="429"></div>';
    var ikAd = {}; ik.forEach(function (x) { ikAd[x[0]] = x[1]; });
    var grupOnce = null;
    document.querySelector('[data-sg-malzeme]').innerHTML = '<ul class="sg-mlist">' + t.m.map(function (x) {
      var g = ''; if (x[0] && x[0] !== grupOnce) { g = '<li class="sg-mlist__grup">' + esc(x[0]) + '</li>'; grupOnce = x[0]; }
      var ad = String(x[3]).trim(), n = ad.toLocaleLowerCase('tr').replace(/̇/g, ''), yerine = ikAd[n];
      var mik = (sayi(x[1]) + ' ' + (x[2] || '')).trim();
      var ikon = x[5] && V.dk[x[5]] ? '<img class="sg-mlist__ikon" src="varlik/saglik/ikon/' + esc(x[5]) + '-k.webp" alt="" aria-hidden="true" width="28" height="28">' : '';
      return g + '<li><span class="sg-mlist__mik">' + esc(mik) + '</span><span class="sg-mlist__ad">' + ikon + (yerine ? '<del>' + esc(ad) + '</del><ins>' + esc(yerine) + '</ins>' : esc(ad)) + (x[4] ? ' <span class="sg-ikincil">(' + esc(x[4]) + ')</span>' : '') + '</span></li>';
    }).join('') + '</ul>';
    document.querySelector('[data-sg-adim]').innerHTML = t.a.map(function (a) { return '<li><div>' + (a[0] ? '<b>' + esc(a[0]) + '</b>' : '') + '<p>' + esc(a[1]) + '</p></div></li>'; }).join('');
    document.querySelector('[data-sg-detay-govde]').hidden = false;
  }).catch(function () { kok.innerHTML = '<p>Tarif yüklenemedi; sayfayı yenileyin.</p>'; });
})();
