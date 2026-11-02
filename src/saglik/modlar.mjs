// Altı yaşam modu: meta + eşleşme kuralı + Akıllı İkame. Tek kaynak (build, kapılar ve rapor bunu kullanır).
// Eşleşme ilkesi (görev): emin olunamayan tarif GÖSTERİLMEZ.
//  1. Tarifin her malzemesi sözlükte sınıflı olmalı (src/saglik/malzeme.mjs; "belirsiz" → tarif dışarıda).
//  2. Modun yasak bayrağını taşıyan malzeme varsa tarif dışarıda — yalnız o malzeme için tanımlı ve koşulu sağlanan
//     bir ikame varsa tarif kalır ve kartta "İkame: X → Y" yazar.
//  3. Moda özgü ek koşul (kategori, Gastro etiketi, porsiyon başı besin değeri) sağlanmalı.
// Alkollü tarif (AL) hiçbir modda yok. Alerji modunda ikame YOK (sıfır hata): seçilen alerjeni içeren tarif kökten gizlenir.
import { siniflandir, ALERJENLER } from './malzeme.mjs';

// Başlığında sağlık iddiası taşıyan tarif Sağlık listelerine girmez (tıbbi iddia yok kuralı)
const IDDIA = /detoks|detox|şifa|bağışıklık|yağ yakan|zayıfla|arındır|kür\b|ilaç gibi/i;
const AZ_BIRIM = new Set(['yemek kaşığı', 'tatlı kaşığı', 'çay kaşığı', 'tutam']);
/** Malzeme az miktarda mı (tat/kıvam verici; yapı taşıyıcı değil)? */
export function az(m, { gram = 50, bardak = 0 } = {}) {
  const b = String(m.birim || '').toLocaleLowerCase('tr'); const x = Number(m.miktar) || 0;
  if (AZ_BIRIM.has(b)) return b !== 'yemek kaşığı' || x <= 4;
  if (b === 'gram') return x > 0 && x <= gram;
  if (b === 'ml') return x > 0 && x <= gram;
  if (b === 'su bardağı' || b === 'çay bardağı') return x > 0 && x <= bardak;
  return false;
}
const HAMUR = new Set(['hamur-isi', 'ekmek', 'kek-ve-pasta', 'kurabiye', 'pizza-ve-pide', 'manti-ve-dolgulu-hamurlar', 'tatli', 'makarna']);
const TATLI = new Set(['tatli', 'kek-ve-pasta', 'kurabiye', 'dondurma-ve-soguk-tatlilar', 'recel']);

