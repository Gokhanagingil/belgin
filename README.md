# Kuş Köyü

60+ yaş grubunda rahat, merak uyandıran ve uzun süreli kullanım gözetilerek tasarlanmış; mantık, Türkçe kelime ve görsel birleştirme oyunlarını kalıcı bir köy yolculuğunda birleştiren mobil öncelikli oyun.

## Oyna

**[Kuş Köyü'nü aç](https://gokhanagingil.github.io/belgin/)**

**[Android pilot APK’yı indir](https://github.com/Gokhanagingil/belgin/releases/latest)**

## Oyun döngüsü

Her Bahçe Günü üç farklı zihinsel aşama sunar:

1. **Sabah · Kuş Düzeni:** Her kuş türünü her satır ve sütunda yalnızca bir kez kullanarak bahçeyi tamamla.
2. **Öğle · Büyük Filo:** Aynı gemileri birleştir; minik kayıktan transatlantiğe uzanan kalıcı filonu büyüt.
3. **Akşam · Gizli Sözcük:** İpucunu oku ve karışık harfleri doğru sıraya koy.

Atölye Siparişleri oyuncu akışında kapalıdır. Eski sipariş kayıtları temizlenir ve aynı bölüm numarası yeni Büyük Filo oyunuyla açılır.

Yanlış hamleler can ya da puan kaybettirmez. Süre sınırı yoktur; oyuncu deneyebilir, geri alabilir ve gerektiğinde yardım kullanabilir. Her aşama köyü geliştiren kaynaklar kazandırır; yıldızlar dikkatli ve yardımsız oyun için ek ustalık hedefi sunar.

## Uzun soluklu yapı

- 12 ayrı bölgeye yayılan 400 Bahçe Günü ve toplam 1.200 aktif oyun aşaması
- 4×4'ten 6×6'ya ilerleyen mantık zorluğu
- 469 özgün Türkçe sözcük ve ipucu; 400 günlük ana yolculukta tekrar yok
- Dört kalıcı köy binası, kaynak ekonomisi ve sekiz saate kadar biriken dönüş hediyesi
- Dönüşümlü aşama görevleri ve üç yıldız ustalık sistemi
- Tarihe bağlı günlük özel görev
- Otomatik kayıt; üç oyun türünün de ortasından devam
- 12 kuşluk keşif albümü
- 10 kademeli, kalıcı Filo Defteri ve kayıktan transatlantiğe gemi yolculuğu

## UX ve erişilebilirlik

- Telefon, tablet ve yatay ekran düzenleri
- Büyük dokunma hedefleri ve renk dışında biçimle de ayırt edilen kuşlar
- Çakışmaları açıklayan anlık, cezalandırmayan geri bildirim
- İlk iki Kuş Düzeni bölümünde neden-sonuç anlatan etkileşimli öğretici
- Her iki bulmacada çözümü otomatik yerleştirmeyen, kademeli düşünme ipuçları
- Üç ücretsiz ipucundan sonra isteğe bağlı ödüllü reklamla bir ek ipucu
- Kelime oyununda daima görünür geri alma
- Her başarıdan sonra kısa kutlamayla otomatik sonraki aşamaya geçiş
- Aktif oyun sırasında varsayılan açık ekran koruması; ana ekranda otomatik bırakma
- Ses, titreşim, büyük yazı, yüksek kontrast ve hareket azaltma ayarları
- Semantik kontroller, ekran okuyucu etiketleri ve görünür klavye odağı
- Ana ekrana ekleme ve çevrimdışı devam desteği
- Android uygulamasında cihaz yedeklemesi ve dosyayla telefonlar arası kayıt aktarımı
- Oyun ve ayar pencerelerinde görünmeyen, yalnızca ana ekrana ayrılmış küçük AdMob banner alanı

## Android

Capacitor tabanlı Android projesi `android/` dizinindedir. Pilot APK üretmek için:

```bash
npm ci
npm run android:debug
```

GitHub’daki **Android Package** iş akışı test reklamlı pilot APK üretir. İmzalı Play Store AAB süreci, gerekli AdMob kimlikleri ve upload-key sırları tanımlandığında aynı iş akışındaki `store` kanalıyla çalışır. Ayrıntılar için [`docs/android-release.md`](docs/android-release.md) belgesine bakın.

## Geliştirme

```bash
npm install
npm run dev
npm test
```

`npm test`, 400 günlük aktif Mantık + Sözcük akışını, kapatılan sipariş kayıtlarının güvenli geçişini, köy ekonomisini, kayıt devamlılığını ve albümü tarayıcı tabanlı regresyon testleriyle denetler. Ayrı oyun tasarımında değerlendirilecek atölye motoru da bağımsız testlerle korunur.
