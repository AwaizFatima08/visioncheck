import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNITS } from './adsConfig';
import { useAdsReady } from './initAds';

// BannerAd keeps a 0x0 size until an ad loads, so offline or no-fill leaves no gap.
const AdBanner = ({ placement }) => {
  const ready = useAdsReady();
  const [failed, setFailed] = useState(false);

  if (!ready || failed || !AD_UNITS[placement]) return null;

  return (
    <View style={styles.box}>
      <BannerAd
        unitId={AD_UNITS[placement]}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: { alignItems: 'center', backgroundColor: '#FFFFFF' },
});

export default AdBanner;