/* ---------- Akıllı İkame tabloları (mod sayfasında da bu listeler gösterilir) ---------- */
// i: { kod, eslesme(ad normal, bilgi, m, t) → bool, yerine, not, ikon? (Kids şeffaf ikon anahtarı) }
const ad = (re) => (n) => re.test(n);
const MODLAR_HAM = [
  {
    kod: 'colyak', dosya: 'saglik-colyak.html', ad: 'Çölyak ve Glutensiz', kisa: 'Glutensiz', renk: 'bugday', ikon: 'basak',
    slogan: 'Buğdaysız, arpasız, çavdarsız; çapraz bulaşmaya karşı dikkatli bir mutfak.',
    kimler: ['Çölyak tanısı olanlar', 'Hekimi glutensiz beslenme önermiş olanlar', 'Glutene duyarlılığı olan ve bunu hekimiyle konuşmuş olanlar', 'Bu kişilere yemek hazırlayan aile ve arkadaşlar'],
    gizlenir: ['Buğday, arpa, çavdar ve bunlardan yapılan un, irmik, bulgur, yufka, makarna, ekmek', 'Glutensiz sertifikası olmayan yulaf', 'Aynı hatta üretilmiş olabilecek paketli ürünler: hazır baharat karışımları, hazır soslar, bulyon, galeta'],
    onerilir: ['Pirinç, mısır, karabuğday, kinoa ve patates temelli tarifler', 'Sertifikalı glutensiz un ve nişastalar', 'Taze et, balık, sebze, meyve ve bakliyat ağırlıklı yemekler'],
    yasakBayrak: ['G', 'YU', 'P'],
    riskli: [['Buğday unu, irmik, bulgur, firik', 'gluten'], ['Arpa, malt, bira', 'gluten'], ['Çavdar ekmeği', 'gluten'], ['Sertifikasız yulaf', 'çapraz bulaşma'], ['Yufka, makarna, erişte, kuskus', 'gluten'], ['Soya sosu', 'buğday içerir'], ['Hazır baharat karışımı, bulyon, hazır sos', 'gizli gluten / aynı bant'], ['Galeta unu, bisküvi, kadayıf', 'gluten']],
    ikame: [
      { kod: 'un', eslesme: (n, b, m, t) => /^(un|buğday unu)$/.test(n) && az(m, { gram: 60 }) && !t.kategori.some((k) => HAMUR.has(k)), yerine: 'pirinç unu ya da karabuğday unu', not: 'sertifikalı glutensiz; kıvam için az miktarda', ikon: 'un' },
      { kod: 'galeta', eslesme: (n, b, m) => /galeta/.test(n) && az(m, { gram: 80, bardak: 1 }), yerine: 'glutensiz galeta unu ya da badem unu', not: 'kaplama ve köfte bağlayıcısı olarak' },
      { kod: 'soya', eslesme: (n) => /soya sosu/.test(n), yerine: 'glutensiz tamari', not: 'etiketinde "glutensiz" yazan' },
      { kod: 'paketli', eslesme: (n, b) => !b.has('G') && !b.has('YU') && /unu|nişasta|maya|vanilya|kakao|jelatin|kabartma/.test(n), yerine: (n) => `sertifikalı glutensiz ${n}`, not: 'aynı hatta üretim riskine karşı' },
    ],
    ikameKart: [['Buğday unu', 'Badem, nohut ya da karabuğday unu', 'un'], ['Galeta unu', 'Glutensiz galeta ya da öğütülmüş badem', 'butun-kuruyemis'], ['Bulgur', 'Karabuğday ya da kinoa', 'bulgur'], ['Makarna', 'Pirinç ya da mercimek makarnası', 'makarna'], ['Soya sosu', 'Glutensiz tamari', null], ['Yulaf', 'Sertifikalı glutensiz yulaf', 'yulaf']],
  },
  {
    kod: 'diyabet', dosya: 'saglik-diyabet.html', ad: 'Diyabet ve Kan Şekeri', kisa: 'Kan şekeri dostu', renk: 'mavi', ikon: 'damla',
    slogan: 'Düşük glisemik indeks, dengeli karbonhidrat; lif ve proteinle eşleşen tabaklar.',
    kimler: ['Tip 1 ya da tip 2 diyabeti olanlar', 'Gebelik diyabeti tanısı alanlar', 'Hekimi kan şekerini izlemesini önermiş olanlar (insülin direnci, prediyabet)', 'Rafine şekeri azaltmak isteyenler'],
    gizlenir: ['Eklenmiş şeker, bal, pekmez, hurma özü, agave ve şuruplar', 'Beyaz un, beyaz pirinç, patates gibi hızlı yükselen nişastalar', 'Meyve suları, kuru meyveler ve şerbetli tatlılar'],
    onerilir: ['Sebze, bakliyat, tam tahıl ve protein ağırlıklı tabaklar', 'Tatlandırmada az miktarda stevia ya da eritritol', 'Karbonhidratı lif ve proteinle aynı öğünde eşleştirmek'],
    yasakBayrak: ['SEK', 'GI'],
    riskli: [['Toz şeker, esmer şeker, pudra şekeri', 'hızlı kan şekeri artışı'], ['Bal, pekmez, hurma özü, agave', 'şeker yükü'], ['Beyaz pirinç, patates', 'yüksek glisemik indeks'], ['Beyaz un, irmik, beyaz ekmek', 'yüksek glisemik indeks'], ['Meyve suyu', 'lifsiz şeker'], ['Kuru meyve', 'yoğun şeker'], ['Şerbetli tatlılar, reçel', 'şeker yükü']],
    ikame: [
      { kod: 'seker', eslesme: (n, b, m, t) => /^(toz şeker|şeker|esmer şeker|kahverengi şeker)$/.test(n) && az(m) && !t.kategori.some((k) => TATLI.has(k)), yerine: 'stevia ya da eritritol', not: 'tadı dengelemek için; miktarı yarıya indirin', ikon: 'seker' },
      { kod: 'bal', eslesme: (n, b, m) => /^(bal|pekmez)$/.test(n) && az(m) && !/tatli/.test(''), yerine: 'stevia ya da eritritol', not: 'sos ve marinasyonda', ikon: 'bal' },
      { kod: 'pirinc', eslesme: (n, b, m) => /^(pirinç|uzun taneli pirinç|kırık pirinç)$/.test(n), yerine: 'karabuğday ya da esmer pirinç', not: 'daha yavaş yükselen tahıl', ikon: 'pirinc' },
    ],
    ikameKart: [['Toz şeker', 'Stevia ya da eritritol', 'seker'], ['Bal, pekmez', 'Az miktarda stevia + tarçın', 'bal'], ['Beyaz pirinç', 'Karabuğday, bulgur ya da esmer pirinç', 'pirinc'], ['Beyaz un', 'Tam buğday ya da badem unu', 'un'], ['Patates', 'Kabak, karnabahar püresi', 'patates'], ['Meyve suyu', 'Bütün meyve + yoğurt (lif ve protein)', 'meyve-suyu']],
  },
  {
    kod: 'alerji', dosya: 'saglik-alerji.html', ad: 'Majör Gıda Alerjileri', kisa: 'Alerjene göre', renk: 'lila', ikon: 'kalkan',
    slogan: 'Alerjenini seç; içeren ve aynı bantta üretilmiş olabilecek her tarif listeden kalksın.',
    kimler: ['Tanılı gıda alerjisi olanlar (süt, yumurta, yer fıstığı, sert kabuklu, susam, balık, kabuklu deniz ürünü, soya, gluten…)', 'Alerjik çocuğu için yemek hazırlayan aileler', 'Misafirinin alerjisine göre sofra kuranlar'],
    gizlenir: ['Seçtiğin alerjeni ya da türevini içeren her tarif (tüm sayfalarda)', 'Paketli, hazır ve "aynı bantta üretilmiştir" uyarısı taşıyabilecek ürün içeren tarifler', 'Malzemesi tam tanımlanamayan tarifler'],
    onerilir: ['Taze, tek bileşenli malzemelerle yapılan tarifler', 'Her ürünün etiketini yeniden okumak (tarifler değişmez, ürün içerikleri değişebilir)', 'Mutfakta ayrı kesme tahtası ve kap kullanmak'],
    yasakBayrak: ['P'],
    riskli: [['Hazır soslar (mayonez, ketçap, soya sosu)', 'birden çok alerjen'], ['Bisküvi, çikolata, granola', 'aynı bant riski'], ['Hazır baharat karışımları, bulyon', 'kereviz, hardal, gluten'], ['Sucuk, sosis, jambon', 'süt proteini, soya'], ['Hazır hamurlar', 'gluten, yumurta, süt'], ['Kuru meyve', 'sülfit']],
    ikame: [],
    ikameKart: [['İnek sütü', 'Pirinç ya da yulaf sütü (diğer alerjenine uygunsa)', 'sut'], ['Tereyağı', 'Zeytinyağı', 'zeytinyagi'], ['Yumurta (kek, köfte bağlayıcı)', 'Öğütülmüş keten tohumu + su', 'yumurta'], ['Tahin', 'Ayçiçeği çekirdeği ezmesi', 'tahin'], ['Fıstık ezmesi', 'Kabak çekirdeği ezmesi', 'fistik-ezmesi'], ['Buğday unu', 'Pirinç ya da karabuğday unu', 'un']],
  },
  {
    kod: 'laktoz', dosya: 'saglik-laktoz.html', ad: 'Süt ve Laktoz (İSPA dahil)', kisa: 'Sütsüz', renk: 'turkuaz', ikon: 'sut',
    slogan: 'Hayvansal süt ürünleri devre dışı; bitkisel ve zeytinyağlı karşılıklar öne çıkar.',
    kimler: ['Laktoz intoleransı olanlar', 'İnek sütü proteini alerjisi (İSPA) olan çocuklar ve aileleri', 'Hekimi sütsüz beslenme önermiş olanlar', 'Bitkisel beslenmeyi deneyenler'],
    gizlenir: ['Süt, yoğurt, peynir, kaymak, krema, ayran, kefir ve tereyağı içeren tarifler', 'Süt proteini içerebilecek paketli ürünler (hazır hamur, şarküteri, çikolata)', 'İSPA\'da laktozsuz inek sütü de uygun değildir'],
    onerilir: ['Zeytinyağlılar, et ve sebze yemekleri, bakliyat', 'Tereyağı yerine zeytinyağı ya da hindistan cevizi yağı', 'Süt yerine bitkisel süt (İSPA için hekiminizin önerdiği ürün)'],
    yasakBayrak: ['S', 'P'],
    riskli: [['İnek, keçi, koyun sütü', 'süt proteini + laktoz'], ['Yoğurt, ayran, kefir', 'süt proteini'], ['Peynir, lor, kaymak, krema', 'süt proteini'], ['Tereyağı, sadeyağ', 'süt proteini'], ['Çikolata, bisküvi, hazır hamur', 'gizli süt tozu'], ['Sucuk, sosis', 'süt proteini katkısı']],
    ikame: [
      { kod: 'tereyagi', eslesme: (n) => /tereyağı/.test(n), yerine: 'zeytinyağı ya da hindistan cevizi yağı', not: 'kavurmada zeytinyağı, hamurda hindistan cevizi yağı', ikon: 'zeytinyagi' },
      { kod: 'sut', eslesme: (n) => /^(süt|ılık süt)$/.test(n), yerine: 'bitkisel süt (yulaf, pirinç, badem)', not: 'İSPA\'da laktozsuz inek sütü uygun değildir', ikon: 'sut' },
      { kod: 'krema', eslesme: (n, b, m) => /^krema$/.test(n) && az(m, { gram: 100, bardak: 0.5 }), yerine: 'hindistan cevizi kreması', not: 'sos ve çorbada' },
    ],
    ikameKart: [['Tereyağı', 'Zeytinyağı ya da hindistan cevizi yağı', 'tereyagi'], ['İnek sütü', 'Bitkisel süt (yulaf, pirinç, badem)', 'sut'], ['Yoğurt', 'Hindistan cevizi ya da soya yoğurdu', 'yogurt'], ['Krema', 'Hindistan cevizi kreması', null], ['Peynir (üstüne)', 'Besin mayası ya da kavrulmuş kaju kreması', 'kasar'], ['Ayran', 'Limonlu soda ya da bitkisel kefir', null]],
  },
  {
    kod: 'ibs', dosya: 'saglik-ibs.html', ad: 'Hassas Bağırsak (IBS / SIBO)', kisa: 'Düşük FODMAP', renk: 'adacayi', ikon: 'yaprak',
    slogan: 'Düşük FODMAP: soğan ve sarımsağın aromasını, şişkinlik yapan kısmı olmadan almak.',
    kimler: ['Hekim tanısıyla irritabl bağırsak sendromu (IBS) olanlar', 'SIBO süreci hekim ve diyetisyenle izlenenler', 'Diyetisyeniyle düşük FODMAP dönemine girenler'],
    gizlenir: ['Soğan, sarımsak, pırasanın beyaz kısmı', 'Elma, armut, karpuz, mango, kuru meyve ve bal', 'Karnabahar, mantar, kuşkonmaz, enginar', 'Nohut, fasulye, mercimek gibi baklagiller', 'Laktozlu süt ve yoğurt, buğday ağırlıklı hamurlar'],
    onerilir: ['Sarımsak yerine sarımsak infüze zeytinyağı', 'Soğan yerine taze soğanın yalnız yeşil kısmı ve bir tutam asafetida', 'Pirinç, patates, kinoa, havuç, kabak, ıspanak, domates'],
    yasakBayrak: ['F', 'L', 'P'],
    riskli: [['Soğan, sarımsak, pırasa (beyaz kısım)', 'fruktan'], ['Elma, armut, karpuz, mango', 'fruktoz / poliol'], ['Karnabahar, mantar', 'poliol'], ['Nohut, fasulye, mercimek', 'GOS'], ['Süt, yoğurt', 'laktoz'], ['Bal, kuru meyve', 'fruktoz'], ['Buğday ağırlıklı ekmek ve hamur', 'fruktan']],
    ikame: [
      { kod: 'sarimsak', eslesme: (n) => /^sarımsak$/.test(n), yerine: 'sarımsak infüze zeytinyağı', not: 'sarımsağı yağda kavurup çıkarın; aroma yağda kalır' },
      { kod: 'sarimsak-toz', eslesme: (n) => /sarımsak tozu/.test(n), yerine: 'bir tutam asafetida', not: 'çok azı yeter' },
      { kod: 'sogan', eslesme: (n, b, m) => /^(soğan|kuru soğan|kırmızı soğan)$/.test(n) && (String(m.birim).toLocaleLowerCase('tr') !== 'adet' || Number(m.miktar) <= 2) && !(String(m.birim).toLocaleLowerCase('tr') === 'kg'), yerine: 'taze soğanın yeşil kısmı + bir tutam asafetida', not: 'beyaz kısmı kullanılmaz', ikon: 'sogan' },
      { kod: 'taze-sogan', eslesme: (n) => /^(taze soğan|yeşil soğan|taze soğan yaprağı)$/.test(n), yerine: 'yalnız yeşil kısmı', not: 'beyaz kısmı ayrılır' },
      { kod: 'pirasa', eslesme: (n) => /^pırasa$/.test(n), yerine: 'pırasanın yalnız yeşil yaprakları', not: 'beyaz gövde kullanılmaz', ikon: 'pirasa' },
      { kod: 'sut', eslesme: (n) => /^(süt|ılık süt)$/.test(n), yerine: 'laktozsuz süt', not: '', ikon: 'sut' },
      { kod: 'yogurt', eslesme: (n) => /^(yoğurt|süzme yoğurt|tam yağlı yoğurt)$/.test(n), yerine: 'laktozsuz yoğurt', not: '', ikon: 'yogurt' },
      { kod: 'bal', eslesme: (n, b, m) => /^bal$/.test(n) && az(m), yerine: 'akçaağaç şurubu', not: 'aynı miktarda', ikon: 'bal' },
    ],
    ikameKart: [['Sarımsak', 'Sarımsak infüze zeytinyağı', 'zeytinyagi'], ['Soğan', 'Taze soğanın yeşil kısmı + asafetida', 'sogan'], ['Süt, yoğurt', 'Laktozsuz süt ve yoğurt', 'sut'], ['Bal', 'Akçaağaç şurubu', 'bal'], ['Elma, armut', 'Portakal, mandalina, çilek', 'elma'], ['Nohut, mercimek', 'Az miktar konserve mercimek (süzülmüş) ya da tofu', 'nohut']],
  },
  {
    kod: 'kalp', dosya: 'saglik-kalp.html', ad: 'Kalp ve Tansiyon (DASH)', kisa: 'Az tuzlu, kalp dostu', renk: 'mercan', ikon: 'kalp',
    slogan: 'Sodyumda en katı kural; tuzun yerini taze ot, baharat ve narenciye alır.',
    kimler: ['Yüksek tansiyonu olanlar', 'Kalp-damar hastalığı nedeniyle hekimi az tuzlu beslenme önermiş olanlar', 'Kolesterolü yüksek olanlar', 'DASH tarzı beslenmeyi deneyenler'],
    gizlenir: ['Tuzlu işlenmiş ürünler: sucuk, sosis, pastırma, turşu, salamura peynir, bulyon, hazır sos', 'Kuyruk yağı, margarin, sakatat ve yağlı etler', 'Kaymak, krema, kaşar gibi doymuş yağı yüksek süt ürünleri', 'Şekerli tatlılar'],
    onerilir: ['Tuz yerine taze ot, baharat, limon kabuğu ve suyu', 'Tereyağı yerine zeytinyağı', 'Sebze, meyve, bakliyat, tam tahıl, balık ve derisiz tavuk'],
    yasakBayrak: ['NA', 'DY', 'SA'],
    riskli: [['Tuz, bulyon, hazır sos', 'sodyum'], ['Sucuk, sosis, pastırma, jambon', 'sodyum + doymuş yağ'], ['Turşu, salamura zeytin, kapari', 'sodyum'], ['Beyaz peynir, kaşar', 'sodyum + doymuş yağ'], ['Kuyruk yağı, margarin', 'doymuş / trans yağ'], ['Ciğer, böbrek gibi sakatat', 'kolesterol'], ['Kaymak, krema', 'doymuş yağ']],
    ikame: [
      { kod: 'tuz', eslesme: (n) => /^(tuz|kaba deniz tuzu|tuz ve karabiber)$/.test(n), yerine: 'taze baharat + narenciye (limon kabuğu ve suyu)', not: 'pul biber, kimyon, kekik, sumak', ikon: 'limon' },
      { kod: 'tereyagi', eslesme: (n) => /tereyağı/.test(n), yerine: 'zeytinyağı', not: '', ikon: 'zeytinyagi' },
      { kod: 'salca', eslesme: (n, b, m) => /salçası|^salça$/.test(n) && az(m), yerine: 'tuzsuz domates püresi', not: 'rendelenmiş taze domates ya da tuzsuz ev salçası', ikon: 'domates' },
    ],
    ikameKart: [['Tuz', 'Taze baharat + limon kabuğu ve suyu', 'tuz'], ['Tereyağı', 'Zeytinyağı', 'zeytinyagi'], ['Salça', 'Tuzsuz domates püresi', 'domates-salcasi'], ['Bulyon', 'Tuzsuz ev yapımı sebze suyu', 'havuc'], ['Beyaz peynir', 'Tuzsuz lor peyniri', 'lor-peyniri'], ['Kırmızı et', 'Balık ya da derisiz tavuk', 'dana-kusbasi']],
  },
];

