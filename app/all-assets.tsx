import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { useCrypto } from '@/contexts/CryptoContext';
import { assetTypeIcons } from '@/constants/assetIcons';
import { demoAssets } from '@/mocks/demo-data';
import { useMemo } from 'react';

export default function AllAssetsScreen() {
  const { isBalanceVisible } = useUser();
  const { cryptoPrices, stockPrices, isCryptoError, isStocksError } = useCrypto();
  const router = useRouter();

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
        if (isCryptoError) {
          return asset;
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
        if (isStocksError) {
          return asset;
        }
      }
      return asset;
    });
  }, [cryptoPrices, stockPrices, isCryptoError, isStocksError]);

  const formatBalance = (value: number) => {
    if (isBalanceVisible) {
      return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return '****';
  };

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
        <Text style={styles.headerTitle}>All Assets</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {assets.map(asset => {
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
            <TouchableOpacity 
              key={asset.id} 
              style={styles.assetCard} 
              activeOpacity={0.7}
              onPress={() => router.push(`/asset-detail?id=${asset.id}`)}
            >
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
});
