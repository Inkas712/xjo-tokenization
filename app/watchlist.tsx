import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bookmark, Trash2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { assets as mockAssets } from '@/mocks/assets';
import { AssetCard } from '@/components/AssetCard';
import { useWallet } from '@/contexts/WalletContext';
import { useAssetsQuery } from '@/hooks/useAssets';

type SortOption = 'date' | 'price' | 'name';

export default function WatchlistScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { watchlist, clearWatchlist, showToast } = useWallet();
  const [sort, setSort] = useState<SortOption>('date');
  const [showClearModal, setShowClearModal] = useState<boolean>(false);

  const assetsQuery = useAssetsQuery();
  const allAssets = assetsQuery.data ?? mockAssets;

  const watchlistAssets = useMemo(() => {
    let filtered = allAssets.filter(a => watchlist.includes(a.id));
    switch (sort) {
      case 'price': filtered.sort((a, b) => a.price - b.price); break;
      case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return filtered;
  }, [watchlist, sort]);

  const handleClearAll = useCallback(() => {
    clearWatchlist();
    setShowClearModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('Watchlist cleared');
  }, [clearWatchlist, showToast]);

  const pairCount = Math.ceil(watchlistAssets.length / 2);
  const pairKeys = useMemo(() => Array.from({ length: pairCount }, (_, i) => i), [pairCount]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Watchlist</Text>
        {watchlistAssets.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => setShowClearModal(true)}>
            <Trash2 size={18} color={Colors.error} />
          </TouchableOpacity>
        )}
        {watchlistAssets.length === 0 && <View style={{ width: 40 }} />}
      </View>

      {watchlistAssets.length > 0 && (
        <View style={styles.sortRow}>
          {(['date', 'price', 'name'] as SortOption[]).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sortChip, sort === s && styles.sortChipActive]}
              onPress={() => setSort(s)}
            >
              <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>
                {s === 'date' ? 'Date Added' : s === 'price' ? 'Price' : 'Name'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={pairKeys}
        keyExtractor={item => `wl-pair-${item}`}
        renderItem={({ item }) => {
          const first = watchlistAssets[item * 2];
          const second = watchlistAssets[item * 2 + 1];
          return (
            <View style={styles.row}>
              {first && <AssetCard asset={first} />}
              {second ? <AssetCard asset={second} /> : <View style={{ flex: 1, margin: 6 }} />}
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bookmark size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No saved assets</Text>
            <Text style={styles.emptySubtitle}>Bookmark assets from the marketplace to track them here</Text>
          </View>
        }
      />

      <Modal visible={showClearModal} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowClearModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Clear Watchlist?</Text>
            <Text style={styles.modalText}>This will remove all {watchlistAssets.length} saved assets from your watchlist.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowClearModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleClearAll}>
                <Text style={styles.modalConfirmText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  clearBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  sortRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  sortChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  sortChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  sortText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  sortTextActive: { color: Colors.white },
  row: { flexDirection: 'row', paddingHorizontal: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 80, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: Colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  modalText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancel: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  modalConfirm: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: Colors.error },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
