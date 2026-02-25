import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Package,
  Tag,
  DollarSign,
  Percent,
  ChevronRight,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { assets } from '@/mocks/assets';
import { useAssetsQuery } from '@/hooks/useAssets';
import { PriceChart } from '@/components/PriceChart';
import { portfolioValueHistory, royaltyData, royaltyMonthly } from '@/mocks/extended';
import { riskFactors, riskRecommendations, riskScoreHistory } from '@/mocks/premium';
import Svg, { Rect, Text as SvgText, Circle } from 'react-native-svg';

type DashTab = 'overview' | 'royalties' | 'risk';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashTab>('overview');

  const assetsQuery = useAssetsQuery();
  const allAssets = assetsQuery.data ?? assets;
  const ownedAssets = useMemo(() => allAssets.filter(a => a.owner.id === 'u1'), [allAssets]);
  const totalValue = useMemo(() => ownedAssets.reduce((sum, a) => sum + a.priceUsd, 0), [ownedAssets]);
  const totalRoyalties = useMemo(() => royaltyData.reduce((sum, r) => sum + r.amountReceived, 0), []);

  const portfolioChartData = useMemo(() =>
    portfolioValueHistory.map(p => ({ month: p.month, price: p.value / 1000 })),
  []);

  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    ownedAssets.forEach(a => {
      cats[a.category] = (cats[a.category] || 0) + a.priceUsd;
    });
    return Object.entries(cats).map(([cat, val]) => ({ category: cat, value: val, percent: Math.round((val / totalValue) * 100) }));
  }, [ownedAssets, totalValue]);

  const topPerforming = useMemo(() => {
    return ownedAssets.map(a => {
      const purchasePrice = a.price * 0.75;
      const change = ((a.price - purchasePrice) / purchasePrice) * 100;
      return { ...a, purchasePrice, change };
    }).sort((a, b) => b.change - a.change).slice(0, 5);
  }, [ownedAssets]);

  const catColors = ['#7AB648', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Dashboard</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>${totalValue.toLocaleString()}</Text>
          <View style={styles.changeRow}>
            <TrendingUp size={14} color={Colors.success} />
            <Text style={styles.changeText}>+18.3% (30d)</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {(['overview', 'royalties', 'risk'] as DashTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'risk' ? 'Risk Score' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' && (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Package size={18} color={Colors.accent} />
                <Text style={styles.statValue}>{ownedAssets.length}</Text>
                <Text style={styles.statLabel}>Total Assets</Text>
              </View>
              <View style={styles.statCard}>
                <Tag size={18} color={Colors.bid} />
                <Text style={styles.statValue}>{ownedAssets.filter(a => a.status !== 'New').length}</Text>
                <Text style={styles.statLabel}>Active Listings</Text>
              </View>
              <View style={styles.statCard}>
                <DollarSign size={18} color={Colors.success} />
                <Text style={styles.statValue}>$48.2K</Text>
                <Text style={styles.statLabel}>Total Earned</Text>
              </View>
              <View style={styles.statCard}>
                <Percent size={18} color={Colors.warning} />
                <Text style={styles.statValue}>{totalRoyalties.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Royalties (ETH)</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Portfolio Value (12mo)</Text>
              <View style={styles.chartCard}>
                <PriceChart data={portfolioChartData} width={320} height={180} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Breakdown by Category</Text>
              <View style={styles.breakdownCard}>
                <View style={styles.barContainer}>
                  {categoryBreakdown.map((cat, i) => (
                    <View
                      key={cat.category}
                      style={[styles.barSegment, { flex: cat.percent, backgroundColor: catColors[i % catColors.length] }]}
                    />
                  ))}
                </View>
                {categoryBreakdown.map((cat, i) => (
                  <View key={cat.category} style={styles.breakdownRow}>
                    <View style={[styles.colorDot, { backgroundColor: catColors[i % catColors.length] }]} />
                    <Text style={styles.breakdownLabel}>{cat.category}</Text>
                    <Text style={styles.breakdownValue}>{cat.percent}%</Text>
                    <Text style={styles.breakdownAmount}>${cat.value.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Performing Assets</Text>
              <View style={styles.tableCard}>
                {topPerforming.map(a => (
                  <TouchableOpacity
                    key={a.id}
                    style={styles.performRow}
                    onPress={() => router.push(`/asset/${a.id}` as any)}
                  >
                    <Image source={{ uri: a.image }} style={styles.performImage} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.performName} numberOfLines={1}>{a.name}</Text>
                      <Text style={styles.performBuy}>Bought: {a.purchasePrice.toFixed(2)} ETH</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' as const }}>
                      <Text style={styles.performCurrent}>{a.price} ETH</Text>
                      <View style={styles.performChangeRow}>
                        {a.change >= 0 ? <TrendingUp size={10} color={Colors.success} /> : <TrendingDown size={10} color={Colors.error} />}
                        <Text style={[styles.performChange, { color: a.change >= 0 ? Colors.success : Colors.error }]}>
                          {a.change >= 0 ? '+' : ''}{a.change.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {activeTab === 'risk' && (
          <>
            <View style={styles.section}>
              <View style={styles.riskGaugeCard}>
                <Svg width={160} height={100}>
                  <Circle cx={80} cy={80} r={60} stroke={Colors.cardBorder} strokeWidth={12} fill="none" strokeDasharray="188.5 188.5" rotation="-180" origin="80, 80" />
                  <Circle cx={80} cy={80} r={60} stroke={42 <= 33 ? Colors.success : 42 <= 66 ? Colors.warning : Colors.error} strokeWidth={12} fill="none" strokeDasharray={`${(42 / 100) * 188.5} 188.5`} rotation="-180" origin="80, 80" />
                </Svg>
                <View style={styles.riskScoreOverlay}>
                  <Text style={styles.riskScoreNum}>42</Text>
                  <Text style={styles.riskScoreLabel}>Medium Risk</Text>
                </View>
              </View>
              <Text style={styles.riskExplanation}>Your portfolio has moderate risk due to concentration in a few assets and limited diversification.</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Risk Breakdown</Text>
              <View style={styles.riskCard}>
                {riskFactors.map((f, i) => (
                  <View key={f.name} style={[styles.riskRow, i < riskFactors.length - 1 && styles.riskBorder]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.riskName}>{f.name}</Text>
                      <Text style={styles.riskDesc}>{f.description}</Text>
                    </View>
                    <View style={styles.riskBarContainer}>
                      <View style={styles.riskBarBg}>
                        <View style={[styles.riskBarFill, { width: `${f.score}%` as any, backgroundColor: f.score <= 33 ? Colors.success : f.score <= 66 ? Colors.warning : Colors.error }]} />
                      </View>
                      <Text style={styles.riskScoreSmall}>{f.score}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Improve Your Score</Text>
              {riskRecommendations.map((r, i) => (
                <View key={i} style={styles.recommendCard}>
                  <View style={styles.recommendDot} />
                  <Text style={styles.recommendText}>{r}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Risk Score History</Text>
              <View style={styles.chartCard}>
                <PriceChart data={riskScoreHistory.map(r => ({ month: r.month, price: r.score }))} width={320} height={140} />
              </View>
            </View>
          </>
        )}

        {activeTab === 'royalties' && (
          <>
            <View style={styles.royaltyHeader}>
              <View style={styles.royaltyTotal}>
                <Text style={styles.royaltyTotalLabel}>Total Royalties Earned</Text>
                <Text style={styles.royaltyTotalValue}>{totalRoyalties.toFixed(4)} ETH</Text>
                <Text style={styles.royaltyTotalUsd}>${(totalRoyalties * 2450).toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
              <View style={styles.chartCard}>
                <Svg width={320} height={160}>
                  {royaltyMonthly.map((m, i) => {
                    const maxAmt = Math.max(...royaltyMonthly.map(r => r.amount));
                    const barH = (m.amount / maxAmt) * 100;
                    const x = 20 + i * 50;
                    return (
                      <React.Fragment key={m.month}>
                        <Rect x={x} y={120 - barH} width={30} height={barH} rx={4} fill={Colors.accent} opacity={0.8} />
                        <SvgText x={x + 15} y={145} textAnchor="middle" fontSize={10} fill={Colors.textTertiary}>{m.month}</SvgText>
                        <SvgText x={x + 15} y={115 - barH} textAnchor="middle" fontSize={9} fill={Colors.accent}>{m.amount.toFixed(2)}</SvgText>
                      </React.Fragment>
                    );
                  })}
                </Svg>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Royalty History</Text>
              <View style={styles.tableCard}>
                {royaltyData.map(r => (
                  <View key={r.id} style={styles.royaltyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.royaltyAsset}>{r.assetName}</Text>
                      <Text style={styles.royaltyDate}>{r.saleDate}</Text>
                    </View>
                    <View style={{ alignItems: 'center' as const }}>
                      <Text style={styles.royaltySale}>{r.salePrice} ETH</Text>
                      <Text style={styles.royaltyPercent}>{r.royaltyPercent}%</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' as const, minWidth: 80 }}>
                      <Text style={styles.royaltyEarned}>{r.amountReceived.toFixed(4)} ETH</Text>
                      <Text style={styles.royaltyEarnedUsd}>${(r.amountReceived * 2450).toFixed(2)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  portfolioCard: { marginHorizontal: 16, backgroundColor: Colors.accent, borderRadius: 20, padding: 24, alignItems: 'center' },
  portfolioLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  portfolioValue: { fontSize: 36, fontWeight: '900', color: Colors.white, marginTop: 4 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  changeText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 20, gap: 0, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.accent },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textTertiary },
  tabTextActive: { color: Colors.accent },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 16, gap: 8 },
  statCard: { width: '47%' as any, backgroundColor: Colors.card, borderRadius: 14, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.cardBorder, flexGrow: 1, margin: 2 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textTertiary },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  chartCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  breakdownCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, gap: 10 },
  barContainer: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 },
  barSegment: { borderRadius: 6 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  breakdownValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, width: 36, textAlign: 'right' },
  breakdownAmount: { fontSize: 12, color: Colors.textTertiary, width: 70, textAlign: 'right' },
  tableCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  performRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  performImage: { width: 40, height: 40, borderRadius: 10 },
  performName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  performBuy: { fontSize: 11, color: Colors.textTertiary },
  performCurrent: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  performChangeRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  performChange: { fontSize: 11, fontWeight: '600' },
  royaltyHeader: { paddingHorizontal: 16, marginTop: 16 },
  royaltyTotal: { backgroundColor: Colors.card, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  royaltyTotalLabel: { fontSize: 13, color: Colors.textTertiary },
  royaltyTotalValue: { fontSize: 28, fontWeight: '900', color: Colors.accent, marginTop: 4 },
  royaltyTotalUsd: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  royaltyRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  royaltyAsset: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  royaltyDate: { fontSize: 11, color: Colors.textTertiary },
  royaltySale: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  royaltyPercent: { fontSize: 10, color: Colors.textTertiary },
  royaltyEarned: { fontSize: 13, fontWeight: '700', color: Colors.accent },
  royaltyEarnedUsd: { fontSize: 10, color: Colors.textTertiary },
  riskGaugeCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.cardBorder, position: 'relative' as const },
  riskScoreOverlay: { position: 'absolute' as const, top: 50, alignItems: 'center' },
  riskScoreNum: { fontSize: 36, fontWeight: '900' as const, color: Colors.warning },
  riskScoreLabel: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
  riskExplanation: { fontSize: 12, color: Colors.textTertiary, textAlign: 'center' as const, marginTop: 12, lineHeight: 18 },
  riskCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden' as const, borderWidth: 1, borderColor: Colors.cardBorder },
  riskRow: { padding: 14, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 },
  riskBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  riskName: { fontSize: 13, fontWeight: '700' as const, color: Colors.textPrimary },
  riskDesc: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  riskBarContainer: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, width: 100 },
  riskBarBg: { flex: 1, height: 6, backgroundColor: Colors.cardBorder, borderRadius: 3, overflow: 'hidden' as const },
  riskBarFill: { height: 6, borderRadius: 3 },
  riskScoreSmall: { fontSize: 12, fontWeight: '700' as const, color: Colors.textPrimary, width: 24, textAlign: 'right' as const },
  recommendCard: { flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: 10, backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.cardBorder },
  recommendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, marginTop: 4 },
  recommendText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
