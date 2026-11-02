// H21 — Yazı detayı: her makale için saglik-yazi-<slug>.html (veri/icerik.json modlar.<kod>.makaleler[]).
// Düzen: Dada Gourmet yazı detayı (yalnız DÜZEN; içerik/görsel Health'in kendi) → tam genişlik görselli hero (kırıntı · kategori=mod ·
// başlık · meta) · hero'ya binen beyaz gövde, ortada 880px okuma sütunu · alt bağlantı satırı + paylaş · "İlgili yazılar" 3'lü kart ızgarası.
// Gastro belirteçleri: Gilroy, köşe 12px, gölge yok. Stil: varlik/saglik/css/okuma.css · davranış: varlik/saglik/js/okuma.js.
// Kart + veri yardımcıları burada; liste sayfası (bilgi.mjs) aynı kartı kullanır.

const KAT_DIS = new Set(['icecek', 'sos', 'tursu-ve-konserve', 'recel']);

/** Tüm yazılar (mod sırası) + her yazıya TEKİL tarif görseli (listede aynı foto iki kez görünmez) + mod başına bir tarif-CTA görseli. */
export function yaziVerisi(o) {
  const { MODLAR, icerik, ESLESME } = o;
  const alinan = new Set(Object.values(o.SAHNE || {}).map((t) => t.slug));
  const sec = (kod, bas) => {
    const l = ESLESME[kod] || [];
    for (let k = 0; k < l.length; k++) {
      const t = l[(bas + k) % l.length].t;
      if (alinan.has(t.slug) || t.kategori.some((x) => KAT_DIS.has(x))) continue;
      alinan.add(t.slug); return t;
    }
    return l[0] ? l[0].t : null;
  };
  const yazilar = [];
  const ctaGorsel = {};
  for (const M of MODLAR) {
    const l = ((icerik.modlar || {})[M.kod] || {}).makaleler || [];
    l.forEach((a, i) => yazilar.push({ M, a, i, t: sec(M.kod, 5 + i * 4) }));
  }
  for (const M of MODLAR) ctaGorsel[M.kod] = sec(M.kod, 1);
  return { yazilar, ctaGorsel };
}

export const yaziHref = (a) => `saglik-yazi-${a.slug}.html`;

/** Kaynak satırı: "Ad — https://…" → bağlantı; yalnız ad → düz metin (URL uydurulmaz). */
export function kaynakHtml(o, k) {
  const m = String(k).match(/^(.*?)\s+[—-]\s+(https?:\/\/\S+)$/);
  return m
    ? `<a href="${o.esc(m[2])}" target="_blank" rel="noopener nofollow">${o.esc(m[1])}<span class="sg-gizli"> (yeni sekmede açılır)</span> <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>`
    : `<span>${o.esc(k)}</span>`;
}

const ipucuSay = (a) => (a.maddeler || []).length;
const kaynakSay = (a) => (a.kaynaklar || []).length;

/** Gourmet .disc-card karşılığı: görsel (okuma süresi rozeti) · kategori (mod, kurum rengi) · başlık · özet · alt meta. */
export function yaziKart(o, { M, a, t }, { baslikSeviye = 3, oncelik = false } = {}) {
  const { esc, ui } = o;
  const h = `h${baslikSeviye}`;
  return `<article class="sg-ok-kart" data-renk="${M.renk}" data-mod="${M.kod}" data-slug="${esc(a.slug)}">
 <a class="sg-ok-kart__bag" href="${yaziHref(a)}">
  <div class="sg-ok-kart__medya">${t ? o.foto(o.tarifGorsel(t), '', { oncelik }) : ''}<span class="sg-ok-sure">${ui('saat', 14)}${esc(a.okuma_dk || 2)} dk okuma</span></div>
  <span class="sg-ok-kat">${ui(M.ikon, 14)}${esc(o.SEKME[M.kod])}</span>
  <${h} class="sg-ok-kart__baslik">${esc(a.baslik)}</${h}>
  <p class="sg-ok-kart__ozet">${esc(a.ozet)}</p>
  <div class="sg-ok-kart__alt">${ipucuSay(a) ? `<span>${ui('tik', 14)}${ipucuSay(a)} pratik ipucu</span>` : ''}${kaynakSay(a) ? `<span><i class="fa-solid fa-book-open" aria-hidden="true"></i>${kaynakSay(a)} kaynak</span>` : ''}</div>
 </a>
</article>`;
}

/** Izgaranın son yuvası: modun tariflerine giden kart (aynı kart kalıbı; uydurma içerik yok — sayı ESLESME'den). */
export function tarifCtaKart(o, M, t) {
  const { esc, ui } = o;
  const n = (o.ESLESME[M.kod] || []).length;
  return `<article class="sg-ok-kart sg-ok-kart--tarif" data-renk="${M.renk}" data-mod="${M.kod}">
 <a class="sg-ok-kart__bag" href="${M.dosya}">
  <div class="sg-ok-kart__medya">${t ? o.foto(o.tarifGorsel(t), '') : ''}<span class="sg-ok-sure">${ui('kitap', 14)}${n} tarif</span></div>
  <span class="sg-ok-kat">${ui(M.ikon, 14)}${esc(o.SEKME[M.kod])} tarifler</span>
  <h3 class="sg-ok-kart__baslik">${esc(M.ad)} tarifleri</h3>
  <p class="sg-ok-kart__ozet">Bu moda uyumlu ${n} tarif; gerektiğinde akıllı ikamelerle birlikte.</p>
  <div class="sg-ok-kart__alt"><span class="sg-ok-kart__git">Tariflere git ${ui('ok', 14)}</span></div>
 </a>
</article>`;
}

