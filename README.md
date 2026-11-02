# Dada Gastro Sağlık — prototip

Dada Gastro'nun içinde yaşayan **Sağlık** alanı ve altı **yaşam modu**nun statik prototipi:
Çölyak ve Glutensiz · Diyabet ve Kan Şekeri · Majör Gıda Alerjileri · Süt ve Laktoz (İSPA dahil) · Hassas Bağırsak (IBS/SIBO, düşük FODMAP) · Kalp ve Tansiyon (DASH).
Yayın: GitHub Pages (`noindex`). Bilgiler genel bilgilendirme amaçlıdır; tanı ve tedavi için hekime danışılmalıdır.

## Sayfalar
| Sayfa | Ne |
|---|---|
| `index.html` | Gastro ana sayfası (yerel donör kopyası) + Sağlık giriş bandı |
| `tarifler.html` | Gastro tarif listesi + "Sağlık modları" chip'i; her sayfada mega menüde Sağlık şeridi |
| `saglik.html` | Hub: modunu seç, altı mod kartı, nasıl çalışır, öne çıkan tarifler, bilgi kartları |
| `saglik-colyak.html` … `saglik-kalp.html` | Mod sayfaları: kimler için, gizlenir/önerilir, riskli malzemeler, Akıllı İkame, filtreli tarif ızgarası, bilgi, iş birliği (yalnız admin), SSS |
| `saglik-dolap.html` | Dolapta Ne Var: seçili moda göre riskli malzemeler dışlanır |
| `saglik-tarif.html?t=<slug>&mod=<kod>` | Tarif detayı: uyum rozeti, ikameyle uyarlanmış malzeme listesi |
| `saglik-bilgi.html` | Mod başına üç kısa yazı |

## Nasıl çalışır
Kabuk ve veri **yerel kopyadan** gelir; canlı siteye istek atılmaz.
```bash
npm i                                  # yalnız playwright (kapılar için)
python3 -I araclar/veri-hazirla.py     # gastro-mysql database.sqlite (salt okuma) → veri/gastro-tarifler.json
node araclar/build.mjs                 # src/donor + src/saglik + veri → kökte statik HTML (+ görseller yerel kopyadan webp)
node araclar/sunucu.mjs                # http://localhost:8790/DadaSaglik/
node araclar/mod-kapisi.mjs            # yasaklı malzemeli tarif 0 + alerjen süzgeci tüm listelerde
node araclar/davranis.mjs              # sticky, SSS, alerjen, dolap, detay, partner bayrağı, metin taramaları
node araclar/varlik-kapisi.mjs · radius-kapisi.mjs · bosluk-kapisi.mjs · denge-kapisi.mjs
```
Eşleşme kuralı: `src/saglik/malzeme.mjs` (528 malzeme adı → alerjen/FODMAP/şeker/Gİ/sodyum/doymuş yağ/paketli bayrakları; sınıflanamayan ad → tarif gösterilmez) + `src/saglik/modlar.mjs` (mod başına yasak bayraklar, Akıllı İkame, ek koşullar). Plan ve kararlar: `tasks/saglik-plan.md`. Kurum doğrulaması: `tasks/saglik-kaynaklar.md`.

## Kaynaklar ve haklar
- Arayüz kabuğu, tarifler ve tarif fotoğrafları: **Dada Gastro** (yerel kopya). Şeffaf malzeme ikonları: Dada Gastro Kids prototipi.
- Kurum logoları kurumların kendi resmî sitelerinden, değiştirilmeden alınmıştır; iş birliği alanı **yalnız yönetici görünür** olarak işaretlidir ve "Olası iş birliği"dir — kurumların onayı ya da desteği anlamına gelmez.
- Gilroy yazı tipi Gastro'nun kendi varlığı olarak taşınmıştır.
