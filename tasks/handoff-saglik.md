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
- ☑ 1–7 İlk teslim + revizeler canlıda (a797ee4: sekme sayfa içi, sayfalama, Gastro paneli, köşe üçlüsü).
- ◐ TUR "Health" (Beyar 2 Kas): ☑ marka adı "Dada Gastro Health" (logo rozeti "health", kırıntı, menü, title/meta; dosya adları aynı) · ☑ mod sekmeleri + Tarifler/Bilgilendirme = Gastro `.disc-tabs/.dt/.dt.active` (kopya stil yok) · ☑ kart = Gastro `.r-card` birebir + `tarif-liste.css` + `.lst-grid` (şef/puan/görüntülenme/bütçe veriden; mod uyumu ve ikame Gastro `.rd-b` rozeti; hover yok) · ☑ font: tüm metin Gilroy, sahte kalın 0 (css/yazi.css: Gastro ExtraBold dosyası Gilroy 600–900'e bağlı; kanon §5) · ☑ başlık "Bizimle iş birliği yapan kurumlar" · ◐ tarif detayı Gastro detay şablonu birebir (ajan `detay`: src/saglik/sayfalar/tarif.mjs, js/detay.js) · ☐ duman → push → Pages → canlı linkler + Gastro yan yana 3 görüntü · ☐ kapılar push sonrası arka planda (yeni: araclar/font-kapisi.mjs, araclar/parite-kapisi.mjs)

## ▶ SIRADAKİ
- ☑ 59d0705 canlı: seçili mod sekmesi öncü kurum renginde (kaynak: tasks/saglik-kaynaklar.md "Kurum renkleri"), kart/karo/panel/sekme çubuğunda gölge yok. Beyar: "revizeler gelecek, kapı koşma" → bu turda kapı koşulmadı; yeni araclar/golge-kapisi.mjs yazıldı, koşulmadı.
- Kapı güncellemesi gerekli (önceki tur sonucu, sayfa hatası değil): radius-kapisi Gastro .dt'nin 8px köşesini (Gastro --radius-sm) ETİKET listesine almalı; varlik-kapisi .sg-sekme-bolum'u (sekme bandı) 'görselsiz bölüm' kuralından muaf tutmalı. mod/davranış kapıları yeşildi.
- Kapı sonuçlarına göre düzeltme (davranış/radius/varlık kapıları eski kart işaretlemesine — .sg-r-ikame, .sg-gir — bakıyorsa güncelle).
- Kan Şekeri "hata"sı Beyar'dan netleşmedi; ekran görüntüsündeki yer sorulacak.
- Gastro kendi bileşenlerinde (.dt, .r-chip, h1–h4) Gilroy 700 ister ama yalnız 500 dosyası tanımlı → Gastro'nun kendi sayfalarında sahte kalın var; Health'te yazi.css ile giderildi. Gastro'ya taşınırken aynı bağlama gastro-mysql resources/css/gilroy-font-faces.css'e eklenebilir (karar Beyar'da).

## ⚠ Canlı öncesi: kurum izinleri
- Kurum logoları (banner şeritleri, iş birliği kartları) ve mod ikonu olarak kullanılan kurum site ikonları **yalnız prototipte** kalabilir. Canlıya taşımadan önce her kurumdan yazılı kullanım izni alınmalı; izin gelmeyen kurumun logosu/ikonu kaldırılır (mod ikonunda çizgisel ikon yedeği hazır: ui(M.ikon)).
- İzin gerekenler: tasks/saglik-kaynaklar.md partner tabloları (16 kurum) + "Mod ikonları" tablosu (6 site ikonu). Hepsi data-yalniz-admin bayraklı.
- Gastro'ya taşımadan önce her kurumla yazılı iş birliği + logo kullanım izni şart; yoksa başlık 'Bu alanda çalışan kurumlar'a döner. (Beyar 2 Kas: başlık şu an "Bizimle iş birliği yapan kurumlar" — hub kartı, mod hero şeridi, bilgilendirme iş birliği bölümü; kaynak: src/saglik/ortak.mjs logoSeridi/kurumKutusu/partnerBolumu.)
