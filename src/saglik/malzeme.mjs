// Malzeme sözlüğü — Gastro tariflerindeki her malzeme adını bayraklara çevirir (tek kaynak).
// İlk eşleşen kural kazanır (özel → genel). Hiçbir kurala uymayan ad "belirsiz"dir: o malzemeyi içeren tarif
// HİÇBİR modda gösterilmez (görev kuralı: emin olunamayan tarifi gösterme).
//
// Bayraklar:
//  Alerjen (TGK / AB 14 grup): G gluten · S süt · Y yumurta · B balık · K kabuklu (karides) · M yumuşakça · YF yer fıstığı ·
//    SK sert kabuklu (çam fıstığı, hindistan cevizi ve kestane ihtiyaten dahil) · SU susam · SO soya · H hardal · KE kereviz · SF sülfit
//  YU yulaf (sertifikasız → çölyakta riskli) · P paketli/işlenmiş (aynı bantta üretim, çapraz bulaşma riski)
//  L yüksek laktoz · F yüksek FODMAP · SEK eklenen şeker/şurup · GI yüksek glisemik nişasta · NA yüksek sodyum ·
//  DY doymuş yağ yükü · SA sakatat · AL alkol
// Kategori (Kiler): sebze, meyve, protein, tahil, sut, yag, baharat, sos, diger · ikon: Kids şeffaf ürün ikonu anahtarı (varsa)
//
// Kelime başı (4 Kas 2026): her kural yalnız bir KELİMENİN BAŞINDA eşleşir — desenin önüne `KELIME_BASI` konur
// (Unicode harf farkında; JS `\b` ASCII'dir ve ş ğ ü ç ı ö'de çalışmaz). Sağ sınır konmaz: Türkçe ek alır (yumurtası,
// muzlu, domatesli). Birleşik kelimenin içinde geçen ad gerekiyorsa alternatif açıkça yazılır (`\p{L}*ciğer`,
// `acıbadem`). Eşleşen kelimeyi BÜTÜN kelime olarak içeren çakışmalar (kefir limonu, şeker fasulyesi, koç yumurtası)
// genel kuraldan ÖNCE gelen özgül kuralla çözülür. Desenlerde `\p{..}` kullanılabilir (kurallar `u` kipinde derlenir).

export const ALERJENLER = [
  ['G', 'gluten', 'Gluten (buğday, arpa, çavdar)'],
  ['S', 'sut', 'Süt ve süt ürünleri'],
  ['Y', 'yumurta', 'Yumurta'],
  ['YF', 'yerfistigi', 'Yer fıstığı'],
  ['SK', 'sertkabuklu', 'Sert kabuklu yemişler'],
  ['SU', 'susam', 'Susam'],
  ['B', 'balik', 'Balık'],
  ['K', 'kabuklu', 'Kabuklu deniz ürünleri'],
  ['M', 'yumusakca', 'Yumuşakçalar'],
  ['SO', 'soya', 'Soya'],
  ['H', 'hardal', 'Hardal'],
  ['KE', 'kereviz', 'Kereviz'],
  ['SF', 'sulfit', 'Sülfit'],
];

export const KELIME_BASI = '(?<![\\p{L}\\p{M}])';

// Balık adları (balık kuralı ve füme balık kuralı aynı listeyi kullanır).
const BALIK = '\\p{L}*balı[kğ]|hamsi|levrek|çipura|palamut|kalkan|mezgit|merluza|sazan|pisi|vatoz|mercan|mırmır|ton balığı|alabalık|somon|uskumru|ringa|sardalya|lüfer|istavrit|morina|torik|kefal|barbun(?!ya)|çiroz|sinarit|lakerda|papalina|haddock';
const FUME = '(füme|tütsülenmiş|tütsülü)';
// İşlenmiş balık (füme · tuzlu · turşu · konserve): balık adıyla birlikte geçerse B P NA.
const ISLENMIS_BALIK = '(füme|tütsülenmiş|tütsülü|tuzlu|turşu|konserve)';

