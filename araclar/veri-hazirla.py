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

malz = {}
for r in c.execute('''select tm.tarif_id, tm.grup_basligi, tm.sira, tm.miktar, coalesce(ob.kisa_ad, ob.ad, tm.olcu_birimi_slug) birim,
                      m.ad mad, m.slug mslug, tm.serbest_ad, tm.aciklama
                      from tarif_malzemeleri tm left join malzemeler m on m.id = tm.malzeme_id
                      left join olcu_birimleri ob on ob.id = tm.olcu_birimi_id order by tm.tarif_id, tm.sira'''):
    malz.setdefault(r['tarif_id'], []).append({
        'grup': r['grup_basligi'] or None, 'miktar': r['miktar'], 'birim': r['birim'] or '',
        'ad': (r['mad'] or r['serbest_ad'] or '').strip(), 'aciklama': (r['aciklama'] or '').strip()})

adim = {}
for r in c.execute('select tarif_id, sira, baslik, metin from tarif_adimlari where coalesce(pasif_mi,0)=0 order by tarif_id, sira'):
    adim.setdefault(r['tarif_id'], []).append({'baslik': r['baslik'] or '', 'metin': r['metin'] or ''})

besin = {}
for r in c.execute('select * from tarif_besin_degerleri'):
    besin[r['tarif_id']] = {k: r[k] for k in ['kalori', 'protein_g', 'karbonhidrat_g', 'yag_g', 'lif_g', 'seker_g', 'sodyum_mg', 'doymus_yag_g', 'hesaplanabildi']}

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
    })

os.makedirs(os.path.join(KOK, 'veri'), exist_ok=True)
with open(os.path.join(KOK, 'veri', 'gastro-tarifler.json'), 'w', encoding='utf-8') as f:
    json.dump({'kaynak': 'gastro-mysql/database/database.sqlite (salt okuma)', 'tarif': len(cikti), 'tarifler': cikti}, f, ensure_ascii=False, indent=1)
print('tarif', len(cikti), 'malzemeli', sum(1 for x in cikti if x['malzemeler']), 'besinli', sum(1 for x in cikti if x['besin'] and x['besin']['hesaplanabildi']))
