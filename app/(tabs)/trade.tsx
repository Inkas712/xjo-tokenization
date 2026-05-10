import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Info, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import { fetchCryptoPrices, fetchChartData, ChartDataPoint } from '@/services/coingecko';
import { fetchMultipleStocks } from '@/services/alphavantage';

type AssetType = 'crypto' | 'forex' | 'stocks';

interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  type: AssetType;
  complianceLabel: string;
  chartData?: number[];
  isLive?: boolean;
}

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA'];
const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN'];

const forexData: MarketAsset[] = [
  { id: 'forex-1', name: 'EUR/USD', symbol: 'EURUSD', price: 1.0842, change24h: 0.3, type: 'forex', complianceLabel: 'Low Volatility' },
  { id: 'forex-2', name: 'GBP/USD', symbol: 'GBPUSD', price: 1.2654, change24h: -0.5, type: 'forex', complianceLabel: 'Low Volatility' },
  { id: 'forex-3', name: 'USD/JPY', symbol: 'USDJPY', price: 149.85, change24h: 1.1, type: 'forex', complianceLabel: 'Low Volatility' },
  { id: 'forex-4', name: 'AUD/USD', symbol: 'AUDUSD', price: 0.6523, change24h: -0.2, type: 'forex', complianceLabel: 'Low Volatility' },
];

const cryptoMeta: Record<string, { name: string; complianceLabel: string }> = {
  'BTC': { name: 'Bitcoin', complianceLabel: 'High Volatility' },
  'ETH': { name: 'Ethereum', complianceLabel: 'High Volatility' },
  'XRP': { name: 'Ripple', complianceLabel: 'High Volatility' },
  'SOL': { name: 'Solana', complianceLabel: 'High Volatility' },
  'ADA': { name: 'Cardano', complianceLabel: 'High Volatility' },
};

const stockMeta: Record<string, { name: string; complianceLabel: string }> = {
  'AAPL': { name: 'Apple Inc.', complianceLabel: 'Shariah Compliant' },
  'MSFT': { name: 'Microsoft', complianceLabel: 'Shariah Compliant' },
  'TSLA': { name: 'Tesla', complianceLabel: 'Under Review' },
  'GOOGL': { name: 'Alphabet', complianceLabel: 'Shariah Compliant' },
  'AMZN': { name: 'Amazon', complianceLabel: 'Under Review' },
};

const normalizeChartData = (data: ChartDataPoint[] | null): number[] => {
  if (!data || data.length === 0) return [];
  const prices = data.map(d => d.price);
  const step = Math.max(1, Math.floor(prices.length / 12));
  const sampled: number[] = [];
  for (let i = 0; i < prices.length; i += step) {
    sampled.push(prices[i]);
    if (sampled.length >= 12) break;
  }
  return sampled;
};

const generateFallbackSparkline = (trend: number, points: number = 12): number[] => {
  const data: number[] = [];
  let value = 50;
  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.5) * 10 + trend * 0.5;
    data.push(Math.max(0, Math.min(100, value)));
  }
  return data;
};