// [düzenli ifade, kategori, bayraklar, ikon]
const R = [
  // — su, buz
  [/^(su|soğuk su|sıcak su|ılık su|kaynar su|buz|soda)$/, 'diger', ''],
  // — ek alerjen (4 Kas 2026): adın taşıdığı alerjeni ilk eşleşen başka kural düşürmesin (birleşik değer = iki kuralın birleşimi)
  [/(çikolata|kakao)(lı|li|lu|lü) (süt|yoğurt)/, 'sut', 'S L SEK P SK YF SO'],
  [/(fındık|ceviz|badem|kaju|fıstık)(lı|li|lu|lü) (süt|yoğurt)/, 'sut', 'S L SK'],
  [/(susam|tahin)(lı|li|lu|lü) (süt|yoğurt)/, 'sut', 'S L SU'],
  [/(bal|şeker|pekmez|karamel)(lı|li|lu|lü) (süt|yoğurt)/, 'sut', 'S L SEK'],
  [/\p{L}+(lı|li|lu|lü) süt|(inek|koyun|keçi|manda|deve) sütü/u, 'sut', 'S L', 'sut'],
  [/\p{L}+(lı|li|lu|lü) yoğurt/u, 'sut', 'S L', 'yogurt'],
  [/\p{L}+(lı|li|lu|lü) (ayran|kefir)/u, 'sut', 'S L NA'],
  [/yoğurtlu sos/, 'sos', 'S L P NA F SEK'],
  [/(çikolata|kakao)\p{L}* dondurma/u, 'sut', 'S L SEK DY P SK YF SO'],
  [/(fındık|ceviz|badem|kaju|fıstık)\p{L}* dondurma/u, 'sut', 'S L SEK DY SK'],
  [/dondurma/, 'sut', 'S L SEK DY'],
  [/yumurta eriştesi|yumurtalı (erişte|makarna)/, 'tahil', 'G F GI P Y', 'makarna'],
  [/çikolatalı bisküvi/, 'tahil', 'G F P GI S SEK SK YF SO'],
  [/fındık krema/, 'diger', 'SK S L DY'],
  [/hindistan ?cevizi şeker/, 'diger', 'SK SEK'],
  [/hindistan ?cevizi jöle/, 'diger', 'SK SEK P F'],
  [/balık suyu/, 'diger', 'B P NA KE F'],
  // — hazır soslar / ezmeler / karışımlar (paketli; içerik markaya göre değişir)
  [/soya sosu/, 'sos', 'SO G P NA'],
  [/balık sosu/, 'sos', 'B P NA'],
  [/hoisin/, 'sos', 'SO G P NA SEK F SU'],
  [/sriracha|acı sos|salsa|ketçap|tartar sos|kırmızı meyve sosu|domates sos/, 'sos', 'P NA F SEK'],
  [/mayonez/, 'sos', 'Y H P NA'],
  [/dijon hardal|^hardal$/, 'sos', 'H P NA SF'],
  [/hardal tohumu/, 'baharat', 'H'],
  [/gochujang|doubanjiang|acı fasulye ezmesi|doenjang|taucu|fermente soya/, 'sos', 'SO G P NA F'],
  [/köri ezmesi|massaman/, 'sos', 'P NA F K B'],
  [/harissa|acı biber ezmesi|acı biber salçası|aji amarillo/, 'sos', 'P NA F'],
  [/wasabi|kren|yaban turpu/, 'sos', 'P H'],
  [/fıstık ezmesi|yer fıstığı ezmesi/, 'diger', 'YF P'],
  [/karaciğer ezmesi|pate/, 'protein', 'P SA DY NA S'],
  [/garam masala|köri tozu|ras el hanout|fajita|berbere|beş baharat|biryani|nihari|pav bhaji|kmeli|baharat karışımı/, 'baharat', 'P F'],
  [/(et|eti|tavuk|sebze|balık|dana|kuzu|kemik) suyu/, 'diger', 'P NA KE F'],
  [/kabartma tozu/, 'diger', 'P G'],
  [/karbonat/, 'diger', 'NA'],
  [/[iı]nstant maya|kuru maya|yaş maya|^maya$/, 'diger', 'P'],
  [/jelatin/, 'diger', 'P'],
  [/vanilya(?!lı)/, 'baharat', 'P'],
  // — un, ekmek, tahıl (gluten)
  [/badem unu/, 'tahil', 'SK P'],
  [/nohut unu/, 'tahil', 'P F'],
  [/karabuğday unu/, 'tahil', 'P'],
  [/mısır unu/, 'tahil', 'P'],
  [/mısır nişastası|^nişasta$/, 'tahil', 'P GI'],
  [/galeta/, 'tahil', 'G P GI'],
  [/tam buğday unu/, 'tahil', 'G F', 'un'],
  [/buğday unu|^un$/, 'tahil', 'G F GI', 'un'],
  [/irmik/, 'tahil', 'G F GI'],
  [/bulgur|aşurelik buğday|kırık buğday|freekeh/, 'tahil', 'G F', 'bulgur'],
  [/kuskus/, 'tahil', 'G F GI P'],
  [/pirinç eriştesi|pirinç keki|tteok/, 'tahil', 'P GI'],
  [/makarna|erişte/, 'tahil', 'G F GI P', 'makarna'],
  [/yufka|puf böreği|pizza hamuru|kadayıf|bisküvi|kedi dili/, 'tahil', 'G F P GI'],
  [/çavdar/, 'tahil', 'G F P'],
  [/mısır tortilla|arepa/, 'tahil', 'P'],
  [/susamlı .*ekme/, 'tahil', 'G F P GI SU'],
  [/tortilla|lavaş|pide|simit|ekme[kğ]|\bpav\b/, 'tahil', 'G F P GI'],
  [/granola/, 'tahil', 'G YU SK P SEK'],
  [/yulaf/, 'tahil', 'YU', 'yulaf'],
  [/karabuğday/, 'tahil', ''],
  [/kinoa/, 'tahil', ''],
  [/kalan pirinç pilavı/, 'tahil', 'GI NA'],
  [/basmati/, 'tahil', '', 'pirinc'],
  [/pirinç/, 'tahil', 'GI', 'pirinc'],
  [/kırık mısır|mısır koçanı|^mısır$/, 'sebze', 'F'],
  // — şeker, tatlandırıcı
  [/eritritol/, 'diger', ''],
  [/akçaağaç/, 'diger', 'SEK'],
  [/^bal$/, 'diger', 'SEK F', 'bal'],
  [/pekmez|hurma şurubu|şurup/, 'diger', 'SEK F'],
  [/reçel|jöle/, 'diger', 'SEK P F'],
  [/kondanse|yoğunlaştırılmış süt/, 'sut', 'S L SEK P'],
  [/şeker fasulye/, 'tahil', 'F'],
  [/şeker elma/, 'meyve', 'F', 'elma'],
  [/şeker mısır/, 'sebze', 'F'],
  [/şeker(?!siz)/, 'diger', 'SEK', 'seker'],
  [/bitter çikolata|çikolata/, 'diger', 'S SEK P SK YF SO'],
  [/kakao/, 'diger', 'P', 'kakao-cikolata'],
  [/keçiboynuzu/, 'diger', 'F'],
  // — süt ürünleri
  [/hindistan ?cevizi sütü/, 'diger', 'SK P DY'],
  [/hindistan ?cevizi rendesi/, 'diger', 'SK DY'],
  [/hindistan ?cevizi/, 'diger', 'SK DY'],
  [/tereyağı/, 'sut', 'S DY', 'tereyagi'],
  [/kaymak|krema|mascarpone|krem peynir/, 'sut', 'S L DY'],
  [/(kefir|kafir) limonu yaprağı/, 'baharat', ''],
  [/(kefir|kafir) limonu/, 'meyve', '', 'limon'],
  [/ayran|kefir/, 'sut', 'S L NA'],
  [/yoğurt/, 'sut', 'S L', 'yogurt'],
  [/^ılık süt$|^süt$|yoğun süt/, 'sut', 'S L', 'sut'],
  [/lor|süzme lor|taze peynir|tuzsuz (taze )?peynir|keçi peyniri/, 'sut', 'S L', 'lor-peyniri'],
  [/kaşar|cheddar|çedar|gravyer|halumi|ezine|beyaz peynir|süzme peynir|muzarella|mozzarella|mozarella/, 'sut', 'S DY NA', 'kasar'],
  // — yumurta
  [/koç yumurta/, 'protein', 'SA DY'],
  [/balık yumurta/, 'protein', 'B Y'],
  [/yumurta/, 'protein', 'Y', 'yumurta'],
  // — işlenmiş et, sakatat
  [new RegExp(`sucu[kğ]|şarküteri|sosis|jambon|pastırma|bastırma|kavurma|salam(?!ura)|pepperoni|peperoni|beyk[ıo]n|bacon|pancetta|prosciutto|chorizo|${FUME} (et|dana|kuzu|sığır|hindi|tavuk|kaz|ördek|kaburga|bonfile)|(dana|kuzu|sığır|hindi|tavuk|kaz|ördek) ${FUME}`, 'u'), 'protein', 'P NA DY SF'],
  [/balı(k|ğı) \p{L}*ciğer/u, 'protein', 'B SA DY'],
  [/\p{L}*ciğer|böbre[kğ](?! fasulye|\p{L}* için)|işkembe|yüre[kğ]|beyin|beyni|paça(?!nga)|kelle|şirden|[mb]umbar|bağırsa[kğ]|uykuluk|salgı bezi|kokoreç|dalak|ili[kğ](?!siz)|kemik iliği|(dana|kuzu|sığır|koyun|keçi|tavuk|hindi) (dili?|kalbi|ayağı|damarı|yanak|yanağı)(?!\p{L})/u, 'protein', 'SA DY'],
  [/kuyruk yağı|iç yağı/, 'yag', 'DY'],
  // — et, tavuk, balık, deniz ürünü
  [/karides/, 'protein', 'K'],
  [/midye|kalamar|ahtapot|mürekkep balığı/, 'protein', 'M'],
  [/ton balığı konservesi/, 'protein', 'B P NA'],
  [new RegExp(`${ISLENMIS_BALIK} (.* )?(${BALIK})|(${BALIK})( .*)? ${ISLENMIS_BALIK}|tuzu .*(${BALIK})|(${BALIK}).* tuzu|çiroz|lakerda`, 'u'), 'protein', 'B P NA'],
  [new RegExp(`${FUME} (toz |pul )?(kırmızı (toz )?biber|paprika|toz biber|pul biber|biber)`, 'u'), 'baharat', '', 'aci-baharat'],
  [/kızarmış hamsi/, 'protein', 'B G'],
  [/somon/, 'protein', 'B', 'somon'],
  [new RegExp(BALIK, 'u'), 'protein', 'B'],
  [/kuzu kaburga|kaburga|yağlı dana kıyma/, 'protein', 'DY'],
  [/kıyma/, 'protein', '', 'kiyma'],
  [/demirhindi/, 'sos', 'F'],
  [/kuşbaşı|antrikot|biftek|bonfile|dana|kuzu|incik|pirzola|kaz eti/, 'protein', '', 'dana-kusbasi'],
  [/tavuk|hindi|bıldırcın/, 'protein', '', 'tavuk'],
  [/yumuşak tofu/, 'protein', 'SO P F'],
  [/tofu/, 'protein', 'SO P'],
  // — kuruyemiş, tohum
  [/yer fıstığı/, 'diger', 'YF'],
  [/çam fıstığı|dolmalık fıstık/, 'diger', 'SK'],
  [/antep fıstığı/, 'diger', 'SK F'],
  [/badem|acıbadem|fındık|ceviz/, 'diger', 'SK', 'butun-kuruyemis'],
  [/kestane/, 'diger', 'SK F'],
  [/tahin/, 'diger', 'SU', 'tahin'],
  [/susam yağı|susamyağı/, 'yag', 'SU'],
  [/susam/, 'baharat', 'SU'],
  [/chia/, 'diger', ''],
  [/çörek otu/, 'baharat', ''],
  // — yağ
  [/margarin/, 'yag', 'DY P'],
  [/zeytinyağı/, 'yag', '', 'zeytinyagi'],
  [/ayçiçek yağı|sıvı ?yağ/, 'yag', ''],
  // — bakliyat
  [/nohut/, 'tahil', 'F', 'nohut'],
  [/kırmızı mercimek/, 'tahil', 'F', 'kirmizi-mercimek'],
  [/mercimek/, 'tahil', 'F'],
  [/fasulye filizi/, 'sebze', ''],
  [/soya fasulye|edamame/, 'tahil', 'SO F'],
  [/fasulye|barbunya|bakla|acıbakla|azuki|pinto/, 'tahil', 'F'],
  [/bezelye/, 'sebze', 'F', 'bezelye'],
  // — soğan, sarımsak
  [/frenk soğanı/, 'baharat', ''],
  [/kızarmış soğan/, 'sebze', 'F P'],
  [/sarımsak/, 'sebze', 'F'],
  [/soğan/, 'sebze', 'F', 'sogan'],
  [/pırasa/, 'sebze', 'F', 'pirasa'],
  // — sebze
  [/karnabahar/, 'sebze', 'F', 'karnabahar'],
  [/mantar/, 'sebze', 'F'],
  [/enginar/, 'sebze', 'F', 'enginar'],
  [/kuşkonmaz/, 'sebze', 'F'],
  [/brüksel/, 'sebze', 'F'],
  [/kereviz/, 'sebze', 'KE F', 'kereviz'],
  [/kırmızı pancar|^pancar$/, 'sebze', 'F', 'pancar'],
  [/tatlı patates|kumara/, 'sebze', 'F', 'tatli-patates'],
  [/bal ?kabağı/, 'sebze', 'F', 'balkabagi'],
  [/yer elması/, 'sebze', 'F'],
  [/yeşil muz/, 'meyve', 'GI'],
  [/patates/, 'sebze', 'GI', 'patates'],
  [/domates salçası|biber salçası|^salça$|kırmızı biber salçası/, 'sos', 'NA', 'domates-salcasi'],
  [/yeşil domates/, 'sebze', ''],
  [/domates/, 'sebze', '', 'domates'],
  [/turşu/, 'sebze', 'NA P'],
  [/kapari|zeytin(?!yağı)/, 'sebze', 'NA'],
  [/patlıcan/, 'sebze', ''],
  [/^kabak$/, 'sebze', '', 'kabak'],
  [/havuç/, 'sebze', '', 'havuc'],
  [/ıspanak/, 'sebze', '', 'ispanak'],
  [/salatalık/, 'sebze', '', 'salatalik'],
  [/marul|roka|yeşillik|semizotu|radika|pazı|kara lahana|ebegümeci|deniz börülcesi/, 'sebze', ''],
  [/lahana|karalahana/, 'sebze', ''],
  [/kohlrabi|turp/, 'sebze', ''],
  [/bamya/, 'sebze', ''],
  [/taze barbunya/, 'sebze', 'F'],
  [/kırmızı ve yeşil biber|dolmalık biber|kapya|sivri biber|yeşil biber|kırmızı biber$|^biber$|sarı dolmalık|acı biber$|acı (yeşil|sarı|kırmızı) biber|taze acı biber|yeşil acı biber|kırmızı acı biber|kırmızı dolmalık biber|kırmızı kapya biber|yeşil sivri biber/, 'sebze', '', 'biber'],
  // — meyve
  [/kuru (erik|kayısı|incir|üzüm)|kuş üzümü|kuşüzümü|kuru longan/, 'meyve', 'F SF SEK'],
  [/trabzon hurması/, 'meyve', ''],
  [/hurma/, 'meyve', 'F SEK'],
  [/ayva/, 'meyve', 'F', 'ayva'],
  [/üzüm suyu|armut suyu|portakal suyu|meyve suyu/, 'meyve', 'SEK F'],
  [/elma sirkesi/, 'sos', ''],
  [/elma/, 'meyve', 'F', 'elma'],
  [/armut/, 'meyve', 'F', 'armut'],
  [/karpuz/, 'meyve', 'F', 'karpuz'],
  [/mango/, 'meyve', 'F'],
  [/şeftali/, 'meyve', 'F', 'seftali'],
  [/kayısı|erik|kiraz|vişne/, 'meyve', 'F'],
  [/nar ekşisi/, 'sos', 'SEK'],
  [/nar/, 'meyve', 'F', 'nar'],
  [/avokado/, 'meyve', 'F', 'avokado'],
  [/muz/, 'meyve', 'F', 'muz'],
  [/incir/, 'meyve', 'F', 'incir'],
  [/dondurulmuş meyve|açai/, 'meyve', 'F P'],
  [/limon suyu/, 'meyve', '', 'limon'],
  [/limon otu/, 'baharat', ''],
  [/kuru limon/, 'baharat', ''],
  [/limon/, 'meyve', '', 'limon'],
  [/portakal/, 'meyve', '', 'portakal'],
  [/mandalina/, 'meyve', '', 'mandalina'],
  [/çilek/, 'meyve', '', 'cilek'],
  [/ahududu/, 'meyve', ''],
  [/üzüm/, 'meyve', '', 'uzum'],
  [/kavun/, 'meyve', '', 'kavun'],
  [/ananas/, 'meyve', ''],
  [/kızılcık|çarkıfelek|frenk üzümü/, 'meyve', 'F'],
  [/kuşburnu/, 'meyve', 'F'],
  // — sirke, içecek, alkol
  [/şarap sirkesi|balsamik|balzamik/, 'sos', 'SF'],
  [/sirke/, 'sos', ''],
  [/şarap|marsala/, 'diger', 'AL SF'],
  [/gül suyu/, 'diger', ''],
  [/türk kahvesi|kahve|siyah çay/, 'diger', ''],
  // — tuz, baharat, ot
  [/tuz ve karabiber/, 'baharat', 'NA', 'tuz'],
  [/tuz/, 'baharat', 'NA', 'tuz'],
  [/kimyon/, 'baharat', '', 'kimyon'],
  [/tarçın/, 'baharat', '', 'tarcin'],
  [/maydanoz|dereotu|nane|kişniş|fesleğen|reyhan|kekik|biberiye|defne|guasca|çemen/, 'baharat', '', 'maydanoz'],
  [/zencefil|zerdeçal|karanfil|kakule|muskat|yeni ?bahar|yıldız anason|safran|sumak|sichuan|beyaz biber|karabiber|toz biber|pul biber|biber tozu|kırmızı toz biber|ancho|guajillo|kuru acı biber|kuru kırmızı biber|kurutulmuş kırmızı biber|portakal kabuğu|limon kabuğu|ananas kabuğu/, 'baharat', '', 'aci-baharat'],
];

