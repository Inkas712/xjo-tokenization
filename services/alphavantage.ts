const ALPHAVANTAGE_API_KEY = process.env.EXPO_PUBLIC_ALPHAVANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

export interface StockChartDataPoint {
  timestamp: number;
  price: number;
}

export async function fetchStockPrice(symbol: string): Promise<StockQuote | null> {
  if (!ALPHAVANTAGE_API_KEY) {
    console.error('AlphaVantage API key not configured');
    return null;
  }

  const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stock price: ${response.statusText}`);
    }
    
    const data = await response.json();
    const quote = data['Global Quote'];
    
    if (!quote || Object.keys(quote).length === 0) {
      console.error(`No data available for symbol: ${symbol}`);
      return null;
    }
    
    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume']),
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

export async function fetchStockChartData(
  symbol: string,
  interval: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<StockChartDataPoint[] | null> {
  if (!ALPHAVANTAGE_API_KEY) {
    console.error('AlphaVantage API key not configured');
    return null;
  }

  const functionMap = {
    daily: 'TIME_SERIES_DAILY',
    weekly: 'TIME_SERIES_WEEKLY',
    monthly: 'TIME_SERIES_MONTHLY',
  };

  const url = `${BASE_URL}?function=${functionMap[interval]}&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stock chart data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const timeSeriesKey = interval === 'daily' 
      ? 'Time Series (Daily)' 
      : interval === 'weekly'
      ? 'Weekly Time Series'
      : 'Monthly Time Series';
    
    const timeSeries = data[timeSeriesKey];
    
    if (!timeSeries) {
      console.error(`No chart data available for symbol: ${symbol}`);
      return null;
    }
    
    const chartData: StockChartDataPoint[] = [];
    
    for (const [date, values] of Object.entries(timeSeries)) {
      const timestamp = new Date(date).getTime();
      const price = parseFloat((values as any)['4. close']);
      chartData.push({ timestamp, price });
    }
    
    return chartData.reverse();
  } catch (error) {
    console.error(`Error fetching stock chart data for ${symbol}:`, error);
    return null;
  }
}

export async function fetchMultipleStocks(symbols: string[]): Promise<Record<string, StockQuote>> {
  const results: Record<string, StockQuote> = {};
  
  for (const symbol of symbols) {
    const quote = await fetchStockPrice(symbol);
    if (quote) {
      results[symbol] = quote;
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return results;
}
