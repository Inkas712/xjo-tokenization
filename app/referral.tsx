import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Copy,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  X,
  Share2,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';
import { referrals, referralEarningsMonthly } from '@/mocks/premium';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

export default function ReferralScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useWallet();
  const [showWithdraw, setShowWithdraw] = useState<boolean>(false);

  const referralLink = 'https://xjo.io/ref/7a3B9f2E';
  const totalEarned = referrals.reduce((s, r) => s + r.earnings, 0);
  const activeCount = referrals.filter(r => r.status === 'active').length;
  const totalReferred = referrals.length;

  const tierInfo = totalReferred <= 5 ? { name: 'Bronze', rate: '0.5%', color: Colors.bronze } :
    totalReferred <= 20 ? { name: 'Silver', rate: '0.75%', color: Colors.silver } :
    totalReferred <= 50 ? { name: 'Gold', rate: '1.0%', color: Colors.gold } :
    { name: 'Platinum', rate: '1.5%', color: '#E5E4E2' };

  const handleCopy = () => {
    showToast('Referral link copied to clipboard!');
  };

  const handleShare = (platform: string) => {
    showToast(`Shared via ${platform}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Referral Program</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Earn From Every Referral</Text>
          <Text style={styles.heroSub}>Earn {tierInfo.rate} of every transaction your referral makes for 12 months</Text>
          <View style={styles.tierBadge}>
            <View style={[styles.tierDot, { backgroundColor: tierInfo.color }]} />
            <Text style={styles.tierText}>{tierInfo.name} Tier</Text>
          </View>
        </View>

        <View style={styles.linkCard}>
          <Text style={styles.linkLabel}>Your Referral Link</Text>
          <View style={styles.linkRow}>
            <Text style={styles.linkText} numberOfLines={1}>{referralLink}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Copy size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.shareRow}>
            {['Twitter/X', 'Telegram', 'WhatsApp'].map(p => (
              <TouchableOpacity key={p} style={styles.shareBtn} onPress={() => handleShare(p)}>
                <Share2 size={14} color={Colors.accent} />
                <Text style={styles.shareBtnText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={18} color={Colors.accent} />
            <Text style={styles.statValue}>{totalReferred}</Text>
            <Text style={styles.statLabel}>Total Referred</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={18} color={Colors.success} />
            <Text style={styles.statValue}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={18} color={Colors.accent} />
            <Text style={styles.statValue}>{totalEarned.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Earned (ETH)</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={18} color={Colors.warning} />
            <Text style={styles.statValue}>0.06</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings by Month</Text>
          <View style={styles.chartCard}>
            <Svg width={320} height={160}>
              {referralEarningsMonthly.map((m, i) => {
                const maxAmt = Math.max(...referralEarningsMonthly.map(r => r.amount));
                const barH = maxAmt > 0 ? (m.amount / maxAmt) * 100 : 0;
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Referrals</Text>
            <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowWithdraw(true)}>
              <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tableCard}>
            {referrals.map((r, i) => (
              <View key={r.id} style={[styles.refRow, i < referrals.length - 1 && styles.refBorder]}>
                <Image source={{ uri: r.avatar }} style={styles.refAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.refName}>{r.username}</Text>
                  <Text style={styles.refDate}>Joined {r.joinDate}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' as const }}>
                  <Text style={styles.refEarned}>{r.earnings.toFixed(2)} ETH</Text>
                  <View style={[styles.statusBadge, r.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
                    <Text style={[styles.statusText, r.status === 'active' ? styles.activeText : styles.inactiveText]}>{r.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Tiers</Text>
          <View style={styles.tiersCard}>
            {[
              { tier: 'Bronze', range: '1-5 referrals', rate: '0.5%', color: Colors.bronze },
              { tier: 'Silver', range: '6-20 referrals', rate: '0.75%', color: Colors.silver },
              { tier: 'Gold', range: '21-50 referrals', rate: '1.0%', color: Colors.gold },
              { tier: 'Platinum', range: '50+ referrals', rate: '1.5%', color: '#E5E4E2' },
            ].map((t, i) => (
              <View key={t.tier} style={[styles.tierRow, i < 3 && styles.tierBorder]}>
                <View style={[styles.tierIcon, { backgroundColor: t.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tierName}>{t.tier}</Text>
                  <Text style={styles.tierRange}>{t.range}</Text>
                </View>
                <Text style={styles.tierRate}>{t.rate}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showWithdraw} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.withdrawModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Earnings</Text>
              <TouchableOpacity onPress={() => setShowWithdraw(false)}>
                <X size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.withdrawAmount}>
              <Text style={styles.withdrawLabel}>Available to withdraw</Text>
              <Text style={styles.withdrawValue}>{totalEarned.toFixed(4)} ETH</Text>
              <Text style={styles.withdrawUsd}>${(totalEarned * 3200).toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.confirmWithdraw}
              onPress={() => {
                setShowWithdraw(false);
                showToast('Withdrawal initiated! Funds will arrive in ~5 minutes.');
              }}
            >
              <Text style={styles.confirmWithdrawText}>Withdraw to Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  heroCard: { marginHorizontal: 16, backgroundColor: Colors.accent, borderRadius: 20, padding: 24, marginBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: Colors.white },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8, lineHeight: 18 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginTop: 12 },
  tierDot: { width: 10, height: 10, borderRadius: 5 },
  tierText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  linkCard: { marginHorizontal: 16, backgroundColor: Colors.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 16 },
  linkLabel: { fontSize: 12, fontWeight: '600', color: Colors.textTertiary, marginBottom: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkText: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  copyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  shareRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#E8F5E2', borderRadius: 10, paddingVertical: 10 },
  shareBtnText: { fontSize: 11, fontWeight: '600', color: Colors.accent },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  statCard: { width: '47%' as any, backgroundColor: Colors.card, borderRadius: 14, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.cardBorder, flexGrow: 1, margin: 2 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textTertiary },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  chartCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  withdrawBtn: { backgroundColor: Colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  withdrawText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  tableCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  refRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  refBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  refAvatar: { width: 36, height: 36, borderRadius: 18 },
  refName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  refDate: { fontSize: 11, color: Colors.textTertiary, marginTop: 1 },
  refEarned: { fontSize: 13, fontWeight: '700', color: Colors.accent },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  activeBadge: { backgroundColor: '#E8F5E2' },
  inactiveBadge: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 10, fontWeight: '600' },
  activeText: { color: Colors.accent },
  inactiveText: { color: Colors.textTertiary },
  tiersCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  tierRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  tierBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  tierIcon: { width: 12, height: 12, borderRadius: 6 },
  tierName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  tierRange: { fontSize: 11, color: Colors.textTertiary },
  tierRate: { fontSize: 16, fontWeight: '800', color: Colors.accent },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 30 },
  withdrawModal: { backgroundColor: Colors.card, borderRadius: 20, padding: 24, width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  withdrawAmount: { backgroundColor: Colors.background, borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 20 },
  withdrawLabel: { fontSize: 12, color: Colors.textTertiary },
  withdrawValue: { fontSize: 28, fontWeight: '900', color: Colors.accent, marginTop: 4 },
  withdrawUsd: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  confirmWithdraw: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  confirmWithdrawText: { fontSize: 16, fontWeight: '800', color: Colors.white },
});
