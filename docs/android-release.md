# Kuş Köyü Android yayınlama rehberi

## Yerel pilot APK

```bash
npm ci
npm run android:debug
```

Çıktı: `android/app/build/outputs/apk/debug/app-debug.apk`

Pilot paket, Google’ın resmi test reklam kimliğini kullanır. Test reklamı gelir üretmez ve güvenli cihaz denemesi içindir.

## Play Store AAB

Store paketi GitHub’daki **Android Package** iş akışından `store` kanalı seçilerek üretilir. İş akışının çalışması için:

Repository variables:

- `ADMOB_APP_ID`
- `ADMOB_BANNER_ID`
- `ADMOB_REWARDED_ID`

Repository secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

İmzalama dosyası yalnızca GitHub Actions çalışma ortamında açılır; repoya veya üretilen pakete parola olarak yazılmaz. Play App Signing etkinleştirilirken bu anahtar **upload key** olarak kullanılmalıdır ve güvenli bir çevrimdışı kopyası ayrıca saklanmalıdır.

## Sürüm kuralları

- `versionCode` her Play Store yüklemesinde artmalıdır.
- `versionName` kullanıcıya gösterilen sürümdür; Büyük Filo adayı `1.1.0` olarak hazırlanmıştır.
- Güncel hedef: Android 16 / API 36.
- Minimum destek: Android 7 / API 24.

## Canlı reklam öncesi zorunlu kontroller

1. AdMob’da `com.gokhanagingil.kuskoyu` uygulamasını oluştur.
2. Bir Android uyarlanabilir banner ve bir ödüllü video reklam birimi oluştur.
3. Privacy & messaging bölümünde Avrupa düzenlemeleri mesajını yayımla.
4. Kimlikleri repository variables olarak kaydet.
5. Pilot cihazlarda test reklamıyla, kapalı Play testinde gerçek kimlikle doğrula.
6. Play Console Veri güvenliği ve “Reklam içerir” beyanlarını tamamla.
7. AAB’yi önce Internal testing kanalına yükle; doğrudan production’a gönderme.