/* ---------- Moda özgü ek koşullar ---------- */
const NET_KARB = (b) => (b && b.hesaplanabildi ? (b.karbonhidrat_g || 0) - (b.lif_g || 0) : null);
const EK = {
  colyak: () => true,
  diyabet: (t) => {
    if (t.kategori.some((k) => TATLI.has(k) || k === 'icecek') && !t.beslenme.includes('diyabete-uygun')) return false;
    const nk = NET_KARB(t.besin);
    if (nk !== null && (nk > 40 || (t.besin.seker_g || 0) > 12)) return false;
    return true;
  },
  alerji: () => true,
  laktoz: () => true,
  ibs: (t) => !t.kategori.includes('icecek'),
  kalp: (t) => {
    if (t.kategori.some((k) => TATLI.has(k) || k === 'sakatat')) return false;
    if (t.besin && t.besin.hesaplanabildi && (t.besin.doymus_yag_g || 0) > 10) return false;
    return true;
  },
};

export const MODLAR = MODLAR_HAM.map((m) => ({ ...m, ek: EK[m.kod] }));
export const MOD = Object.fromEntries(MODLAR.map((m) => [m.kod, m]));

/** Tarifin malzeme bilgileri (sözlük) + alerjen listesi. */
export function tarifBilgi(t) {
  const malz = t.malzemeler.map((m) => ({ m, s: siniflandir(m.ad) }));
  const alerjen = new Set();
  for (const { s } of malz) for (const [b, kod] of ALERJENLER) if (s.bayrak.has(b)) alerjen.add(kod);
  if (malz.some(({ s }) => s.bayrak.has('YU'))) alerjen.add('gluten-yulaf');
  return {
    malz,
    belirsiz: malz.filter(({ s }) => s.belirsiz).map(({ s }) => s.ad),
    alerjen: [...alerjen],
    paketli: malz.some(({ s }) => s.bayrak.has('P')),
    alkol: malz.some(({ s }) => s.bayrak.has('AL')),
  };
}

