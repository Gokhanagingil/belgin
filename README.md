# Kuş Bahçesi · Kuşların Şifresi

60+ yaş grubunda rahat ve uzun süreli kullanım gözetilerek tasarlanmış, mobil öncelikli mantık ve Türkçe kelime oyunu.

## Oyna

**[Kuş Bahçesi'ni aç](https://gokhanagingil.github.io/belgin/)**

## Oyun döngüsü

Her bölüm iki farklı zihinsel aşamadan oluşur:

1. **Kuş düzeni:** Her kuş türünü her satır ve sütunda yalnızca bir kez kullanarak bahçeyi tamamla.
2. **Gizli sözcük:** Açılan ipucunu oku ve karışık harfleri doğru sıraya koy.

Yanlış hamleler can ya da puan kaybettirmez. Süre sınırı yoktur; oyuncu deneyebilir, geri alabilir ve gerektiğinde yardım kullanabilir. Bölüm yıldızları dikkatli ve yardımsız oyun için ek ustalık hedefi sunar.

## Uzun soluklu yapı

- 12 ayrı bahçe dünyasına yayılan 1.200 deterministik bölüm
- 4×4'ten 6×6'ya ilerleyen mantık zorluğu
- 80 özgün Türkçe sözcük ve ipucu
- Dönüşümlü bölüm görevleri ve üç yıldız ustalık sistemi
- Tarihe bağlı günlük mantık + kelime bulmacası
- Otomatik kayıt; mantık veya kelime aşamasının ortasından devam
- 12 kuşluk keşif albümü

## UX ve erişilebilirlik

- Telefon, tablet ve yatay ekran düzenleri
- Büyük dokunma hedefleri ve renk dışında biçimle de ayırt edilen kuşlar
- Çakışmaları açıklayan anlık, cezalandırmayan geri bildirim
- Geri alma, çakışmaları temizleme ve doğru yer ipucu
- Ses, titreşim, büyük yazı, yüksek kontrast ve hareket azaltma ayarları
- Semantik kontroller, ekran okuyucu etiketleri ve görünür klavye odağı
- Ana ekrana ekleme ve çevrimdışı devam desteği

## Geliştirme

```bash
npm install
npm run dev
npm test
```

`npm test`, 1.200 bölümün tamamını doğrular; üretim yolu, iki aşamalı bölüm akışı, kayıt ve albüm için tarayıcı tabanlı regresyon testlerini çalıştırır.
