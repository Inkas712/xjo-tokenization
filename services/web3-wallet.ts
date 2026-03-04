import { Platform } from 'react-native';
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatEther,
  type Address,
  type WalletClient,
  type PublicClient,
  type Chain,
} from 'viem';
import * as Sentry from '@sentry/react-native';

const ALCHEMY_RPC = process.env.EXPO_PUBLIC_ALCHEMY_RPC || '';

export const polygonAmoy: Chain = {
  id: 80002,
  name: 'Polygon Amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: { http: [ALCHEMY_RPC || 'https://rpc-amoy.polygon.technology'] },
  },
  blockExplorers: {
    default: { name: 'OKLink', url: 'https://www.oklink.com/amoy' },
  },
  testnet: true,
};

export const polygon: Chain = {
  id: 137,
  name: 'Polygon',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://polygon-rpc.com'] },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  },
};

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export type WalletConnectionResult = {
  address: string;
  chainId: number;
  walletClient: WalletClient;
  publicClient: PublicClient;
};

function getEthereumProvider(): EthereumProvider | null {
  if (Platform.OS !== 'web') return null;
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

export function isWalletAvailable(): boolean {
  return getEthereumProvider() !== null;
}

export function getDetectedWalletName(): string | null {
  const provider = getEthereumProvider();
  if (!provider) return null;
  if (provider.isMetaMask) return 'MetaMask';
  if (provider.isCoinbaseWallet) return 'Coinbase Wallet';
  return 'Browser Wallet';
}

export async function connectBrowserWallet(): Promise<WalletConnectionResult> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
  }

  console.log('[Web3Wallet] Requesting accounts...');

  const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts returned. Please unlock your wallet and try again.');
  }

  const address = accounts[0] as Address;
  console.log('[Web3Wallet] Connected:', address);

  const chainIdHex = await provider.request({ method: 'eth_chainId' }) as string;
  const chainId = parseInt(chainIdHex, 16);
  console.log('[Web3Wallet] Chain ID:', chainId);

  const targetChain = chainId === 137 ? polygon : polygonAmoy;

  const walletClient = createWalletClient({
    account: address,
    chain: targetChain,
    transport: custom(provider),
  });

  const publicClient = createPublicClient({
    chain: targetChain,
    transport: ALCHEMY_RPC ? http(ALCHEMY_RPC) : custom(provider),
  });

  return { address, chainId, walletClient, publicClient };
}

export async function switchToPolygonAmoy(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) return;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x13882' }],
    });
    console.log('[Web3Wallet] Switched to Polygon Amoy');
  } catch (switchError: unknown) {
    const err = switchError as { code?: number };
    if (err.code === 4902) {
      console.log('[Web3Wallet] Adding Polygon Amoy network...');
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x13882',
          chainName: 'Polygon Amoy Testnet',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: [ALCHEMY_RPC || 'https://rpc-amoy.polygon.technology'],
          blockExplorerUrls: ['https://www.oklink.com/amoy'],
        }],
      });
    } else {
      throw switchError;
    }
  }
}

export async function getBalance(address: string): Promise<{ balanceWei: bigint; balanceFormatted: string }> {
  try {
    const publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: ALCHEMY_RPC ? http(ALCHEMY_RPC) : http('https://rpc-amoy.polygon.technology'),
    });

    const balanceWei = await publicClient.getBalance({ address: address as Address });
    const balanceFormatted = formatEther(balanceWei);
    const rounded = parseFloat(balanceFormatted).toFixed(4);
    console.log('[Web3Wallet] Balance:', rounded, 'MATIC');
    return { balanceWei, balanceFormatted: rounded };
  } catch (e) {
    console.error('[Web3Wallet] getBalance error:', e);
    Sentry.captureException(e, { tags: { service: 'web3-wallet', method: 'getBalance' } });
    return { balanceWei: BigInt(0), balanceFormatted: '0.0000' };
  }
}

export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  const provider = getEthereumProvider();
  if (!provider) return () => {};

  const handler = (...args: unknown[]) => {
    callback(args[0] as string[]);
  };
  provider.on('accountsChanged', handler);
  return () => provider.removeListener('accountsChanged', handler);
}

export function onChainChanged(callback: (chainId: number) => void): () => void {
  const provider = getEthereumProvider();
  if (!provider) return () => {};

  const handler = (...args: unknown[]) => {
    callback(parseInt(args[0] as string, 16));
  };
  provider.on('chainChanged', handler);
  return () => provider.removeListener('chainChanged', handler);
}

export async function disconnectBrowserWallet(): Promise<void> {
  console.log('[Web3Wallet] Disconnected (client-side only)');
}

export function isOnWeb(): boolean {
  return Platform.OS === 'web';
}
