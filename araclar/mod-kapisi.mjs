// Mod filtresi doğruluğu kapısı: "yasaklı malzeme içeren tarif 0".
// Sınıflandırıcıdan (src/saglik/malzeme.mjs) BAĞIMSIZ, ham malzeme adına bakan ikinci bir kara liste kullanır:
//  1) Statik: her mod sayfasındaki her kartın tarifinde kara listeye uyan malzeme yoksa ya da o malzeme kartta
//     "Akıllı ikame" olarak yazıyorsa geçer; aksi hâlde kırmızı. Her kartın tarifi gerçekten modun uyumlu listesinde olmalı.
//  2) Canlı/yerel tarayıcı: alerjen seçimi (süt + gluten; sonra yer fıstığı + susam + sert kabuklu) localStorage'a yazılır,
//     her Sağlık listesinde görünür kartların hiçbirinde seçili alerjenin ham kara listesi ve paketli ürün yok.
// Kullanım: node araclar/mod-kapisi.mjs   (TABAN=… ile canlıda)   BOZ=1 → kara listeye uyan bir tarifi kartlara sokar (kırmızı vermeli)
import { readFileSync, readdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { MODLAR } from '../src/saglik/modlar.mjs';
const TABAN = process.env.TABAN || 'http://localhost:8790/DadaSaglik/';
const T = Object.fromEntries(JSON.parse(readFileSync('veri/gastro-tarifler.json', 'utf8')).tarifler.map((t) => [t.slug, t]));
const n = (s) => String(s || '').normalize('NFC').toLocaleLowerCase('tr').replace(/̇/g, '').replace(/\s+/g, ' ').trim();
const KARA = {
  colyak: /(^|\s)un$|(?<!kara)buğday|bulgur|irmik|arpa|çavdar|yulaf|makarna|^(?!.*pirinç).*erişte|yufka|lavaş|ekme[kğ]|galeta|bisküvi|kuskus|soya sosu|kadayıf|freekeh|simit|pide|hoisin|hamuru|puf böreği|kabartma tozu|granola|tortilla(?!.*mısır)/,
  diyabet: /şeker|(^|\s)bal$|pekmez|şurup|şurubu|reçel|jöle|(^|\s)hurma$|hurma şurubu|agave|kuru üzüm|kuş üzümü|(üzüm|portakal|armut) suyu|^(uzun taneli |kırık )?pirinç$|^patates$|^un$|(?<!tam )buğday unu|irmik|nişasta|galeta|ekme[kğ]|lavaş|bisküvi|makarna/,
  alerji: /mayonez|ketçap|bisküvi|çikolata|sucuk|sosis|jambon|pastırma|(et|tavuk|sebze|balık) suyu|baharat(ı| karışımı)|garam|köri|konserve|soya sosu|hoisin|hazır|granola|kabartma tozu|maya$|tofu|hindistan cevizi sütü|füme/,
  laktoz: /(^|\s)süt$|yoğurt|peynir|kaşar|(^|\s)lor|kaymak|krema|tereyağı|ayran|kefir|labne|mascarpone|cheddar|çedar|gravyer|halumi|kondanse|ezine|çikolata/,
  ibs: /soğan(?!ı)|sarımsak|pırasa|(^|\s)elma$|armut|karpuz|mango|karnabahar|mantar|kuşkonmaz|enginar|nohut|(?<!fasulye )fasulye(?! filizi)|barbunya|mercimek|(^|\s)bal$|(^|\s)süt$|yoğurt|kuru (üzüm|erik|kayısı|incir)|(^|\s)hurma|bezelye|(?<!kara)buğday|bulgur|ekme[kğ]|kaymak|krema/,
  kalp: /(^|\s)tuz(\s|$)|deniz tuzu|sucuk|sosis|pastırma|bastırma|jambon|kavurma|turşu|kapari|zeytin(?!yağı)|beyaz peynir|kaşar|cheddar|çedar|gravyer|halumi|kuyruk yağı|margarin|ciğer|böbre|kaymak|krema|soya sosu|(et|tavuk|sebze|balık) suyu|tereyağı|salça/,
};
// İkame edilebilecek ham adlar kartta "ad → yerine" olarak görünmeli
let kirmizi = 0, kontrol = 0;
const ok = (k, m) => { kontrol++; if (!k) { kirmizi++; console.log('✗', m); } };
const ozet = {};
for (const M of MODLAR) {
  let html = readFileSync(M.dosya, 'utf8');
  const kartlar = [...html.matchAll(/<article class="sg-kart sg-tarif[^"]*"[^>]*data-slug="([^"]+)"[\s\S]*?<\/article>/g)];
  if (process.env.BOZ && M.kod === 'colyak') kartlar.push(['<article><p class="sg-tarif__ikame"></p></article>', Object.values(T).find((t) => t.malzemeler.some((m) => /bulgur/.test(n(m.ad)))).slug]);
  let hata = 0;
  for (const [kart, slug] of kartlar) {
    const t = T[slug]; if (!t) { ok(false, `${M.kod}: bilinmeyen tarif ${slug}`); continue; }
    const veri = (kart.match(/data-ikameler="([^"]*)"/) || [, ''])[1].replace(/&amp;/g, '&');
    const ikameli = new Set(veri.split('|').filter(Boolean).map((x) => n(x.split('→')[0])));
    for (const m of t.malzemeler) {
      const a = n(m.ad);
      if (KARA[M.kod].test(a) && !ikameli.has(a)) { hata++; ok(false, `${M.kod}: ${slug} → "${a}" (ikamesiz)`); }
    }
  }
  ozet[M.kod] = kartlar.length;
  ok(true, ''); kontrol--;
  console.log(`${hata ? '✗' : '✓'} ${M.kod.padEnd(8)} ${String(kartlar.length).padStart(3)} kart · yasaklı malzemeli tarif: ${hata}`);
}

// Tarayıcı: alerjen süzgeci tüm listelerde
const ALERJEN_KARA = {
  sut: KARA.laktoz, gluten: KARA.colyak,
  yerfistigi: /yer fıstığı|fıstık ezmesi|çikolata/, susam: /susam|tahin|hoisin/, sertkabuklu: /badem|fındık|ceviz|antep fıstığı|kaju|çam fıstığı|dolmalık fıstık|hindistan cevizi|kestane|granola|çikolata/,
};
const tar = await chromium.launch();
for (const sec of [['sut', 'gluten'], ['yerfistigi', 'susam', 'sertkabuklu']]) {
  const ctx = await tar.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript((v) => { try { localStorage.setItem('dadagastrosaglik.alerjen.v1', v); } catch (e) {} }, JSON.stringify(sec));
  for (const s of ['saglik.html', ...MODLAR.map((M) => M.dosya)]) {
    const p = await ctx.newPage();
    await p.goto(TABAN + s, { waitUntil: 'networkidle' });
    // tüm kartları göster (sayfalama)
    for (let i = 0; i < 40; i++) { const d = await p.$('[data-sg-daha]:visible'); if (!d) break; await d.click(); await p.waitForTimeout(30); }
    const gorunen = await p.$$eval('.sg-tarif', (l) => l.filter((k) => !k.hidden && !k.closest('[hidden]') && k.getBoundingClientRect().height > 0).map((k) => [k.dataset.slug, k.dataset.paketli]));
    const durum = await p.$eval('#sgAlerjenDurum', (d) => !d.hidden).catch(() => false);
    let h = 0;
    for (const [slug, pk] of gorunen) {
      if (pk === '1') { h++; continue; }
      const t = T[slug];
      for (const a of sec) if (t.malzemeler.some((m) => ALERJEN_KARA[a].test(n(m.ad)))) { h++; console.log(`   ✗ ${s} ${slug} seçili alerjen: ${a}`); }
    }
    ok(h === 0 && durum, `alerjen [${sec.join(',')}] ${s}: görünen ${gorunen.length}, ihlal ${h}, durum şeridi ${durum}`);
    console.log(`${h === 0 && durum ? '✓' : '✗'} alerjen [${sec.join(',')}] ${s.padEnd(22)} görünen ${gorunen.length} · ihlal ${h}`);
    await p.close();
  }
  await ctx.close();
}
await tar.close();
console.log(`\nmod kapısı: ${kontrol - kirmizi}/${kontrol} yeşil · kart sayıları ${JSON.stringify(ozet)}`);
process.exit(kirmizi ? 1 : 0);
