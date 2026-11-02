// Davranış kapısı — gerçek tıklamalarla + statik taramalar (Kids davranis.mjs'in Sağlık uyarlaması).
// Kullanım: node araclar/davranis.mjs   (TABAN=… ile canlıda)
import { chromium } from 'playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { tokenTaramasi } from './temizle.mjs';
const T = process.env.TABAN || 'http://localhost:8790/DadaSaglik/';
let hata = 0;
const ok = (k, ad) => { console.log(`${k ? '✓' : '✗'} ${ad}`); if (!k) hata++; };
const UYARI = 'Bu bilgiler genel bilgilendirme amaçlıdır; tanı ve tedavi için hekiminize danışın.';
const MODSAY = ['saglik-colyak.html', 'saglik-diyabet.html', 'saglik-alerji.html', 'saglik-laktoz.html', 'saglik-ibs.html', 'saglik-kalp.html'];
const saglik = readdirSync('.').filter((f) => /^saglik(-.+)?\.html$/.test(f));
const BILGI = MODSAY.map((f) => f.replace('.html', '-bilgi.html'));

/* ---------- Statik ---------- */
{
  const tum = [...readdirSync('.').filter((f) => f.endsWith('.html')), ...readdirSync('src/donor').map((f) => 'src/donor/' + f)];
  const k = tum.map((f) => [f, tokenTaramasi(readFileSync(f, 'utf8'))]).filter(([, r]) => r.length);
  ok(!k.length, `token/csrf taraması: ${tum.length} dosya` + (k.length ? ' → ' + k.map(([f, r]) => f + ': ' + r).join(' | ') : ''));
  const metin = (f) => readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  const iddia = saglik.flatMap((f) => [...metin(f).matchAll(/[^.]{0,40}(tedavi eder|tedavi etmek|iyileştir|şifa|detoks|hastalığı önler|geçirir)[^.]{0,20}/gi)].map((m) => f + ': ' + m[0].trim()));
  ok(!iddia.length, 'tıbbi iddia yok (tedavi eder / iyileştirir / şifa / detoks)' + (iddia.length ? ' → ' + iddia.slice(0, 3).join(' | ') : ''));
  for (const f of [...MODSAY, ...BILGI, 'saglik-tarif.html']) { const n = metin(f).split(UYARI).length - 1; ok(n === 1, `${f}: uyarı satırı tam 1 kez (${n})`); }
  const onay = saglik.flatMap((f) => [...metin(f).replace(/Kurumların bu sayfayı onayladığı ya da desteklediği anlamına gelmez\./g, '').matchAll(/[^.]{0,30}(onayladı|onaylı|destekliyor|desteğiyle|resmî partner|resmi partner|iş ortağımız)[^.]{0,20}/gi)].map((m) => f + ': ' + m[0].trim()));
  ok(!onay.length, 'partner: onay/destek ifadesi yok' + (onay.length ? ' → ' + onay.slice(0, 3).join(' | ') : ''));
  for (const f of BILGI) {
    const h = readFileSync(f, 'utf8'); const b = h.match(/<section class="sg-bolum sg-partnerler"[^>]*>[\s\S]*?<\/section>/);
    if (!b) { ok(false, `${f}: iş birliği bölümü yok`); continue; }
    const kart = (b[0].match(/class="sg-kart sg-partner"/g) || []).length, logo = (b[0].match(/class="sg-partner__logo"><img/g) || []).length;
    const serit = h.match(/<div class="sg-logo-serit[^"]*" data-yalniz-admin="1">[\s\S]*?<\/ul><\/div>/);
    ok(/data-yalniz-admin="1"/.test(b[0]) && kart > 0 && logo === kart && /rel="noopener nofollow"/.test(b[0]) && !/Olası iş birliği/.test(h), `${f}: iş birliği yalnız-admin, ${kart} kart ${logo} logo, "Olası iş birliği" etiketi yok`);
    ok(!!serit && (serit[0].match(/<img/g) || []).length === logo, `${f}: hero banner'da yalnız-admin logo şeridi (${serit ? (serit[0].match(/<img/g) || []).length : 0} logo)`);
  }
  // iç bağlar: yerel dosyalar var
  const kirik = [];
  for (const f of [...saglik, 'index.html', 'tarifler.html']) for (const m of readFileSync(f, 'utf8').matchAll(/href="((?:saglik)[^"#?]*\.html)/g)) if (!readdirSync('.').includes(m[1])) kirik.push(f + ' → ' + m[1]);
  ok(!kirik.length, 'iç bağlar kırık değil' + (kirik.length ? ' → ' + [...new Set(kirik)].slice(0, 4).join(', ') : ''));
}

/* ---------- Tarayıcı ---------- */
const tar = await chromium.launch();
const ctx = await tar.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const jsHata = []; p.on('pageerror', (e) => jsHata.push(e.message));

// Giriş kapıları
await p.goto(T + 'index.html', { waitUntil: 'networkidle' });
ok(await p.locator('.sg-bant a[href="saglik.html"]').count() > 0, 'kapı A: ana sayfada Sağlık bandı → saglik.html');
await p.goto(T + 'tarifler.html', { waitUntil: 'networkidle' });
ok(await p.locator('a.sg-chip-gastro[href="saglik.html"]').count() === 1, 'kapı B: tarifler.html "Sağlık modları" chip');
ok(await p.locator('.mega [data-sg-dongu-oge="saglik"] a.sg-mega-serit__chip').count() === 3 && await p.locator('.mega [data-sg-dongu-oge="kids"] a.sg-mega-serit__chip').count() === 3, 'kapı C: mega yuvasında Sağlık (3 mod) ↔ Kids (3 yaş) şeritleri');
{ const g = async () => p.$eval('.mega [data-sg-dongu]', (y) => y.querySelector('.sg-dongu-aktif').dataset.sgDonguOge);
  const once = await g(); await p.$eval('.mega [data-sg-dongu-git="kids"]', (b) => b.click()); const sonra = await g();
  ok(once === 'saglik' && sonra === 'kids', `mega geçişi: ${once} → ${sonra} (nokta düğmesi)`); }
ok(await p.locator('a.sg-fct-saglik[href="saglik-kalp.html"]').count() === 1 && await p.locator('a.sg-fct-saglik').count() === 5, 'tarifler.html Beslenme süzgeci: Glutensiz/Diyabete Uygun/Laktozsuz/Süt İçermez/Kalp Dostu → Sağlık modları');

// Alt menü + logo rozeti + sticky
await p.goto(T + 'saglik-colyak.html', { waitUntil: 'networkidle' });
const menu = await p.$$eval('.sg-ust__menu > a', (l) => l.map((a) => a.textContent.trim() || a.getAttribute('aria-label')));
ok(menu.length === 7 && /ana sayfa/i.test(menu[0]), `alt menü: ev ikonu + 6 mod (${menu.join(' | ')})`);
ok(await p.$eval('.sg-ust__menu .dt.active[aria-current="page"]', (a) => a.textContent.trim()) === 'Glutensiz', 'aktif sekme işaretli');
const rozet = await p.$eval('.header .brand', (b) => getComputedStyle(b, '::after').content);
ok(/health/.test(rozet), `header logosu yanında "health" rozeti (CSS ::after: ${rozet})`);
await p.mouse.wheel(0, 900); await p.waitForTimeout(250); await p.mouse.wheel(0, 300); await p.waitForTimeout(500);
const st = await p.evaluate(() => { const tb = document.querySelector('.topbar'), h = document.querySelector('header.header'), u = document.querySelector('.sg-ust'); return { gizli: document.documentElement.classList.contains('sg-ust-gizli'), tb: tb.getBoundingClientRect().bottom, hb: h.getBoundingClientRect().bottom, u: u.getBoundingClientRect().top, logo: getComputedStyle(document.querySelector('.sg-ust__logo')).visibility }; });
ok(st.gizli && st.hb <= st.tb + 1 && Math.abs(st.u - st.tb) <= 1 && st.logo === 'visible', `sticky aşağı: header gizli, siyah bant + Sağlık barı görünür, mini kilit (${JSON.stringify(st)})`);
await p.mouse.wheel(0, -400); await p.waitForTimeout(500);
ok(!(await p.evaluate(() => document.documentElement.classList.contains('sg-ust-gizli'))), 'sticky yukarı: Gastro header geri geldi');

// Sekmeler: Tarifler ↔ Bilgilendirme
ok(await p.locator('.sg-sekmeler a[aria-current="page"]').textContent().then((x) => /Tarifler/.test(x)) && await p.locator('.sg-sekmeler a[href="saglik-colyak-bilgi.html"]').count() === 1, 'mod sekmeleri: Tarifler (aktif) · Bilgilendirme');
await p.evaluate(() => (window.__sgYukleme = 1));
await p.click('.sg-sekmeler a[href="saglik-colyak-bilgi.html"]'); await p.waitForTimeout(200);
ok(/colyak-bilgi/.test(p.url()) && await p.evaluate(() => window.__sgYukleme) === 1 && await p.locator('.sg-kural:visible').count() === 2 && await p.locator('[data-sg-katalog]:visible').count() === 0, 'Bilgilendirme sekmesi sayfa yenilenmeden açılır (adres -bilgi), kurallar görünür, liste gizli');
// SSS tek-açık
const d = p.locator('.sg-sss__dugme');
await d.nth(0).click(); await d.nth(1).click(); await p.waitForTimeout(100);
const acik = await p.$$eval('.sg-sss__dugme', (l) => l.map((b) => b.getAttribute('aria-expanded')));
ok(acik.filter((x) => x === 'true').length === 1 && acik[1] === 'true', `SSS tek-açık (${acik.join(',')})`);

// Katalog: ikamesiz filtresi, sayfalama
await p.goto(T + 'saglik-colyak.html', { waitUntil: 'networkidle' });
const say = () => p.$$eval('[data-sg-izgara] .sg-tarif', (l) => l.filter((k) => !k.hidden).length);
const ilk1 = await p.$eval('[data-sg-izgara] .sg-tarif:not([hidden])', (k) => k.dataset.slug);
const once = await say();
await p.click('.pagi .pg[data-sayfa="2"]'); await p.waitForTimeout(200);
const ilk2 = await p.$eval('[data-sg-izgara] .sg-tarif:not([hidden])', (k) => k.dataset.slug);
ok(once === 12 && await say() === 12 && ilk1 !== ilk2 && /sayfa=2/.test(p.url()) && await p.locator('.pagi .pg.is-active').textContent() === '2', `Gastro sayfalaması: sayfa 1 → 2 (12'şer kart, ?sayfa=2, aktif .pg)`);
await p.goto(T + 'saglik-colyak.html', { waitUntil: 'networkidle' });
await p.click('label.sg-satir:has(input[name="ikamesiz"])'); await p.waitForTimeout(150);
const ik = await p.$$eval('[data-sg-izgara] .sg-tarif', (l) => l.filter((k) => !k.hidden).map((k) => +k.dataset.ikame));
ok(ik.length > 0 && ik.every((x) => x === 0), `"Yalnız ikame gerektirmeyenler": ${ik.length} görünen kartın hepsi ikamesiz`);

// Alerjen seçimi kalıcı + tüm listelere
await p.goto(T + 'saglik-alerji.html', { waitUntil: 'networkidle' });
const alOnce = +(await p.textContent('[data-sg-sonuc]')).match(/\d+/)[0];
await p.click('label.sg-satir:has(input[value="sut"])'); await p.waitForTimeout(150);
const alSonra = +(await p.textContent('[data-sg-sonuc]')).match(/\d+/)[0];
const depo = await p.evaluate(() => { try { return localStorage.getItem('dadagastrosaglik.alerjen.v1'); } catch (e) { return 'HATA'; } });
ok(alSonra < alOnce && depo === '["sut"]', `alerjen seçimi: ${alOnce} → ${alSonra} tarif, localStorage ${depo}`);
await p.goto(T + 'saglik-kalp.html', { waitUntil: 'networkidle' });
const sutlu = await p.$$eval('.sg-tarif', (l) => l.filter((k) => !k.hidden && (k.dataset.alerjen.split(' ').includes('sut') || k.dataset.paketli === '1')).length);
ok(sutlu === 0 && await p.isVisible('#sgAlerjenDurum'), 'alerjen başka sayfada da uygulanıyor + durum şeridi');
await p.evaluate(() => { try { localStorage.removeItem('dadagastrosaglik.alerjen.v1'); } catch (e) {} });

// Depolama kapalıyken sayfa çalışır
{
  const c2 = await tar.newContext(); await c2.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('kapalı'); } }); });
  const p2 = await c2.newPage(); const h2 = []; p2.on('pageerror', (e) => h2.push(e.message));
  await p2.goto(T + 'saglik-alerji.html', { waitUntil: 'networkidle' });
  await p2.click('label.sg-satir:has(input[value="yumurta"])'); await p2.waitForTimeout(150);
  ok(!h2.length && /Yumurta/.test(await p2.textContent('[data-sg-alerjen-ozet]')), 'localStorage kapalıyken alerjen seçimi çalışır (hata yok)');
  await c2.close();
}

