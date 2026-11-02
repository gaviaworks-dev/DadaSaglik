# Dada Gastro Sağlık — plan ve kararlar

2 Kasım 2026 · kaynak: Beyar "Dada Gastro: Özel Sağlık Alanı ve Yaşam Modları" özeti (görev metni) · miras: Dada Gastro Kids prototipi (v2 kararları)

## 1. Mimari (Kids'in aynısı)
- Kabuk: canlı Gastro'nun **yerel donör kopyası** (Kids `src/donor/*.html` + `varlik/gastro/**` kopyalandı; canlıya istek yok). `araclar/temizle.mjs` (token/CSRF/oturum temizliği) aynen; `araclar/snapshot.mjs` yalnız belge olarak taşındı, ÇALIŞTIRILMAZ (canlı yük yasağı).
- Derleme: `node araclar/build.mjs` → kökte statik HTML. Sağlık sayfası = Gastro tarif detayı kabuğu (açık header) + `<main>` içinde `.sg-sayfa` (Sağlık alt menüsü + içerik).
- Sınıf öneki `sg-` · CSS `varlik/saglik/saglik.css` (+ `css/<kol>.css`) · JS `varlik/saglik/saglik.js` (+ `js/<kol>.js`).
- Veri: `python3 -I araclar/veri-hazirla.py` → `veri/gastro-tarifler.json` (gastro-mysql `database.sqlite` SALT OKUMA `mode=ro`; 480 yayında tarif, kapak + malzeme + adım + beslenme etiketi + porsiyon başı besin değeri). Görseller gastro-mysql `public/varliklar/media` yerel kopyasından, yalnız eşleşen tariflerinki 640px webp'ye (cwebp) indirgenip `varlik/saglik/tarif/` altına.
- Yerel sunucu: `node araclar/sunucu.mjs` → http://localhost:8790/DadaSaglik/ (Pages alt yolunu taklit eder).

## 2. Sayfalar
| Dosya | Ne |
|---|---|
| `index.html` | Gastro ana sayfa (donör) + Sağlık giriş bandı (kapı A) |
| `tarifler.html` | Gastro tarif listesi + "Sağlık modları" chip'i (kapı B); her sayfada mega menüde Sağlık şeridi (kapı C) |
| `saglik.html` | Hub: hero + "Modunu seç" (6 mod kartı, kısa açıklama), nasıl çalışır, öne çıkan tarifler, bilgi kartları |
| `saglik-colyak.html` … `saglik-kalp.html` (6) | Mod sayfası (alt sekme) |
| `saglik-dolap.html` | Dolapta Ne Var — seçili moda göre riskli malzemeler dışlanır (Kids Bebek Dolabı kalıbı) |
| `saglik-tarif.html?t=<slug>&mod=<kod>` | Tarif detayı: modda uyum rozeti, ikame uygulanmış malzeme listesi, adımlar |
| `saglik-bilgi.html#<makale>` | Bilgilendirme makaleleri (6 mod × 3) |