// Derlenmiş tablo: her desen `KELIME_BASI` ile başlar ve `u` kipindedir. Üretici (Gastro `scripts/alan/uret-kural-tablosu.mjs`) bunu okur.
export const KURALLAR = R.map(([re, kategori, b, ikon]) => [new RegExp(`${KELIME_BASI}(?:${re.source})`, 'u'), kategori, b, ikon || null]);

const _norm = (s) => String(s || '').normalize('NFC').toLocaleLowerCase('tr').replace(/̇/g, '').replace(/\s+/g, ' ').trim();
export const normal = _norm;

// Eşleşme adı (Beyar kararı 4 Kas 2026): parantez içi not asıl malzemeyi ezmez, ilk malzeme adı esastır. Normal adın
// İLK "(" işaretinden önceki kısmı (sondaki boşluk/virgül/noktalı virgül/iki nokta/nokta atılarak) sınıflandırılır;
// kapanmamış parantez de aynı kuralla kesilir. Parantez başta ya da önceki kısım boşsa tam ad denenir (sıkı taraf).
// `ad` alanı değişmez (normal ad); eşleşilen ad ayrıca `eslesme_ad` alanındadır.
export function eslesmeAdi(n) {
  const i = n.indexOf('(');
  if (i <= 0) return n;
  const on = n.slice(0, i).replace(/[ ,;:.]+$/, '');
  return on === '' ? n : on;
}

/** Ad → { ad, eslesme_ad, kategori, bayrak:Set, ikon, belirsiz } */
export function siniflandir(ad) {
  const n = _norm(ad);
  const e = eslesmeAdi(n);
  for (const [re, kategori, b, ikon] of KURALLAR) {
    if (re.test(e)) return { ad: n, eslesme_ad: e, kategori, bayrak: new Set(b.split(/\s+/).filter(Boolean)), ikon: ikon || null, belirsiz: false };
  }
  return { ad: n, eslesme_ad: e, kategori: null, bayrak: new Set(), ikon: null, belirsiz: true };
}
