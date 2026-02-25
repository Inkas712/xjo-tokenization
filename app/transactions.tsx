import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, ChevronLeft, ChevronRight, Sparkles, ShoppingCart, Tag, Gavel, ArrowRightLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { transactions, TransactionRecord } from '@/mocks/extended';
import { useWallet } from '@/contexts/WalletContext';

type TxFilter = 'All' | 'Mint' | 'Buy' | 'Sell' | 'Bid' | 'Transfer';

const PAGE_SIZE = 10;

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useWallet();
  const [filter, setFilter] = useState<TxFilter>('All');
  const [page, setPage] = useState<number>(0);

  const filtered = useMemo(() => {
    if (filter === 'All') return transactions;
    return transactions.filter(t => t.type === filter);
  }, [filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page]);

  const getTypeIcon = (type: TransactionRecord['type']) => {
    switch (type) {
      case 'Mint': return <Sparkles size={14} color={Colors.warning} />;
      case 'Buy': return <ShoppingCart size={14} color={Colors.success} />;
      case 'Sell': return <Tag size={14} color={Colors.accent} />;
      case 'Bid': return <Gavel size={14} color={Colors.bid} />;
      case 'Transfer': return <ArrowRightLeft size={14} color={Colors.polygon} />;
    }
  };

  const getStatusColor = (status: TransactionRecord['status']) => {
    switch (status) {
      case 'Confirmed': return Colors.success;
      case 'Pending': return Colors.warning;
      case 'Failed': return Colors.error;
    }
  };

  const handleExport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast('CSV export downloaded');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Download size={18} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {(['All', 'Mint', 'Buy', 'Sell', 'Bid', 'Transfer'] as TxFilter[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => { setFilter(f); setPage(0); }}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={pageData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.txRow}
            onPress={() => router.push(`/asset/${item.assetId}` as any)}
          >
            <View style={[styles.typeIcon, { backgroundColor: getStatusColor(item.status) + '15' }]}>
              {getTypeIcon(item.type)}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.txHeader}>
                <Text style={styles.txType}>{item.type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.txAsset} numberOfLines={1}>{item.asset}</Text>
              <Text style={styles.txMeta}>{item.from} → {item.to}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' as const }}>
              <Text style={styles.txPrice}>{item.price > 0 ? `${item.price} ETH` : '—'}</Text>
              <Text style={styles.txDate}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />

      {totalPages > 1 && (
        <View style={[styles.pagination, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
            onPress={() => page > 0 && setPage(page - 1)}
            disabled={page === 0}
          >
            <ChevronLeft size={18} color={page === 0 ? Colors.textTertiary : Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.pageText}>Page {page + 1} of {totalPages}</Text>
          <TouchableOpacity
            style={[styles.pageBtn, page >= totalPages - 1 && styles.pageBtnDisabled]}
            onPress={() => page < totalPages - 1 && setPage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight size={18} color={page >= totalPages - 1 ? Colors.textTertiary : Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  exportBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E2', alignItems: 'center', justifyContent: 'center' },
  filterRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.cardBorder },
  typeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  txType: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 9, fontWeight: '700' },
  txAsset: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  txMeta: { fontSize: 10, color: Colors.textTertiary, fontFamily: 'monospace', marginTop: 2 },
  txPrice: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  txDate: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.textTertiary },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.cardBorder, backgroundColor: Colors.white },
  pageBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  pageBtnDisabled: { opacity: 0.4 },
  pageText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
});
