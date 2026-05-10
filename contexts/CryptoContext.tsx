import { useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery } from '@tanstack/react-query';
import { fetchCryptoPrices, fetchChartData, CoinPrice } from '@/services/coingecko';
import { fetchMultipleStocks, StockQuote } from '@/services/alphavantage';
import { fetchWalletBalance, fetchWalletTransactions } from '@/services/moralis';

const DEFAULT_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

export const [CryptoProvider, useCrypto] = createContextHook(() => {
  const [walletAddress, setWalletAddress] = useState<string>(DEFAULT_WALLET_ADDRESS);
  const cryptoPricesQuery = useQuery({
    queryKey: ['cryptoPrices'],
    queryFn: () => fetchCryptoPrices(['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'XRP', 'SOL']),
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 2,
  });

  const stockPricesQuery = useQuery({
    queryKey: ['stockPrices'],
    queryFn: () => fetchMultipleStocks(['AAPL', 'MSFT', 'GOOGL', 'TSLA']),
    refetchInterval: 300000,
    staleTime: 60000,
    retry: 2,
  });

  const walletBalanceQuery = useQuery({
    queryKey: ['walletBalance', walletAddress],
    queryFn: () => fetchWalletBalance(walletAddress, 'eth'),
    refetchInterval: 120000,
    staleTime: 60000,
    retry: 2,
    enabled: !!walletAddress,
  });

  const walletTransactionsQuery = useQuery({
    queryKey: ['walletTransactions', walletAddress],
    queryFn: () => fetchWalletTransactions(walletAddress, 'eth', 20),
    refetchInterval: 180000,
    staleTime: 120000,
    retry: 2,
    enabled: !!walletAddress,
  });

  const getCryptoPrice = (symbol: string): CoinPrice | null => {
    return cryptoPricesQuery.data?.[symbol] || null;
  };

  const getStockPrice = (symbol: string): StockQuote | null => {
    return stockPricesQuery.data?.[symbol] || null;
  };

  const useChartData = (symbol: string, days: number) => {
    return useQuery({
      queryKey: ['chartData', symbol, days],
      queryFn: () => fetchChartData(symbol, days),
      enabled: !!symbol,
      staleTime: 300000,
    });
  };

  const updateWalletAddress = (address: string) => {
    setWalletAddress(address);
  };

  const refreshWallet = async () => {
    await Promise.all([
      walletBalanceQuery.refetch(),
      walletTransactionsQuery.refetch(),
    ]);
  };

  return {
    cryptoPrices: cryptoPricesQuery.data || {},
    stockPrices: stockPricesQuery.data || {},
    walletBalance: walletBalanceQuery.data || null,
    walletTransactions: walletTransactionsQuery.data || [],
    walletAddress,
    isLoading: cryptoPricesQuery.isLoading || stockPricesQuery.isLoading || walletBalanceQuery.isLoading,
    isError: cryptoPricesQuery.isError || stockPricesQuery.isError || walletBalanceQuery.isError,
    isCryptoLoading: cryptoPricesQuery.isLoading,
    isStocksLoading: stockPricesQuery.isLoading,
    isWalletLoading: walletBalanceQuery.isLoading,
    isCryptoError: cryptoPricesQuery.isError,
    isStocksError: stockPricesQuery.isError,
    isWalletError: walletBalanceQuery.isError,
    getCryptoPrice,
    getStockPrice,
    useChartData,
    updateWalletAddress,
    refreshWallet,
  };
});