/**
 * Bir tarifi bir moda göre değerlendirir.
 * → { uyum:true, ikameler:[{ad, yerine, not, kod}] } ya da { uyum:false, neden }
 */
export function eslestir(t, mod, bilgi = tarifBilgi(t)) {
  const M = typeof mod === 'string' ? MOD[mod] : mod;
  if (bilgi.belirsiz.length) return { uyum: false, neden: 'belirsiz malzeme: ' + bilgi.belirsiz.join(', ') };
  if (bilgi.alkol) return { uyum: false, neden: 'alkol' };
  if (IDDIA.test(`${t.baslik} ${t.alt_baslik || ''}`)) return { uyum: false, neden: 'başlıkta sağlık iddiası' };
  if (t.malzemeler.length < 3) return { uyum: false, neden: 'malzeme listesi kısa' };
  const ikameler = [];
  for (const { m, s } of bilgi.malz) {
    const yasak = M.yasakBayrak.filter((b) => s.bayrak.has(b));
    if (!yasak.length) continue;
    const i = M.ikame.find((x) => x.eslesme(s.ad, s.bayrak, m, t));
    if (!i) return { uyum: false, neden: `${s.ad} (${yasak.join(',')})` };
    // ikame başka bir yasak bayrağı açık bırakmasın: ikame bu malzemenin TÜM yasak bayraklarını karşılar (tablo bunu varsayar)
    ikameler.push({ ad: s.ad, yerine: typeof i.yerine === 'function' ? i.yerine(s.ad) : i.yerine, not: i.not, kod: i.kod });
  }
  if (!M.ek(t, bilgi)) return { uyum: false, neden: 'mod ek koşulu' };
  const tek = []; const gor = new Set();
  for (const x of ikameler) { const k = x.ad + '→' + x.yerine; if (!gor.has(k)) { gor.add(k); tek.push(x); } }
  return { uyum: true, ikameler: tek };
}
