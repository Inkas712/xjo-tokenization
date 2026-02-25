import { useState, useCallback, useMemo, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { mixpanel } from '@/services/mixpanel';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery } from '@tanstack/react-query';
import { notifications as mockNotifications, Notification } from '@/mocks/notifications';
import { Currency, Language, exchangeRates, currencySymbols } from '@/mocks/premium';
import { getEthBalance, getEthPrice, testAlchemyConnection, AlchemyConnectionTest } from '@/services/alchemy';
import { testSupabaseConnection, SupabaseConnectionTest } from '@/services/supabase';
import { testPinataConnection, PinataConnectionTest } from '@/services/pinata';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WalletType = 'MetaMask' | 'WalletConnect' | 'Coinbase Wallet';

const WALLETCONNECT_PROJECT_ID = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export interface PriceAlert {
  id: string;
  assetId: string;
  assetName: string;
  belowPrice?: number;
  abovePrice?: number;
}

interface WalletState {
  isConnected: boolean;
  walletType: WalletType | null;
  address: string;
  fullAddress: string;
  balance: string;
  connectWallet: (type: WalletType) => void;
  disconnectWallet: () => void;
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
  favorites: string[];
  toggleFavorite: (assetId: string) => void;
  watchlist: string[];
  toggleWatchlist: (assetId: string) => void;
  clearWatchlist: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  following: string[];
  toggleFollow: (userId: string) => void;
  kycStatus: 'none' | 'pending' | 'verified';
  setKycStatus: (status: 'none' | 'pending' | 'verified') => void;
  priceAlerts: PriceAlert[];
  addPriceAlert: (alert: PriceAlert) => void;
  removePriceAlert: (id: string) => void;
  toastMessage: string;
  toastType: 'success' | 'error';
  showToast: (message: string, type?: 'success' | 'error') => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  isPro: boolean;
  setIsPro: (v: boolean) => void;
  convertPrice: (ethPrice: number) => string;
  formatPrice: (ethPrice: number) => string;
  ethUsdPrice: number;
  walletConnectProjectId: string;
  connectionStatus: {
    alchemy: AlchemyConnectionTest | null;
    supabase: SupabaseConnectionTest | null;
    pinata: PinataConnectionTest | null;
    walletConnect: { configured: boolean };
    testing: boolean;
    lastTested: string | null;
  };
  testConnections: () => Promise<void>;
}

