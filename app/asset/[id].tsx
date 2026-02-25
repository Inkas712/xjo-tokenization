import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Heart,
  Share2,
  Eye,
  Copy,
  CheckCircle,
  Tag,
  ArrowRightLeft,
  Gavel,
  Sparkles,
  ExternalLink,
  BadgeCheck,
  Bookmark,
  MessageCircle,
  Star,
  PieChart,
  Bell,
  Flag,
  X,
  Send,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { assets } from '@/mocks/assets';
import { PriceChart } from '@/components/PriceChart';
import { useAssetQuery, usePlaceBid, usePurchaseAsset } from '@/hooks/useAssets';
import { AuctionTimer } from '@/components/AuctionTimer';
import { useWallet } from '@/contexts/WalletContext';
import { mixpanel } from '@/services/mixpanel';
import {
  generateComments,
  generateResaleHistory,
  generateFractionHolders,
  sellerReviews,
  Comment,
} from '@/mocks/extended';
import Svg, { Circle as SvgCircle, Text as SvgText } from 'react-native-svg';

type DetailTab = 'bids' | 'activity' | 'resale' | 'fractions' | 'comments';

export default function AssetDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isConnected, toggleFavorite, favorites, toggleWatchlist, watchlist, showToast, addPriceAlert } = useWallet();

  const assetQuery = useAssetQuery(id ?? '');
  const placeBidMutation = usePlaceBid();
  const purchaseMutation = usePurchaseAsset();
  const asset = assetQuery.data ?? assets.find(a => a.id === id) ?? null;

  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
  const [showBidModal, setShowBidModal] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [showReviewsModal, setShowReviewsModal] = useState<boolean>(false);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [buyState, setBuyState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [bidState, setBidState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [activeTab, setActiveTab] = useState<DetailTab>('bids');
  const [newComment, setNewComment] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>(() => generateComments());
  const [alertBelow, setAlertBelow] = useState<string>('');
  const [alertAbove, setAlertAbove] = useState<string>('');

  const isFavorited = asset ? favorites.includes(asset.id) : false;

  useEffect(() => {
    if (asset) {
      mixpanel.trackAssetViewed(asset.id, asset.name, asset.category, asset.price);
    }
  }, [asset?.id]);
  const isWatchlisted = asset ? watchlist.includes(asset.id) : false;

  const isVerified = useMemo(() => {
    const verifiedIds = ['1', '2', '3', '5', '7', '11', '13', '14'];
    return asset ? verifiedIds.includes(asset.id) : false;
  }, [asset]);

  const resaleHistory = useMemo(() => asset ? generateResaleHistory(asset.price) : [], [asset]);
  const fractionHolders = useMemo(() => generateFractionHolders(), []);

  const auctionEndTime = useMemo(() => {
    if (!asset || asset.saleType !== 'auction') return null;
    const end = new Date();
    end.setHours(end.getHours() + parseInt(asset.id) * 7 + 12);
    return end;
  }, [asset]);

  const handleBuy = useCallback(() => {
    if (!isConnected) {
      Alert.alert('Connect Wallet', 'Please connect your wallet to make a purchase.');
      return;
    }
    setShowBuyModal(true);
  }, [isConnected]);

  const confirmBuy = useCallback(async () => {
    if (!asset) return;
    setBuyState('loading');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      console.log(`[AssetDetail] Purchasing asset ${asset.id} via Supabase...`);
      await purchaseMutation.mutateAsync({
        assetId: asset.id,
        buyerWallet: '0x7a3B4c2D8E1f6A9b5C3d7E2F8a4B6c1D9e5F2E',
        price: asset.price,
      });
      setBuyState('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (asset) {
        mixpanel.trackAssetPurchased(asset.id, asset.price, asset.owner.wallet, '0x7a3B4c2D8E1f6A9b5C3d7E2F8a4B6c1D9e5F2E');
      }
    } catch (err: any) {
      console.error('[AssetDetail] Purchase failed:', err);
      setBuyState('idle');
      setShowBuyModal(false);
      const errorMsg = err?.message || 'Purchase failed. Please try again.';
      showToast(errorMsg, 'error');
    }
  }, [asset, purchaseMutation]);

  const handleBid = useCallback(() => {
    if (!isConnected) {
      Alert.alert('Connect Wallet', 'Please connect your wallet to place a bid.');
      return;
    }
    setShowBidModal(true);
  }, [isConnected]);

  const confirmBid = useCallback(async () => {
    const amount = parseFloat(bidAmount);
    if (!asset) return;
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bid amount.');
      return;
    }
    const highestBid = asset.bids.length > 0 ? asset.bids[0].amount : 0;
    if (amount <= highestBid) {
      Alert.alert('Bid Too Low', `Your bid must be higher than the current highest bid of ${highestBid} ETH.`);
      return;
    }
    setBidState('loading');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      console.log(`[AssetDetail] Placing bid ${amount} ETH on asset ${asset.id} via Supabase...`);
      await placeBidMutation.mutateAsync({
        assetId: asset.id,
        bidderId: 'u1',
        amount,
      });
      setBidState('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (asset) {
        mixpanel.trackBidPlaced(asset.id, amount, '0x7a3B4c2D8E1f6A9b5C3d7E2F8a4B6c1D9e5F2E');
      }
    } catch (err: any) {
      console.error('[AssetDetail] Bid failed:', err);
      setBidState('idle');
      setShowBidModal(false);
      const errorMsg = err?.message || 'Bid failed. Please try again.';
      showToast(errorMsg, 'error');
    }
  }, [bidAmount, asset, placeBidMutation]);

  const handleFavorite = useCallback(() => {
    if (!asset) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(asset.id);
  }, [asset, toggleFavorite]);

  const handleWatchlist = useCallback(() => {
    if (!asset) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isWatchlisted) {
      mixpanel.trackWatchlistAdded(asset.id);
    }
    toggleWatchlist(asset.id);
    showToast(isWatchlisted ? 'Removed from watchlist' : 'Added to watchlist');
  }, [asset, toggleWatchlist, isWatchlisted, showToast]);

  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `cm-new-${Date.now()}`,
      user: { id: 'u1', name: 'Elena Voss', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', wallet: '0x7a3B...9f2E' },
      text: newComment.trim(),
      timestamp: 'Just now',
    };
    setComments(prev => [comment, ...prev]);
    setNewComment('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast('Comment added');
  }, [newComment, showToast]);

  const handleSetAlert = useCallback(() => {
    if (!asset) return;
    const below = alertBelow ? parseFloat(alertBelow) : undefined;
    const above = alertAbove ? parseFloat(alertAbove) : undefined;
    if (!below && !above) return;
    addPriceAlert({
      id: `alert-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      belowPrice: below,
      abovePrice: above,
    });
    setShowAlertModal(false);
    setAlertBelow('');
    setAlertAbove('');
    showToast('Price alert set');
  }, [asset, alertBelow, alertAbove, addPriceAlert, showToast]);

  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case 'Minted': return <Sparkles size={16} color={Colors.warning} />;
      case 'Listed': return <Tag size={16} color={Colors.accent} />;
      case 'Sold': return <CheckCircle size={16} color={Colors.success} />;
      case 'Transfer': return <ArrowRightLeft size={16} color={Colors.bid} />;
      case 'Bid': return <Gavel size={16} color={Colors.polygon} />;
      default: return <ExternalLink size={16} color={Colors.textTertiary} />;
    }
  }, []);

  if (!asset) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Asset not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalFractionsSold = fractionHolders.reduce((sum, f) => sum + f.sharesPercent, 0);

  const tabs: { key: DetailTab; label: string; count: number }[] = [
    { key: 'bids', label: 'Bids', count: asset.bids.length },
    { key: 'activity', label: 'Activity', count: asset.activity.length },
    { key: 'resale', label: 'Resale', count: resaleHistory.length },
    { key: 'fractions', label: 'Fractions', count: fractionHolders.length },
    { key: 'comments', label: 'Comments', count: comments.length },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: asset.image }} style={styles.image} contentFit="cover" />
          <View style={[styles.imageOverlay, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} testID="back-btn">
              <ArrowLeft size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleWatchlist}>
                <Bookmark size={20} color={isWatchlisted ? Colors.accent : Colors.textPrimary} fill={isWatchlisted ? Colors.accent : 'none'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleFavorite}>
                <Heart size={20} color={isFavorited ? Colors.error : Colors.textPrimary} fill={isFavorited ? Colors.error : 'none'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); showToast('Link copied to clipboard'); }}>
                <Share2 size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.assetName}>{asset.name}</Text>
                {isVerified && <BadgeCheck size={20} color={Colors.verified} />}
              </View>
              <View style={styles.metaRow}>
                <View style={[styles.statusBadge, { backgroundColor: asset.status === 'Auction' ? Colors.bid : asset.status === 'New' ? Colors.warning : Colors.accent }]}>
                  <Text style={styles.statusText}>{asset.status}</Text>
                </View>
                <View style={styles.viewsRow}>
                  <Eye size={14} color={Colors.textTertiary} />
                  <Text style={styles.viewsText}>{asset.views.toLocaleString()} views</Text>
                </View>
              </View>
            </View>
          </View>

          {asset.saleType === 'auction' && auctionEndTime && (
            <View style={styles.auctionCard}>
              <Text style={styles.auctionLabel}>Auction ends in</Text>
              <AuctionTimer endTime={auctionEndTime} />
            </View>
          )}

          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Current Price</Text>
            <Text style={styles.priceValue}>{asset.price} ETH</Text>
            <Text style={styles.priceUsd}>${asset.priceUsd.toLocaleString()}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.alertBtn} onPress={() => setShowAlertModal(true)}>
              <Bell size={16} color={Colors.accent} />
              <Text style={styles.alertBtnText}>Set Alert</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportBtn} onPress={() => router.push('/report' as any)}>
              <Flag size={16} color={Colors.error} />
              <Text style={styles.reportBtnText}>Report</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ownerCard}>
            <Image source={{ uri: asset.owner.avatar }} style={styles.ownerAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerLabel}>Owned by</Text>
              <Text style={styles.ownerName}>{asset.owner.name}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowReviewsModal(true)}>
              <View style={styles.ratingRow}>
                <Star size={14} color={Colors.gold} fill={Colors.gold} />
                <Text style={styles.ratingText}>4.5</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{asset.description}</Text>

          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsCard}>
            {[
              ['Token ID', `#${asset.tokenId}`],
              ['Contract', `${asset.contractAddress.slice(0, 8)}...${asset.contractAddress.slice(-6)}`],
              ['Blockchain', asset.blockchain],
              ['Token Standard', asset.tokenStandard],
              ['Royalty', `${asset.royalty}%`],
              ['Supply', asset.supply.toLocaleString()],
            ].map(([label, value]) => (
              <View key={label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{label}</Text>
                <View style={styles.detailValueRow}>
                  <Text style={styles.detailValue}>{value}</Text>
                  {label === 'Contract' && <Copy size={12} color={Colors.textTertiary} />}
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Price History</Text>
          <View style={styles.chartCard}>
            <PriceChart data={asset.priceHistory} width={300} height={180} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollRow}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabChip, activeTab === tab.key && styles.tabChipActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabChipText, activeTab === tab.key && styles.tabChipTextActive]}>
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {activeTab === 'bids' && (
            <View style={styles.tableCard}>
              {asset.bids.map(bid => (
                <View key={bid.id} style={styles.bidRow}>
                  <Image source={{ uri: bid.bidder.avatar }} style={styles.bidAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bidName}>{bid.bidder.name}</Text>
                    <Text style={styles.bidTime}>{bid.timestamp}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' as const }}>
                    <Text style={styles.bidAmount}>{bid.amount} ETH</Text>
                    <Text style={styles.bidUsd}>${bid.amountUsd.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'activity' && (
            <View style={styles.tableCard}>
              {asset.activity.map(event => (
                <View key={event.id} style={styles.activityRow}>
                  <View style={styles.activityIcon}>{getActivityIcon(event.type)}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityType}>{event.type}</Text>
                    <Text style={styles.activityDetail}>{event.from} → {event.to}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' as const }}>
                    {event.price && <Text style={styles.activityPrice}>{event.price} ETH</Text>}
                    <Text style={styles.activityTime}>{event.timestamp}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'resale' && (
            <View style={styles.tableCard}>
              {resaleHistory.map(entry => (
                <View key={entry.id} style={styles.resaleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resaleDate}>{entry.date}</Text>
                    <Text style={styles.resaleWallets}>{entry.from} → {entry.to}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' as const }}>
                    <Text style={styles.resalePrice}>{entry.price} ETH</Text>
                    <Text style={styles.resaleUsd}>${entry.priceUsd.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'fractions' && (
            <View>
              <View style={styles.fractionHeader}>
                <View style={styles.donutContainer}>
                  <Svg width={120} height={120}>
                    {fractionHolders.map((holder, i) => {
                      const colors = ['#7AB648', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
                      const startAngle = fractionHolders.slice(0, i).reduce((sum, h) => sum + h.sharesPercent, 0) * 3.6;
                      const endAngle = startAngle + holder.sharesPercent * 3.6;
                      const startRad = (startAngle - 90) * Math.PI / 180;
                      const endRad = (endAngle - 90) * Math.PI / 180;
                      const x1 = 60 + 45 * Math.cos(startRad);
                      const y1 = 60 + 45 * Math.sin(startRad);
                      const x2 = 60 + 45 * Math.cos(endRad);
                      const y2 = 60 + 45 * Math.sin(endRad);
                      const largeArc = holder.sharesPercent > 50 ? 1 : 0;
                      return (
                        <SvgCircle
                          key={holder.id}
                          cx={60}
                          cy={60}
                          r={45}
                          fill="none"
                          stroke={colors[i % colors.length]}
                          strokeWidth={16}
                          strokeDasharray={`${holder.sharesPercent * 2.827} ${(100 - holder.sharesPercent) * 2.827}`}
                          strokeDashoffset={-fractionHolders.slice(0, i).reduce((sum, h) => sum + h.sharesPercent, 0) * 2.827}
                        />
                      );
                    })}
                    <SvgText x={60} y={56} textAnchor="middle" fontSize={16} fontWeight="bold" fill={Colors.textPrimary}>{totalFractionsSold}%</SvgText>
                    <SvgText x={60} y={72} textAnchor="middle" fontSize={9} fill={Colors.textTertiary}>Sold</SvgText>
                  </Svg>
                </View>
                <View style={styles.fractionProgress}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${totalFractionsSold}%` }]} />
                  </View>
                  <Text style={styles.fractionAvailable}>{100 - totalFractionsSold}% still available</Text>
                </View>
              </View>

              <View style={styles.tableCard}>
                {fractionHolders.map(holder => (
                  <View key={holder.id} style={styles.fractionRow}>
                    <Image source={{ uri: holder.user.avatar }} style={styles.fractionAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fractionName}>{holder.user.name}</Text>
                      <Text style={styles.fractionShares}>{holder.sharesPercent}% ownership</Text>
                    </View>
                    <Text style={styles.fractionValue}>${holder.value.toLocaleString()}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.buyFractionBtn} onPress={handleBuy}>
                <PieChart size={16} color={Colors.white} />
                <Text style={styles.buyFractionText}>Buy Fraction</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'comments' && (
            <View>
              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  placeholderTextColor={Colors.textTertiary}
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity style={styles.commentSendBtn} onPress={handleAddComment}>
                  <Send size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
              <View style={styles.tableCard}>
                {comments.map(comment => (
                  <View key={comment.id} style={styles.commentRow}>
                    <Image source={{ uri: comment.user.avatar }} style={styles.commentAvatar} />
                    <View style={{ flex: 1 }}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentName}>{comment.user.name}</Text>
                        <Text style={styles.commentTime}>{comment.timestamp}</Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <TouchableOpacity onPress={() => showToast('Comment reported')}>
                        <Text style={styles.commentReport}>Report</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.bidBtn} onPress={handleBid} testID="place-bid-btn">
          <Gavel size={18} color={Colors.accent} />
          <Text style={styles.bidBtnText}>Place Bid</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuy} testID="buy-now-btn">
          <Text style={styles.buyBtnText}>Buy Now — {asset.price} ETH</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showBuyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {buyState === 'idle' && (
              <>
                <Text style={styles.modalTitle}>Confirm Purchase</Text>
                <View style={styles.modalAssetRow}>
                  <Image source={{ uri: asset.image }} style={styles.modalImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalAssetName}>{asset.name}</Text>
                    <Text style={styles.modalAssetPrice}>{asset.price} ETH</Text>
                  </View>
                </View>
                <View style={styles.modalDivider} />
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Item Price</Text>
                  <Text style={styles.modalDetailValue}>{asset.price} ETH</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Gas Fee (est.)</Text>
                  <Text style={styles.modalDetailValue}>0.002 ETH</Text>
                </View>
                <View style={styles.modalDivider} />
                <View style={styles.modalDetailRow}>
                  <Text style={[styles.modalDetailLabel, { fontWeight: '700' as const }]}>Total</Text>
                  <Text style={[styles.modalDetailValue, { fontWeight: '800' as const, color: Colors.accent }]}>
                    {(asset.price + 0.002).toFixed(3)} ETH
                  </Text>
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setShowBuyModal(false); setBuyState('idle'); }}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmBuy}>
                    <Text style={styles.modalConfirmText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {buyState === 'loading' && (
              <View style={styles.modalCenter}>
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={styles.modalLoadingText}>Processing transaction...</Text>
              </View>
            )}
            {buyState === 'success' && (
              <View style={styles.modalCenter}>
                <View style={styles.successCircle}><CheckCircle size={40} color={Colors.accent} /></View>
                <Text style={styles.modalSuccessTitle}>Purchase Complete!</Text>
                <Text style={styles.txHash}>0x8f3a...b72e4d91</Text>
                <TouchableOpacity style={styles.modalDoneBtn} onPress={() => { setShowBuyModal(false); setBuyState('idle'); }}>
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showBidModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {bidState === 'idle' && (
              <>
                <Text style={styles.modalTitle}>Place a Bid</Text>
                <View style={styles.modalAssetRow}>
                  <Image source={{ uri: asset.image }} style={styles.modalImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalAssetName}>{asset.name}</Text>
                    <Text style={styles.modalAssetPrice}>Highest: {asset.bids[0]?.amount || 0} ETH</Text>
                  </View>
                </View>
                <Text style={styles.bidInputLabel}>Your Bid (ETH)</Text>
                <TextInput style={styles.bidInput} placeholder="0.00" placeholderTextColor={Colors.textTertiary} keyboardType="numeric" value={bidAmount} onChangeText={setBidAmount} testID="bid-input" />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setShowBidModal(false); setBidState('idle'); setBidAmount(''); }}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmBid}>
                    <Text style={styles.modalConfirmText}>Place Bid</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {bidState === 'loading' && (
              <View style={styles.modalCenter}>
                <ActivityIndicator size="large" color={Colors.bid} />
                <Text style={styles.modalLoadingText}>Submitting bid...</Text>
              </View>
            )}
            {bidState === 'success' && (
              <View style={styles.modalCenter}>
                <View style={[styles.successCircle, { backgroundColor: '#EFF6FF' }]}><Gavel size={40} color={Colors.bid} /></View>
                <Text style={styles.modalSuccessTitle}>Bid Confirmed!</Text>
                <Text style={styles.modalSubText}>Your bid of {bidAmount} ETH has been placed</Text>
                <TouchableOpacity style={[styles.modalDoneBtn, { backgroundColor: Colors.bid }]} onPress={() => { setShowBidModal(false); setBidState('idle'); setBidAmount(''); }}>
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showAlertModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAlertModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Price Alert</Text>
            <Text style={styles.bidInputLabel}>Notify when price drops below (ETH)</Text>
            <TextInput style={styles.bidInput} placeholder="0.00" placeholderTextColor={Colors.textTertiary} keyboardType="numeric" value={alertBelow} onChangeText={setAlertBelow} />
            <Text style={[styles.bidInputLabel, { marginTop: 12 }]}>Notify when price rises above (ETH)</Text>
            <TextInput style={styles.bidInput} placeholder="0.00" placeholderTextColor={Colors.textTertiary} keyboardType="numeric" value={alertAbove} onChangeText={setAlertAbove} />
            <TouchableOpacity style={[styles.modalConfirmBtn, { marginTop: 16 }]} onPress={handleSetAlert}>
              <Text style={styles.modalConfirmText}>Set Alert</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showReviewsModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowReviewsModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.reviewHeader}>
              <Text style={styles.modalTitle}>Seller Reviews</Text>
              <TouchableOpacity onPress={() => setShowReviewsModal(false)}>
                <X size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.ratingOverview}>
              <Text style={styles.ratingBig}>4.5</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={16} color={Colors.gold} fill={s <= 4 ? Colors.gold : 'none'} />
                ))}
              </View>
              <Text style={styles.reviewCount}>{sellerReviews.length} reviews</Text>
            </View>
            {sellerReviews.map(review => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewItemHeader}>
                  <Image source={{ uri: review.user.avatar }} style={styles.reviewAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{review.user.name}</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={10} color={Colors.gold} fill={s <= review.rating ? Colors.gold : 'none'} />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewTime}>{review.timestamp}</Text>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },
  backLink: { fontSize: 15, color: Colors.accent, textAlign: 'center', marginTop: 12, fontWeight: '600' },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 300 },
  imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  imageActions: { flexDirection: 'row', gap: 8 },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  assetName: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  viewsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewsText: { fontSize: 12, color: Colors.textTertiary },
  auctionCard: { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, marginTop: 16, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#BFDBFE' },
  auctionLabel: { fontSize: 12, fontWeight: '600', color: Colors.bid },
  priceCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 20, marginTop: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  priceLabel: { fontSize: 12, color: Colors.textTertiary, fontWeight: '500' },
  priceValue: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, marginTop: 4 },
  priceUsd: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  alertBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E8F5E2', borderWidth: 1, borderColor: Colors.primaryLight },
  alertBtnText: { fontSize: 12, fontWeight: '600', color: Colors.accent },
  reportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  reportBtnText: { fontSize: 12, fontWeight: '600', color: Colors.error },
  ownerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginTop: 12, gap: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  ownerAvatar: { width: 40, height: 40, borderRadius: 20 },
  ownerLabel: { fontSize: 11, color: Colors.textTertiary },
  ownerName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  ratingText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 24, marginBottom: 12, letterSpacing: -0.3 },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  detailsCard: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  detailLabel: { fontSize: 13, color: Colors.textTertiary },
  detailValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, fontFamily: 'monospace' },
  chartCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  tabScrollRow: { marginTop: 24, gap: 8, paddingBottom: 8 },
  tabChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  tabChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  tabChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  tabChipTextActive: { color: Colors.white },
  tableCard: { marginTop: 8 },
  bidRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  bidAvatar: { width: 36, height: 36, borderRadius: 18 },
  bidName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  bidTime: { fontSize: 11, color: Colors.textTertiary },
  bidAmount: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  bidUsd: { fontSize: 11, color: Colors.textTertiary },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  activityIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  activityType: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  activityDetail: { fontSize: 11, color: Colors.textTertiary, fontFamily: 'monospace' },
  activityPrice: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  activityTime: { fontSize: 11, color: Colors.textTertiary },
  resaleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  resaleDate: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  resaleWallets: { fontSize: 11, color: Colors.textTertiary, fontFamily: 'monospace', marginTop: 2 },
  resalePrice: { fontSize: 14, fontWeight: '700', color: Colors.accent },
  resaleUsd: { fontSize: 11, color: Colors.textTertiary },
  fractionHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 8 },
  donutContainer: { alignItems: 'center' },
  fractionProgress: { flex: 1, gap: 8 },
  progressBarBg: { height: 8, backgroundColor: Colors.cardBorder, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  fractionAvailable: { fontSize: 12, color: Colors.textTertiary },
  fractionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  fractionAvatar: { width: 32, height: 32, borderRadius: 16 },
  fractionName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  fractionShares: { fontSize: 11, color: Colors.textTertiary },
  fractionValue: { fontSize: 13, fontWeight: '700', color: Colors.accent },
  buyFractionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.accent, marginTop: 16 },
  buyFractionText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  commentInputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  commentInput: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.cardBorder },
  commentSendBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  commentRow: { flexDirection: 'row', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  commentAvatar: { width: 32, height: 32, borderRadius: 16 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  commentTime: { fontSize: 10, color: Colors.textTertiary },
  commentText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginTop: 4 },
  commentReport: { fontSize: 10, color: Colors.error, marginTop: 4 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, gap: 10, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  bidBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, borderRadius: 14, borderWidth: 2, borderColor: Colors.accent, backgroundColor: '#E8F5E2' },
  bidBtnText: { fontSize: 14, fontWeight: '700', color: Colors.accent },
  buyBtn: { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, backgroundColor: Colors.accent, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buyBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: Colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 },
  modalAssetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalImage: { width: 56, height: 56, borderRadius: 12 },
  modalAssetName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  modalAssetPrice: { fontSize: 13, color: Colors.textSecondary },
  modalDivider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: 12 },
  modalDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  modalDetailLabel: { fontSize: 14, color: Colors.textSecondary },
  modalDetailValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  modalConfirmBtn: { flex: 2, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: Colors.accent },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  modalCenter: { alignItems: 'center', paddingVertical: 20, gap: 12 },
  modalLoadingText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  modalSubText: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center' },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E2', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  modalSuccessTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  txHash: { fontSize: 13, fontFamily: 'monospace', color: Colors.accent, backgroundColor: '#E8F5E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  modalDoneBtn: { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.accent, marginTop: 8 },
  modalDoneText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  bidInputLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  bidInput: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, fontWeight: '700', color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.cardBorder },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  ratingOverview: { alignItems: 'center', marginBottom: 16 },
  ratingBig: { fontSize: 36, fontWeight: '900', color: Colors.textPrimary },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
  reviewCount: { fontSize: 12, color: Colors.textTertiary, marginTop: 4 },
  reviewItem: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  reviewItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 28, height: 28, borderRadius: 14 },
  reviewName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  reviewTime: { fontSize: 10, color: Colors.textTertiary },
  reviewText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginTop: 6 },
});
