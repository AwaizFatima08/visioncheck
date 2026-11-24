import { TestIds } from 'react-native-google-mobile-ads';

// Real units are served only when EAS sets EXPO_PUBLIC_ADS_LIVE=true (production
// profile). Dev and preview builds always get Google's test ads, so tapping an
// ad while testing never counts as an invalid click on the live account.
const LIVE = process.env.EXPO_PUBLIC_ADS_LIVE === 'true';

const LIVE_UNITS = {
  home:    'ca-app-pub-2087846699268567/9845934844',
  history: 'ca-app-pub-2087846699268567/8257521009',
};

export const AD_UNITS = {
  home:    LIVE ? LIVE_UNITS.home    : TestIds.BANNER,
  history: LIVE ? LIVE_UNITS.history : TestIds.BANNER,
};
