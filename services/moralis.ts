const MORALIS_API_KEY = process.env.EXPO_PUBLIC_MORALIS_API_KEY;
const BASE_URL = 'https://deep-index.moralis.io/api/v2.2';

export interface WalletBalance {
  token_address: string;
  name: string;
  symbol: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  possible_spam: boolean;
  verified_contract: boolean;
  balance_formatted: string;
  usd_price?: number;
  usd_value?: number;
  usd_price_24hr_percent_change?: number;
}

export interface NativeBalance {
  balance: string;
  balance_formatted: string;
  usd_price?: number;
  usd_value?: number;
}

export interface Transaction {
  hash: string;
  from_address: string;
  to_address: string;
  value: string;
  gas: string;
  gas_price: string;
  block_timestamp: string;
  block_number: string;
  transaction_fee?: string;
}

export async function fetchWalletBalance(
  walletAddress: string,
  chain: string = 'eth'
): Promise<{ native: NativeBalance; tokens: WalletBalance[] } | null> {
  if (!MORALIS_API_KEY) {
    console.error('Moralis API key not configured');
    return null;
  }

  try {
    const headers = {
      'Accept': 'application/json',
      'X-API-Key': MORALIS_API_KEY,
    };

    const nativeResponse = await fetch(
      `${BASE_URL}/${walletAddress}/balance?chain=${chain}`,
      { headers }
    );

    const tokensResponse = await fetch(
      `${BASE_URL}/${walletAddress}/erc20?chain=${chain}`,
      { headers }
    );

    if (!nativeResponse.ok || !tokensResponse.ok) {
      console.error('Failed to fetch wallet data');
      return null;
    }

    const nativeData = await nativeResponse.json();
    const tokensData = await tokensResponse.json();

    const nativeBalance: NativeBalance = {
      balance: nativeData.balance || '0',
      balance_formatted: (parseFloat(nativeData.balance || '0') / 1e18).toFixed(8),
      usd_price: 0,
      usd_value: 0,
    };

    const tokens: WalletBalance[] = tokensData
      .filter((token: any) => !token.possible_spam)
      .map((token: any) => ({
        token_address: token.token_address,
        name: token.name,
        symbol: token.symbol,
        logo: token.logo,
        thumbnail: token.thumbnail,
        decimals: token.decimals,
        balance: token.balance,
        possible_spam: token.possible_spam || false,
        verified_contract: token.verified_contract || false,
        balance_formatted: (parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(8),
        usd_price: token.usd_price,
        usd_value: token.usd_value,
        usd_price_24hr_percent_change: token.usd_price_24hr_percent_change,
      }));

    return { native: nativeBalance, tokens };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return null;
  }
}

export async function fetchWalletTransactions(
  walletAddress: string,
  chain: string = 'eth',
  limit: number = 20
): Promise<Transaction[]> {
  if (!MORALIS_API_KEY) {
    console.error('Moralis API key not configured');
    return [];
  }

  try {
    const headers = {
      'Accept': 'application/json',
      'X-API-Key': MORALIS_API_KEY,
    };

    const response = await fetch(
      `${BASE_URL}/${walletAddress}?chain=${chain}&limit=${limit}`,
      { headers }
    );

    if (!response.ok) {
      console.error('Failed to fetch transactions');
      return [];
    }

    const data = await response.json();

    return data.result?.map((tx: any) => ({
      hash: tx.hash,
      from_address: tx.from_address,
      to_address: tx.to_address,
      value: tx.value,
      gas: tx.gas,
      gas_price: tx.gas_price,
      block_timestamp: tx.block_timestamp,
      block_number: tx.block_number,
      transaction_fee: tx.receipt_gas_used 
        ? (parseFloat(tx.receipt_gas_used) * parseFloat(tx.gas_price) / 1e18).toFixed(8)
        : undefined,
    })) || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function fetchMultipleWallets(
  walletAddresses: string[],
  chain: string = 'eth'
): Promise<Record<string, { native: NativeBalance; tokens: WalletBalance[] }>> {
  const results: Record<string, { native: NativeBalance; tokens: WalletBalance[] }> = {};

  for (const address of walletAddresses) {
    const data = await fetchWalletBalance(address, chain);
    if (data) {
      results[address] = data;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}
