# Sağlık / beslenme kurumları: doğrulama notu ("Olası iş birliği" alanı için)

**Tarih:** 2 Kasım 2026

## Yöntem

- Her kurum için önce web araması yapıldı (WebSearch, standard mode). Ardından aday alan adı doğrudan açıldı (curl ile HTML alındı). Sayfa başlığı (`<title>`), footer'daki telif/iletişim satırı ve gerekirse "Hakkımızda" sayfası okunarak sitenin o kuruma ait olduğu teyit edildi.
- "Doğrulandı": kullanıcı dokümanındaki ad doğru, site açıldı ve kuruma ait.
- "Düzeltildi": kurum var ama resmî adı farklı.
- "Eklendi": dokümanda yoktu, alternatif olarak doğrulandı.
- "Çıkarıldı / doğrulanamadı": bu adla bir kurum ya da resmî site bulunamadı.
- Tanımlar kendi sözlerimle yazıldı ve tarafsız tutuldu. Tıbbi iddia içermez. Kurumların hiçbiri bu prototipi onaylamış ya da desteklemiş değildir; listede ad, kısa tanım, resmî site bağlantısı ve kurumun kendi sitesinden alınmış resmî logosu yer alacak (logo kuralı aşağıda).
- Siteler 2 Kasım 2026'da açıldı. Alan adları zamanla değişebilir. Yayına almadan önce bağlantıları bir kez daha kontrol edin.

## Görünürlük ve etiket kuralı

- Partner bölümü yalnız admin görünür (prototipte görünür; canlıda admin yetkisine bağlanacak). Etiket: Olası iş birliği; onay/destek ifadesi yok.
- Logolar (Beyar kararı, önceki "logo yok" kuralının yerine geçer): kurumların kendi resmî sitelerinden ham hâliyle indirildi; renk, oran veya kırpma değişikliği yapılmadı. Klasör: `varlik/saglik/partner/ham/`. Dosya türleri `file` komutuyla doğrulandı (hepsi gerçek SVG/PNG/JPEG; HTML hata sayfası yok). WebP dönüşümü ve boyutlandırma ayrıca yapılacak.
- Logo notları: Türk Kalp Vakfı'nın tam logosu sitede ikon fontu olarak gömülü olduğundan yalnız amblem (apple-touch-icon) indirildi. Türkiye Diyetisyenler Derneği'nin SVG'si yalnız İngilizce yazılı; Türkçe başlık logosu ayrıca JPG olarak kaydedildi ("57. Yıl" ibareli, düşük çözünürlük). Çocuk Alerji İmmünoloji ve Astım Derneği ve Türk Hipertansiyon ve Böbrek Hastalıkları Derneği logoları düşük çözünürlüklü PNG (447×182 ve 173×173).

---

## Çölyak

| Kurum (resmî ad) | Site | Tanım | Durum | Kaynak | Logo kaynağı (URL) | Logo dosyası |
|---|---|---|---|---|---|---|
| Çölyakla Yaşam Derneği | https://colyak.org.tr | İstanbul merkezli bir hasta derneği. Çölyaklı bireylere ve ailelerine glutensiz yaşam konusunda bilgi ve dayanışma sunar. Avrupa Çölyak Dernekleri Birliği (AOECS) üyesidir. | Doğrulandı (güven: yüksek) | Site başlığı ve footer'da "Çölyakla Yaşam Derneği" ve "AOECS üyesidir" yazıyor: https://colyak.org.tr/hakkimizda/ · Celiac.com dernek listesi: https://www.celiac.com/celiac-disease/turkey-r621 | https://colyak.org.tr/wp-content/uploads/2022/02/colyak-logo.png | colyakla-yasam-dernegi.png |
| Çölyak Vakfı | https://www.colyakvakfi.org.tr | 2023'te kurulmuş bir vakıf. Çölyak farkındalığı, glutensiz gıdaya erişim ve okul ya da yurtlarda glutensiz seçenekler üzerine çalışır. | Eklendi (güven: orta-yüksek) | Site başlığı "Çölyak Vakfı", içerikler 2023-2024 tarihli · DHA haberinde kuruluş tarihi Nisan 2023 ve kurucu başkan Doç. Dr. Elif Bal Beşikçi: https://www.dha.com.tr/saglik-yasam/colyak-vakfi-1inci-yasini-glutensiz-gala-yemegi-ile-kutladi-2428579 · Not: .org.tr sitesindeki menü bağlantıları colyakvakfi.org alan adına gidiyor. O yeni görünümlü sitede yer tutucu gibi duran bir telefon numarası (+90 850 123 45 67) var, bu yüzden bağlantı için .org.tr önerilir. | https://www.colyakvakfi.org.tr/wp-content/uploads/2024/03/CVLogoWName.png | colyak-vakfi.png |
| Çölyak ve Organik Beslenme Derneği (Manisa) | https://colyakdernegi.org.tr | Manisa merkezli yerel bir dernek. Çölyaklı bireyler ve çocuklar için bilgilendirme, dayanışma ve güvenli gıdaya erişim çalışmaları yürütür. | Eklendi (güven: orta, yerel ölçekte) | Site başlığı ve footer'da "Çölyak ve Organik Beslenme Derneği", Şehzadeler/Manisa adresi var · Çölyak izleme raporunda adı geçiyor: https://hjy4a1l8ib.ufs.sh/f/ckxZ1gzkvKRlfGIrYTX0Moy1s3OjhUbwrdq7nTFAEcBYkI2l | https://colyakdernegi.org.tr/_next/static/media/logo.0zhvuefu2esbp.png | colyak-ve-organik-beslenme-dernegi.png |

