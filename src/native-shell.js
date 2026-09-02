import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { KeepAwake } from "@capacitor-community/keep-awake";
import {
  AdMob,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize
} from "@capacitor-community/admob";

const GOOGLE_TEST_BANNER_ID = "ca-app-pub-3940256099942544/9214589741";
const GOOGLE_TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917";
const productionAds = import.meta.env.VITE_ADMOB_MODE === "production";
const bannerId = productionAds ? import.meta.env.VITE_ADMOB_BANNER_ID : GOOGLE_TEST_BANNER_ID;
const rewardedId = productionAds ? import.meta.env.VITE_ADMOB_REWARDED_ID : GOOGLE_TEST_REWARDED_ID;
const adsEnabled = import.meta.env.VITE_ADMOB_ENABLED !== "false";

let adInitialization;
let bannerCreated = false;
let bannerRequested = false;
let bannerListenersReady = false;

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

function setBannerSpace(visible) {
  document.body.classList.toggle("native-banner-visible", visible);
}

async function prepareAds() {
  if (!isNativeApp() || !adsEnabled || !bannerId) return false;
  if (!adInitialization) {
    adInitialization = (async () => {
      if (!bannerListenersReady) {
        bannerListenersReady = true;
        await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
          if (bannerRequested) setBannerSpace(true);
        });
        await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
          setBannerSpace(bannerRequested && Number(size?.height || 0) > 0);
        });
        await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => {
          bannerCreated = false;
          setBannerSpace(false);
        });
      }
      await AdMob.initialize({ initializeForTesting: !productionAds });
      let consent = await AdMob.requestConsentInfo();
      if (!consent.canRequestAds && consent.isConsentFormAvailable) {
        consent = await AdMob.showConsentForm();
      }
      return Boolean(consent.canRequestAds);
    })().catch(() => false);
  }
  return adInitialization;
}

export async function showHomeBanner() {
  bannerRequested = true;
  if (!(await prepareAds()) || !bannerRequested) return;
  try {
    if (bannerCreated) {
      await AdMob.resumeBanner();
    } else {
      await AdMob.showBanner({
        adId: bannerId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: !productionAds
      });
      bannerCreated = true;
    }
  } catch {
    bannerCreated = false;
    setBannerSpace(false);
  }
}

export async function hideHomeBanner() {
  bannerRequested = false;
  setBannerSpace(false);
  if (!isNativeApp() || !bannerCreated) return;
  try { await AdMob.hideBanner(); } catch { /* Reklam henüz oluşmadıysa devam et. */ }
}

export async function showPrivacyChoices() {
  if (!isNativeApp()) return false;
  try {
    await AdMob.showPrivacyOptionsForm();
    return true;
  } catch {
    return false;
  }
}

export async function watchRewardedHintAd() {
  if (!isNativeApp() || !rewardedId || !(await prepareAds())) return false;
  try {
    await AdMob.prepareRewardVideoAd({
      adId: rewardedId,
      isTesting: !productionAds,
      immersiveMode: true
    });
    const reward = await AdMob.showRewardVideoAd({ adId: rewardedId });
    return Number(reward?.amount || 0) > 0;
  } catch {
    return false;
  }
}

export async function openPrivacyPolicy() {
  const url = "https://gokhanagingil.github.io/belgin/privacy.html";
  if (isNativeApp()) {
    try {
      await Browser.open({ url, presentationStyle: "popover" });
      return;
    } catch { /* Sistem tarayıcısı açılamazsa yeni sekmeyi dene. */ }
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function keepNativeScreenAwake() {
  if (!isNativeApp()) return false;
  try {
    await KeepAwake.keepAwake();
    return true;
  } catch {
    return false;
  }
}

export async function allowNativeScreenSleep() {
  if (!isNativeApp()) return false;
  try {
    await KeepAwake.allowSleep();
    return true;
  } catch {
    return false;
  }
}

export async function registerNativeBackHandler(handler) {
  if (!isNativeApp()) return;
  await App.addListener("backButton", async () => {
    const handled = await handler();
    if (!handled) await App.minimizeApp();
  });
}
