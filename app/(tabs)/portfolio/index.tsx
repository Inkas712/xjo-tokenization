import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  Settings,
  Copy,
  Wallet,
  Sparkles,
  Tag,
  CheckCircle,
  ArrowRightLeft,
  ExternalLink,
  X,
  CheckSquare,
  Square,
  RefreshCw,
  Trash2,
  Send,
  BadgeCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Asset } from '@/mocks/assets';
import { AssetCard } from '@/components/AssetCard';
import { useWallet } from '@/contexts/WalletContext';
import { useAssetsQuery } from '@/hooks/useAssets';

type ProfileTab = 'owned' | 'created' | 'favorited' | 'activity';

const mockUser = {
  name: 'Elena Voss',
  username: '@elenav',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  wallet: '0x7a3B4c5D6e7F8901aBcDeF1234567890abcdef12',
  followers: 234,
  following: 56,
};

const mockActivity = [
  { id: 'pa1', type: 'Sold', asset: 'Digital Aurora #7', price: '3.2 ETH', time: '2 hours ago' },
  { id: 'pa2', type: 'Listed', asset: 'Skyline Penthouse #42', price: '12.5 ETH', time: '1 day ago' },
  { id: 'pa3', type: 'Minted', asset: 'Neo-Tokyo Drift #33', price: '—', time: '3 days ago' },
  { id: 'pa4', type: 'Purchased', asset: 'Gold Bar 1kg', price: '2.1 ETH', time: '1 week ago' },
  { id: 'pa5', type: 'Bid Placed', asset: 'Vintage Rolex Daytona', price: '42.0 ETH', time: '2 weeks ago' },
];

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favorites, showToast, kycStatus, balance, fullAddress } = useWallet();
  const assetsQuery = useAssetsQuery();
  const allAssets = assetsQuery.data ?? [];
  const [activeTab, setActiveTab] = useState<ProfileTab>('owned');
  const [showListModal, setShowListModal] = useState<boolean>(false);
  const [showResellModal, setShowResellModal] = useState<boolean>(false);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [listPrice, setListPrice] = useState<string>('');
  const [resellSaleType, setResellSaleType] = useState<'fixed' | 'auction'>('fixed');
  const [listState, setListState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState<string>('');

  const ownedAssets = useMemo(() => allAssets.filter(a => a.owner.id === 'u1'), [allAssets]);
  const createdAssets = useMemo(() => allAssets.filter(a => a.creator.id === 'u1'), [allAssets]);
  const favoritedAssets = useMemo(() => allAssets.filter(a => favorites.includes(a.id)), [favorites, allAssets]);

  const handleListForSale = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setListPrice(asset.price.toString());
    setShowListModal(true);
  }, []);

  const handleResell = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setListPrice(asset.price.toString());
    setResellSaleType('fixed');
    setShowResellModal(true);
  }, []);

  const confirmList = useCallback(async () => {
    const price = parseFloat(listPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }
    setListState('loading');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setListState('success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [listPrice]);

  const closeListModal = useCallback(() => {
    setShowListModal(false);
    setShowResellModal(false);
    setSelectedAsset(null);
    setListPrice('');
    setListState('idle');
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.length === ownedAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ownedAssets.map(a => a.id));
    }
  }, [ownedAssets, selectedIds.length]);

  const handleBulkList = useCallback(async () => {
    const price = parseFloat(bulkPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }
    setListState('loading');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setListState('success');
    showToast(`${selectedIds.length} assets listed for ${bulkPrice} ETH each`);
    setBulkMode(false);
    setSelectedIds([]);
    setShowBulkModal(false);
    setListState('idle');
    setBulkPrice('');
  }, [bulkPrice, selectedIds.length, showToast]);

  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case 'Sold': return <CheckCircle size={16} color={Colors.success} />;
      case 'Listed': return <Tag size={16} color={Colors.accent} />;
      case 'Minted': return <Sparkles size={16} color={Colors.warning} />;
      case 'Purchased': return <ArrowRightLeft size={16} color={Colors.bid} />;
      default: return <ExternalLink size={16} color={Colors.textTertiary} />;
    }
  }, []);

  const currentAssets = useMemo(() => {
    switch (activeTab) {
      case 'owned': return ownedAssets;
      case 'created': return createdAssets;
      case 'favorited': return favoritedAssets;
      default: return [];
    }
  }, [activeTab, ownedAssets, createdAssets, favoritedAssets]);

  const tabs: { key: ProfileTab; label: string; count: number }[] = [
    { key: 'owned', label: 'Owned', count: ownedAssets.length },
    { key: 'created', label: 'Created', count: createdAssets.length },
    { key: 'favorited', label: 'Favorited', count: favoritedAssets.length },
    { key: 'activity', label: 'Activity', count: mockActivity.length },
  ];

  const renderHeader = useCallback(() => (
    <View>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings' as any)}>
          <Settings size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {kycStatus !== 'verified' && (
        <TouchableOpacity style={styles.kycBanner} onPress={() => router.push('/kyc' as any)}>
          <BadgeCheck size={16} color="#92400E" />
          <Text style={styles.kycBannerText}>
            {kycStatus === 'pending' ? 'KYC under review' : 'Complete KYC to access regulated assets'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.profileCard}>
        <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
        <Text style={styles.userName}>{mockUser.name}</Text>
        <Text style={styles.userHandle}>{mockUser.username}</Text>
        <TouchableOpacity
          style={styles.walletRow}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            showToast('Wallet address copied');
          }}
        >
          <Text style={styles.walletAddress}>{mockUser.wallet.slice(0, 6)}...{mockUser.wallet.slice(-4)}</Text>
          <Copy size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
        <View style={styles.balanceRow}>
          <Wallet size={16} color={Colors.accent} />
          <Text style={styles.balanceText}>{balance || '24.58'} ETH</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{ownedAssets.length}</Text>
          <Text style={styles.statLabel}>Owned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{createdAssets.length}</Text>
          <Text style={styles.statLabel}>Created</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockUser.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockUser.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.key} style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]} onPress={() => { setActiveTab(tab.key); setBulkMode(false); setSelectedIds([]); }}>
            <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>{tab.label} ({tab.count})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === 'owned' && (
        <View style={styles.bulkActions}>
          <TouchableOpacity
            style={[styles.bulkBtn, bulkMode && styles.bulkBtnActive]}
            onPress={() => { setBulkMode(!bulkMode); setSelectedIds([]); }}
          >
            <CheckSquare size={14} color={bulkMode ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.bulkBtnText, bulkMode && styles.bulkBtnTextActive]}>
              {bulkMode ? `${selectedIds.length} selected` : 'Select'}
            </Text>
          </TouchableOpacity>
          {bulkMode && (
            <>
              <TouchableOpacity style={styles.bulkActionBtn} onPress={selectAll}>
                <Text style={styles.bulkActionText}>{selectedIds.length === ownedAssets.length ? 'Deselect All' : 'Select All'}</Text>
              </TouchableOpacity>
              {selectedIds.length >= 2 && (
                <TouchableOpacity style={styles.bulkListBtn} onPress={() => setShowBulkModal(true)}>
                  <Tag size={12} color={Colors.white} />
                  <Text style={styles.bulkListText}>List Selected</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  ), [insets.top, activeTab, ownedAssets.length, createdAssets.length, favoritedAssets.length, router, tabs, bulkMode, selectedIds, kycStatus, showToast]);

  if (activeTab === 'activity') {
    return (
      <View style={styles.container}>
        <FlatList
          data={mockActivity}
          ListHeaderComponent={renderHeader}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.activityRow}>
              <View style={styles.activityIcon}>{getActivityIcon(item.type)}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityType}>{item.type}</Text>
                <Text style={styles.activityAsset}>{item.asset}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' as const }}>
                <Text style={styles.activityPrice}>{item.price}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  const pairCount = Math.ceil(currentAssets.length / 2);
  const pairKeys = Array.from({ length: pairCount }, (_, i) => i);

  return (
    <View style={styles.container}>
      <FlatList
        data={pairKeys}
        ListHeaderComponent={renderHeader}
        keyExtractor={item => `portfolio-pair-${item}`}
        renderItem={({ item }) => {
          const first = currentAssets[item * 2];
          const second = currentAssets[item * 2 + 1];
          return (
            <View>
              <View style={styles.assetRow}>
                {first && (
                  <View style={{ flex: 1 }}>
                    {bulkMode && activeTab === 'owned' && (
                      <TouchableOpacity style={styles.selectCheckbox} onPress={() => toggleSelect(first.id)}>
                        {selectedIds.includes(first.id) ? <CheckSquare size={20} color={Colors.accent} /> : <Square size={20} color={Colors.textTertiary} />}
                      </TouchableOpacity>
                    )}
                    <AssetCard asset={first} />
                    {activeTab === 'owned' && !bulkMode && (
                      <View style={styles.assetActions}>
                        <TouchableOpacity style={styles.listBtn} onPress={() => handleListForSale(first)}>
                          <Tag size={12} color={Colors.accent} />
                          <Text style={styles.listBtnText}>List</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.resellBtn} onPress={() => handleResell(first)}>
                          <RefreshCw size={12} color={Colors.bid} />
                          <Text style={styles.resellBtnText}>Resell</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
                {second ? (
                  <View style={{ flex: 1 }}>
                    {bulkMode && activeTab === 'owned' && (
                      <TouchableOpacity style={styles.selectCheckbox} onPress={() => toggleSelect(second.id)}>
                        {selectedIds.includes(second.id) ? <CheckSquare size={20} color={Colors.accent} /> : <Square size={20} color={Colors.textTertiary} />}
                      </TouchableOpacity>
                    )}
                    <AssetCard asset={second} />
                    {activeTab === 'owned' && !bulkMode && (
                      <View style={styles.assetActions}>
                        <TouchableOpacity style={styles.listBtn} onPress={() => handleListForSale(second)}>
                          <Tag size={12} color={Colors.accent} />
                          <Text style={styles.listBtnText}>List</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.resellBtn} onPress={() => handleResell(second)}>
                          <RefreshCw size={12} color={Colors.bid} />
                          <Text style={styles.resellBtnText}>Resell</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : <View style={{ flex: 1, margin: 6 }} />}
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{activeTab === 'favorited' ? 'No favorited assets yet' : 'No assets to show'}</Text>
          </View>
        }
      />

      <Modal visible={showListModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {listState === 'idle' && selectedAsset && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>List for Sale</Text>
                  <TouchableOpacity onPress={closeListModal}><X size={22} color={Colors.textPrimary} /></TouchableOpacity>
                </View>
                <View style={styles.modalAssetRow}>
                  <Image source={{ uri: selectedAsset.image }} style={styles.modalImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalAssetName}>{selectedAsset.name}</Text>
                    <Text style={styles.modalAssetCategory}>{selectedAsset.category}</Text>
                  </View>
                </View>
                <Text style={styles.inputLabel}>Listing Price (ETH)</Text>
                <TextInput style={styles.listInput} placeholder="0.00" placeholderTextColor={Colors.textTertiary} keyboardType="numeric" value={listPrice} onChangeText={setListPrice} />
                <TouchableOpacity style={styles.confirmBtn} onPress={confirmList}><Text style={styles.confirmText}>List Asset</Text></TouchableOpacity>
              </>
            )}
            {listState === 'loading' && (
              <View style={styles.modalCenter}><ActivityIndicator size="large" color={Colors.accent} /><Text style={styles.loadingText}>Creating listing...</Text></View>
            )}
            {listState === 'success' && (
              <View style={styles.modalCenter}>
                <View style={styles.successCircle}><CheckCircle size={40} color={Colors.accent} /></View>
                <Text style={styles.successTitle}>Listed Successfully!</Text>
                <Text style={styles.successSub}>{selectedAsset?.name} listed for {listPrice} ETH</Text>
                <TouchableOpacity style={styles.doneBtn} onPress={closeListModal}><Text style={styles.doneText}>Done</Text></TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showResellModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {listState === 'idle' && selectedAsset && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Resell Asset</Text>
                  <TouchableOpacity onPress={closeListModal}><X size={22} color={Colors.textPrimary} /></TouchableOpacity>
                </View>
                <View style={styles.modalAssetRow}>
                  <Image source={{ uri: selectedAsset.image }} style={styles.modalImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalAssetName}>{selectedAsset.name}</Text>
                    <Text style={styles.modalAssetCategory}>{selectedAsset.category}</Text>
                  </View>
                </View>
                <Text style={styles.inputLabel}>Sale Type</Text>
                <View style={styles.saleTypeRow}>
                  <TouchableOpacity style={[styles.saleOption, resellSaleType === 'fixed' && styles.saleOptionActive]} onPress={() => setResellSaleType('fixed')}>
                    <Text style={[styles.saleOptionText, resellSaleType === 'fixed' && styles.saleOptionTextActive]}>Fixed Price</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.saleOption, resellSaleType === 'auction' && styles.saleOptionActive]} onPress={() => setResellSaleType('auction')}>
                    <Text style={[styles.saleOptionText, resellSaleType === 'auction' && styles.saleOptionTextActive]}>Auction</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputLabel}>Price (ETH)</Text>
                <TextInput style={styles.listInput} placeholder="0.00" placeholderTextColor={Colors.textTertiary} keyboardType="numeric" value={listPrice} onChangeText={setListPrice} />
                <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: Colors.bid }]} onPress={confirmList}>
                  <Text style={styles.confirmText}>Resell Asset</Text>
                </TouchableOpacity>
              </>
            )}
            {listState === 'loading' && (
              <View style={styles.modalCenter}><ActivityIndicator size="large" color={Colors.bid} /><Text style={styles.loadingText}>Creating resale listing...</Text></View>
            )}
            {listState === 'success' && (
              <View style={styles.modalCenter}>
                <View style={[styles.successCircle, { backgroundColor: '#EFF6FF' }]}><RefreshCw size={40} color={Colors.bid} /></View>
                <Text style={styles.successTitle}>Resale Listed!</Text>
                <Text style={styles.successSub}>{selectedAsset?.name} listed for {listPrice} ETH as {resellSaleType}</Text>
                <TouchableOpacity style={[styles.doneBtn, { backgroundColor: Colors.bid }]} onPress={closeListModal}><Text style={styles.doneText}>Done</Text></TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showBulkModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>List {selectedIds.length} Assets</Text>
              <TouchableOpacity onPress={() => { setShowBulkModal(false); setBulkPrice(''); setListState('idle'); }}>
                <X size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.bulkInfo}>{selectedIds.length} assets will be listed at the same price</Text>
            <Text style={styles.inputLabel}>Price per asset (ETH)</Text>
            <TextInput style={styles.listInput} placeholder="0.00" placeholderTextColor={Colors.textTertiary} keyboardType="numeric" value={bulkPrice} onChangeText={setBulkPrice} />
            <TouchableOpacity style={styles.confirmBtn} onPress={handleBulkList}>
              <Text style={styles.confirmText}>List All Selected</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  kycBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FDE68A' },
  kycBannerText: { fontSize: 12, fontWeight: '600', color: '#92400E', flex: 1 },
  profileCard: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: Colors.primaryLight },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: 12 },
  userHandle: { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },
  walletRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: Colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.cardBorder },
  walletAddress: { fontSize: 12, fontFamily: 'monospace', color: Colors.textSecondary },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  balanceText: { fontSize: 18, fontWeight: '800', color: Colors.accent },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: Colors.card, borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.cardBorder },
  tabsRow: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, gap: 8 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  tabBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  tabBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  tabBtnTextActive: { color: Colors.white },
  bulkActions: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8, alignItems: 'center' },
  bulkBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  bulkBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  bulkBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  bulkBtnTextActive: { color: Colors.white },
  bulkActionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  bulkActionText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  bulkListBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.accent },
  bulkListText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  assetRow: { flexDirection: 'row', paddingHorizontal: 10 },
  selectCheckbox: { position: 'absolute', top: 12, left: 12, zIndex: 10, width: 28, height: 28, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  assetActions: { flexDirection: 'row', marginHorizontal: 6, marginTop: -2, marginBottom: 8, gap: 4 },
  listBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 10, backgroundColor: '#E8F5E2', borderWidth: 1, borderColor: Colors.primaryLight },
  listBtnText: { fontSize: 11, fontWeight: '600', color: Colors.accent },
  resellBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 10, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  resellBtnText: { fontSize: 11, fontWeight: '600', color: Colors.bid },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  activityIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  activityType: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  activityAsset: { fontSize: 12, color: Colors.textTertiary, marginTop: 1 },
  activityPrice: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  activityTime: { fontSize: 11, color: Colors.textTertiary },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: Colors.textTertiary },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: Colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  modalAssetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  modalImage: { width: 52, height: 52, borderRadius: 10 },
  modalAssetName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  modalAssetCategory: { fontSize: 12, color: Colors.textTertiary },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  listInput: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, fontWeight: '700', color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 16 },
  saleTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  saleOption: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  saleOptionActive: { backgroundColor: Colors.bid, borderColor: Colors.bid },
  saleOptionText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  saleOptionTextActive: { color: Colors.white },
  confirmBtn: { paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.accent, alignItems: 'center' },
  confirmText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  modalCenter: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  loadingText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  successCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E8F5E2', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  successTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  successSub: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center' },
  doneBtn: { paddingHorizontal: 36, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.accent, marginTop: 12 },
  doneText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  bulkInfo: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
});