## 3. Kabuk ve gezinme (Kids kararları)
- Gastro üst siyah bant + header + footer **aynen**; altında Sağlık alt menüsü: **ev ikonu + 6 mod sekmesi** (Glutensiz · Kan Şekeri · Alerjen · Sütsüz · Düşük FODMAP · Kalp Dostu). Menü metin + dolu ev ikonu (Kids 2 Kas kararı: kategori ikonu yok).
- Logo: Dada Gastro logosu aynen + yanında sade **"sağlık"** rozeti (Kids `kids` rozeti mantığı: header'da yalnız CSS `::after`, Gastro DOM'una öğe eklenmez; bağımsız kilit SVG).
- Sticky (Kids R3): aşağı kayınca yalnız Gastro `header.header` gizlenir; siyah bant + Sağlık barı kalır; mini kilit görünür; yukarı kayınca geri gelir; reduced-motion anında. Sayfa yapışkan barları `top: var(--sg-bar-alt)`.
- Radius tek değer = Gastro buton köşesi (`--radius-md`, 12px; "Giriş Yap" ölçülür). İstisna yalnız gerçek daire ve switch.
- Spacing ölçeği 4/8/12/16/24/32/48/64/96 (`--sg-s1…s9`).
- Izgara: yarım satır yok (son satır "Tüm tarifler" yönlendirme kartıyla ya da "Daha fazla göster"le tamamlanır); yan yana kartlar eşit boy, CTA altta aynı çizgide.
- SSS: tek-açık akordeon (Kids sssKur birebir), hash ile açılır.
- Görsel dil: gerçek, aydınlık yemek fotoğrafları (Gastro tarif kapakları); malzeme ikonları şeffaf (Kids `urun-pixar` seti yerel kopya). Her moda sakin vurgu rengi (açık zemin / koyu metin AA).
- Uyarı tek satır, sayfada bir kez (mod sayfaları + tarif detayı): "Bu bilgiler genel bilgilendirme amaçlıdır; tanı ve tedavi için hekiminize danışın."

