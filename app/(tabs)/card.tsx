import { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Modal,
  Pressable,
  Alert
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Unlock, RefreshCw, XCircle, Shield, CreditCard as CardIcon, Info, Radio } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { demoCards } from '@/mocks/demo-data';
import { CardTransaction } from '@/types';
import { useUser } from '@/contexts/UserContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

export default function CardScreen() {
  const { user } = useUser();
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [cardStatuses, setCardStatuses] = useState<Record<string, 'active' | 'frozen'>>(
    demoCards.reduce((acc, card) => ({ ...acc, [card.id]: card.status }), {})
  );
  const [showCardDetails, setShowCardDetails] = useState<boolean>(false);
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);
  const [spendingLimit] = useState<number>(5000);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentCard = demoCards[currentCardIndex];
  const currentStatus = cardStatuses[currentCard.id];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentCardIndex && index >= 0 && index < demoCards.length) {
      setCurrentCardIndex(index);
    }
  };

  const toggleFreeze = () => {
    const newStatus = currentStatus === 'active' ? 'frozen' : 'active';
    setCardStatuses(prev => ({ ...prev, [currentCard.id]: newStatus }));
  };

  const handleCardTap = () => {
    setShowCardDetails(true);
  };

  const handleReissue = () => {
    Alert.alert('Reissue Card', 'Your new card will arrive in 5-7 business days.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reissue', style: 'default' }
    ]);
  };

  const handleClose = () => {
    Alert.alert(
      'Close Card',
      'Are you sure you want to close this card? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Close Card', style: 'destructive' }
      ]
    );
  };

  const handleEditLimit = () => {
    Alert.alert('Edit Spending Limit', 'Set your monthly spending limit', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Save', style: 'default' }
    ]);
  };

  const groupTransactionsByDate = (transactions: CardTransaction[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: { title: string; data: CardTransaction[] }[] = [
      { title: 'Today', data: [] },
      { title: 'This week', data: [] },
      { title: 'Earlier', data: [] },
    ];

    transactions.forEach(txn => {
      const txnDate = new Date(txn.date);
      const txnDay = new Date(txnDate.getFullYear(), txnDate.getMonth(), txnDate.getDate());

      if (txnDay.getTime() === today.getTime()) {
        groups[0].data.push(txn);
      } else if (txnDay >= weekAgo) {
        groups[1].data.push(txn);
      } else {
        groups[2].data.push(txn);
      }
    });

    return groups.filter(group => group.data.length > 0);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const transactionGroups = groupTransactionsByDate(currentCard.transactions);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.limitSection}>
          <View>
            <Text style={styles.limitLabel}>Spending limit</Text>
            <Text style={styles.limitAmount}>
              {currentCard.currency} {spendingLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditLimit}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={SCREEN_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={styles.cardsScrollContainer}
        >
          {demoCards.map((card) => (
            <TouchableOpacity 
              key={card.id} 
              style={styles.cardContainer}
              activeOpacity={0.95}
              onPress={handleCardTap}
            >
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTopLeft}>
                    <Text style={styles.brandText}>XJO</Text>
                    {cardStatuses[card.id] === 'frozen' && (
                      <View style={styles.frozenBadge}>
                        <Lock size={10} color="#FFFFFF" />
                        <Text style={styles.frozenText}>Frozen</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.logoContainer}>
                    <View style={styles.brandLogo}>
                      <Text style={styles.logoText}>🦅</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.cardMiddle}>
                  <View style={styles.chipContainer}>
                    <View style={styles.chip}>
                      <View style={styles.chipInner} />
                    </View>
                  </View>
                  <View style={styles.contactlessContainer}>
                    <Radio size={32} color="#7A9B7E" strokeWidth={2.5} />
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <View />
                  <View style={styles.mastercardLogo}>
                    <View style={[styles.mastercardCircle, styles.mastercardRed]} />
                    <View style={[styles.mastercardCircle, styles.mastercardOrange]} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.tapHint}>Tap to view card details</Text>

        {demoCards.length > 1 && (
          <View style={styles.pagination}>
            {demoCards.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentCardIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.7}
            onPress={toggleFreeze}
          >
            <View style={[styles.actionIconContainer, currentStatus !== 'active' && styles.actionIconActive]}>
              {currentStatus === 'active' ? (
                <Lock size={22} color={Colors.text} />
              ) : (
                <Unlock size={22} color={Colors.primary} />
              )}
            </View>
            <Text style={styles.actionText}>
              {currentStatus === 'active' ? 'Freeze card' : 'Unfreeze card'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.7}
            onPress={handleReissue}
          >
            <View style={styles.actionIconContainer}>
              <RefreshCw size={22} color={Colors.text} />
            </View>
            <Text style={styles.actionText}>Reissue card</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.7}
            onPress={handleClose}
          >
            <View style={[styles.actionIconContainer, styles.actionIconDanger]}>
              <XCircle size={22} color={Colors.error} />
            </View>
            <Text style={[styles.actionText, styles.actionTextDanger]}>Close card</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.transactionsTitle}>Transactions</Text>
          
          {transactionGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <CardIcon size={32} color={Colors.textSecondary} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>Your card activity will appear here</Text>
            </View>
          ) : (
            transactionGroups.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.transactionGroup}>
                {group.data.map((txn, index) => (
                  <TouchableOpacity 
                    key={txn.id} 
                    style={[
                      styles.transactionItem,
                      index === group.data.length - 1 && styles.transactionItemLast
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.transactionLeft}>
                      <Text style={styles.merchant}>{txn.merchant}</Text>
                      <Text style={styles.transactionDate}>{formatDate(txn.date)}</Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      txn.type === 'credit' && styles.creditAmount
                    ]}>
                      {txn.type === 'debit' ? '-' : '+'}{txn.currency} {txn.amount.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About your digital card</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Shield size={18} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Virtual and secure</Text>
              <Text style={styles.infoItemText}>Your card exists digitally and can be used for online purchases worldwide.</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Lock size={18} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Freeze anytime</Text>
              <Text style={styles.infoItemText}>Temporarily disable your card if it&apos;s lost or you suspect fraud.</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Info size={18} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoItemTitle}>Spending control</Text>
              <Text style={styles.infoItemText}>Set monthly limits to stay within your budget and track expenses.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showCardDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCardDetails(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowCardDetails(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Card Details</Text>
              <TouchableOpacity 
                onPress={() => setShowCardDetails(false)}
                style={styles.closeButton}
              >
                <XCircle size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cardholder name</Text>
                <Text style={styles.detailValue}>{user?.name || currentCard.cardholderName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card number</Text>
                <View style={styles.cardNumberRow}>
                  {showCardNumber ? (
                    <Text style={styles.detailValue}>{currentCard.cardNumberFull}</Text>
                  ) : (
                    <Text style={styles.detailValue}>{currentCard.cardNumber}</Text>
                  )}
                  <TouchableOpacity onPress={() => setShowCardNumber(!showCardNumber)}>
                    <Text style={styles.showButton}>
                      {showCardNumber ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expiry date</Text>
                <Text style={styles.detailValue}>{currentCard.expiryDate}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card type</Text>
                <Text style={styles.detailValue}>
                  {currentCard.type === 'virtual' ? 'Virtual' : 'Physical'}
                </Text>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  limitSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  limitLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500' as const,
  },
  limitAmount: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  cardsScrollContainer: {
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    paddingVertical: 12,
  },
  card: {
    borderRadius: 24,
    padding: 26,
    backgroundColor: '#C8E6C9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    minHeight: 220,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTopLeft: {
    flex: 1,
  },
  brandText: {
    fontSize: 56,
    fontWeight: '700' as const,
    color: '#7A9B7E',
    letterSpacing: 4,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(122, 155, 126, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7A9B7E',
  },
  logoText: {
    fontSize: 32,
  },
  frozenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(122, 155, 126, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  frozenText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#7A9B7E',
  },
  cardMiddle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  chipContainer: {
    alignItems: 'flex-start',
  },
  chip: {
    width: 52,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#B8B8B8',
    padding: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  chipInner: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#9E9E9E',
    borderRadius: 4,
  },
  contactlessContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '90deg' }],
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  mastercardLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: 60,
    height: 36,
  },
  mastercardCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    position: 'absolute',
  },
  mastercardRed: {
    backgroundColor: '#EB001B',
    left: 0,
  },
  mastercardOrange: {
    backgroundColor: '#FF5F00',
    right: 0,
  },
  tapHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 28,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  actionIconActive: {
    backgroundColor: Colors.primary + '10',
  },
  actionIconDanger: {
    backgroundColor: Colors.error + '08',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 16,
  },
  actionTextDanger: {
    color: Colors.error,
  },
  transactionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  emptyState: {
    paddingVertical: 56,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.border + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  transactionGroup: {
    marginBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border + '60',
  },
  transactionItemLast: {
    borderBottomWidth: 0,
  },
  transactionLeft: {
    flex: 1,
  },
  merchant: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  creditAmount: {
    color: Colors.primary,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 14,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  infoItemText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 40,
    paddingHorizontal: 24,
    minHeight: 400,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  detailsContent: {
    gap: 24,
  },
  detailRow: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  cardNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showButton: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
