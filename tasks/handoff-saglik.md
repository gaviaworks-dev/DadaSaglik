# Dada Gastro Sağlık — prototip (handoff)

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
- ☑ 1 Araştırma (Kids repo, seçki kalıbı, yerel sqlite verisi) · ◐ partner ajanı `partner-arastirma` (tasks/saglik-kaynaklar.md + logolar varlik/saglik/partner/ham/) · ☑ içerik ajanı `icerik` (veri/icerik.json)
- ☑ 2 Plan tasks/saglik-plan.md
- ☑ 3 Kur: build.mjs, src/saglik/{malzeme,modlar,ortak}.mjs, sayfalar {hub,mod,dolap,tarif,bilgi}, saglik.css + css/mod.css, saglik.js + js/{katalog,dolap,detay}.js · sunucu 8790
- ☑ 4 Kapılar YEREL YEŞİL: mod 14/14 · davranış · varlık 48/48 · radius 28/28 · boşluk 40/40 · denge 44/44 · partner logoları (17 webp/svg) · eksik şeffaf ikon 3 (soya sosu, krema, ayran → mod ikonu yer tutucu; kredi harcanmadı, taban 560)
- ☑ 5 9 commit (db1bfca…b66def9) · repo gaviaworks-dev/DadaSaglik (public) push · Pages açıldı (main /) · Pages derlendi (b66def9)
- ☑ 6 CANLI kapılar yeşil: mod 14/14 · davranış · varlık 48/48 · radius 28/28 · denge 44/44 · boşluk 40/40 · görüntüler rapor/tmp/teslim/ (pafta-1440.png, pafta-390.png) · ☐ 7 rapor (6 mod 1440+390 görüntü, partner tablosu, mod başına tarif sayısı) → DUR
