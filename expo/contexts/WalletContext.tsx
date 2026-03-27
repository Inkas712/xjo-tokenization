import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { mixpanel } from '@/services/mixpanel';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery } from '@tanstack/react-query';
import { Notification } from '@/mocks/notifications';
import { Currency, Language, exchangeRates, currencySymbols } from '@/mocks/premium';
import { getEthPrice, testAlchemyConnection, AlchemyConnectionTest } from '@/services/alchemy';
import { testSupabaseConnection, SupabaseConnectionTest } from '@/services/supabase';
import { testPinataConnection, PinataConnectionTest } from '@/services/pinata';
import {
  connectBrowserWallet,
  disconnectBrowserWallet,
  getBalance,
  isWalletAvailable,
  getDetectedWalletName,
  onAccountsChanged,
  onChainChanged,
  switchToPolygonAmoy,
  isOnWeb,
} from '@/services/web3-wallet';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WalletType = 'MetaMask' | 'WalletConnect' | 'Coinbase Wallet' | 'Browser Wallet';

const WALLETCONNECT_PROJECT_ID = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const WALLETCONNECT_METADATA = {
  name: 'XJO Tokenization',
  description: 'Tokenize real-world assets on blockchain',
  url: 'https://www.xjotoken.online',
  icons: ['https://www.xjotoken.online/favicon.png'],
  redirect: {
    native: 'rork-app://',
    universal: 'https://www.xjotoken.online',
  },
};

export const WALLETCONNECT_ALLOWED_DOMAINS = [
  'https://www.xjotoken.online',
  'https://xjo-tokenization.vercel.app',
];

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
  isConnecting: boolean;
  connectionError: string | null;
  hasInjectedWallet: boolean;
  detectedWalletName: string | null;
  chainId: number | null;
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
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [following, setFollowing] = useState<string[]>([]);
  const [kycStatus, setKycStatus] = useState<'none' | 'pending' | 'verified'>('none');
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [currency, setCurrency] = useState<Currency>('ETH');
  const [language, setLanguage] = useState<Language>('en');
  const [isPro, setIsPro] = useState<boolean>(false);

  const cleanupRef = useRef<(() => void)[]>([]);

  const hasInjectedWallet = useMemo(() => isOnWeb() && isWalletAvailable(), []);
  const detectedWalletName = useMemo(() => isOnWeb() ? getDetectedWalletName() : null, []);

  const ethPriceQuery = useQuery({
    queryKey: ['ethPrice'],
    queryFn: getEthPrice,
    staleTime: 120000,
  });

  const ethUsdPrice = ethPriceQuery.data ?? 0.85;

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

  const persistState = useCallback(async (state: Record<string, unknown>) => {
    try {
      const existing = await AsyncStorage.getItem('wallet_state');
      const current = existing ? JSON.parse(existing) : {};
      await AsyncStorage.setItem('wallet_state', JSON.stringify({ ...current, ...state }));
    } catch (err) {
      console.error('[Wallet] Failed to persist state:', err);
    }
  }, []);

  useEffect(() => {
    if (!isOnWeb() || !isWalletAvailable()) return;

    const unsubAccounts = onAccountsChanged((accounts) => {
      console.log('[Wallet] Accounts changed:', accounts);
      if (accounts.length === 0) {
        setIsConnected(false);
        setWalletType(null);
        setFullAddress('');
        setBalance('0');
        setChainId(null);
        Sentry.setUser(null);
        console.log('[Wallet] Wallet disconnected via provider event');
      } else if (accounts[0] && accounts[0] !== fullAddress) {
        const newAddr = accounts[0];
        setFullAddress(newAddr);
        Sentry.setUser({ id: newAddr });
        mixpanel.identify(newAddr);
        console.log('[Wallet] Account switched to:', newAddr);
        getBalance(newAddr).then(result => {
          setBalance(result.balanceFormatted);
        });
      }
    });

    const unsubChain = onChainChanged((newChainId) => {
      console.log('[Wallet] Chain changed:', newChainId);
      setChainId(newChainId);
      if (fullAddress) {
        getBalance(fullAddress).then(result => {
          setBalance(result.balanceFormatted);
        });
      }
    });

    cleanupRef.current = [unsubAccounts, unsubChain];

    return () => {
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
    };
  }, [fullAddress]);

  useEffect(() => {
    if (!isOnWeb() || !isWalletAvailable()) return;

    const checkExistingConnection = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts && accounts.length > 0) {
            const addr = accounts[0];
            console.log('[Wallet] Found existing connection:', addr);
            setFullAddress(addr);
            setIsConnected(true);
            setWalletType(getDetectedWalletName() as WalletType ?? 'Browser Wallet');

            const chainHex = await window.ethereum.request({ method: 'eth_chainId' }) as string;
            setChainId(parseInt(chainHex, 16));

            Sentry.setUser({ id: addr });
            mixpanel.identify(addr);

            const result = await getBalance(addr);
            setBalance(result.balanceFormatted);
          }
        }
      } catch (err) {
        console.log('[Wallet] No existing connection found:', err);
      }
    };

    checkExistingConnection();
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
    setConnectionError(null);
    setIsConnecting(true);

    try {
      if (!isWalletAvailable()) {
        const msg = 'No wallet detected. Please install MetaMask (metamask.io) to connect your wallet.';
        console.warn('[Wallet]', msg);
        setConnectionError(msg);
        if (typeof window !== 'undefined') {
          alert(msg);
        }
        return;
      }

      console.log('[Wallet] Using real browser wallet connection');

      const result = await connectBrowserWallet();
      const addr = result.address;

      setIsConnected(true);
      setWalletType(type);
      setFullAddress(addr);
      setChainId(result.chainId);

      Sentry.setUser({ id: addr });
      Sentry.addBreadcrumb({
        category: 'wallet',
        message: 'wallet_connected',
        data: { walletType: type, address: addr, chainId: result.chainId },
        level: 'info',
      });

      mixpanel.identify(addr);
      mixpanel.setProfile({
        wallet_address: addr,
        platform: Platform.OS,
        wallet_type: type,
      });
      mixpanel.trackWalletConnected(addr);

      const balanceResult = await getBalance(addr);
      setBalance(balanceResult.balanceFormatted);
      console.log(`[Wallet] Real balance: ${balanceResult.balanceFormatted} MATIC`);

      if (result.chainId !== 80002 && result.chainId !== 137) {
        console.log('[Wallet] Not on Polygon, attempting switch...');
        try {
          await switchToPolygonAmoy();
        } catch (switchErr) {
          console.warn('[Wallet] Could not auto-switch network:', switchErr);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      console.error('[Wallet] Connection error:', message);
      setConnectionError(message);
      Sentry.captureException(err, { tags: { action: 'wallet_connect', walletType: type } });
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    console.log('[Wallet] Disconnecting...');
    mixpanel.trackWalletDisconnected();

    if (isOnWeb()) {
      await disconnectBrowserWallet();
    }

    setIsConnected(false);
    setWalletType(null);
    setFullAddress('');
    setBalance('0');
    setChainId(null);
    setConnectionError(null);
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
    isConnecting,
    connectionError,
    hasInjectedWallet,
    detectedWalletName,
    chainId,
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
