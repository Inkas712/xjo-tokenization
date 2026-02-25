import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { ArrowLeft, Copy, RefreshCw, TrendingUp, Activity, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';
import { whaleData, whaleActivityFeed } from '@/mocks/premium';

type TimeFilter = '1H' | '24H' | '7D' | '30D';

export default function WhalesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast, isPro } = useWallet();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24H');
  const [lastUpdated, setLastUpdated] = useState<number>(30);
  const [activityFeed, setActivityFeed] = useState(whaleActivityFeed);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(prev => {
        if (prev <= 0) {
          const shuffled = [...whaleActivityFeed].sort(() => Math.random() - 0.5);
          setActivityFeed(shuffled);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => ({
    volume24h: whaleData.reduce((s, w) => s + w.totalVolume * 0.05, 0),
    largestTrade: 95.0,
    mostActive: whaleData[0].wallet,
  }), []);

  const handleCopy = useCallback((wallet: string) => {
    showToast(`Wallet ${wallet} copied`);
  }, [showToast]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Whale Tracker</Text>
          <View style={{ width: 40 }} />
        </View>

        {!isPro && (
          <View style={styles.proBanner}>
            <Zap size={16} color={Colors.warning} />
            <Text style={styles.proBannerText}>Pro feature — Limited preview</Text>
            <TouchableOpacity onPress={() => router.push('/pricing' as any)}>
              <Text style={styles.upgradeLink}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.refreshRow}>
          <RefreshCw size={12} color={Colors.textTertiary} />
          <Text style={styles.refreshText}>Last updated {lastUpdated}s ago</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <TrendingUp size={16} color={Colors.accent} />
            <Text style={styles.statValue}>{stats.volume24h.toFixed(0)} ETH</Text>
            <Text style={styles.statLabel}>24h Volume</Text>
          </View>
          <View style={styles.statCard}>
            <Activity size={16} color={Colors.error} />
            <Text style={styles.statValue}>{stats.largestTrade} ETH</Text>
            <Text style={styles.statLabel}>Largest Trade</Text>
          </View>
          <View style={styles.statCard}>
            <Zap size={16} color={Colors.warning} />
            <Text style={styles.statValue} numberOfLines={1}>{stats.mostActive}</Text>
            <Text style={styles.statLabel}>Most Active</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['1H', '24H', '7D', '30D'] as TimeFilter[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, timeFilter === f && styles.filterChipActive]}
              onPress={() => setTimeFilter(f)}
            >
              <Text style={[styles.filterText, timeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Whales</Text>
          <View style={styles.tableCard}>
            {whaleData.map((w, i) => (
              <View key={w.id} style={[styles.whaleRow, i < whaleData.length - 1 && styles.whaleBorder]}>
                <View style={styles.rankBadge}>
                  <Text style={[styles.rankText, i < 3 && { color: i === 0 ? Colors.gold : i === 1 ? Colors.silver : Colors.bronze }]}>
                    {i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.walletRow}>
                    <Text style={styles.walletText}>{w.wallet}</Text>
                    <TouchableOpacity onPress={() => handleCopy(w.wallet)}>
                      <Copy size={12} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.whaleMeta}>{w.trades} trades · Avg {w.avgTradeSize.toFixed(1)} ETH · {w.favoriteCategory}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' as const }}>
                  <Text style={styles.whaleVolume}>{w.totalVolume.toFixed(1)}</Text>
                  <Text style={styles.whaleVolumeLabel}>ETH</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Activity</Text>
          <View style={styles.activityCard}>
            {activityFeed.map((a, i) => (
              <View key={a.id + '-' + i} style={[styles.activityRow, i < activityFeed.length - 1 && styles.activityBorder]}>
                <View style={[styles.actionDot, { backgroundColor: a.action === 'bought' ? Colors.success : a.action === 'sold' ? Colors.error : Colors.bid }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityText}>
                    <Text style={styles.activityWallet}>{a.wallet}</Text> {a.action}{' '}
                    <Text style={styles.activityAsset}>{a.asset}</Text>
                  </Text>
                  <Text style={styles.activityTime}>{a.time}</Text>
                </View>
                <Text style={styles.activityAmount}>{a.amount} ETH</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.alertBtn}
          onPress={() => showToast('Whale alert configured!')}
        >
          <Text style={styles.alertBtnText}>Set Whale Alert</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  proBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, marginBottom: 8 },
  proBannerText: { flex: 1, fontSize: 12, color: '#92400E', fontWeight: '500' },
  upgradeLink: { fontSize: 12, fontWeight: '700', color: Colors.accent },
  refreshRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 12 },
  refreshText: { fontSize: 11, color: Colors.textTertiary },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.cardBorder, margin: 2 },
  statValue: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 9, color: Colors.textTertiary },
  filterRow: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  tableCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  whaleRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  whaleBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary },
  walletRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  whaleMeta: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  whaleVolume: { fontSize: 15, fontWeight: '800', color: Colors.accent },
  whaleVolumeLabel: { fontSize: 9, color: Colors.textTertiary },
  activityCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  activityRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  actionDot: { width: 8, height: 8, borderRadius: 4 },
  activityText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 16 },
  activityWallet: { fontWeight: '600', color: Colors.textPrimary },
  activityAsset: { fontWeight: '600', color: Colors.accent },
  activityTime: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  activityAmount: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  alertBtn: { marginHorizontal: 16, marginTop: 24, backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  alertBtnText: { fontSize: 16, fontWeight: '800', color: Colors.white },
});