export default async function (o) {
  const { esc, ui } = o;
  const { yazilar, ctaGorsel } = yaziVerisi(o);
  return yazilar.map((y) => {
    const { M, a, t } = y;
    const ayni = yazilar.filter((x) => x.M.kod === M.kod && x.a.slug !== a.slug);
    const kisa = o.SEKME[M.kod];
    const modBilgi = `saglik-${M.kod}-bilgi.html`;
    const main = o.sayfa(`<div class="sg-ok sg-ok--detay">
<header class="sg-ok-hero sg-ok-hero--yazi" data-renk="${M.renk}">
 ${t ? o.foto(o.tarifGorsel(t), '', { sinif: 'sg-ok-hero__gorsel', oncelik: true }) : ''}
 <span class="sg-ok-hero__katman" aria-hidden="true"></span>
 <div class="wrap">
  ${o.kirinti([['Dada Gastro Health', 'saglik.html'], ['Bilgi', 'saglik-bilgi.html'], [kisa, `saglik-bilgi.html?mod=${M.kod}`], [a.baslik]])}
  <div class="sg-ok-hero__ana">
   <a class="sg-ok-hero__kat" href="saglik-bilgi.html?mod=${M.kod}">${ui(M.ikon, 14)}${esc(kisa)}</a>
   <h1>${esc(a.baslik)}</h1>
   <div class="sg-ok-hero__meta">
    <a class="sg-ok-hero__mod" href="${M.dosya}"><span class="sg-ok-hero__rozet" aria-hidden="true">${ui(M.ikon, 18)}</span><span><b>${esc(M.ad)}</b><span>Dada Gastro Health yaşam modu</span></span></a>
    <span class="sg-ok-hero__bilgi">${ui('saat', 14)}${esc(a.okuma_dk || 2)} dk okuma</span>
    ${kaynakSay(a) ? `<span class="sg-ok-hero__bilgi"><i class="fa-solid fa-book-open" aria-hidden="true"></i>${kaynakSay(a)} kaynak</span>` : ''}
   </div>
  </div>
 </div>
</header>
<article class="sg-ok-govde" data-renk="${M.renk}">
 <div class="wrap">
  <div class="sg-ok-kolon">
   <p class="sg-ok-giris">${esc(a.ozet)}</p>
   ${(a.govde || []).map((p) => `<p>${esc(p)}</p>`).join('\n   ')}
   ${ipucuSay(a) ? `<h2>Mutfakta pratik adımlar</h2>
   <ul class="sg-ok-liste">${a.maddeler.map((x) => `<li>${ui('tik', 16)}<span>${esc(x)}</span></li>`).join('')}</ul>` : ''}
   ${kaynakSay(a) ? `<h2>Kaynaklar</h2>
   <ul class="sg-ok-kaynak">${a.kaynaklar.map((k) => `<li>${kaynakHtml(o, k)}</li>`).join('')}</ul>` : ''}
   <p class="sg-ok-uyari" role="note">${ui('uyari', 16)}<span>${o.UYARI}</span></p>
   <div class="sg-ok-alt">
    <span class="sg-ok-alt__bas"><i class="fa-solid fa-link" aria-hidden="true"></i>Bu moda devam</span>
    <div class="sg-ok-alt__chipler">
     <a class="sg-ok-chip" href="${M.dosya}">${ui('kitap', 14)}${esc(kisa)} tarifler</a>
     <a class="sg-ok-chip" href="${modBilgi}">${ui('bilgi', 14)}${esc(kisa)} bilgilendirme</a>
     <a class="sg-ok-chip" href="saglik-bilgi.html?mod=${M.kod}">${ui('filtre', 14)}Tüm ${esc(kisa)} yazıları</a>
    </div>
    <button type="button" class="sg-ok-paylas" data-sg-paylas><i class="fa-solid fa-share-nodes" aria-hidden="true"></i><span>Paylaş</span></button>
   </div>
   <a class="sg-ok-geri" href="${M.dosya}"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i>${esc(M.ad)} moduna dön</a>
  </div>
 </div>
</article>
<section class="sg-ok-ilgili" aria-labelledby="ilgili-bas">
 <div class="wrap">
  <div class="sg-ok-bas"><span class="sg-ok-ust">${ui(M.ikon, 14)}Aynı moddan</span><h2 id="ilgili-bas">İlgili yazılar</h2></div>
  <div class="sg-ok-izgara">${ayni.map((x) => yaziKart(o, x)).join('')}${tarifCtaKart(o, M, ctaGorsel[M.kod])}</div>
 </div>
</section>
</div>`, M.kod);
    return {
      dosya: yaziHref(a),
      baslik: `${a.baslik} — ${kisa} · Dada Gastro Health (prototip)`,
      aciklama: a.ozet,
      main, css: ['okuma'], js: ['okuma'],
      gorsel: t ? o.tarifGorsel(t) : '',
    };
  });
}
