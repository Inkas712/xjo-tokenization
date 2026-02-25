import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import Svg, { Rect, Text as SvgText, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Colors from '@/constants/colors';
import {
  analyticsVolumeByMonth,
  analyticsVolumeByCategory,
  topAssetsByVolume,
  recentSalesTicker,
} from '@/mocks/extended';

type TrendPeriod = '24h' | '7d' | '30d';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('7d');
  const tickerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      tickerAnim.setValue(0);
      Animated.timing(tickerAnim, {
        toValue: -1200,
        duration: 20000,
        useNativeDriver: true,
      }).start(() => animate());
    };
    animate();
    return () => tickerAnim.stopAnimation();
  }, [tickerAnim]);

  const maxVol = Math.max(...analyticsVolumeByMonth.map(v => v.volume));
  const maxCatVol = Math.max(...analyticsVolumeByCategory.map(v => v.volume));

  const volumePoints = analyticsVolumeByMonth.map((v, i) => ({
    x: 30 + (i / (analyticsVolumeByMonth.length - 1)) * 280,
    y: 20 + 120 - (v.volume / maxVol) * 120,
  }));

  let linePath = `M ${volumePoints[0].x} ${volumePoints[0].y}`;
  for (let i = 1; i < volumePoints.length; i++) {
    const cp1x = volumePoints[i - 1].x + (volumePoints[i].x - volumePoints[i - 1].x) / 3;
    const cp2x = volumePoints[i].x - (volumePoints[i].x - volumePoints[i - 1].x) / 3;
    linePath += ` C ${cp1x} ${volumePoints[i - 1].y}, ${cp2x} ${volumePoints[i].y}, ${volumePoints[i].x} ${volumePoints[i].y}`;
  }
  const areaPath = linePath + ` L ${volumePoints[volumePoints.length - 1].x} 140 L ${volumePoints[0].x} 140 Z`;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Market Analytics</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tickerContainer}>
          <Animated.View style={[styles.tickerRow, { transform: [{ translateX: tickerAnim }] }]}>
            {[...recentSalesTicker, ...recentSalesTicker].map((sale, i) => (
              <View key={`${sale.asset}-${i}`} style={styles.tickerItem}>
                <Text style={styles.tickerAsset}>{sale.asset}</Text>
                <Text style={styles.tickerPrice}>{sale.price}</Text>
                <Text style={styles.tickerTime}>{sale.time}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Volume (6mo)</Text>
          <View style={styles.chartCard}>
            <Svg width={320} height={180}>
              <Defs>
                <LinearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={Colors.accent} stopOpacity="0.3" />
                  <Stop offset="100%" stopColor={Colors.accent} stopOpacity="0.02" />
                </LinearGradient>
              </Defs>
              <Path d={areaPath} fill="url(#volGrad)" />
              <Path d={linePath} stroke={Colors.accent} strokeWidth={2.5} fill="none" strokeLinecap="round" />
              {volumePoints.map((p, i) => (
                <React.Fragment key={i}>
                  <Circle cx={p.x} cy={p.y} r={4} fill={Colors.white} stroke={Colors.accent} strokeWidth={2} />
                  <SvgText x={p.x} y={165} textAnchor="middle" fontSize={10} fill={Colors.textTertiary}>
                    {analyticsVolumeByMonth[i].month}
                  </SvgText>
                </React.Fragment>
              ))}
            </Svg>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volume by Category</Text>
          <View style={styles.chartCard}>
            <Svg width={320} height={200}>
              {analyticsVolumeByCategory.map((cat, i) => {
                const barH = (cat.volume / maxCatVol) * 130;
                const x = 20 + i * 62;
                const colors = ['#7AB648', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];
                return (
                  <React.Fragment key={cat.category}>
                    <Rect x={x} y={150 - barH} width={42} height={barH} rx={6} fill={colors[i]} opacity={0.85} />
                    <SvgText x={x + 21} y={175} textAnchor="middle" fontSize={9} fill={Colors.textTertiary}>
                      {cat.category.length > 6 ? cat.category.slice(0, 6) : cat.category}
                    </SvgText>
                    <SvgText x={x + 21} y={145 - barH} textAnchor="middle" fontSize={9} fill={colors[i]} fontWeight="bold">
                      ${(cat.volume / 1000).toFixed(1)}K
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Trending Assets</Text>
            <View style={styles.periodTabs}>
              {(['24h', '7d', '30d'] as TrendPeriod[]).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodTab, trendPeriod === p && styles.periodTabActive]}
                  onPress={() => setTrendPeriod(p)}
                >
                  <Text style={[styles.periodText, trendPeriod === p && styles.periodTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Asset</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' as const }]}>Volume</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' as const }]}>Change</Text>
            </View>
            {topAssetsByVolume.map(asset => (
              <View key={asset.rank} style={styles.tableRow}>
                <Text style={[styles.rankText, asset.rank <= 3 && styles.rankTop]}>{asset.rank}</Text>
                <Text style={styles.assetNameText} numberOfLines={1}>{asset.name}</Text>
                <Text style={styles.volumeText}>{asset.volume.toFixed(1)}</Text>
                <View style={styles.changeCell}>
                  {asset.change >= 0 ? (
                    <TrendingUp size={12} color={Colors.success} />
                  ) : (
                    <TrendingDown size={12} color={Colors.error} />
                  )}
                  <Text style={[styles.changeText, { color: asset.change >= 0 ? Colors.success : Colors.error }]}>
                    {asset.change >= 0 ? '+' : ''}{asset.change}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  tickerContainer: { height: 36, overflow: 'hidden', backgroundColor: '#E8F5E2', marginHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  tickerRow: { flexDirection: 'row', alignItems: 'center' },
  tickerItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16 },
  tickerAsset: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary },
  tickerPrice: { fontSize: 11, fontWeight: '700', color: Colors.accent },
  tickerTime: { fontSize: 9, color: Colors.textTertiary },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  periodTabs: { flexDirection: 'row', gap: 4 },
  periodTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  periodTabActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  periodText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  periodTextActive: { color: Colors.white },
  tableCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  tableHeaderText: { fontSize: 11, fontWeight: '600', color: Colors.textTertiary },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  rankText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, width: 28 },
  rankTop: { color: Colors.accent },
  assetNameText: { flex: 2, fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  volumeText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary, textAlign: 'right' },
  changeCell: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  changeText: { fontSize: 12, fontWeight: '600' },
});