export default function TradeScreen() {
  const [selectedType, setSelectedType] = useState<AssetType>('crypto');
  const router = useRouter();

  const { data: cryptoPrices, isLoading: cryptoLoading, refetch: refetchCrypto, isRefetching: cryptoRefetching } = useQuery({
    queryKey: ['trade-crypto-prices'],
    queryFn: () => fetchCryptoPrices(CRYPTO_SYMBOLS),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const { data: btcChart } = useQuery({
    queryKey: ['trade-btc-chart'],
    queryFn: () => fetchChartData('BTC', 1),
    staleTime: 60000,
  });

  const { data: ethChart } = useQuery({
    queryKey: ['trade-eth-chart'],
    queryFn: () => fetchChartData('ETH', 1),
    staleTime: 60000,
  });

  const { data: xrpChart } = useQuery({
    queryKey: ['trade-xrp-chart'],
    queryFn: () => fetchChartData('XRP', 1),
    staleTime: 60000,
  });

  const { data: solChart } = useQuery({
    queryKey: ['trade-sol-chart'],
    queryFn: () => fetchChartData('SOL', 1),
    staleTime: 60000,
  });

  const { data: adaChart } = useQuery({
    queryKey: ['trade-ada-chart'],
    queryFn: () => fetchChartData('ADA', 1),
    staleTime: 60000,
  });

  const { data: stockPrices, isLoading: stocksLoading, refetch: refetchStocks, isRefetching: stocksRefetching } = useQuery({
    queryKey: ['trade-stock-prices'],
    queryFn: () => fetchMultipleStocks(STOCK_SYMBOLS),
    staleTime: 60000,
    refetchInterval: 120000,
  });

  const cryptoAssets = useMemo((): MarketAsset[] => {
    const charts: Record<string, ChartDataPoint[] | null | undefined> = {
      'BTC': btcChart,
      'ETH': ethChart,
      'XRP': xrpChart,
      'SOL': solChart,
      'ADA': adaChart,
    };
    
    return CRYPTO_SYMBOLS.map((symbol, index) => {
      const priceData = cryptoPrices?.[symbol];
      const meta = cryptoMeta[symbol];
      const chartData = charts[symbol];
      
      return {
        id: `crypto-${index}`,
        name: meta?.name || symbol,
        symbol,
        price: priceData?.current_price || 0,
        change24h: priceData?.price_change_percentage_24h || 0,
        type: 'crypto' as AssetType,
        complianceLabel: meta?.complianceLabel || 'High Volatility',
        chartData: normalizeChartData(chartData ?? null),
        isLive: !!priceData,
      };
    });
  }, [cryptoPrices, btcChart, ethChart, xrpChart, solChart, adaChart]);

  const stockAssets = useMemo((): MarketAsset[] => {
    return STOCK_SYMBOLS.map((symbol, index) => {
      const priceData = stockPrices?.[symbol];
      const meta = stockMeta[symbol];
      
      return {
        id: `stock-${index}`,
        name: meta?.name || symbol,
        symbol,
        price: priceData?.price || 0,
        change24h: priceData?.changePercent || 0,
        type: 'stocks' as AssetType,
        complianceLabel: meta?.complianceLabel || 'Under Review',
        isLive: !!priceData,
      };
    });
  }, [stockPrices]);

  const types: { id: AssetType; label: string }[] = [
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'stocks', label: 'Stocks' },
  ];

  const filteredAssets = useMemo(() => {
    switch (selectedType) {
      case 'crypto':
        return cryptoAssets;
      case 'forex':
        return forexData;
      case 'stocks':
        return stockAssets;
      default:
        return [];
    }
  }, [selectedType, cryptoAssets, stockAssets]);

  const isLoading = selectedType === 'crypto' ? cryptoLoading : selectedType === 'stocks' ? stocksLoading : false;
  const isRefetching = selectedType === 'crypto' ? cryptoRefetching : selectedType === 'stocks' ? stocksRefetching : false;

  const handleRefresh = useCallback(() => {
    if (selectedType === 'crypto') {
      refetchCrypto();
    } else if (selectedType === 'stocks') {
      refetchStocks();
    }
  }, [selectedType, refetchCrypto, refetchStocks]);

  const handleAssetPress = useCallback((asset: MarketAsset) => {
    if (asset.type === 'crypto') {
      router.push({
        pathname: '/asset-detail',
        params: { symbol: asset.symbol, name: asset.name, type: 'crypto' },
      });
    }
  }, [router]);

  const renderSparkline = (asset: MarketAsset) => {
    const points = asset.chartData && asset.chartData.length > 0 
      ? asset.chartData 
      : generateFallbackSparkline(asset.change24h);
    
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    
    const width = 60;
    const height = 30;
    const padding = 2;

    const chartPoints = points.map((value, index) => {
      const x = (index / (points.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((value - min) / range) * (height - padding * 2) - padding;
      return { x, y };
    });

    const isPositive = asset.change24h >= 0;
    const lineColor = isPositive ? '#10B981' : '#EF4444';

    return (
      <View style={styles.sparklineContainer}>
        {chartPoints.map((point, index) => {
          if (index === 0) return null;
          const prevPoint = chartPoints[index - 1];
          const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x);
          const length = Math.sqrt(
            Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
          );

          return (
            <View
              key={index}
              style={{
                position: 'absolute' as const,
                left: prevPoint.x,
                top: prevPoint.y,
                width: length,
                height: 2,
                backgroundColor: lineColor,
                transform: [{ rotate: `${angle}rad` }],
                transformOrigin: 'left center',
                borderRadius: 1,
              }}
            />
          );
        })}
      </View>
    );
  };

  const formatPrice = (price: number, type: AssetType): string => {
    if (price === 0) return '—';
    if (type === 'forex') {
      return price.toFixed(4);
    }
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (price >= 1) {
      return price.toFixed(2);
    }
    return price.toFixed(4);
  };

  const renderAssetCard = (asset: MarketAsset) => {
    const isPositive = asset.change24h >= 0;
    
    return (
      <TouchableOpacity
        key={asset.id}
        style={styles.assetCard}
        activeOpacity={0.7}
        onPress={() => handleAssetPress(asset)}
      >
        <View style={styles.assetLeft}>
          <View style={[styles.assetIcon, { backgroundColor: isPositive ? '#10B98115' : '#EF444415' }]}>
            <Text style={[styles.assetSymbol, { color: isPositive ? '#10B981' : '#EF4444' }]}>
              {asset.symbol.substring(0, 3)}
            </Text>
          </View>
          <View style={styles.assetInfo}>
            <View style={styles.assetNameRow}>
              <Text style={styles.assetName}>{asset.name}</Text>
              {asset.isLive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                </View>
              )}
            </View>
            <View style={styles.complianceTag}>
              <Text style={styles.complianceText}>{asset.complianceLabel}</Text>
            </View>
          </View>
        </View>

        {renderSparkline(asset)}

        <View style={styles.assetRight}>
          <Text style={styles.assetPrice}>
            {asset.type === 'forex' ? '' : '$'}{formatPrice(asset.price, asset.type)}
          </Text>
          <View style={[
            styles.changeContainer,
            { backgroundColor: isPositive ? '#10B98115' : '#EF444415' }
          ]}>
            {isPositive ? (
              <TrendingUp size={12} color="#10B981" />
            ) : (
              <TrendingDown size={12} color="#EF4444" />
            )}
            <Text style={[
              styles.changeText,
              { color: isPositive ? '#10B981' : '#EF4444' }
            ]}>
              {Math.abs(asset.change24h).toFixed(2)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Markets</Text>
          <Text style={styles.subtitle}>Live price action</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          {isRefetching ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <RefreshCw size={20} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.typesContainer}>
        {types.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.typeButton, selectedType === type.id && styles.typeButtonSelected]}
            onPress={() => setSelectedType(type.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.typeText, selectedType === type.id && styles.typeTextSelected]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedType !== 'forex' && (
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            {(selectedType === 'crypto' ? cryptoPrices : stockPrices) ? (
              <>
                <Wifi size={14} color="#10B981" />
                <Text style={[styles.statusText, { color: '#10B981' }]}>Live</Text>
              </>
            ) : (
              <>
                <WifiOff size={14} color={Colors.textSecondary} />
                <Text style={styles.statusText}>Offline</Text>
              </>
            )}
          </View>
          <Text style={styles.statusText}>
            {selectedType === 'crypto' ? 'CoinGecko' : 'Alpha Vantage'}
          </Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching live prices...</Text>
          </View>
        ) : (
          <>
            {filteredAssets.map(renderAssetCard)}

            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Info size={20} color={Colors.primary} />
                <Text style={styles.infoTitle}>Values-Based Investing</Text>
              </View>
              <Text style={styles.infoText}>
                All assets are evaluated for ethical and Shariah compliance. We prioritize transparency and risk-sharing principles over guaranteed returns.
              </Text>
              <Text style={styles.infoNote}>
                No guaranteed returns • Interest-free principles
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '400' as const,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeButtonSelected: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  typeTextSelected: {
    color: Colors.cardBackground,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  assetCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.border + '60',
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetSymbol: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  assetInfo: {
    flex: 1,
  },
  assetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  liveBadge: {
    padding: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  complianceTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  complianceText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  sparklineContainer: {
    width: 60,
    height: 30,
    marginHorizontal: 12,
  },
  assetRight: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  assetPrice: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  infoCard: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
    marginBottom: 12,
    opacity: 0.85,
  },
  infoNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
