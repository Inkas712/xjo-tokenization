import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { demoAssets } from '@/mocks/demo-data';
import { assetTypeIcons } from '@/constants/assetIcons';
import { useUser } from '@/contexts/UserContext';
import { useCrypto } from '@/contexts/CryptoContext';
import { useQuery } from '@tanstack/react-query';
import { fetchStockChartData } from '@/services/alphavantage';

type TimeRange = '1D' | '7D' | '1M' | '1Y';

export default function AssetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isBalanceVisible } = useUser();
  const { cryptoPrices, stockPrices, useChartData } = useCrypto();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1D');

  const baseAsset = demoAssets.find(a => a.id === id);

  const getRangeDays = (range: TimeRange): number => {
    switch (range) {
      case '1D': return 1;
      case '7D': return 7;
      case '1M': return 30;
      case '1Y': return 365;
      default: return 1;
    }
  };

  const cryptoChartQuery = useChartData(
    baseAsset?.type === 'crypto' ? baseAsset.currency : '',
    getRangeDays(selectedRange)
  );

  const getStockInterval = (range: TimeRange): 'daily' | 'weekly' | 'monthly' => {
    switch (range) {
      case '1D': return 'daily';
      case '7D': return 'daily';
      case '1M': return 'daily';
      case '1Y': return 'weekly';
      default: return 'daily';
    }
  };

  const stockChartQuery = useQuery({
    queryKey: ['stockChart', baseAsset?.currency, selectedRange],
    queryFn: () => fetchStockChartData(baseAsset?.currency || '', getStockInterval(selectedRange)),
    enabled: baseAsset?.type === 'shares' && !!baseAsset.currency,
    staleTime: 300000,
  });

  const asset = useMemo(() => {
    if (!baseAsset) return null;
    if (baseAsset.type === 'crypto' && cryptoPrices[baseAsset.currency]) {
      const cryptoPrice = cryptoPrices[baseAsset.currency];
      return {
        ...baseAsset,
        value: baseAsset.balance * cryptoPrice.current_price,
        change24h: cryptoPrice.price_change_percentage_24h,
      };
    }
    if (baseAsset.type === 'shares' && stockPrices[baseAsset.currency]) {
      const stockPrice = stockPrices[baseAsset.currency];
      return {
        ...baseAsset,
        value: baseAsset.balance * stockPrice.price,
        change24h: stockPrice.changePercent,
      };
    }
    return baseAsset;
  }, [baseAsset, cryptoPrices, stockPrices]);

  const chartData = useMemo(() => {
    if (asset?.type === 'crypto' && cryptoChartQuery.data) {
      const data = cryptoChartQuery.data;
      const rangeMap = { '1D': 24, '7D': 168, '1M': 30, '1Y': 365 };
      const limit = rangeMap[selectedRange];
      const sliced = data.slice(-limit);
      return sliced.map(point => ({ value: point.price, timestamp: point.timestamp }));
    }
    if (asset?.type === 'shares' && stockChartQuery.data) {
      const data = stockChartQuery.data;
      const rangeMap = { '1D': 1, '7D': 7, '1M': 30, '1Y': 252 };
      const limit = rangeMap[selectedRange];
      const sliced = data.slice(-limit);
      return sliced.map(point => ({ value: point.price, timestamp: point.timestamp }));
    }
    switch (selectedRange) {
      case '1D':
        return asset?.chartData1D || [];
      case '7D':
        return asset?.chartData7D || [];
      case '1M':
        return asset?.chartData1M || [];
      case '1Y':
        return asset?.chartData1Y || [];
      default:
        return asset?.chartData1D || [];
    }
  }, [asset, selectedRange, cryptoChartQuery.data, stockChartQuery.data]);

  if (!asset) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Asset not found</Text>
      </SafeAreaView>
    );
  }

  const AssetIcon = assetTypeIcons[asset.type];

  const isLoading = (asset?.type === 'crypto' && cryptoChartQuery.isLoading) || 
                     (asset?.type === 'shares' && stockChartQuery.isLoading);

  const currentPrice = asset?.type === 'crypto' 
    ? cryptoPrices[asset.currency]?.current_price
    : asset?.type === 'shares'
    ? stockPrices[asset.currency]?.price
    : null;

  const priceChange = asset?.change24h;
  const isPositive = (priceChange || 0) >= 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.assetHeader}>
          <View style={[styles.assetIconLarge, { backgroundColor: asset.type === 'crypto' ? Colors.primary + '20' : asset.type === 'shares' ? '#E3F2FD' : '#F5F5F5' }]}>
            <AssetIcon size={32} color={asset.type === 'crypto' ? Colors.primary : Colors.text} />
          </View>
          <Text style={styles.assetName}>{asset.name}</Text>
          <Text style={styles.assetCurrency}>{asset.currency}</Text>
        </View>

        {currentPrice && isBalanceVisible && (
          <View style={styles.priceCard}>
            <Text style={styles.currentPrice}>
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            {priceChange !== undefined && (
              <View style={[styles.priceChangeContainer, { backgroundColor: isPositive ? Colors.success + '20' : Colors.error + '20' }]}>
                {isPositive ? (
                  <TrendingUp size={16} color={Colors.success} />
                ) : (
                  <TrendingDown size={16} color={Colors.error} />
                )}
                <Text style={[styles.priceChangeText, { color: isPositive ? Colors.success : Colors.error }]}>
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </Text>
                <Text style={styles.priceChangeLabel}>24h</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.chartContainer}>
          {isLoading ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading chart data...</Text>
            </View>
          ) : chartData.length > 0 ? (
            <LineChart data={chartData} color={isPositive ? Colors.success : Colors.primary} />
          ) : (
            <View style={styles.chartEmpty}>
              <Text style={styles.emptyText}>No chart data available</Text>
            </View>
          )}
        </View>

        <View style={styles.timeSelector}>
          {(['1D', '7D', '1M', '1Y'] as TimeRange[]).map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeSelectorButton,
                selectedRange === range && styles.timeSelectorButtonActive,
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedRange(range)}
            >
              <Text
                style={[
                  styles.timeSelectorText,
                  selectedRange === range && styles.timeSelectorTextActive,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Your Balance</Text>
            <Text style={styles.statValue}>
              {isBalanceVisible
                ? `${asset.balance.toFixed(asset.type === 'crypto' ? 4 : asset.type === 'shares' ? 0 : 2)} ${asset.currency}`
                : '****'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Value</Text>
            <Text style={styles.statValue}>
              {isBalanceVisible
                ? `${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '****'}
            </Text>
          </View>
        </View>

        {asset.type === 'crypto' && cryptoPrices[asset.currency] && isBalanceVisible && (
          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>24h High</Text>
              <Text style={styles.metricValue}>
                ${cryptoPrices[asset.currency].high_24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>24h Low</Text>
              <Text style={styles.metricValue}>
                ${cryptoPrices[asset.currency].low_24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Market Cap</Text>
              <Text style={styles.metricValue}>
                ${(cryptoPrices[asset.currency].market_cap / 1e9).toFixed(2)}B
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>24h Volume</Text>
              <Text style={styles.metricValue}>
                ${(cryptoPrices[asset.currency].total_volume / 1e9).toFixed(2)}B
              </Text>
            </View>
          </View>
        )}

        {asset.type === 'shares' && stockPrices[asset.currency] && isBalanceVisible && (
          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Day High</Text>
              <Text style={styles.metricValue}>
                ${stockPrices[asset.currency].high.toFixed(2)}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Day Low</Text>
              <Text style={styles.metricValue}>
                ${stockPrices[asset.currency].low.toFixed(2)}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Volume</Text>
              <Text style={styles.metricValue}>
                {(stockPrices[asset.currency].volume / 1e6).toFixed(2)}M
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const LineChart = ({ data, color }: { data: { value: number; timestamp?: number }[]; color: string }) => {
  if (data.length === 0) return null;

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const width = Dimensions.get('window').width - 72;
  const height = 280;
  const padding = 24;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((value - minValue) / range) * (height - padding * 2) - padding;
    return { x, y, value };
  });

  return (
    <View style={{ width, height, position: 'relative' }}>
      <View style={{
        position: 'absolute',
        top: padding,
        left: padding,
        right: padding,
        bottom: padding,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderColor: Colors.border,
        opacity: 0.3,
      }} />
      {points.map((point, index) => {
        if (index === 0) return null;
        const prevPoint = points[index - 1];
        const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x);
        const length = Math.sqrt(
          Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
        );

        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: prevPoint.x,
              top: prevPoint.y,
              width: length,
              height: 3,
              backgroundColor: color,
              transform: [{ rotate: `${angle}rad` }],
              transformOrigin: 'left center',
              borderRadius: 1.5,
            }}
          />
        );
      })}
      {points.map((point, index) => {
        if (index % Math.ceil(points.length / 8) !== 0 && index !== points.length - 1) return null;
        return (
          <View
            key={`point-${index}`}
            style={{
              position: 'absolute',
              left: point.x - 4,
              top: point.y - 4,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: color,
              borderWidth: 2,
              borderColor: Colors.cardBackground,
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  assetHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  assetIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  assetName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  assetBalance: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  assetCurrency: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  priceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceChangeText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  priceChangeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  chartContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  chartLoading: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chartEmpty: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 6,
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeSelectorButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  timeSelectorButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeSelectorText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  timeSelectorTextActive: {
    color: Colors.cardBackground,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  metricsContainer: {
    marginHorizontal: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
});
