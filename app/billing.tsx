import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Crown, CreditCard, AlertTriangle, X, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';
import { paymentHistory } from '@/mocks/premium';

export default function BillingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro, setIsPro, showToast } = useWallet();
  const [showCancel, setShowCancel] = useState<boolean>(false);

  const handleCancel = () => {
    setIsPro(false);
    setShowCancel(false);
    showToast('Plan cancelled. Pro features will expire at end of billing period.');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Billing</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.planBadge}>
              <Crown size={16} color="#FFD700" />
              <Text style={styles.planBadgeText}>{isPro ? 'Pro' : 'Free'}</Text>
            </View>
            {!isPro && (
              <TouchableOpacity style={styles.upgradeSmall} onPress={() => router.push('/pricing' as any)}>
                <Text style={styles.upgradeSmallText}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.planName}>{isPro ? 'Pro Monthly' : 'Free Plan'}</Text>
          <Text style={styles.planPrice}>{isPro ? '$29/month' : '$0'}</Text>
          {isPro && (
            <View style={styles.nextBilling}>
              <Text style={styles.nextLabel}>Next billing date</Text>
              <Text style={styles.nextDate}>March 1, 2026</Text>
            </View>
          )}
        </View>

        {isPro && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentCard}>
              <CreditCard size={20} color={Colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>Visa ending in 4242</Text>
                <Text style={styles.cardExpiry}>Expires 12/27</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <View style={styles.historyCard}>
            {(isPro ? paymentHistory : []).length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No payment history</Text>
              </View>
            ) : (
              paymentHistory.map((p, i) => (
                <View key={p.id} style={[styles.historyRow, i < paymentHistory.length - 1 && styles.historyBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyDesc}>{p.description}</Text>
                    <Text style={styles.historyDate}>{p.date}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' as const }}>
                    <Text style={styles.historyAmount}>${p.amount}</Text>
                    <View style={styles.paidBadge}>
                      <Check size={10} color={Colors.accent} />
                      <Text style={styles.paidText}>Paid</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {isPro && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCancel(true)}>
            <Text style={styles.cancelText}>Cancel Plan</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={showCancel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModal}>
            <View style={styles.cancelIconBox}>
              <AlertTriangle size={28} color={Colors.warning} />
            </View>
            <Text style={styles.cancelTitle}>Cancel Pro Plan?</Text>
            <Text style={styles.cancelDesc}>You will lose access to:</Text>
            {['Zero commission', 'Unlimited listings', 'Advanced analytics', 'Bundle sales', 'Featured listings'].map((f, i) => (
              <View key={i} style={styles.loseRow}>
                <X size={14} color={Colors.error} />
                <Text style={styles.loseText}>{f}</Text>
              </View>
            ))}
            <View style={styles.cancelActions}>
              <TouchableOpacity style={styles.keepBtn} onPress={() => setShowCancel(false)}>
                <Text style={styles.keepBtnText}>Keep Pro</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmCancelBtn} onPress={handleCancel}>
                <Text style={styles.confirmCancelText}>Cancel Plan</Text>
              </TouchableOpacity>
            </View>
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
  planCard: { marginHorizontal: 16, backgroundColor: Colors.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: Colors.cardBorder },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  planBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  planBadgeText: { fontSize: 13, fontWeight: '800', color: '#92400E' },
  upgradeSmall: { backgroundColor: Colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  upgradeSmallText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  planName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  planPrice: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  nextBilling: { marginTop: 16, backgroundColor: Colors.background, borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between' },
  nextLabel: { fontSize: 13, color: Colors.textSecondary },
  nextDate: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  paymentCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  cardName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  cardExpiry: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  editText: { fontSize: 13, fontWeight: '600', color: Colors.accent },
  historyCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  historyRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  historyDesc: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  historyDate: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  historyAmount: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  paidText: { fontSize: 10, color: Colors.accent, fontWeight: '600' },
  emptyState: { padding: 30, alignItems: 'center' },
  emptyText: { fontSize: 13, color: Colors.textTertiary },
  cancelBtn: { marginHorizontal: 16, marginTop: 30, alignItems: 'center', paddingVertical: 14 },
  cancelText: { fontSize: 14, fontWeight: '600', color: Colors.error },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 30 },
  cancelModal: { backgroundColor: Colors.card, borderRadius: 20, padding: 24, width: '100%' },
  cancelIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  cancelTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  cancelDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 12 },
  loseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingHorizontal: 8 },
  loseText: { fontSize: 13, color: Colors.textSecondary },
  cancelActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  keepBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  keepBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  confirmCancelBtn: { flex: 1, backgroundColor: Colors.background, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.error },
  confirmCancelText: { fontSize: 14, fontWeight: '700', color: Colors.error },
});