// Dolap: mod süzgeci riskli malzemeyi dışlar
await p.goto(T + 'saglik-dolap.html?mod=colyak', { waitUntil: 'networkidle' });
await p.waitForSelector('.sg-mz[data-durum]');
const riskli = await p.$('.sg-mz[data-durum="riskli"]');
if (riskli) {
  const k = await riskli.getAttribute('data-k');
  await p.$eval(`.sg-mz[data-k="${k}"]`, (b) => b.closest('details').open = true);
  await p.click(`.sg-mz[data-k="${k}"]`, { force: true }); await p.waitForTimeout(100);
  ok(await p.getAttribute(`.sg-mz[data-k="${k}"]`, 'aria-pressed') === 'false' && /dışlanır/.test(await p.textContent('[data-sg-dolap-durum]')), `dolap (Glutensiz): riskli "${k}" eklenemez, gerekçe söylenir`);
} else ok(false, 'dolap: Glutensiz modda riskli malzeme kartı bulunamadı');
for (const k of ['domates', 'sogan', 'biber']) { await p.$eval(`.sg-mz[data-k="${k}"]`, (b) => b.closest('details').open = true); await p.click(`.sg-mz[data-k="${k}"]`); }
await p.waitForTimeout(150);
const sonuc = await p.$$eval('[data-sg-dolap-sonuc] .sg-tarif', (l) => l.length);
ok(sonuc > 0 && /m=domates/.test(p.url()), `dolap: 3 malzemeyle ${sonuc} sonuç kartı, seçim adreste`);
await p.click('.sg-mod-bar__oge[data-mod="ibs"]'); await p.waitForTimeout(150);
ok(await p.$eval('.sg-dcip[data-k="sogan"]', (c) => c.classList.contains('sg-dcip--disli')) === false && /İkame/.test(await p.textContent('.sg-mz[data-k="sogan"] .sg-mz__not')), 'dolap (Düşük FODMAP): soğan ikameli olarak gösterilir');

