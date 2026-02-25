import * as Sentry from '@sentry/react-native';

const ALCHEMY_RPC = process.env.EXPO_PUBLIC_ALCHEMY_RPC;

export interface AlchemyNft {
  contract: { address: string };
  tokenId: string;
  tokenType: string;
  title: string;
  description: string;
  tokenUri?: { raw: string; gateway: string };
  media?: { raw: string; gateway: string; thumbnail?: string }[];
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: { trait_type: string; value: string }[];
  };
}

export interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

export interface EthBalanceResult {
  balance: string;
  balanceEth: number;
}

export interface AlchemyConnectionTest {
  configured: boolean;
  connected: boolean;
  blockNumber?: number;
  ethPrice?: number;
  latencyMs?: number;
  error?: string;
}

export const getWalletBalance = async (address: string): Promise<string> => {
  if (!address || address.length < 10 || !ALCHEMY_RPC) return '0.0000';
  try {
    const res = await fetch(ALCHEMY_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }),
    });
    if (!res.ok) {
      console.warn('[Alchemy] getWalletBalance HTTP error:', res.status);
      return '0.0000';
    }
    const json = await res.json();
    if (!json || json.error || !json.result) {
      console.warn('[Alchemy] getWalletBalance RPC returned no result');
      return '0.0000';
    }
    const eth = Number(BigInt(json.result)) / 1e18;
    return eth.toFixed(4);
  } catch (e: unknown) {
    console.warn('[Alchemy] getWalletBalance failed:', e instanceof Error ? e.message : String(e));
    Sentry.captureException(e, { tags: { service: 'alchemy', method: 'getWalletBalance' } });
    return '0.0000';
  }
};

export const getEthPrice = async (): Promise<number> => {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd'
    );
    if (!res.ok) return 0.85;
    const json = await res.json();
    return json?.['matic-network']?.usd || 0.85;
  } catch (e: unknown) {
    Sentry.captureException(e, { tags: { service: 'alchemy', method: 'getEthPrice' } });
    return 0.85;
  }
};

export const getBlockNumber = async (): Promise<number> => {
  if (!ALCHEMY_RPC) return 0;
  try {
    const res = await fetch(ALCHEMY_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: [],
      }),
    });
    if (!res.ok) return 0;
    const json = await res.json();
    if (!json || json.error || !json.result) return 0;
    return parseInt(json.result, 16) || 0;
  } catch (e: unknown) {
    Sentry.captureException(e, { tags: { service: 'alchemy', method: 'getBlockNumber' } });
    return 0;
  }
};

export const getEthBalance = async (address: string): Promise<EthBalanceResult> => {
  if (!address || !ALCHEMY_RPC) return { balance: '0x0', balanceEth: 0 };
  try {
    const balanceStr = await getWalletBalance(address);
    const balanceEth = parseFloat(balanceStr) || 0;
    return { balance: '0x0', balanceEth };
  } catch {
    return { balance: '0x0', balanceEth: 0 };
  }
};

export const getNFTsForOwner = async (ownerAddress: string): Promise<AlchemyNft[]> => {
  if (!ALCHEMY_RPC || !ownerAddress) return [];
  try {
    const baseUrl = ALCHEMY_RPC.replace('/v2/', '/nft/v3/');
    const url = `${baseUrl}/getNFTsForOwner?owner=${ownerAddress}&withMetadata=true&pageSize=100`;
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.ownedNfts || [];
  } catch {
    return [];
  }
};

export const testAlchemyConnection = async (): Promise<AlchemyConnectionTest> => {
  if (!ALCHEMY_RPC) {
    return { configured: false, connected: false, error: 'API key not set' };
  }
  try {
    const start = Date.now();
    const blockNumber = await getBlockNumber();
    const latencyMs = Date.now() - start;
    if (!blockNumber) {
      return { configured: true, connected: false, latencyMs, error: 'Failed to get block number' };
    }
    let ethPrice = 0.85;
    try { ethPrice = await getEthPrice(); } catch {}
    return { configured: true, connected: true, blockNumber, ethPrice, latencyMs };
  } catch {
    return { configured: true, connected: false, error: 'Connection failed' };
  }
};

export const isAlchemyConfigured = (): boolean => !!ALCHEMY_RPC;
