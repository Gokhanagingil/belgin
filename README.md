# Kuş Köyü

60+ yaş grubunda rahat, merak uyandıran ve uzun süreli kullanım gözetilerek tasarlanmış; mantık ve Türkçe kelime oyunlarını kalıcı bir köy yolculuğunda birleştiren mobil öncelikli oyun.

## Oyna

**[Kuş Köyü'nü aç](https://gokhanagingil.github.io/belgin/)**

## Oyun döngüsü

Her Bahçe Günü iki farklı zihinsel aşama sunar:

1. **Sabah · Kuş Düzeni:** Her kuş türünü her satır ve sütunda yalnızca bir kez kullanarak bahçeyi tamamla.
2. **Akşam · Gizli Sözcük:** İpucunu oku ve karışık harfleri doğru sıraya koy.

Atölye Siparişleri oyuncu akışında kapalıdır. Eski kayıt sipariş aşamasındaysa ilerleme kaybetmeden otomatik olarak Gizli Sözcük bölümüne geçirilir. Atölye daha sonra yeni bir oyun mekaniğiyle, bağımsız bir oyun olarak yeniden tasarlanacaktır.

Yanlış hamleler can ya da puan kaybettirmez. Süre sınırı yoktur; oyuncu deneyebilir, geri alabilir ve gerektiğinde yardım kullanabilir. Her aşama köyü geliştiren kaynaklar kazandırır; yıldızlar dikkatli ve yardımsız oyun için ek ustalık hedefi sunar.

## Uzun soluklu yapı

- 12 ayrı bölgeye yayılan 400 Bahçe Günü ve toplam 800 aktif bulmaca
- 4×4'ten 6×6'ya ilerleyen mantık zorluğu
- 80 özgün Türkçe sözcük ve ipucu
- Dört kalıcı köy binası, kaynak ekonomisi ve sekiz saate kadar biriken dönüş hediyesi
- Dönüşümlü aşama görevleri ve üç yıldız ustalık sistemi
- Tarihe bağlı günlük özel görev
- Otomatik kayıt; iki oyun türünün de ortasından devam
- 12 kuşluk keşif albümü

## UX ve erişilebilirlik

- Telefon, tablet ve yatay ekran düzenleri
- Büyük dokunma hedefleri ve renk dışında biçimle de ayırt edilen kuşlar
- Çakışmaları açıklayan anlık, cezalandırmayan geri bildirim
- Geri alma, çakışmaları temizleme ve doğru yer ipucu
- Her başarıdan sonra kısa kutlamayla otomatik sonraki aşamaya geçiş
- Aktif oyun sırasında varsayılan açık ekran koruması; ana ekranda otomatik bırakma
- Ses, titreşim, büyük yazı, yüksek kontrast ve hareket azaltma ayarları
- Semantik kontroller, ekran okuyucu etiketleri ve görünür klavye odağı
- Ana ekrana ekleme ve çevrimdışı devam desteği

## Geliştirme

```bash
npm install
npm run dev
npm test
```

`npm test`, 400 günlük aktif Mantık + Sözcük akışını, kapatılan sipariş kayıtlarının güvenli geçişini, köy ekonomisini, kayıt devamlılığını ve albümü tarayıcı tabanlı regresyon testleriyle denetler. Ayrı oyun tasarımında değerlendirilecek atölye motoru da bağımsız testlerle korunur.
