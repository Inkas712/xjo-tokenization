import { Platform } from 'react-native';

const MIXPANEL_TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || '';
const MIXPANEL_TRACK_URL = 'https://api.mixpanel.com/track';
const MIXPANEL_ENGAGE_URL = 'https://api.mixpanel.com/engage';

let distinctId: string = `anon_${Math.random().toString(36).slice(2)}`;

const getBaseProperties = () => ({
  token: MIXPANEL_TOKEN,
  platform: Platform.OS,
  $os: Platform.OS,
  time: Math.floor(Date.now() / 1000),
});

const sendEvent = async (eventName: string, properties: Record<string, unknown> = {}) => {
  if (!MIXPANEL_TOKEN) {
    console.warn('[Mixpanel] No token configured');
    return;
  }
  try {
    const payload = {
      event: eventName,
      properties: {
        ...getBaseProperties(),
        distinct_id: distinctId,
        ...properties,
      },
    };
    const encoded = btoa(JSON.stringify(payload));
    const res = await fetch(`${MIXPANEL_TRACK_URL}?data=${encoded}&verbose=1`, {
      method: 'GET',
    });
    const json = await res.json();
    if (json.status !== 1) {
      console.warn('[Mixpanel] Track failed:', json.error);
    } else {
      console.log(`[Mixpanel] Tracked: ${eventName}`);
    }
  } catch (err) {
    console.warn('[Mixpanel] Track error:', err);
  }
};

const sendEngage = async (properties: Record<string, unknown> = {}) => {
  if (!MIXPANEL_TOKEN) return;
  try {
    const payload = {
      $token: MIXPANEL_TOKEN,
      $distinct_id: distinctId,
      $set: {
        ...properties,
        $last_seen: new Date().toISOString(),
      },
    };
    const encoded = btoa(JSON.stringify(payload));
    await fetch(`${MIXPANEL_ENGAGE_URL}?data=${encoded}&verbose=1`, {
      method: 'GET',
    });
    console.log('[Mixpanel] Engaged user profile');
  } catch (err) {
    console.warn('[Mixpanel] Engage error:', err);
  }
};

export const mixpanel = {
  identify: (id: string) => {
    console.log(`[Mixpanel] Identify: ${id}`);
    distinctId = id;
  },

  setProfile: (properties: Record<string, unknown>) => {
    sendEngage(properties);
  },

  track: (eventName: string, properties?: Record<string, unknown>) => {
    sendEvent(eventName, properties);
  },

  trackWalletConnected: (walletAddress: string) => {
    sendEvent('wallet_connected', {
      wallet_address: walletAddress,
      timestamp: new Date().toISOString(),
    });
  },

  trackWalletDisconnected: () => {
    sendEvent('wallet_disconnected', {
      timestamp: new Date().toISOString(),
    });
  },

  trackAssetViewed: (assetId: string, assetName: string, category: string, price: number) => {
    sendEvent('asset_viewed', {
      asset_id: assetId,
      asset_name: assetName,
      category,
      price,
    });
  },

  trackAssetMinted: (assetName: string, category: string, price: number, royalty: number) => {
    sendEvent('asset_minted', {
      asset_name: assetName,
      category,
      price,
      royalty,
    });
  },

  trackAssetPurchased: (assetId: string, price: number, seller: string, buyer: string) => {
    sendEvent('asset_purchased', {
      asset_id: assetId,
      price,
      seller,
      buyer,
    });
  },

  trackBidPlaced: (assetId: string, bidAmount: number, bidder: string) => {
    sendEvent('bid_placed', {
      asset_id: assetId,
      bid_amount: bidAmount,
      bidder,
    });
  },

  trackSearchPerformed: (query: string, resultsCount: number) => {
    sendEvent('search_performed', {
      query,
      results_count: resultsCount,
    });
  },

  trackPageViewed: (pageName: string) => {
    sendEvent('page_viewed', {
      page_name: pageName,
    });
  },

  trackProUpgradeClicked: (planType: string) => {
    sendEvent('pro_upgrade_clicked', {
      plan_type: planType,
    });
  },

  trackProUpgradeCompleted: (planType: string, amount: number) => {
    sendEvent('pro_upgrade_completed', {
      plan_type: planType,
      amount,
    });
  },

  trackWatchlistAdded: (assetId: string) => {
    sendEvent('watchlist_added', {
      asset_id: assetId,
    });
  },

  trackNotificationOpened: (type: string) => {
    sendEvent('notification_opened', {
      type,
    });
  },
};
