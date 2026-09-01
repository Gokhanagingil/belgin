# Kuş Köyü

60+ yaş grubunda rahat, merak uyandıran ve uzun süreli kullanım gözetilerek tasarlanmış; mantık, üretim planlama ve Türkçe kelime oyunlarını kalıcı bir köy yolculuğunda birleştiren mobil öncelikli oyun.

## Oyna

**[Kuş Köyü'nü aç](https://gokhanagingil.github.io/belgin/)**

## Oyun döngüsü

Her Bahçe Günü üç farklı zihinsel aşamadan oluşur:

1. **Sabah · Kuş Düzeni:** Her kuş türünü her satır ve sütunda yalnızca bir kez kullanarak bahçeyi tamamla.
2. **Öğle · Atölye Siparişleri:** Ortak malzemeleri planla, ara ürünleri doğru sırayla üret ve köy siparişlerini teslim et.
3. **Akşam · Gizli Sözcük:** İpucunu oku ve karışık harfleri doğru sıraya koy.

Yanlış hamleler can ya da puan kaybettirmez. Süre sınırı yoktur; oyuncu deneyebilir, geri alabilir ve gerektiğinde yardım kullanabilir. Her aşama köyü geliştiren kaynaklar kazandırır; yıldızlar dikkatli ve yardımsız oyun için ek ustalık hedefi sunar.

## Uzun soluklu yapı

- 12 ayrı bölgeye yayılan 400 Bahçe Günü ve toplam 1.200 deterministik aşama
- 4×4'ten 6×6'ya ilerleyen mantık zorluğu
- 11 tariflik, çok adımlı ve her bölümü çözülebilirliği kanıtlanmış üretim sistemi
- 80 özgün Türkçe sözcük ve ipucu
- Dört kalıcı köy binası, kaynak ekonomisi ve sekiz saate kadar biriken dönüş hediyesi
- Dönüşümlü aşama görevleri ve üç yıldız ustalık sistemi
- Tarihe bağlı günlük özel görev
- Otomatik kayıt; üç oyun türünün de ortasından devam
- 12 kuşluk keşif albümü

## UX ve erişilebilirlik

- Telefon, tablet ve yatay ekran düzenleri
- Büyük dokunma hedefleri ve renk dışında biçimle de ayırt edilen kuşlar
- Çakışmaları açıklayan anlık, cezalandırmayan geri bildirim
- Geri alma, çakışmaları temizleme ve doğru yer ipucu
- Siparişlerde geri alma, sıfırlama ve bağlama duyarlı sıradaki adım desteği
- Ses, titreşim, büyük yazı, yüksek kontrast ve hareket azaltma ayarları
- Semantik kontroller, ekran okuyucu etiketleri ve görünür klavye odağı
- Ana ekrana ekleme ve çevrimdışı devam desteği

## Geliştirme

```bash
npm install
npm run dev
npm test
```

`npm test`, 1.200 aşamanın tamamını doğrular; tariflerin çözüm planlarını, üçlü gün akışını, köy ekonomisini, kayıt geçişini ve albümü tarayıcı tabanlı regresyon testleriyle denetler.
