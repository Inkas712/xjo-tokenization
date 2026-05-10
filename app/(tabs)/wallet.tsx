import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Eye, EyeOff, RefreshCw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCrypto } from '@/contexts/CryptoContext';
import { useUser } from '@/contexts/UserContext';

export default function WalletScreen() {
  const { walletBalance, walletTransactions, isWalletLoading, walletAddress, updateWalletAddress, refreshWallet } = useCrypto();
  const { isBalanceVisible, toggleBalanceVisibility } = useUser();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputAddress, setInputAddress] = useState<string>(walletAddress);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const totalValue = useMemo(() => {
    if (!walletBalance) return 0;
    let total = walletBalance.native.usd_value || 0;
    walletBalance.tokens.forEach(token => {
      total += token.usd_value || 0;
    });
    return total;
  }, [walletBalance]);

  const handleUpdateAddress = () => {
    if (!inputAddress || inputAddress.length < 10) {
      Alert.alert('Invalid Address', 'Please enter a valid Ethereum wallet address');
      return;
    }
    updateWalletAddress(inputAddress);
    setIsEditing(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWallet();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (value: number) => {
    if (!isBalanceVisible) return '****';
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
          activeOpacity={0.7}
        >
          <RefreshCw 
            size={20} 
            color={Colors.primary}
            style={isRefreshing ? { transform: [{ rotate: '180deg' }] } : {}}
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.walletAddressCard}>
          <View style={styles.walletAddressHeader}>
            <WalletIcon size={20} color={Colors.primary} />
            <Text style={styles.walletAddressLabel}>Wallet Address (Read-Only)</Text>
          </View>
          
          {isEditing ? (
            <View>
              <TextInput
                style={styles.addressInput}
                value={inputAddress}
                onChangeText={setInputAddress}
                placeholder="0x..."
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.addressActions}>
                <TouchableOpacity
                  style={[styles.addressActionButton, styles.cancelButton]}
                  onPress={() => {
                    setInputAddress(walletAddress);
                    setIsEditing(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addressActionButton, styles.saveButton]}
                  onPress={handleUpdateAddress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addressDisplay}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.addressText}>{formatAddress(walletAddress)}</Text>
              <Text style={styles.tapToEdit}>Tap to edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.totalValueCard}>
          <View style={styles.totalValueHeader}>
            <Text style={styles.totalValueLabel}>Total Wallet Value</Text>
            <TouchableOpacity onPress={toggleBalanceVisibility} activeOpacity={0.7}>
              {isBalanceVisible ? (
                <Eye size={20} color={Colors.cardBackground} opacity={0.9} />
              ) : (
                <EyeOff size={20} color={Colors.cardBackground} opacity={0.9} />
              )}
            </TouchableOpacity>
          </View>
          {isWalletLoading ? (
            <ActivityIndicator size="large" color={Colors.cardBackground} style={styles.loader} />
          ) : (
            <Text style={styles.totalValueAmount}>${formatBalance(totalValue)}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balances</Text>
          
          {isWalletLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading wallet data...</Text>
            </View>
          ) : !walletBalance ? (
            <View style={styles.emptyContainer}>
              <WalletIcon size={48} color={Colors.textSecondary} opacity={0.5} />
              <Text style={styles.emptyText}>No wallet data available</Text>
              <Text style={styles.emptySubtext}>Check your wallet address or try again</Text>
            </View>
          ) : (
            <>
              <View style={styles.tokenCard}>
                <View style={styles.tokenIconContainer}>
                  <WalletIcon size={24} color={Colors.primary} />
                </View>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenName}>Ethereum (ETH)</Text>
                  <Text style={styles.tokenBalance}>
                    {isBalanceVisible 
                      ? `${parseFloat(walletBalance.native.balance_formatted).toFixed(6)} ETH`
                      : '****'}
                  </Text>
                </View>
                <View style={styles.tokenValueContainer}>
                  <Text style={styles.tokenValue}>
                    ${formatBalance(walletBalance.native.usd_value || 0)}
                  </Text>
                </View>
              </View>

              {walletBalance.tokens.map((token, index) => (
                <View key={token.token_address} style={styles.tokenCard}>
                  <View style={styles.tokenIconContainer}>
                    {token.logo ? (
                      <View style={styles.tokenLogo}>
                        <Text style={styles.tokenSymbol}>{token.symbol.slice(0, 2)}</Text>
                      </View>
                    ) : (
                      <View style={styles.tokenLogo}>
                        <Text style={styles.tokenSymbol}>{token.symbol.slice(0, 2)}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenName}>{token.name}</Text>
                    <Text style={styles.tokenBalance}>
                      {isBalanceVisible 
                        ? `${parseFloat(token.balance_formatted).toFixed(6)} ${token.symbol}`
                        : '****'}
                    </Text>
                  </View>
                  <View style={styles.tokenValueContainer}>
                    <Text style={styles.tokenValue}>
                      ${formatBalance(token.usd_value || 0)}
                    </Text>
                    {token.usd_price_24hr_percent_change !== undefined && isBalanceVisible && (
                      <View style={styles.changeContainer}>
                        {token.usd_price_24hr_percent_change > 0 ? (
                          <TrendingUp size={12} color={Colors.success} />
                        ) : (
                          <TrendingDown size={12} color={Colors.error} />
                        )}
                        <Text 
                          style={[
                            styles.changeText, 
                            { color: token.usd_price_24hr_percent_change > 0 ? Colors.success : Colors.error }
                          ]}
                        >
                          {Math.abs(token.usd_price_24hr_percent_change).toFixed(2)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {walletBalance.tokens.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptySubtext}>No tokens found in this wallet</Text>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          {isWalletLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : walletTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptySubtext}>No transactions found</Text>
            </View>
          ) : (
            <>
              {walletTransactions.slice(0, 10).map((tx) => {
                const isSent = tx.from_address.toLowerCase() === walletAddress.toLowerCase();
                const value = parseFloat(tx.value) / 1e18;
                
                return (
                  <View key={tx.hash} style={styles.transactionCard}>
                    <View style={[styles.transactionIcon, { backgroundColor: isSent ? Colors.error + '20' : Colors.success + '20' }]}>
                      {isSent ? (
                        <ArrowUpRight size={20} color={Colors.error} />
                      ) : (
                        <ArrowDownLeft size={20} color={Colors.success} />
                      )}
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionType}>{isSent ? 'Sent' : 'Received'}</Text>
                      <Text style={styles.transactionDate}>{formatDate(tx.block_timestamp)}</Text>
                    </View>
                    <View style={styles.transactionValueContainer}>
                      <Text style={[styles.transactionValue, { color: isSent ? Colors.error : Colors.success }]}>
                        {isSent ? '-' : '+'}{value.toFixed(6)} ETH
                      </Text>
                      <Text style={styles.transactionAddress}>
                        {isSent ? `To: ${formatAddress(tx.to_address)}` : `From: ${formatAddress(tx.from_address)}`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Read-Only Mode</Text>
          <Text style={styles.disclaimerText}>
            This wallet is in read-only mode. You can view balances and transactions, but cannot send or receive funds. 
            No private keys or seed phrases are stored.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  walletAddressCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  walletAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  walletAddressLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  addressInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addressActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.cardBackground,
  },
  addressDisplay: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  tapToEdit: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  totalValueCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  totalValueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalValueLabel: {
    fontSize: 14,
    color: Colors.cardBackground,
    opacity: 0.9,
    fontWeight: '500' as const,
  },
  totalValueAmount: {
    fontSize: 42,
    fontWeight: '700' as const,
    color: Colors.cardBackground,
  },
  loader: {
    marginVertical: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  loadingContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tokenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  tokenIconContainer: {
    marginRight: 12,
  },
  tokenLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  tokenBalance: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tokenValueContainer: {
    alignItems: 'flex-end',
  },
  tokenValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  transactionValueContainer: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  transactionAddress: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  disclaimerCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
