# Yerel Gastro verisinden (gastro-mysql/database/database.sqlite, SALT OKUMA mode=ro) tarif kaynağını çıkarır.
# Canlı siteye istek atılmaz. Görseller gastro-mysql/public/varliklar/media yerel kopyasından gelir (build sırasında
# yalnız eşleşen tariflerinki varlik/saglik/tarif/ altına kopyalanır — araclar/build.mjs).
#
# Kullanım: python3 -I araclar/veri-hazirla.py [GASTRO_KOK]
#   GASTRO_KOK varsayılan: ~/Developer/Revenge Projects/DadaMentor/gastro-mysql
# Çıktı: veri/gastro-tarifler.json
import json, os, sqlite3, sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GASTRO = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Developer/Revenge Projects/DadaMentor/gastro-mysql')
DB = os.path.join(GASTRO, 'database', 'database.sqlite')
c = sqlite3.connect(f'file:{DB}?mode=ro', uri=True)
c.row_factory = sqlite3.Row

eksen = {}
for r in c.execute('''select ted.tarif_id, e.kod, ed.slug, ed.ad from tarif_eksen_degerleri ted
                      join eksen_degerleri ed on ed.id = ted.eksen_degeri_id join eksenler e on e.id = ed.eksen_id'''):
    eksen.setdefault(r['tarif_id'], {}).setdefault(r['kod'], []).append(r['slug'])
ad_ = {r['id']: r['ad'] for r in c.execute('select id, ad from eksen_degerleri')}
kat_ad = {r['slug']: r['ad'] for r in c.execute("select ed.slug, ed.ad from eksen_degerleri ed join eksenler e on e.id = ed.eksen_id where e.kod = 'kategori'")}

malz = {}
# H31: Gastro ölçü balonunun gram satırı (SunumHaritasi::olcuNotu) — olcu_donusumleri: malzeme id → ölçü slug → gram
olcu_gram = {(r[0], r[1]): r[2] for r in c.execute('select d.malzeme_id, b.slug, d.gram_karsiligi from olcu_donusumleri d join olcu_birimleri b on b.id = d.olcu_birimi_id')}
for r in c.execute('''select tm.tarif_id, tm.grup_basligi, tm.sira, tm.miktar, coalesce(ob.kisa_ad, ob.ad, tm.olcu_birimi_slug) birim,
                      m.ad mad, m.slug mslug, tm.serbest_ad, tm.aciklama, tm.malzeme_id, tm.olcu_birimi_slug
                      from tarif_malzemeleri tm left join malzemeler m on m.id = tm.malzeme_id
                      left join olcu_birimleri ob on ob.id = tm.olcu_birimi_id order by tm.tarif_id, tm.sira'''):
    malz.setdefault(r['tarif_id'], []).append({
        'grup': r['grup_basligi'] or None, 'miktar': r['miktar'], 'birim': r['birim'] or '',
        'ad': (r['mad'] or r['serbest_ad'] or '').strip(), 'aciklama': (r['aciklama'] or '').strip(),
        'malzeme_id': r['malzeme_id'], 'gram': olcu_gram.get((r['malzeme_id'], r['olcu_birimi_slug']))})

adim = {}
for r in c.execute('select tarif_id, sira, baslik, metin, sure_dk from tarif_adimlari where coalesce(pasif_mi,0)=0 order by tarif_id, sira'):
    adim.setdefault(r['tarif_id'], []).append({'baslik': r['baslik'] or '', 'metin': r['metin'] or '', 'sure_dk': r['sure_dk'] or None})

# H20 detay paritesi (Gastro TarifDetayServisi kuralları; yalnız SAYIM — kişi/hesap kimliği dışarı çıkmaz):
# etiketler (tarif_etiketleri → taksonomi_terimleri, sira), gerçek puan/değerlendirme (`degerlendirmeler` satırlarından —
# tarifler.ortalama_puan/degerlendirme_sayisi/yorum_sayisi Gastro'da "SAHTE SAYAÇ" diye işaretli donmuş tohum sütunları),
# yayındaki üst yorum sayısı, "Ben de Yaptım" (uye_denemeleri) ve "Eline Sağlık" (tarif_begenileri) sayaçları, şef sayaçları.
etiket = {}
for r in c.execute('''select te.tarif_id, tt.terim from tarif_etiketleri te join taksonomi_terimleri tt on tt.id = te.terim_id
                      where coalesce(trim(tt.terim), '') != '' order by te.tarif_id, te.sira'''):
    etiket.setdefault(r['tarif_id'], []).append(r['terim'])
yorumcu = {}  # tarif → yayındaki yorumu olan hesaplar (yalnız yorumsuz-puan sayımı için; çıktıya girmez)
yorum_say = {}
for r in c.execute("select hedef_id, hesap_id, ust_yorum_id from yorumlar where hedef_tur = 'tarif' and durum = 'yayin'"):
    yorumcu.setdefault(r['hedef_id'], set()).add(r['hesap_id'])
    if r['ust_yorum_id'] is None: yorum_say[r['hedef_id']] = yorum_say.get(r['hedef_id'], 0) + 1
puan = {}
for r in c.execute('select tarif_id, hesap_id, puan from degerlendirmeler'):
    p = puan.setdefault(r['tarif_id'], {'n': 0, 'top': 0, 'dagilim': {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}, 'yorumsuz': 0})
    p['n'] += 1; p['top'] += r['puan'] or 0
    if r['puan'] in p['dagilim']: p['dagilim'][r['puan']] += 1
    if r['hesap_id'] not in yorumcu.get(r['tarif_id'], set()): p['yorumsuz'] += 1
