import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, QrCode, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { useCrypto } from '@/contexts/CryptoContext';
import { assetTypeIcons } from '@/constants/assetIcons';
import { demoAssets } from '@/mocks/demo-data';

export default function HomeScreen() {
  const { user, isBalanceVisible, toggleBalanceVisibility } = useUser();
  const { cryptoPrices, stockPrices, isCryptoError, isStocksError, isCryptoLoading, isStocksLoading } = useCrypto();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const assets = useMemo(() => {
    return demoAssets.map(asset => {
      if (asset.type === 'crypto') {
        if (cryptoPrices && cryptoPrices[asset.currency]) {
          const cryptoPrice = cryptoPrices[asset.currency];
          return {
            ...asset,
            value: asset.balance * cryptoPrice.current_price,
            change24h: cryptoPrice.price_change_percentage_24h,
          };
        }
      }
      if (asset.type === 'shares') {
        if (stockPrices && stockPrices[asset.currency]) {
          const stockPrice = stockPrices[asset.currency];
          return {
            ...asset,
            value: asset.balance * stockPrice.price,
            change24h: stockPrice.changePercent,
          };
        }
      }
      return asset;
    });
  }, [cryptoPrices, stockPrices]);

  const totalBalance = assets.reduce((sum, asset) => sum + asset.value, 0);

  const formatBalance = (value: number) => {
    if (isBalanceVisible) {
      return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return '****';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'}</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Search size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton} 
              activeOpacity={0.7}
              onPress={() => router.push('/qr-entry')}
            >
              <QrCode size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Send by nickname or card number"
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <TouchableOpacity onPress={toggleBalanceVisibility} activeOpacity={0.7}>
              {isBalanceVisible ? (
                <Eye size={20} color={Colors.cardBackground} opacity={0.9} />
              ) : (
                <EyeOff size={20} color={Colors.cardBackground} opacity={0.9} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>{formatBalance(totalBalance)}</Text>
          <Text style={styles.balanceSubtext}>Total Assets</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Assets</Text>
          {(isCryptoLoading || isStocksLoading) && assets.length === 0 ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading market data...</Text>
            </View>
          ) : (isCryptoError || isStocksError) && Object.keys(cryptoPrices).length === 0 && Object.keys(stockPrices).length === 0 ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>Unable to load market data</Text>
              <Text style={styles.errorSubtext}>Using offline data. Pull to refresh.</Text>
            </View>
          ) : null}
          {assets.slice(0, 1).map(asset => {
            const AssetIcon = assetTypeIcons[asset.type];
            const getBackgroundColor = () => {
              switch (asset.type) {
                case 'crypto':
                  return Colors.primary + '20';
                case 'shares':
                  return '#E3F2FD';
                default:
                  return '#F5F5F5';
              }
            };
            
            return (
              <TouchableOpacity key={asset.id} style={styles.assetCard} activeOpacity={0.7}>
                <View style={[styles.assetIcon, { backgroundColor: getBackgroundColor() }]}>
                  <AssetIcon size={20} color={asset.type === 'crypto' ? Colors.primary : Colors.text} />
                </View>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetBalance}>
                    {isBalanceVisible
                      ? `${asset.balance.toFixed(asset.type === 'crypto' ? 4 : asset.type === 'shares' ? 0 : 2)} ${asset.currency}`
                      : '****'}
                  </Text>
                </View>
                <View style={styles.assetValueContainer}>
                  <Text style={styles.assetValue}>{formatBalance(asset.value)}</Text>
                  {asset.change24h !== undefined && isBalanceVisible && (
                    <View style={styles.changeContainer}>
                      {asset.change24h > 0 ? (
                        <TrendingUp size={12} color={Colors.success} />
                      ) : (
                        <TrendingDown size={12} color={Colors.error} />
                      )}
                      <Text style={[styles.changeText, { color: asset.change24h > 0 ? Colors.success : Colors.error }]}>
                        {Math.abs(asset.change24h)}%
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          
          <TouchableOpacity 
            style={styles.viewAllButton} 
            activeOpacity={0.7}
            onPress={() => router.push('/all-assets')}
          >
            <Text style={styles.viewAllButtonText}>View all assets</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartsSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartsScrollContent}
          >
            {assets.map(asset => {
              const AssetIcon = assetTypeIcons[asset.type];
              const chartData = asset.chartData || [];
              
              return (
                <TouchableOpacity
                  key={asset.id}
                  style={styles.chartCard}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/asset-detail?id=${asset.id}`)}
                >
                  <View style={styles.chartCardHeader}>
                    <View style={[styles.chartCardIcon, { backgroundColor: asset.type === 'crypto' ? Colors.primary + '20' : asset.type === 'shares' ? '#E3F2FD' : '#F5F5F5' }]}>
                      <AssetIcon size={18} color={asset.type === 'crypto' ? Colors.primary : Colors.text} />
                    </View>
                    <Text style={styles.chartCardName}>{asset.name}</Text>
                  </View>
                  
                  <View style={styles.sparklineContainer}>
                    <Sparkline data={chartData} color={Colors.primary} />
                  </View>
                  
                  <Text style={styles.chartCardBalance}>
                    {isBalanceVisible
                      ? `${asset.balance.toFixed(asset.type === 'crypto' ? 4 : asset.type === 'shares' ? 0 : 2)} ${asset.currency}`
                      : '****'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Sparkline = ({ data, color }: { data: { value: number }[]; color: string }) => {
  if (data.length === 0) return null;
  
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  
  const width = 120;
  const height = 40;
  const padding = 2;
  
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((value - minValue) / range) * (height - padding * 2) - padding;
    return { x, y };
  });
  
  return (
    <View style={{ width, height }}>
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
              height: 2,
              backgroundColor: color,
              transform: [{ rotate: `${angle}rad` }],
              transformOrigin: 'left center',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.cardBackground,
    opacity: 0.9,
    fontWeight: '500' as const,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700' as const,
    color: Colors.cardBackground,
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: Colors.cardBackground,
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  assetBalance: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  assetValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  assetValueContainer: {
    alignItems: 'flex-end',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  viewAllButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  chartsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  chartsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  chartCard: {
    width: 160,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  chartCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  chartCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCardName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  sparklineContainer: {
    marginBottom: 12,
  },
  chartCardBalance: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  loadingCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 40,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorCard: {
    backgroundColor: Colors.error + '15',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.error,
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