## 4. Mod sayfası (Kids alt sekmesi × Gastro reklam seçki sayfası hibriti)
Gastro seçki sayfası (`resources/views/reklam/secki/hero.blade.php`, `public/reklam/secki.css`): sahne fotoğrafı tam kaplar + marka renginde soldan sağa açılan katman, kırıntı, eyebrow, logo + "Sponsorlu" etiketi, h1, lead, istatistik şeridi; sağda beyaz kutu; liste bölümü hero'ya hilal biçimli girişle biner, zemin marka tonundan site zeminine iner; logosuz marka → baş harf yuvarlağı.
Mod sayfasında aynı iskelet, marka yerine **mod rengi**:
1. Hero: uyumlu bir tarifin fotoğrafı sahne + mod rengi katmanı · kırıntı · eyebrow "Sağlık modu" · h1 · giriş · istatistik (uyumlu tarif · akıllı ikame · riskli malzeme) · sağda beyaz kutu "Kimler için?"
2. Tek satır uyarı şeridi.
3. (Alerji modu) Alerjen seçici: 13 grup, çoklu; localStorage try/catch; seçim tüm sayfalarda tüm listelere uygulanır.
4. "Bu modda neler gizlenir / neler önerilir" iki eşit kart.
5. Riskli malzeme listesi (malzeme + neden).
6. Akıllı İkame kartları (malzeme → karşılık, şeffaf ikonlar).
7. İnce Dolap bandı → `saglik-dolap.html?mod=<kod>`.
8. Tarif ızgarası (seçki liste girişi): sol filtre (kategori, süre, "yalnız ikamesiz"), sağda "N tarif" + sıralama; kartta mod uyum rozeti + uygulanan ikame satırı; "Daha fazla göster".
9. Bilgilendirme makale kartları (3).
10. **İş birliği** (seçki kalıbı): "Olası iş birliği" etiketli kurum kartları — logo + ad + kısa tanım + resmî site bağlantısı. **Yalnız admin görünür:** bölüm `data-yalniz-admin` bayraklı; prototipte görünür, canlıya taşınırken admin yetkisine bağlanacak (Gastro'da `@can('admin')` / yönetim oturumu ile sarılacak). Onay/destek ifadesi yok.
11. SSS (5, tek-açık).

## 5. Veri eşleşme kuralları (src/saglik/malzeme.mjs + src/saglik/modlar.mjs)
- Malzeme sözlüğü: 528 farklı malzeme adı kural tablosuyla bayraklanır (14 alerjen grubu, sertifikasız yulaf, paketli/aynı bant riski, yüksek laktoz, yüksek FODMAP, eklenmiş şeker, yüksek Gİ, sodyum, doymuş yağ, sakatat, alkol). Kurala uymayan ad **belirsiz** → o tarif hiçbir modda gösterilmez.
- Mod kuralı: yasak bayraklı malzeme varsa tarif dışarıda; yalnız o malzemeye tanımlı ve koşulu sağlanan **Akıllı İkame** varsa kalır (kartta "İkame: X → Y").
- Moda göre: Çölyak yasak {G, YU, P} · ikame: az miktar un (hamur işi değil) → pirinç/karabuğday unu, galeta → glutensiz galeta/badem unu, soya sosu → glutensiz tamari, tek bileşenli paketli ürün → "sertifikalı glutensiz". Diyabet yasak {SEK, GI} + tatlı/içecek kategorisi (Gastro "diyabete uygun" etiketi yoksa) + hesaplanmış besin varsa net karbonhidrat ≤ 40 g, şeker ≤ 12 g/porsiyon · ikame: az şeker → stevia/eritritol, az bal/pekmez → stevia/eritritol, pirinç → karabuğday/esmer pirinç. Alerji yasak {P} (aynı bant) + kullanıcı seçimi; **ikame yok** (sıfır hata). Süt/Laktoz yasak {S, P} · ikame: tereyağı → zeytinyağı/hindistan cevizi yağı, süt → bitkisel süt, az krema → hindistan cevizi kreması. IBS yasak {F, L, P} · ikame: sarımsak → infüze zeytinyağı, sarımsak tozu → asafetida, ≤2 soğan → taze soğan yeşili + asafetida, pırasa → yeşil yaprak, süt/yoğurt → laktozsuz, az bal → akçaağaç şurubu. Kalp yasak {NA, DY, SA} + tatlı/sakatat kategorisi + hesaplanmış doymuş yağ ≤ 10 g · ikame: tuz → taze baharat + narenciye, tereyağı → zeytinyağı, az salça → tuzsuz domates püresi.
- Alkollü tarif hiçbir modda yok; en az 3 malzeme.
- Kapı: `araclar/mod-kapisi.mjs` — her mod sayfasındaki her kartın tarifi, ikame edilmeyen yasak malzeme içermiyor (0); alerjen seçimi sonrası görünür kartlarda seçili alerjen 0.

## 6. Partner doğrulama tablosu
→ tasks/saglik-kaynaklar.md (ajan `partner-arastirma`; doğrulanmış/düzeltilmiş/çıkarılmış adlar + logo kaynakları).

## 7. Kapılar (Kids uyarlaması)
varlik (404, JS hatası, yatay taşma, kırık görsel, kesilme, alt metin; 1440/1024/768/390) · davranis (sticky, SSS tek-açık, alerjen seçimi kalıcı + tüm listeler, mod seçimi, dolap dışlama, filtre) · denge (yan yana kart boyu, CTA hizası) · radius (tek değer) · bosluk (spacing ölçeği) · izgara (yarım satır yok) · mod (yasaklı malzeme 0) · token taraması (build).

## 8. Kararlar
karar: Tarif kaynağı sqlite'taki 480 yayında tarif (Gastro'nun 1016 tariflik yeni partileri yerelde görselsiz; görselsiz tarif gösterilmez). gerekçe: gerçek fotoğraf kuralı + yerel kopya şartı.
karar: Partner logoları kullanılır (Beyar EK 2 Kas, ilk "logo yok" kuralının yerine). gerekçe: Beyar kararı; alan yalnız admin görünür.
karar: Başlığında sağlık iddiası taşıyan Gastro tarifleri (ör. "Yeşil Detoks Smoothie"; detoks/şifa/bağışıklık/yağ yakan/zayıflatan/arındırıcı/kür) hiçbir Sağlık listesine girmez. gerekçe: görev kuralı "tıbbi iddia yok"; tarif başlığı sayfada iddia gibi okunur.
karar: İkame kartı ikonu = asıl (değiştirilen) malzemenin Kids şeffaf ikonu; yoksa karşılığınınki; ikisi de yoksa mod çizgisel ikonu yer tutucu (soya sosu, krema, ayran). Higgsfield ile üretim yapılmadı. gerekçe: paylaşımlı hesap bakiyesi 566,88; Kids turunda konan 560 tabanının altına inmemek için.