export const [WalletProvider, useWallet] = createContextHook<WalletState>(() => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [fullAddress, setFullAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [notifs, setNotifs] = useState<Notification[]>(mockNotifications);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [following, setFollowing] = useState<string[]>(['u2', 'u3']);
  const [kycStatus, setKycStatus] = useState<'none' | 'pending' | 'verified'>('none');
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [currency, setCurrency] = useState<Currency>('ETH');
  const [language, setLanguage] = useState<Language>('en');
  const [isPro, setIsPro] = useState<boolean>(false);

  const ethPriceQuery = useQuery({
    queryKey: ['ethPrice'],
    queryFn: getEthPrice,
    staleTime: 120000,
  });

  const ethUsdPrice = ethPriceQuery.data ?? 3200;

  const [connectionStatus, setConnectionStatus] = useState<{
    alchemy: AlchemyConnectionTest | null;
    supabase: SupabaseConnectionTest | null;
    pinata: PinataConnectionTest | null;
    walletConnect: { configured: boolean };
    testing: boolean;
    lastTested: string | null;
  }>({
    alchemy: null,
    supabase: null,
    pinata: null,
    walletConnect: { configured: !!WALLETCONNECT_PROJECT_ID },
    testing: false,
    lastTested: null,
  });

  const testConnections = useCallback(async () => {
    console.log('[Wallet] Testing all connections...');
    setConnectionStatus(prev => ({ ...prev, testing: true }));

    try {
      const [alchemyResult, supabaseResult, pinataResult] = await Promise.allSettled([
        testAlchemyConnection(),
        testSupabaseConnection(),
        testPinataConnection(),
      ]);

      const alchemy = alchemyResult.status === 'fulfilled' ? alchemyResult.value : { configured: false, connected: false, error: 'Test failed' } as AlchemyConnectionTest;
      const supabaseRes = supabaseResult.status === 'fulfilled' ? supabaseResult.value : { configured: false, connected: false, canRead: false, canWrite: false, error: 'Test failed' } as SupabaseConnectionTest;
      const pinata = pinataResult.status === 'fulfilled' ? pinataResult.value : { configured: false, connected: false, error: 'Test failed' } as PinataConnectionTest;

      console.log('[Wallet] Connection results:', {
        alchemy: alchemy.connected ? 'OK' : alchemy.error,
        supabase: supabaseRes.connected ? 'OK' : supabaseRes.error,
        pinata: pinata.connected ? 'OK' : pinata.error,
        walletConnect: WALLETCONNECT_PROJECT_ID ? 'configured' : 'not set',
      });

      setConnectionStatus({
        alchemy,
        supabase: supabaseRes,
        pinata,
        walletConnect: { configured: !!WALLETCONNECT_PROJECT_ID },
        testing: false,
        lastTested: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[Wallet] Connection test error:', err);
      setConnectionStatus(prev => ({ ...prev, testing: false }));
    }
  }, []);

  const dynamicRates = useMemo(() => ({
    ETH: 1,
    USD: ethUsdPrice,
    EUR: ethUsdPrice * 0.92,
    BTC: ethUsdPrice / 67000,
  }), [ethUsdPrice]);

  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const stored = await AsyncStorage.getItem('wallet_state');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.favorites) setFavorites(parsed.favorites);
          if (parsed.watchlist) setWatchlist(parsed.watchlist);
          if (parsed.currency) setCurrency(parsed.currency);
          if (parsed.language) setLanguage(parsed.language);
          if (parsed.isDarkMode !== undefined) setIsDarkMode(parsed.isDarkMode);
          if (parsed.isPro !== undefined) setIsPro(parsed.isPro);
          console.log('[Wallet] Restored persisted state');
        }
      } catch (err) {
        console.error('[Wallet] Failed to load persisted state:', err);
      }
    };
    loadPersistedState();
  }, []);

  const persistState = useCallback(async (state: Record<string, any>) => {
    try {
      const existing = await AsyncStorage.getItem('wallet_state');
      const current = existing ? JSON.parse(existing) : {};
      await AsyncStorage.setItem('wallet_state', JSON.stringify({ ...current, ...state }));
    } catch (err) {
      console.error('[Wallet] Failed to persist state:', err);
    }
  }, []);

  const address = useMemo(() => {
    if (!fullAddress) return '';
    if (fullAddress.length > 10) {
      return `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`;
    }
    return fullAddress;
  }, [fullAddress]);

  const connectWallet = useCallback(async (type: WalletType) => {
    console.log(`[Wallet] Connecting with ${type}...`);
    console.log(`[Wallet] WalletConnect Project ID: ${WALLETCONNECT_PROJECT_ID ? 'configured' : 'not set'}`);

    setIsConnected(true);
    setWalletType(type);

    const mockAddress = '0x7a3B4c2D8E1f6A9b5C3d7E2F8a4B6c1D9e5F2E';
    setFullAddress(mockAddress);

    Sentry.setUser({ id: mockAddress });
    Sentry.addBreadcrumb({
      category: 'wallet',
      message: 'wallet_connected',
      data: { walletType: type, address: mockAddress },
      level: 'info',
    });

    mixpanel.identify(mockAddress);
    mixpanel.setProfile({
      wallet_address: mockAddress,
      platform: 'mobile',
      wallet_type: type,
    });
    mixpanel.trackWalletConnected(mockAddress);

    const balanceResult = await getEthBalance(mockAddress);
    if (balanceResult) {
      setBalance(balanceResult.balanceEth.toString());
      console.log(`[Wallet] Balance fetched: ${balanceResult.balanceEth} ETH`);
    } else {
      setBalance('24.58');
      console.log('[Wallet] Using fallback balance');
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    console.log('[Wallet] Disconnecting...');
    mixpanel.trackWalletDisconnected();
    setIsConnected(false);
    setWalletType(null);
    setFullAddress('');
    setBalance('0');
    Sentry.setUser(null);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAll = useCallback(() => {
    setNotifs([]);
  }, []);

  const unreadCount = useMemo(() => notifs.filter(n => !n.read).length, [notifs]);

  const toggleFavorite = useCallback((assetId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId];
      persistState({ favorites: updated });
      return updated;
    });
  }, [persistState]);

  const toggleWatchlist = useCallback((assetId: string) => {
    setWatchlist(prev => {
      const updated = prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId];
      persistState({ watchlist: updated });
      return updated;
    });
  }, [persistState]);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
    persistState({ watchlist: [] });
  }, [persistState]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      persistState({ isDarkMode: !prev });
      return !prev;
    });
  }, [persistState]);

  const toggleFollow = useCallback((userId: string) => {
    setFollowing(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }, []);

  const addPriceAlert = useCallback((alert: PriceAlert) => {
    setPriceAlerts(prev => [...prev, alert]);
  }, []);

  const removePriceAlert = useCallback((id: string) => {
    setPriceAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastType(type);
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  const convertPrice = useCallback((ethPrice: number): string => {
    const rate = dynamicRates[currency] ?? exchangeRates[currency];
    const converted = ethPrice * rate;
    if (currency === 'ETH') return converted.toFixed(4);
    if (currency === 'BTC') return converted.toFixed(6);
    return converted.toFixed(2);
  }, [currency, dynamicRates]);

  const formatPrice = useCallback((ethPrice: number): string => {
    const sym = currencySymbols[currency];
    const val = convertPrice(ethPrice);
    if (currency === 'ETH' || currency === 'BTC') return `${val} ${sym}`;
    return `${sym}${val}`;
  }, [currency, convertPrice]);

  return {
    isConnected,
    walletType,
    address,
    fullAddress,
    balance,
    connectWallet,
    disconnectWallet,
    notifications: notifs,
    unreadCount,
    markAllRead,
    markRead,
    clearAll,
    favorites,
    toggleFavorite,
    watchlist,
    toggleWatchlist,
    clearWatchlist,
    isDarkMode,
    toggleDarkMode,
    following,
    toggleFollow,
    kycStatus,
    setKycStatus,
    priceAlerts,
    addPriceAlert,
    removePriceAlert,
    toastMessage,
    toastType,
    showToast,
    currency,
    setCurrency,
    language,
    setLanguage,
    isPro,
    setIsPro,
    convertPrice,
    formatPrice,
    ethUsdPrice,
    walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
    connectionStatus,
    testConnections,
  };
});