- "Glutensiz Beslenme Derneği": Bu adla bir kurum bulunamadı, listeden çıkarıldı. Benzer adlı **Glutensiz Hayat Derneği** ve **Türkiye Çölyak Federasyonu** basında geçiyor (https://t24.com.tr/haber/colyak-hastalari-maltepede-bulustu,622094). İkisinin de resmî sitesi doğrulanamadığı için listeye alınmadı. **Ankara Çölyak Derneği** de basında geçiyor, onun da sitesi doğrulanamadı.

## Diyabet

| Kurum (resmî ad) | Site | Tanım | Durum | Kaynak | Logo kaynağı (URL) | Logo dosyası |
|---|---|---|---|---|---|---|
| Türkiye Diyabet Vakfı | https://www.turkdiab.org | 1996'da kurulmuş, kamu yararına çalışan bir vakıf. Diyabet farkındalığı, eğitim kampları ve toplum projeleri yürütür. Uluslararası Diyabet Federasyonu (IDF) üyesidir. | Doğrulandı (güven: yüksek) | Site başlığı "Türkiye Diyabet Vakfı - Ana Sayfa" · IDF üye sayfası: https://idf.org/europe/our-network/our-members/turkiye/turkish-diabetes-foundation/ · https://www.haberturk.com/turkiye-nin-ilk-diyabet-koyu-acildi-2788148 | https://www.turkdiab.org/images/turkiye_diyabet_vakfi_logo_TR.svg | turkiye-diyabet-vakfi.svg |
| Türk Diyabet Cemiyeti | https://www.diyabetcemiyeti.org | 1955'ten beri faaliyette olan, köklü bir sivil toplum kuruluşu. Diyabetli bireylere eğitim ve danışmanlık verir, bir de diyabet dergisi yayımlar. | Düzeltildi (doküman/öneri: "Türkiye Diyabet Cemiyeti", doğru ad "Türk Diyabet Cemiyeti") (güven: yüksek) | Site başlığı "Ana Sayfa \| Türk Diyabet Cemiyeti" (diabetcemiyeti.org adresi bu siteye yönleniyor) · https://www.24saatgazetesi.com/tatli-ve-sekersiz-bir-hayat-icin | https://www.diyabetcemiyeti.org/static/frontend/img/logo.png | turk-diyabet-cemiyeti.png |
| Türkiye Endokrinoloji ve Metabolizma Derneği (TEMD) | https://temd.org.tr | Endokrinoloji uzmanlarının meslek derneği. Diyabet dahil hormon ve metabolizma hastalıkları için kılavuzlar hazırlar. | Doğrulandı (güven: yüksek) | Site başlığı ve footer'da "Bu sitenin tüm hakları Türkiye Endokrinoloji ve Metabolizma Derneği'ne aittir" yazıyor | https://temd.org.tr/Assets/images/logo.png | turkiye-endokrinoloji-ve-metabolizma-dernegi.png |

- "Diyabetle Yaşam Derneği": Bu adla bir kurum ya da site bulunamadı, listeden çıkarıldı.
- Ek seçenekler (doğrulandı ama tabloya alınmadı):
  - **Çocuk Endokrinolojisi ve Diyabet Derneği** (https://cocukendokrindiyabet.org): Çocuk diyabeti için meslek derneği, Okulda Diyabet Programı'nın paydaşlarından.
  - **Diyabet Diyetisyenliği Derneği (DİYED)** (https://diyabetdiyetisyenligi.org): Diyabet alanında çalışan diyetisyenlerin derneği.

## Gıda alerjisi

| Kurum (resmî ad) | Site | Tanım | Durum | Kaynak | Logo kaynağı (URL) | Logo dosyası |
|---|---|---|---|---|---|---|
| Alerji ile Yaşam Derneği | https://www.alerjidernegi.org.tr | Alerjik çocukların aileleri tarafından 2014'te kurulmuş, İstanbul merkezli bir hasta/aile derneği. Besin alerjisi farkındalığı ve günlük yaşam desteği üzerine çalışır. Avrupa Alerji ve Solunum Yolu Hastaları Dernekleri Federasyonu (EFA) üyesidir. | Doğrulandı (güven: yüksek) | Site başlığı "Alerji ile Yaşam Derneği – alerjidernegi.org.tr", Kartal/İstanbul adresi var · EFA üye listesi bu alan adını veriyor: https://www.efanet.org/about-efa/organisation/members · https://efanet.org/annual-report/2021/governance/membership-and-working-groups | https://www.alerjidernegi.org.tr/wp-content/uploads/2023/03/aydlogo.png | alerji-ile-yasam-dernegi.png |
| Türkiye Ulusal Alerji ve Klinik İmmünoloji Derneği (AID) | https://www.aid.org.tr | 1989'da kurulmuş, alerji ve klinik immünoloji uzmanlarının ulusal meslek derneği. Hekimler ve hastalar için bilgilendirme içerikleri hazırlar. | Doğrulandı (güven: yüksek) | Site başlığı "Ana Sayfa \| Türkiye Ulusal Alerji ve Klinik İmmünoloji Derneği" · Derneğin kendi tarihçesi: https://aid.org.tr/wp-content/uploads/2025/01/Kurulusundan-Bugune-TUAKID-1989-2017-Tarihce.pdf | https://www.aid.org.tr/wp-content/uploads/2021/08/AID-logo_kare.png | turkiye-ulusal-alerji-ve-klinik-immunoloji-dernegi.png |
| Besin Alerjisi Derneği | https://besinalerjisi.org.tr | 2019'da kurulmuş, İstanbul merkezli bir dernek. Besin alerjileri konusunda aileleri bilgilendirmeye odaklanır. | Doğrulandı, uyarıyla (güven: orta) | Site başlığı "Türkiye'deki Ailelerin Besin Alerjisi Derneği" ve 2026 tarihli genel kurul duyurusu var · **Uyarı:** Sitenin footer'ında "Çocuk Alerji Uzmanı" ifadesi geçiyor ve /hakkimizda/ sayfası bir hekimin özel muayenehane sitesine (drahmetakcay.com) yönleniyor. Ticari bağlantı ihtimali nedeniyle dikkatli kullanılmalı. | https://besinalerjisi.org.tr/wp-content/uploads/2022/01/besin-alerjisi-dernegi-logo-1.png | besin-alerjisi-dernegi.png |

## Süt / laktoz / İSPA (inek sütü proteini alerjisi)

| Kurum (resmî ad) | Site | Tanım | Durum | Kaynak | Logo kaynağı (URL) | Logo dosyası |
|---|---|---|---|---|---|---|
| Çocuk Alerji İmmünoloji ve Astım Derneği (CAIAD) | https://caiad.org.tr | Çocuk alerji ve immünoloji alanında çalışan hekimlerin derneği. İnek sütü alerjisi de bu alanın konuları arasında. | Eklendi (güven: orta) | Ana sayfada "Çocuk Alerji İmmünoloji ve Astım Derneği olarak 26. yılımızı kutluyoruz", Fatih/İstanbul adresi var · Not: iletişim adresi gmail uzantılı · Hekim üyeliklerinde adı geçiyor (Marmara Ünv. kurumsal tanıtım belgesi) | https://caiad.org.tr/wp-content/uploads/2024/10/tr-lacivert.png | cocuk-alerji-immunoloji-ve-astim-dernegi.png |
| Alerji ile Yaşam Derneği | https://www.alerjidernegi.org.tr | Süt alerjisi de dahil olmak üzere besin alerjisi olan çocukların ailelerine yönelik bir hasta/aile derneği. | Doğrulandı (güven: yüksek) | Alerji tablosundaki kaynaklar | https://www.alerjidernegi.org.tr/wp-content/uploads/2023/03/aydlogo.png | alerji-ile-yasam-dernegi.png |
| Türk Gastroenteroloji Derneği (TGD) | https://tgd.org.tr | Sindirim sistemi hastalıkları alanında çalışan uzmanların köklü meslek derneği. Laktoz intoleransı da ilgi alanındaki konular arasında. | Doğrulandı (güven: yüksek) | Hassas bağırsak tablosuna bakın | https://tgd.org.tr/wp-content/uploads/2022/05/main-logo.svg | turk-gastroenteroloji-dernegi.svg |

- Bu modda ayrı bir hasta derneği bulunamadı.
- **Türk Çocuk Gastroenteroloji, Hepatoloji ve Beslenme Derneği** gerçekte var: üniversite kayıtlarında kongre ve kurs düzenleyicisi olarak geçiyor (https://avesis.gazi.edu.tr/organizedevent/details/01670dc8-7f45-4e6f-b1dd-22d8113db6c8/turk-cocuk-gastroenteroloji-hepatoloji-ve-beslenme-dernegi-cocuklarda-beslenme-kursu). Ancak resmî web sitesi doğrulanamadığı için listeye alınmadı.

## Hassas bağırsak / IBS

| Kurum (resmî ad) | Site | Tanım | Durum | Kaynak | Logo kaynağı (URL) | Logo dosyası |
|---|---|---|---|---|---|---|
| Türk Gastroenteroloji Derneği (TGD) | https://tgd.org.tr | 1959'da kurulmuş, gastroenteroloji uzmanlarının ulusal meslek derneği. Ulusal kongreler ve kamuoyu bilgilendirmesi yapar. | Doğrulandı (güven: yüksek) | Site başlığı "Türk Gastroenteroloji Derneği / TGD", sitede kuruluş bilgisi var · IBS açıklaması yapılan haber: https://www.cumhuriyet.com.tr/saglik/icinizde-bir-sikinti-var-gibi-hissediyorsaniz-dikkat-irritabl-bagirsak-sendromu-riski-2074071 | https://tgd.org.tr/wp-content/uploads/2022/05/main-logo.svg | turk-gastroenteroloji-dernegi.svg |
| Türk Gastroenteroloji Vakfı (TGV) | https://www.tgv.org.tr | Gastroenteroloji alanında bilimsel dergiler yayımlayan ve eğitim etkinlikleri düzenleyen bir vakıf. Ana sayfasında "İBS Farkındalık Ayı" duyurusu yer alıyor. | Eklendi (güven: yüksek) | Site başlığı "Türk Gastroenteroloji Vakfı \| TGV" | https://www.tgv.org.tr/images/tgv-logo.png | turk-gastroenteroloji-vakfi.png |
| Türkiye Diyetisyenler Derneği (TDD) | https://www.tdd.org.tr | Diyetisyenlerin Ankara merkezli meslek derneği. Beslenme ve Diyet Dergisi'ni yayımlar. Diyet uyarlamaları için genel beslenme otoritesi olarak gösterilebilir. | Eklendi (güven: yüksek) | Site başlığı ve footer'da "Türkiye Diyetisyenler Derneği", Altındağ/Ankara adresi var | https://www.tdd.org.tr/Portals/402/tema/logo/tdd-logo-text-4.svg | turkiye-diyetisyenler-dernegi.svg (vektör, yalnız İngilizce yazılı) · alternatif: turkiye-diyetisyenler-dernegi.jpg (Türkçe başlık logosu, 549×92, "57. Yıl" ibareli; kaynak: https://www.tdd.org.tr/Portals/402/tema/logo/WhatsApp%20Image%202026-04-08%20at%2010.40.40.jpg) |

- "Türk Nörogastroenteroloji Derneği" ya da "Nörogastroenteroloji ve Motilite Derneği": Türkiye'de bu adla resmî siteli bir kurum doğrulanamadı, listeden çıkarıldı.

## Kalp / tansiyon

| Kurum (resmî ad) | Site | Tanım | Durum | Kaynak | Logo kaynağı (URL) | Logo dosyası |
|---|---|---|---|---|---|---|
| Türk Kardiyoloji Derneği (TKD) | https://tkd.org.tr | Kardiyologların ulusal meslek derneği. Mesleki eğitim, kılavuzlar ve toplum farkındalığı çalışmaları yürütür. | Doğrulandı (güven: yüksek) | Site başlığı "Türk Kardiyoloji Derneği", footer'da "© 2026 Türk Kardiyoloji Derneği" yazıyor | https://tkd.org.tr/assets/img/tkd-logo-tr.svg | turk-kardiyoloji-dernegi.svg |
| Türk Kalp Vakfı | https://tkv.org.tr | 1975'te kurulmuş bir vakıf. Kalp sağlığı farkındalığı çalışmaları yapar, Dünya Kalp Federasyonu ve Avrupa Kalp Birliği üyesidir. | Doğrulandı, notla (güven: yüksek) | Site başlığı "Türk Kalp Vakfı", ana sayfada kuruluş yılı ve üyelik bilgisi var · Not: Vakfın randevulu bir tıp merkezi de var (ücretli sağlık hizmeti). Bağlantı verirken bunu dikkate alın. | https://tkv.org.tr/apple-touch-icon.png | turk-kalp-vakfi-ikon.png (yalnız amblem, 180×180; tam logo sitede ikon fontu olarak gömülü, dosya olarak yok) |
| Türk Hipertansiyon ve Böbrek Hastalıkları Derneği | https://turkhipertansiyon.org | Yüksek tansiyon ve böbrek hastalıkları alanında çalışan bir bilimsel dernek. Uluslararası Hipertansiyon Cemiyeti ve Dünya Hipertansiyon Ligi üyesidir. | Doğrulandı (güven: yüksek) | Site başlığı ve ana sayfa footer'ında dernek adı ve üyelikler yazıyor | https://turkhipertansiyon.org/uploads/project_image/6555c3b928c003.59220489-1700119481.png | turk-hipertansiyon-ve-bobrek-hastaliklari-dernegi.png |

- Genel beslenme otoritesi olarak Türkiye Diyetisyenler Derneği (https://www.tdd.org.tr) bu modda da kullanılabilir.

---

## Düzeltilen / çıkarılan adlar

- **Glutensiz Beslenme Derneği:** YOK, bu adla kurum bulunamadı ve çıkarıldı. Yerine Çölyak Vakfı ile Çölyak ve Organik Beslenme Derneği eklendi. Benzer adlı Glutensiz Hayat Derneği ve Türkiye Çölyak Federasyonu var, ama siteleri doğrulanamadı.
- **"Çölyak Derneği / Türkiye Çölyak Derneği":** Ulusal ölçekte bu adla resmî siteli bir kurum doğrulanamadı. Basında "Ankara Çölyak Derneği" geçiyor, sitesi doğrulanamadı.
- **Diyabetle Yaşam Derneği:** YOK, doğrulanamadı ve çıkarıldı.
- **"Türkiye Diyabet Cemiyeti":** Doğru adı **Türk Diyabet Cemiyeti**.
- **Türk Nörogastroenteroloji Derneği:** Doğrulanamadı, çıkarıldı. Yerine Türk Gastroenteroloji Vakfı ve Türkiye Diyetisyenler Derneği eklendi.
- **Türk Çocuk Gastroenteroloji, Hepatoloji ve Beslenme Derneği:** Kurum var, ancak resmî sitesi doğrulanamadığı için listeye alınmadı.
- **Türk Kalp Vakfı:** VAR, adı doğru (https://tkv.org.tr).
- **Besin Alerjisi Derneği:** VAR (besinalerjisi.org.tr), ancak özel muayenehane bağlantısı nedeniyle güveni orta.

## Genel bilgi kaynakları (modların sade bilgi metinleri için)

| Kaynak | URL | Hangi mod |
|---|---|---|
| T.C. Sağlık Bakanlığı Halk Sağlığı Genel Müdürlüğü | https://hsgm.saglik.gov.tr | Tümü |
| Türkiye Beslenme Rehberi (TÜBER) 2022, PDF (Sağlık Bakanlığı HSGM) | https://hsgm.saglik.gov.tr/media/attachments/2025/05/12/turkiye-beslenme-rehberi-2022.pdf | Tümü |
| Türkiye Diyabet Programı, PDF (Sağlık Bakanlığı) | https://hsgm.saglik.gov.tr/depo/birimler/saglikli-beslenme-ve-hareketli-hayat-db/Dokumanlar/Programlar/Turkiye-Diyabet-Programi.pdf | Diyabet |
| WHO: Healthy diet (bilgi notu) | https://www.who.int/news-room/fact-sheets/detail/healthy-diet | Tümü, kalp |
| WHO: Hypertension (bilgi notu) | https://www.who.int/news-room/fact-sheets/detail/hypertension | Kalp |
| NHLBI (NIH): DASH Eating Plan | https://www.nhlbi.nih.gov/health/dash-eating-plan | Kalp / tansiyon |
| Monash University: Low FODMAP Diet | https://www.monashfodmap.com | IBS |
| NIDDK (NIH): Lactose Intolerance | https://www.niddk.nih.gov/health-information/digestive-diseases/lactose-intolerance | Laktoz |
| AOECS: Association of European Coeliac Societies | https://www.aoecs.org | Çölyak |
| International Diabetes Federation (IDF) | https://idf.org | Diyabet |
| EAACI: European Academy of Allergy and Clinical Immunology | https://eaaci.org | Alerji, İSPA |

Not: Bu kaynakların tümü 2 Kasım 2026'da açıldı ve doğru kuruma ait olduğu sayfa başlığından teyit edildi. Diyabet Programı PDF'i yalnızca arama sonucundan doğrulandı, açılmadı. WHO hipertansiyon sayfası HTTP 200 döndü.

---

## Makine okunur liste

```json
{
  "colyak": [
    {
      "ad": "Çölyakla Yaşam Derneği",
      "site": "https://colyak.org.tr",
      "tanim": "İstanbul merkezli bir hasta derneği. Çölyaklı bireylere ve ailelerine glutensiz yaşam konusunda bilgi ve dayanışma sunar; AOECS üyesidir.",
      "durum": "dogrulandi",
      "logo": "colyakla-yasam-dernegi.png",
      "logo_kaynak": "https://colyak.org.tr/wp-content/uploads/2022/02/colyak-logo.png"
    },
    {
      "ad": "Çölyak Vakfı",
      "site": "https://www.colyakvakfi.org.tr",
      "tanim": "2023'te kurulmuş bir vakıf. Çölyak farkındalığı ve glutensiz gıdaya erişim üzerine çalışır.",
      "durum": "eklendi",
      "logo": "colyak-vakfi.png",
      "logo_kaynak": "https://www.colyakvakfi.org.tr/wp-content/uploads/2024/03/CVLogoWName.png"
    },
    {
      "ad": "Çölyak ve Organik Beslenme Derneği",
      "site": "https://colyakdernegi.org.tr",
      "tanim": "Manisa merkezli yerel bir dernek. Çölyaklı bireyler ve çocuklar için bilgilendirme ve dayanışma çalışmaları yürütür.",
      "durum": "eklendi",
      "logo": "colyak-ve-organik-beslenme-dernegi.png",
      "logo_kaynak": "https://colyakdernegi.org.tr/_next/static/media/logo.0zhvuefu2esbp.png"
    }
  ],
  "diyabet": [
    {
      "ad": "Türkiye Diyabet Vakfı",
      "site": "https://www.turkdiab.org",
      "tanim": "1996'da kurulmuş, kamu yararına çalışan bir vakıf. Diyabet farkındalığı ve eğitim çalışmaları yürütür; IDF üyesidir.",
      "durum": "dogrulandi",
      "logo": "turkiye-diyabet-vakfi.svg",
      "logo_kaynak": "https://www.turkdiab.org/images/turkiye_diyabet_vakfi_logo_TR.svg"
    },
    {
      "ad": "Türk Diyabet Cemiyeti",
      "site": "https://www.diyabetcemiyeti.org",
      "tanim": "1955'ten beri faaliyette olan bir sivil toplum kuruluşu. Diyabetli bireylere eğitim ve danışmanlık verir.",
      "durum": "duzeltildi",
      "logo": "turk-diyabet-cemiyeti.png",
      "logo_kaynak": "https://www.diyabetcemiyeti.org/static/frontend/img/logo.png"
    },
    {
      "ad": "Türkiye Endokrinoloji ve Metabolizma Derneği",
      "site": "https://temd.org.tr",
      "tanim": "Endokrinoloji uzmanlarının meslek derneği. Diyabet dahil metabolizma hastalıkları için kılavuzlar hazırlar.",
      "durum": "dogrulandi",
      "logo": "turkiye-endokrinoloji-ve-metabolizma-dernegi.png",
      "logo_kaynak": "https://temd.org.tr/Assets/images/logo.png"
    }
  ],
  "alerji": [
    {
      "ad": "Alerji ile Yaşam Derneği",
      "site": "https://www.alerjidernegi.org.tr",
      "tanim": "Alerjik çocukların aileleri tarafından kurulmuş bir hasta/aile derneği. Besin alerjisi farkındalığı üzerine çalışır; EFA üyesidir.",
      "durum": "dogrulandi",
      "logo": "alerji-ile-yasam-dernegi.png",
      "logo_kaynak": "https://www.alerjidernegi.org.tr/wp-content/uploads/2023/03/aydlogo.png"
    },
    {
      "ad": "Türkiye Ulusal Alerji ve Klinik İmmünoloji Derneği",
      "site": "https://www.aid.org.tr",
      "tanim": "1989'da kurulmuş, alerji ve klinik immünoloji uzmanlarının ulusal meslek derneği.",
      "durum": "dogrulandi",
      "logo": "turkiye-ulusal-alerji-ve-klinik-immunoloji-dernegi.png",
      "logo_kaynak": "https://www.aid.org.tr/wp-content/uploads/2021/08/AID-logo_kare.png"
    },
    {
      "ad": "Besin Alerjisi Derneği",
      "site": "https://besinalerjisi.org.tr",
      "tanim": "2019'da kurulmuş, besin alerjileri konusunda aileleri bilgilendirmeye odaklanan bir dernek.",
      "durum": "dogrulandi_uyari",
      "logo": "besin-alerjisi-dernegi.png",
      "logo_kaynak": "https://besinalerjisi.org.tr/wp-content/uploads/2022/01/besin-alerjisi-dernegi-logo-1.png"
    }
  ],
  "laktoz": [
    {
      "ad": "Çocuk Alerji İmmünoloji ve Astım Derneği",
      "site": "https://caiad.org.tr",
      "tanim": "Çocuk alerji ve immünoloji alanında çalışan hekimlerin derneği; inek sütü alerjisi bu alanın konularındandır.",
      "durum": "eklendi",
      "logo": "cocuk-alerji-immunoloji-ve-astim-dernegi.png",
      "logo_kaynak": "https://caiad.org.tr/wp-content/uploads/2024/10/tr-lacivert.png"
    },
    {
      "ad": "Alerji ile Yaşam Derneği",
      "site": "https://www.alerjidernegi.org.tr",
      "tanim": "Süt alerjisi dahil besin alerjisi olan çocukların ailelerine yönelik bir hasta/aile derneği.",
      "durum": "dogrulandi",
      "logo": "alerji-ile-yasam-dernegi.png",
      "logo_kaynak": "https://www.alerjidernegi.org.tr/wp-content/uploads/2023/03/aydlogo.png"
    },
    {
      "ad": "Türk Gastroenteroloji Derneği",
      "site": "https://tgd.org.tr",
      "tanim": "Sindirim sistemi hastalıkları alanındaki uzmanların meslek derneği.",
      "durum": "dogrulandi",
      "logo": "turk-gastroenteroloji-dernegi.svg",
      "logo_kaynak": "https://tgd.org.tr/wp-content/uploads/2022/05/main-logo.svg"
    }
  ],
  "ibs": [
    {
      "ad": "Türk Gastroenteroloji Derneği",
      "site": "https://tgd.org.tr",
      "tanim": "1959'da kurulmuş, gastroenteroloji uzmanlarının ulusal meslek derneği.",
      "durum": "dogrulandi",
      "logo": "turk-gastroenteroloji-dernegi.svg",
      "logo_kaynak": "https://tgd.org.tr/wp-content/uploads/2022/05/main-logo.svg"
    },
    {
      "ad": "Türk Gastroenteroloji Vakfı",
      "site": "https://www.tgv.org.tr",
      "tanim": "Gastroenteroloji alanında bilimsel yayın ve eğitim etkinlikleri yürüten bir vakıf.",
      "durum": "eklendi",
      "logo": "turk-gastroenteroloji-vakfi.png",
      "logo_kaynak": "https://www.tgv.org.tr/images/tgv-logo.png"
    },
    {
      "ad": "Türkiye Diyetisyenler Derneği",
      "site": "https://www.tdd.org.tr",
      "tanim": "Diyetisyenlerin Ankara merkezli meslek derneği; Beslenme ve Diyet Dergisi'ni yayımlar.",
      "durum": "eklendi",
      "logo": "turkiye-diyetisyenler-dernegi.jpg",
      "logo_kaynak": "https://www.tdd.org.tr/Portals/402/tema/logo/tdd-logo-text-4.svg",
      "logo_alternatif": "turkiye-diyetisyenler-dernegi.jpg",
      "logo_alternatif_kaynak": "https://www.tdd.org.tr/Portals/402/tema/logo/WhatsApp%20Image%202026-04-08%20at%2010.40.40.jpg",
      "logo_not": "SVG yalnız İngilizce yazılı (Turkish Dietetic Association); JPG Türkçe başlık logosu, 549x92, \"57. Yıl\" ibareli."
    }
  ],
  "kalp": [
    {
      "ad": "Türk Kardiyoloji Derneği",
      "site": "https://tkd.org.tr",
      "tanim": "Kardiyologların ulusal meslek derneği; eğitim ve toplum farkındalığı çalışmaları yürütür.",
      "durum": "dogrulandi",
      "logo": "turk-kardiyoloji-dernegi.svg",
      "logo_kaynak": "https://tkd.org.tr/assets/img/tkd-logo-tr.svg"
    },
    {
      "ad": "Türk Kalp Vakfı",
      "site": "https://tkv.org.tr",
      "tanim": "1975'te kurulmuş, kalp sağlığı farkındalığı üzerine çalışan bir vakıf; Dünya Kalp Federasyonu üyesidir.",
      "durum": "dogrulandi",
      "logo": "turk-kalp-vakfi-ikon.png",
      "logo_kaynak": "https://tkv.org.tr/apple-touch-icon.png",
      "logo_not": "Yalnız amblem (apple-touch-icon, 180x180). Tam logo sitede ikon fontu olarak gömülü; ayrı dosya yok."
    },
    {
      "ad": "Türk Hipertansiyon ve Böbrek Hastalıkları Derneği",
      "site": "https://turkhipertansiyon.org",
      "tanim": "Yüksek tansiyon ve böbrek hastalıkları alanında çalışan bilimsel bir dernek.",
      "durum": "dogrulandi",
      "logo": "turk-hipertansiyon-ve-bobrek-hastaliklari-dernegi.png",
      "logo_kaynak": "https://turkhipertansiyon.org/uploads/project_image/6555c3b928c003.59220489-1700119481.png"
    }
  ]
}
```

- Lead notu (2 Kas): Türkiye Diyetisyenler Derneği kartında Türkçe başlık logosu (JPG → webp, 549×92, "57. Yıl" ibaresi sitedeki hâliyle) kullanıldı; İngilizce SVG yalnız ham klasöründe.

## Mod ikonları (Beyar 2 Kas, 2. EK — lead)
Menü sekmesi, "Modunu seç" listesi, mod kartları, chip'ler ve Dolap mod barında mod adının solunda, modun öncü kurumunun **kendi sitesindeki resmî site ikonu** (değiştirilmeden; yalnız 64px webp). Ham dosyalar: `varlik/saglik/partner/ikon/ham/`. Hepsi `data-yalniz-admin` bayraklı (canlıda admin değilse çizgisel mod ikonu).
| Mod | Kurum | Kaynak |
|---|---|---|
| Glutensiz | Çölyakla Yaşam Derneği | https://colyak.org.tr/wp-content/uploads/2022/02/cropped-favicon-180x180.png |
| Kan Şekeri | Türkiye Diyabet Vakfı | https://www.turkdiab.org/images/icon.png (63×63) |
| Alerjen | Türkiye Ulusal Alerji ve Klinik İmmünoloji Derneği (AID) | kare resmî logo (partner tablosundaki dosya, 952×952) |
| Sütsüz | Alerji ile Yaşam Derneği | https://www.alerjidernegi.org.tr/wp-content/uploads/2023/04/cropped-Favicon-180x180.png |
| Düşük FODMAP | Türk Gastroenteroloji Derneği | https://tgd.org.tr/wp-content/uploads/2022/05/favicon.ico (48×48; Türk Gastroenteroloji Vakfı'nın site ikonu yok) |
| Kalp Dostu | Türk Kalp Vakfı | https://tkv.org.tr/apple-touch-icon.png |
