import { useEffect, useState } from 'react';
import mobileAds, {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';

let started = false;
let ready = false;
let privacyOptionsRequired = false;
const listeners = new Set();

const publish = () => listeners.forEach(fn => fn(ready));

// Runs once, the first time a screen that can show an ad mounts, so the consent
// form (EEA/UK/some US states) appears after onboarding, never before it.
export const initAds = async () => {
  if (started) return;
  started = true;
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });

    try {
      await AdsConsent.requestInfoUpdate();
      await AdsConsent.loadAndShowConsentFormIfRequired();
    } catch (e) {
      // Offline or form error: fall back to the consent state stored from a previous session.
    }

    const info = await AdsConsent.getConsentInfo();
    privacyOptionsRequired =
      info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
    if (!info.canRequestAds) return;

    await mobileAds().initialize();
    ready = true;
    publish();
  } catch (e) {
    // Ads are optional: any failure leaves the app fully working without them.
  }
};

export const useAdsReady = () => {
  const [value, setValue] = useState(ready);
  useEffect(() => {
    listeners.add(setValue);
    initAds();
    return () => { listeners.delete(setValue); };
  }, []);
  return value;
};

export const isPrivacyOptionsRequired = () => privacyOptionsRequired;

export const showPrivacyOptions = async () => {
  try {
    await AdsConsent.showPrivacyOptionsForm();
  } catch (e) {
    // Nothing to show or offline.
  }
};
