import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Heart, Eye, BadgeCheck, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { Asset } from '@/mocks/assets';
import { AuctionTimer } from './AuctionTimer';

interface AssetCardProps {
  asset: Asset;
  compact?: boolean;
}

function AssetCardComponent({ asset, compact = false }: AssetCardProps) {
  const router = useRouter();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    console.log('[AssetCard] Navigating to asset:', asset.id);
    router.push(`/asset/${asset.id}` as any);
  }, [asset.id, router]);

  const statusColor = asset.status === 'Auction' ? Colors.bid : asset.status === 'New' ? Colors.warning : Colors.accent;

  const isVerified = useMemo(() => {
    const verifiedIds = ['1', '2', '3', '5', '7', '11', '13', '14'];
    return verifiedIds.includes(asset.id);
  }, [asset.id]);

  const auctionEndTime = useMemo(() => {
    if (asset.saleType !== 'auction') return null;
    const end = new Date();
    const hoursToAdd = parseInt(asset.id) * 7 + 12;
    end.setHours(end.getHours() + hoursToAdd);
    return end;
  }, [asset.saleType, asset.id]);

  const reserveMet = useMemo(() => {
    if (asset.saleType !== 'auction') return null;
    return asset.bids.length > 0 && asset.bids[0].amount > asset.price * 0.8;
  }, [asset.saleType, asset.bids, asset.price]);

  return (
    <Animated.View style={[styles.container, compact && styles.compactContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        testID={`asset-card-${asset.id}`}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: asset.image }} style={[styles.image, compact && styles.compactImage]} contentFit="cover" />
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{asset.status}</Text>
          </View>
          <View style={styles.chainBadge}>
            <View style={[styles.chainDot, { backgroundColor: asset.blockchain === 'Ethereum' ? Colors.ethereum : Colors.polygon }]} />
            <Text style={styles.chainText}>{asset.blockchain}</Text>
          </View>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <BadgeCheck size={14} color={Colors.verified} />
            </View>
          )}
          {asset.saleType === 'auction' && auctionEndTime && (
            <View style={styles.timerBadge}>
              <Clock size={10} color={Colors.bid} />
              <AuctionTimer endTime={auctionEndTime} compact />
            </View>
          )}
          {reserveMet !== null && (
            <View style={[styles.reserveBadge, { backgroundColor: reserveMet ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)' }]}>
              <Text style={styles.reserveText}>{reserveMet ? 'Reserve Met' : 'Reserve Not Met'}</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{asset.name}</Text>
            {isVerified && <BadgeCheck size={12} color={Colors.verified} />}
          </View>
          <View style={styles.ownerRow}>
            <Image source={{ uri: asset.owner.avatar }} style={styles.avatar} />
            <Text style={styles.ownerName} numberOfLines={1}>{asset.owner.name}</Text>
          </View>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>{asset.price} ETH</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Heart size={12} color={Colors.textTertiary} />
                <Text style={styles.statText}>{asset.favorites}</Text>
              </View>
              <View style={styles.statItem}>
                <Eye size={12} color={Colors.textTertiary} />
                <Text style={styles.statText}>{asset.views}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export const AssetCard = React.memo(AssetCardComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    flex: 1,
    margin: 6,
  },
  compactContainer: {
    maxWidth: 200,
  },
  imageWrapper: {
    position: 'relative' as const,
  },
  image: {
    width: '100%' as const,
    height: 160,
  },
  compactImage: {
    height: 130,
  },
  statusBadge: {
    position: 'absolute' as const,
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  chainBadge: {
    position: 'absolute' as const,
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  chainDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chainText: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    position: 'absolute' as const,
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  timerBadge: {
    position: 'absolute' as const,
    bottom: 10,
    left: 10,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reserveBadge: {
    position: 'absolute' as const,
    bottom: 38,
    left: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reserveText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '700' as const,
  },
  info: {
    padding: 12,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    flex: 1,
  },
  ownerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  ownerName: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginBottom: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  statsRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  statItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 3,
  },
  statText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
});
