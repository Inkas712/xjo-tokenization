const COINGECKO_API_KEY = process.env.EXPO_PUBLIC_COINGECKO_API_KEY;
const BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CoinPrice {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
}

export interface ChartDataPoint {
  timestamp: number;
  price: number;
}

const COIN_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'SOL': 'solana',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'MATIC': 'matic-network',
};

export async function fetchCryptoPrices(coinIds: string[]): Promise<Record<string, CoinPrice> | null> {
  const mappedIds = coinIds.map(id => COIN_ID_MAP[id] || id.toLowerCase()).join(',');
  
  const url = `${BASE_URL}/coins/markets?vs_currency=usd&ids=${mappedIds}&price_change_percentage=24h`;
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  
  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
  }
  
  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error(`Failed to fetch crypto prices: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
  
  const prices: Record<string, CoinPrice> = {};
  data.forEach((coin: any) => {
    const symbol = Object.keys(COIN_ID_MAP).find(key => COIN_ID_MAP[key] === coin.id) || coin.symbol.toUpperCase();
    prices[symbol] = {
      id: coin.id,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      total_volume: coin.total_volume,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
    };
  });
  
    return prices;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return null;
  }
}

export async function fetchChartData(
  coinId: string,
  days: number
): Promise<ChartDataPoint[] | null> {
  const mappedId = COIN_ID_MAP[coinId] || coinId.toLowerCase();
  const url = `${BASE_URL}/coins/${mappedId}/market_chart?vs_currency=usd&days=${days}`;
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  
  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
  }
  
  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error(`Failed to fetch chart data: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.prices || !Array.isArray(data.prices)) {
      console.error('Invalid chart data received');
      return null;
    }
    
    return data.prices.map((point: [number, number]) => ({
      timestamp: point[0],
      price: point[1],
    }));
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return null;
  }
}
