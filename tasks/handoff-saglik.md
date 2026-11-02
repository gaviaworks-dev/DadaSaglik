# Dada Gastro Health (eski adı: Dada Gastro Sağlık) — prototip (handoff)

> Compact/clear sonrası İLK İŞ: "▶ ŞU AN" bölümünü oku, oradan devam et. Bitmiş (☑) işi tekrarlama.
> Görev: Beyar 2 Kas "YENİ PROTOTİP: Dada Gastro Sağlık" (6 yaşam modu). Kaynak özet görev metninde; Kids prototipinin (~/Developer/Projects/dadakids-prototip) kabuk/kapı/karar mirası.

## Kurallar
- FULL OTONOM, soru yok; belirsizlik → tasks/saglik-plan.md "karar: … gerekçe: …".
- Repo ~/Developer/Projects/dadasaglik-prototip · GitHub gaviaworks-dev/DadaSaglik (oluştur + push + Pages onaylı). Force push YOK, `git add -A` YOK, staged kontrol.
- Canlı dadagastro.com'a yük/parite/tarama YOK. Kabuk = Kids'in yerel donör kopyası (src/donor, varlik/gastro). Veri = gastro-mysql/database/database.sqlite salt okuma (mode=ro) + public/varliklar/media yerel görseller.
- Tıbbi iddia yok ("tedavi eder/iyileştirir" yok). Her mod sayfasında bir kez: "Bu bilgiler genel bilgilendirme amaçlıdır; tanı ve tedavi için hekiminize danışın."
- Partner (EK Beyar 2 Kas, eskisinin yerine): resmî LOGO KULLANILIR (kurumun kendi sitesinden, değiştirilmeden; SVG ya da en yüksek PNG → webp CSS render boyutunda) → varlik/saglik/partner/; kaynak URL tasks/saglik-kaynaklar.md tablosunda. Logo yoksa adla sade yer tutucu + raporla. Kart: logo + ad + kısa tanım + resmî site; etiket "Olası iş birliği"; onay/destek ifadesi yok. Bölüm `data-yalniz-admin` bayraklı (prototipte görünür, canlıda admin yetkisine bağlanacak) → plana not.
- Kids kararları: radius tek değer = Gastro buton (12px, --radius-md) · spacing 4/8/12/16/24/32/48/64/96 · sticky: aşağı kayınca yalnız Gastro header gizlenir, siyah bant + Sağlık barı kalır · ızgara yarım satır yok · yan yana kartlar eşit boy, CTA altta · SSS tek-açık · gerçek/aydınlık foto, şeffaf malzeme ikonları (Kids urun-pixar) · localStorage try/catch.
- Ajanlar commit atmaz; iki ajan aynı dosyaya yazmaz.

