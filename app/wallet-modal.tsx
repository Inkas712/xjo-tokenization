import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Wallet, LogOut, ChevronRight, Shield, Zap, Globe, RefreshCw, CheckCircle, XCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useWallet, WalletType, WALLETCONNECT_METADATA } from '@/contexts/WalletContext';

const NETWORK_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  137: 'Polygon',
  80002: 'Polygon Amoy',
  56: 'BNB Chain',
  42161: 'Arbitrum',
  10: 'Optimism',
};

export default function WalletModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    isConnected, walletType, address, fullAddress, balance, connectWallet, disconnectWallet,
    ethUsdPrice, connectionStatus, testConnections,
    isConnecting, connectionError, hasInjectedWallet, detectedWalletName, chainId,
  } = useWallet();

  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (isConnected && !connectionStatus.lastTested) {
      testConnections();
    }
  }, [isConnected, connectionStatus.lastTested, testConnections]);

  const handleConnect = useCallback((type: WalletType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    connectWallet(type);
  }, [connectWallet]);

  const handleDisconnect = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    disconnectWallet();
    router.back();
  }, [disconnectWallet, router]);

  const handleTestConnections = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    testConnections();
  }, [testConnections]);

  const handleCopyAddress = useCallback(() => {
    if (!fullAddress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullAddress);
    }
  }, [fullAddress]);

  const handleViewExplorer = useCallback(() => {
    if (!fullAddress) return;
    const explorerUrl = chainId === 137
      ? `https://polygonscan.com/address/${fullAddress}`
      : `https://www.oklink.com/amoy/address/${fullAddress}`;
    Linking.openURL(explorerUrl);
  }, [fullAddress, chainId]);

  const getStatusIcon = (connected: boolean | null | undefined) => {
    if (connected === null || connected === undefined) {
      return <AlertCircle size={14} color={Colors.textTertiary} />;
    }
    return connected
      ? <CheckCircle size={14} color="#22C55E" />
      : <XCircle size={14} color="#EF4444" />;
  };

  const getStatusColor = (connected: boolean | null | undefined): string => {
    if (connected === null || connected === undefined) return Colors.textTertiary;
    return connected ? '#22C55E' : '#EF4444';
  };

  const networkName = chainId ? (NETWORK_NAMES[chainId] ?? `Chain ${chainId}`) : 'Unknown';

  const walletOptions: { type: WalletType; name: string; color: string; icon: string; available: boolean; subtitle: string }[] = isWeb && hasInjectedWallet
    ? [
        {
          type: (detectedWalletName as WalletType) ?? 'MetaMask',
          name: detectedWalletName ?? 'Browser Wallet',
          color: '#F6851B',
          icon: '🦊',
          available: true,
          subtitle: 'Detected in browser',
        },
      ]
    : [
        { type: 'MetaMask', name: 'MetaMask', color: '#F6851B', icon: '🦊', available: !isWeb, subtitle: isWeb ? 'Install MetaMask extension' : 'Demo mode' },
        { type: 'WalletConnect', name: 'WalletConnect', color: '#3B99FC', icon: '🔗', available: !isWeb, subtitle: 'Demo mode' },
        { type: 'Coinbase Wallet', name: 'Coinbase Wallet', color: '#0052FF', icon: '🔵', available: !isWeb, subtitle: 'Demo mode' },
      ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{isConnected ? 'Wallet' : 'Connect Wallet'}</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {isConnected ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.connectedContent} showsVerticalScrollIndicator={false}>
          <View style={styles.walletCard}>
            <View style={styles.walletIconLarge}>
              <Wallet size={28} color={Colors.accent} />
            </View>
            <Text style={styles.connectedLabel}>Connected with</Text>
            <Text style={styles.connectedType}>{walletType}</Text>

            {chainId && (
              <View style={styles.networkBadge}>
                <View style={[styles.networkDot, { backgroundColor: chainId === 137 || chainId === 80002 ? '#22C55E' : '#F59E0B' }]} />
                <Text style={styles.networkText}>{networkName}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.addressBox} onPress={handleCopyAddress} activeOpacity={0.7}>
              <Text style={styles.addressText}>{address}</Text>
              <Copy size={14} color={Colors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceValue}>{balance} MATIC</Text>
              <Text style={styles.balanceUsd}>
                ${(parseFloat(balance) * ethUsdPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            <TouchableOpacity style={styles.explorerBtn} onPress={handleViewExplorer}>
              <ExternalLink size={14} color={Colors.accent} />
              <Text style={styles.explorerText}>View on Explorer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Shield size={18} color={Colors.accent} />
              <Text style={styles.infoText}>Secure Connection</Text>
            </View>
            <View style={styles.infoCard}>
              <Zap size={18} color={Colors.warning} />
              <Text style={styles.infoText}>Gas Optimized</Text>
            </View>
            <View style={styles.infoCard}>
              <Globe size={18} color={Colors.bid} />
              <Text style={styles.infoText}>Multi-chain</Text>
            </View>
          </View>

          <View style={styles.serviceStatus}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceTitle}>Service Status</Text>
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={handleTestConnections}
                disabled={connectionStatus.testing}
              >
                {connectionStatus.testing ? (
                  <ActivityIndicator size="small" color={Colors.accent} />
                ) : (
                  <RefreshCw size={16} color={Colors.accent} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.serviceRow}>
              {getStatusIcon(connectionStatus.alchemy?.connected)}
              <Text style={styles.serviceLabel}>Alchemy RPC</Text>
              <Text style={[styles.serviceDetail, { color: getStatusColor(connectionStatus.alchemy?.connected) }]}>
                {connectionStatus.alchemy?.connected
                  ? `Block #${connectionStatus.alchemy.blockNumber ?? '?'}`
                  : connectionStatus.alchemy?.error ?? 'Not tested'}
              </Text>
            </View>

            <View style={styles.serviceRow}>
              {getStatusIcon(connectionStatus.supabase?.connected)}
              <Text style={styles.serviceLabel}>Supabase DB</Text>
              <Text style={[styles.serviceDetail, { color: getStatusColor(connectionStatus.supabase?.connected) }]}>
                {connectionStatus.supabase?.connected
                  ? `${connectionStatus.supabase.tables?.length ?? 0} tables`
                  : connectionStatus.supabase?.error ?? 'Not tested'}
              </Text>
            </View>

            <View style={styles.serviceRow}>
              {getStatusIcon(connectionStatus.pinata?.connected)}
              <Text style={styles.serviceLabel}>Pinata IPFS</Text>
              <Text style={[styles.serviceDetail, { color: getStatusColor(connectionStatus.pinata?.connected) }]}>
                {connectionStatus.pinata?.connected
                  ? `${connectionStatus.pinata.latencyMs}ms`
                  : connectionStatus.pinata?.error ?? 'Not tested'}
              </Text>
            </View>

            <View style={styles.serviceRow}>
              {getStatusIcon(connectionStatus.walletConnect.configured)}
              <Text style={styles.serviceLabel}>WalletConnect</Text>
              <Text style={[styles.serviceDetail, { color: getStatusColor(connectionStatus.walletConnect.configured) }]}>
                {connectionStatus.walletConnect.configured ? 'Configured' : 'Not set'}
              </Text>
            </View>

            {connectionStatus.lastTested && (
              <Text style={styles.lastTested}>
                Last tested: {new Date(connectionStatus.lastTested).toLocaleTimeString()}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
            <LogOut size={18} color={Colors.error} />
            <Text style={styles.disconnectText}>Disconnect Wallet</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.optionsContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.optionsSubtitle}>
            {isWeb && hasInjectedWallet
              ? `Connect your ${detectedWalletName ?? 'browser wallet'} to ${WALLETCONNECT_METADATA.name}`
              : isWeb
                ? 'Install a Web3 wallet like MetaMask to connect'
                : `Choose your preferred wallet to connect to ${WALLETCONNECT_METADATA.name}`
            }
          </Text>

          {isWeb && !hasInjectedWallet && (
            <TouchableOpacity
              style={styles.installWalletCard}
              onPress={() => Linking.openURL('https://metamask.io/download/')}
            >
              <Text style={styles.installWalletIcon}>🦊</Text>
              <View style={styles.installWalletInfo}>
                <Text style={styles.installWalletTitle}>Install MetaMask</Text>
                <Text style={styles.installWalletSubtitle}>Required for real wallet connection</Text>
              </View>
              <ExternalLink size={16} color={Colors.accent} />
            </TouchableOpacity>
          )}

          {connectionError && (
            <View style={styles.errorCard}>
              <XCircle size={16} color="#EF4444" />
              <Text style={styles.errorText}>{connectionError}</Text>
            </View>
          )}

          {walletOptions.map(wallet => (
            <TouchableOpacity
              key={wallet.type}
              style={[styles.walletOption, !wallet.available && isWeb && styles.walletOptionDisabled]}
              onPress={() => handleConnect(wallet.type)}
              disabled={isConnecting}
              testID={`wallet-${wallet.type}`}
            >
              <View style={[styles.walletIcon, { backgroundColor: wallet.color + '15' }]}>
                <Text style={styles.walletEmoji}>{wallet.icon}</Text>
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>{wallet.name}</Text>
                <Text style={styles.walletSubtitle}>{wallet.subtitle}</Text>
              </View>
              {isConnecting ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <ChevronRight size={18} color={Colors.textTertiary} />
              )}
            </TouchableOpacity>
          ))}

          {isWeb && !hasInjectedWallet && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or try demo</Text>
                <View style={styles.dividerLine} />
              </View>

              {[
                { type: 'MetaMask' as WalletType, name: 'MetaMask (Demo)', color: '#F6851B', icon: '🦊' },
                { type: 'WalletConnect' as WalletType, name: 'WalletConnect (Demo)', color: '#3B99FC', icon: '🔗' },
              ].map(wallet => (
                <TouchableOpacity
                  key={wallet.type}
                  style={[styles.walletOption, styles.demoOption]}
                  onPress={() => handleConnect(wallet.type)}
                  disabled={isConnecting}
                >
                  <View style={[styles.walletIcon, { backgroundColor: wallet.color + '10' }]}>
                    <Text style={styles.walletEmoji}>{wallet.icon}</Text>
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={[styles.walletName, { color: Colors.textSecondary }]}>{wallet.name}</Text>
                    <Text style={styles.walletSubtitle}>Simulated connection</Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </>
          )}

          <View style={styles.securityNote}>
            <Shield size={16} color={Colors.textTertiary} />
            <Text style={styles.securityText}>
              {isWeb && hasInjectedWallet
                ? 'Your private keys never leave your wallet. We only request view and transaction permissions.'
                : 'Your private keys never leave your wallet. We only request view permissions.'}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
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
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  walletCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  walletIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  connectedLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  connectedType: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  networkText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  addressText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: Colors.textSecondary,
  },
  balanceCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  balanceLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  balanceUsd: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  explorerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  explorerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  infoText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  disconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: '#FEF2F2',
  },
  disconnectText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.error,
  },
  optionsContent: {
    padding: 20,
    paddingBottom: 40,
  },
  optionsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  installWalletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  installWalletIcon: {
    fontSize: 28,
  },
  installWalletInfo: {
    flex: 1,
  },
  installWalletTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#C2410C',
  },
  installWalletSubtitle: {
    fontSize: 12,
    color: '#EA580C',
    marginTop: 2,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    lineHeight: 18,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  walletOptionDisabled: {
    opacity: 0.5,
  },
  demoOption: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
    shadowOpacity: 0,
    elevation: 0,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletEmoji: {
    fontSize: 24,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  walletSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.cardBorder,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500' as const,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 4,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  serviceStatus: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  serviceDetail: {
    fontSize: 11,
    fontWeight: '500' as const,
    maxWidth: 150,
    textAlign: 'right' as const,
  },
  lastTested: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center' as const,
    marginTop: 4,
  },
});