// Detay: ikame uygulanmış malzeme listesi
await p.goto(T + 'saglik-tarif.html?t=babagannus-tahinli-patlican-mezesi&mod=kalp', { waitUntil: 'networkidle' });
await p.waitForSelector('[data-sg-malzeme] li');
ok(await p.locator('[data-sg-malzeme] del').count() > 0 && await p.locator('[data-sg-malzeme] ins').count() > 0, 'detay: ikame edilen malzeme üstü çizili + karşılığı');
ok(/Kalp dostu uyumlu/.test(await p.textContent('[data-sg-detay]')), 'detay: mod uyum rozeti');
ok(!jsHata.length, 'JS hatası yok' + (jsHata.length ? ' → ' + jsHata.slice(0, 2).join(' | ') : ''));

// Reduced motion: sticky geçişi anında
{
  const c3 = await tar.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p3 = await c3.newPage();
  await p3.goto(T + 'saglik-kalp.html', { waitUntil: 'networkidle' });
  ok(await p3.$eval('header.header', (h) => getComputedStyle(h).transitionDuration) === '0s', 'reduced-motion: header geçişi yok');
  await c3.close();
}
await tar.close();
console.log(`\ndavranış: ${hata ? hata + ' kırmızı' : 'hepsi yeşil'}`);
process.exit(hata ? 1 : 0);