## ▶ ŞU AN
- ☑ H31 (Beyar 3 Kas) canlı: saglik-tarif.html = canlı Gastro tarif detayı (donör: dadagastro.com/tarif/sebzeli-tavuk-sote-tavada-pratik, Beyar'ın açık izniyle genişlik başına TEK salt okuma yüklemesi; DOM/CSS/görüntüler rapor/tmp/h31/canli/). 15 bölüm 1440/390 Δ0 (fark yalnız mod çipi, uyarı satırı ve yerel veride olmayan şef/eşleşme satırı); yan yana rapor/tmp/h31/yan-yana/.
  Değerlendirmeler (Beyar: "prototip, yapay değerlendirme koy, Dada Gastro'daki gibi"): puan/sayılar kayıtlı değerler (kartla aynı), 5→1 dağılım slug tohumlu örnek (toplam = kayıtlı sayı, ortalama ≈ kayıtlı), örnek yorum listesi data-ornek="1" — GERÇEK KULLANICI DEĞİL; Gastro'ya taşınırken gerçek veriyle değiştirilmeli (tarif.mjs tohum/ornekDagilim, detay.js ornekYorumlar).

## ▶ SIRADAKİ
- H31 kalan farklar (veri/kapsam): sote'de şef yok (yerel sef_id NULL; canlıda var) · canlıdaki "Yanında ne iyi gider?" eşleşme satırı yerel veride/kaynakta yok · canlı r-card'da kaydet kalbi (r-save) var, Health kartında yok (kart kodu; yerel Gastro donöründe de yok) · Health alt menüsü header ile kırıntı arasında (hero 1440'ta 62px aşağıda).
- ☑ H29 kapandı (Beyar 2 Kas): kart meta satırı Gastro'yla birebir kalır (kabuk/kart-standart.css kontrollü sarılma); değişiklik yok.
- Filtre paneli liste boyuyla sınırlı (Gastro JS max-height) → 12 kartlık sayfada içte kayar; Gastro 30'ar gösteriyor. İstenirse Health sayfa boyu 30'a çıkarılabilir.
- Kullanılmayan eski sahne dosyaları (acılı kuzu şiş, harissa, domatesli pilav, boquerones) varlik/saglik/sahne/'de duruyor; silinebilir.
- ☑ Bilinçli farklar kararlandı (yukarıda). Eski not: (1) Gastro "Gilroy 700"ü Medium'dan SAHTE kalın çizer; Health yazi.css ile Gastro'nun ExtraBold dosyasını kullanır → kalın metin 1–7 px geniş. Birebir görünüm istenirse css/yazi.css bağlaması kaldırılır (tek satır). (2) Menü yazı boyutu Kids'ten (14.5/13.5 px; Gastro header 15 px). (3) Mobil filtre perdesi Health'te görünür (Gastro donöründe .open/.is-open uyuşmazlığıyla hiç görünmüyor). (4) Tarif detayı puanı gerçek değerlendirmelerden (Gastro TarifDetayServisi: tarifler.ortalama_puan "SAHTE SAYAÇ"), kart puanı Gastro kartı gibi tarifler.puan → kartta 4.5, detayda 0.0 olabilir; istenirse ortak.mjs istemciVerisi `pg` + kart.mjs/saglik.js .r-rate.
- ☑ Kapılar push sonrası koşuldu: 9/9 YEŞİL (boşluk, denge, font, gölge, mod, parite, radius 76/76, varlık 144/144, davranış). Kapıların bulduğu 2 gerçek hata düzeltildi: 390'da hero sütunu kurum kaydırıcısıyla uzayıp H1'i taşırıyordu (.sg-secki-izgara > * min-width:0) · detayda GilroyBd 800 sayaçlar sahte kalındı (yazi.css GilroyBd 701–900 → ExtraBold). Diğerleri kapıların eski işaretlemeye bakmasıydı (güncellendi).
- ☑ 75798c3 canlı: sekme geçişinde titreme giderildi (CLS 0; kök sebepler: yapışkan bar 112→113 px, Gilroy/FA geç değişimi, 390'da yükleme sonrası sekme kaydırması, boyutsuz kurum logoları) · sekme köşesi Gastro buton köşesi 12px · font ölçümü sapma 0. Kapı koşulmadı (Beyar). Ölçüm/kayıt araçları: araclar/titreme-olc.mjs, araclar/titreme-kayit.mjs.
- ☑ 59d0705 canlı: seçili mod sekmesi öncü kurum renginde (kaynak: tasks/saglik-kaynaklar.md "Kurum renkleri"), kart/karo/panel/sekme çubuğunda gölge yok. Beyar: "revizeler gelecek, kapı koşma" → bu turda kapı koşulmadı; yeni araclar/golge-kapisi.mjs yazıldı, koşulmadı.
- Kapı güncellemesi gerekli (önceki tur sonucu, sayfa hatası değil): radius-kapisi Gastro .dt'nin 8px köşesini (Gastro --radius-sm) ETİKET listesine almalı; varlik-kapisi .sg-sekme-bolum'u (sekme bandı) 'görselsiz bölüm' kuralından muaf tutmalı. mod/davranış kapıları yeşildi.
- Kapı sonuçlarına göre düzeltme (davranış/radius/varlık kapıları eski kart işaretlemesine — .sg-r-ikame, .sg-gir — bakıyorsa güncelle).
- Kan Şekeri "hata"sı Beyar'dan netleşmedi; ekran görüntüsündeki yer sorulacak.
- Gastro kendi bileşenlerinde (.dt, .r-chip, h1–h4) Gilroy 700 ister ama yalnız 500 dosyası tanımlı → Gastro'nun kendi sayfalarında sahte kalın var; Health'te yazi.css ile giderildi. Gastro'ya taşınırken aynı bağlama gastro-mysql resources/css/gilroy-font-faces.css'e eklenebilir (karar Beyar'da).

## ⚠ Canlı öncesi: kurum izinleri
- Kurum logoları (banner şeritleri, iş birliği kartları) ve mod ikonu olarak kullanılan kurum site ikonları **yalnız prototipte** kalabilir. Canlıya taşımadan önce her kurumdan yazılı kullanım izni alınmalı; izin gelmeyen kurumun logosu/ikonu kaldırılır (mod ikonunda çizgisel ikon yedeği hazır: ui(M.ikon)).
- İzin gerekenler: tasks/saglik-kaynaklar.md partner tabloları (16 kurum) + "Mod ikonları" tablosu (6 site ikonu). Hepsi data-yalniz-admin bayraklı.
- Gastro'ya taşımadan önce her kurumla yazılı iş birliği + logo kullanım izni şart; yoksa başlık 'Bu alanda çalışan kurumlar'a döner. (Beyar 2 Kas: başlık şu an "Bizimle iş birliği yapan kurumlar" — hub kartı, mod hero şeridi, bilgilendirme iş birliği bölümü; kaynak: src/saglik/ortak.mjs logoSeridi/kurumKutusu/partnerBolumu.)