deneme = {r[0]: r[1] for r in c.execute('select tarif_id, count(*) from uye_denemeleri group by tarif_id')}
alkis = {r[0]: r[1] for r in c.execute('select tarif_id, count(*) from tarif_begenileri group by tarif_id')}
sef_tarif = {r[0]: r[1] for r in c.execute("select sef_id, count(*) from tarifler where durum = 'yayinda' and deleted_at is null group by sef_id")}
takipci = {r[0]: r[1] for r in c.execute('select takip_edilen_id, count(*) from takipler group by takip_edilen_id')}

besin = {}
for r in c.execute('select * from tarif_besin_degerleri'):
    besin[r['tarif_id']] = {k: r[k] for k in ['kalori', 'protein_g', 'karbonhidrat_g', 'yag_g', 'lif_g', 'seker_g', 'sodyum_mg', 'doymus_yag_g', 'hesaplanabildi']}

# Gastro kart/detay paritesi (Beyar 2 Kas): şef görünen adı + unvanı, görüntülenme, bütçe, hatırlatma, tarihler (e-posta vb. ALINMAZ)
sef = {r['id']: {'ad': ' '.join(x for x in [r['ad'], r['soyad']] if x).strip(), 'unvan': r['unvan'], 'kadi': r['kullanici_adi'], 'uye': r['uye_oldu_at'], 'hesap': r['hesap_id']}
       for r in c.execute('select u.id, u.hesap_id, u.kullanici_adi, u.unvan, u.uye_oldu_at, k.ad, k.soyad from uye_profilleri u left join kimlik_hesaplar k on k.id = u.hesap_id')}
BUTCE = {'Ekonomik': 1, 'Orta Bütçe': 2, 'Premium': 3}
cikti = []
for t in c.execute("select * from tarifler where durum = 'yayinda' and deleted_at is null and kapak_url is not null order by id"):
    e = eksen.get(t['id'], {})
    cikti.append({
        'id': t['id'], 'slug': t['slug'], 'baslik': t['baslik'], 'alt_baslik': t['alt_baslik'], 'ozet': t['ozet'],
        'kapak': t['kapak_url'], 'sef': t['sef_kullanici_adi'],
        'porsiyon': t['porsiyon_sayisi'], 'porsiyon_birimi': t['porsiyon_birimi'],
        'hazirlik_dk': t['hazirlik_dk'], 'pisirme_dk': t['pisirme_dk'],
        'zorluk': ad_.get(t['zorluk_id']), 'mutfak': ad_.get(t['mutfak_id']),
        'kategori': e.get('kategori', []), 'beslenme': e.get('beslenme', []), 'ogun': e.get('ogun', []),
        'malzemeler': malz.get(t['id'], []), 'adimlar': adim.get(t['id'], []), 'besin': besin.get(t['id']),
        'puan': t['ortalama_puan'], 'degerlendirme': t['degerlendirme_sayisi'],
        'sef_ad': (sef.get(t['sef_id']) or {}).get('ad') or t['sef_kullanici_adi'], 'sef_unvan': (sef.get(t['sef_id']) or {}).get('unvan'),
        'goruntulenme': t['goruntulenme'], 'butce': BUTCE.get(ad_.get(t['butce_id'])), 'butce_ad': ad_.get(t['butce_id']),
        'hatirlatma': t['hatirlatma'], 'yayin': t['yayinlandi_at'], 'guncelleme': t['guncellendi_at'], 'yorum': t['yorum_sayisi'],
        'etiketler': etiket.get(t['id'], []), 'pisirme_derecesi': t['pisirme_derecesi'],
        'gercek': {'degerlendirme': (puan.get(t['id']) or {}).get('n', 0),
                   'ortalama': round(puan[t['id']]['top'] / puan[t['id']]['n'], 1) if t['id'] in puan else 0.0,
                   'dagilim': [(puan.get(t['id']) or {'dagilim': {}})['dagilim'].get(k, 0) for k in (5, 4, 3, 2, 1)],
                   'yorumsuz': (puan.get(t['id']) or {}).get('yorumsuz', 0), 'yorum': yorum_say.get(t['id'], 0),
                   'deneme': deneme.get(t['id'], 0), 'alkis': alkis.get(t['id'], 0)},
        'sef_sayac': {'tarif': sef_tarif.get(t['sef_id'], 0), 'takipci': takipci.get((sef.get(t['sef_id']) or {}).get('hesap'), 0),
                      'yil': str((sef.get(t['sef_id']) or {}).get('uye') or '')[:4] or None} if t['sef_id'] in sef else None,
    })

os.makedirs(os.path.join(KOK, 'veri'), exist_ok=True)
with open(os.path.join(KOK, 'veri', 'gastro-tarifler.json'), 'w', encoding='utf-8') as f:
    json.dump({'kaynak': 'gastro-mysql/database/database.sqlite (salt okuma)', 'tarif': len(cikti), 'kategori_adlari': kat_ad, 'tarifler': cikti}, f, ensure_ascii=False, indent=1)
print('tarif', len(cikti), 'malzemeli', sum(1 for x in cikti if x['malzemeler']), 'besinli', sum(1 for x in cikti if x['besin'] and x['besin']['hesaplanabildi']))
