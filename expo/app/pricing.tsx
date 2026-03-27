import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Crown,
  Check,
  X,
  Zap,
  Shield,
  BarChart3,
  Star,
  Infinity,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useWallet } from '@/contexts/WalletContext';
import { mixpanel } from '@/services/mixpanel';
import {
  createStripeCheckoutSession,
  openStripeCheckout,
  verifyStripePayment,
  StripePlan,
} from '@/services/stripe';
import { updateUserProStatus } from '@/services/supabase';

type BillingCycle = 'monthly' | 'annual';

type CheckoutState = 'idle' | 'creating' | 'waiting' | 'verifying' | 'success' | 'error';

export default function PricingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro, setIsPro, showToast, fullAddress } = useWallet();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);

  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  const runConfetti = () => {
    setShowConfetti(true);
    confettiAnims.forEach((anim) => {
      anim.x.setValue(0);
      anim.y.setValue(0);
      anim.opacity.setValue(1);
      const targetX = (Math.random() - 0.5) * 300;
      const targetY = Math.random() * -400 - 100;
      Animated.parallel([
        Animated.timing(anim.x, { toValue: targetX, duration: 1500, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(anim.y, { toValue: targetY, duration: 600, useNativeDriver: true }),
          Animated.timing(anim.y, { toValue: 200, duration: 900, useNativeDriver: true }),
        ]),
        Animated.timing(anim.opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]).start();
    });
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleUpgrade = async () => {
    setCheckoutState('creating');
    setErrorMessage('');
    mixpanel.trackProUpgradeClicked(billingCycle);

    const result = await createStripeCheckoutSession(
      billingCycle as StripePlan,
      fullAddress || 'unknown',
    );

    if (!result.success || !result.sessionUrl) {
      setCheckoutState('error');
      setErrorMessage(result.error || 'Could not create checkout session');
      return;
    }

    setSessionId(result.sessionId || '');
    setCheckoutState('waiting');

    const browserResult = await openStripeCheckout(result.sessionUrl);
    console.log('[Pricing] Browser result:', browserResult);

    setCheckoutState('idle');
    if (result.sessionId) {
      setShowVerifyModal(true);
    }
  };

  const handleVerifyPayment = async () => {
    if (!sessionId) {
      showToast('No session to verify', 'error');
      return;
    }

    setCheckoutState('verifying');
    setShowVerifyModal(false);

    const result = await verifyStripePayment(sessionId, fullAddress || '');

    if (!result.success) {
      setCheckoutState('error');
      setErrorMessage(result.error || 'Verification failed');
      return;
    }

    if (result.isPaid) {
      await updateUserProStatus(fullAddress || '', true, result.plan);
      setIsPro(true);
      setCheckoutState('success');
      showToast('Welcome to Pro! All features unlocked 🎉');
      runConfetti();
      mixpanel.trackProUpgradeCompleted(billingCycle, billingCycle === 'monthly' ? 29 : 249);
      setTimeout(() => setCheckoutState('idle'), 2000);
    } else {
      setCheckoutState('error');
      setErrorMessage('Payment not completed. Please finish checkout or try again.');
    }
  };

  const monthlyPrice = 29;
  const annualPrice = 249;
  const price = billingCycle === 'monthly' ? monthlyPrice : annualPrice;

  const isLoading = checkoutState === 'creating' || checkoutState === 'verifying';

  const freeFeatures = [
    { text: '2.5% commission on sales', included: true },
    { text: 'Up to 5 active listings', included: true },
    { text: 'Basic analytics', included: true },
    { text: 'Standard verification queue', included: true },
    { text: 'Community support', included: true },
    { text: 'Unlimited listings', included: false },
    { text: 'Advanced analytics', included: false },
    { text: 'Priority verification', included: false },
    { text: 'Bundle sales', included: false },
    { text: 'Featured listings', included: false },
  ];

  const proFeatures = [
    { text: '0% commission on sales', included: true },
    { text: 'Unlimited active listings', included: true },
    { text: 'Advanced analytics dashboard', included: true },
    { text: 'Priority verification queue', included: true },
    { text: 'Priority support', included: true },
    { text: 'Pro badge on profile', included: true },
    { text: 'Bundle sales creation', included: true },
    { text: 'Featured listing boosts', included: true },
    { text: 'Tax report generation', included: true },
    { text: 'Whale tracker access', included: true },
  ];

  const confettiColors = ['#7AB648', '#93C572', '#FFD700', '#3B82F6', '#EC4899', '#F59E0B'];

  return (
    <View style={styles.container}>
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {confettiAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confettiPiece,
                {
                  backgroundColor: confettiColors[i % confettiColors.length],
                  transform: [{ translateX: anim.x }, { translateY: anim.y }],
                  opacity: anim.opacity,
                  left: '50%',
                  top: '40%',
                },
              ]}
            />
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Pricing</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.crownBg}>
            <Crown size={32} color="#FFD700" fill="#FFD700" />
          </View>
          <Text style={styles.heroTitle}>Unlock the Full Power{'\n'}of the Platform</Text>
          <Text style={styles.heroSub}>Get Pro access for advanced tools, zero commission, and exclusive features</Text>
        </View>

        {isPro && (
          <View style={styles.proBanner}>
            <Crown size={18} color="#FFD700" />
            <Text style={styles.proBannerText}>You are a Pro member!</Text>
            <TouchableOpacity onPress={() => router.push('/billing' as any)}>
              <Text style={styles.manageBilling}>Manage Billing</Text>
            </TouchableOpacity>
          </View>
        )}

        {checkoutState === 'error' && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color={Colors.error} />
            <Text style={styles.errorBannerText} numberOfLines={2}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => setCheckoutState('idle')}>
              <X size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[styles.billingOption, billingCycle === 'monthly' && styles.billingActive]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text style={[styles.billingText, billingCycle === 'monthly' && styles.billingTextActive]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.billingOption, billingCycle === 'annual' && styles.billingActive]}
            onPress={() => setBillingCycle('annual')}
          >
            <Text style={[styles.billingText, billingCycle === 'annual' && styles.billingTextActive]}>Annual</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save 28%</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.plansRow}>
          <View style={styles.planCard}>
            <Text style={styles.planName}>Free</Text>
            <Text style={styles.planPrice}>$0</Text>
            <Text style={styles.planPeriod}>forever</Text>
            <View style={styles.planDivider} />
            {freeFeatures.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                {f.included ? (
                  <Check size={14} color={Colors.accent} />
                ) : (
                  <X size={14} color={Colors.textTertiary} />
                )}
                <Text style={[styles.featureText, !f.included && styles.featureDisabled]}>{f.text}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.planCard, styles.proPlanCard]}>
            <View style={styles.proLabel}>
              <Crown size={12} color="#FFD700" />
              <Text style={styles.proLabelText}>MOST POPULAR</Text>
            </View>
            <Text style={[styles.planName, { color: Colors.white }]}>Pro</Text>
            <Text style={[styles.planPrice, { color: Colors.white }]}>${price}</Text>
            <Text style={[styles.planPeriod, { color: 'rgba(255,255,255,0.7)' }]}>
              {billingCycle === 'monthly' ? '/month' : '/year'}
            </Text>
            <View style={[styles.planDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            {proFeatures.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Check size={14} color="#FFD700" />
                <Text style={[styles.featureText, { color: 'rgba(255,255,255,0.9)' }]}>{f.text}</Text>
              </View>
            ))}
            {!isPro && (
              <TouchableOpacity
                style={[styles.upgradeBtn, isLoading && styles.upgradeBtnDisabled]}
                onPress={handleUpgrade}
                disabled={isLoading}
                testID="upgrade-to-pro-btn"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.accent} />
                ) : checkoutState === 'success' ? (
                  <>
                    <Check size={16} color={Colors.accent} />
                    <Text style={styles.upgradeBtnText}>Pro Activated!</Text>
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} color={Colors.accent} />
                    <Text style={styles.upgradeBtnText}>Upgrade via Stripe</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            {!isPro && checkoutState === 'idle' && sessionId ? (
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={() => setShowVerifyModal(true)}
              >
                <RefreshCw size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.verifyBtnText}>Already paid? Verify</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.stripeInfo}>
          <Shield size={14} color={Colors.textTertiary} />
          <Text style={styles.stripeInfoText}>Payments powered by Stripe. Secure & encrypted. Cancel anytime.</Text>
        </View>

        <View style={styles.whyProSection}>
          <Text style={styles.whyProTitle}>Why Go Pro?</Text>
          <View style={styles.whyProGrid}>
            {[
              { icon: <Shield size={20} color={Colors.accent} />, title: 'Zero Commission', desc: 'Keep 100% of your sales' },
              { icon: <Infinity size={20} color={Colors.accent} />, title: 'Unlimited Listings', desc: 'No cap on active listings' },
              { icon: <BarChart3 size={20} color={Colors.accent} />, title: 'Advanced Analytics', desc: 'Deep portfolio insights' },
              { icon: <Star size={20} color="#FFD700" />, title: 'Pro Badge', desc: 'Stand out from the crowd' },
            ].map((item, i) => (
              <View key={i} style={styles.whyCard}>
                <View style={styles.whyIconBox}>{item.icon}</View>
                <Text style={styles.whyCardTitle}>{item.title}</Text>
                <Text style={styles.whyCardDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showVerifyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.verifyModal, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.verifyModalHeader}>
              <View style={styles.verifyIconBox}>
                <RefreshCw size={24} color={Colors.accent} />
              </View>
              <TouchableOpacity onPress={() => setShowVerifyModal(false)} style={styles.verifyCloseBtn}>
                <X size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.verifyModalTitle}>Confirm Payment</Text>
            <Text style={styles.verifyModalDesc}>
              Did you complete the Stripe checkout? Tap below to verify your payment and activate Pro.
            </Text>
            <TouchableOpacity
              style={styles.verifyConfirmBtn}
              onPress={handleVerifyPayment}
              testID="verify-payment-btn"
            >
              <Check size={18} color={Colors.white} />
              <Text style={styles.verifyConfirmText}>Yes, I Paid — Activate Pro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.verifyCancelBtn}
              onPress={() => setShowVerifyModal(false)}
            >
              <Text style={styles.verifyCancelText}>Not yet, go back</Text>
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
  heroSection: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  crownBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5, lineHeight: 30 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: 300 },
  proBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', marginHorizontal: 16, borderRadius: 12, padding: 14, gap: 10, marginBottom: 16 },
  proBannerText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  manageBilling: { fontSize: 13, fontWeight: '600', color: Colors.accent },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', marginHorizontal: 16, borderRadius: 12, padding: 14, gap: 10, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' },
  errorBannerText: { fontSize: 12, color: Colors.error, flex: 1 },
  billingToggle: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: Colors.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 20 },
  billingOption: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  billingActive: { backgroundColor: Colors.accent },
  billingText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  billingTextActive: { color: Colors.white },
  saveBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  saveText: { fontSize: 9, fontWeight: '800', color: '#92400E' },
  plansRow: { paddingHorizontal: 16, gap: 12 },
  planCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 12 },
  proPlanCard: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  proLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 8 },
  proLabelText: { fontSize: 10, fontWeight: '800', color: '#FFD700' },
  planName: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary },
  planPrice: { fontSize: 40, fontWeight: '900', color: Colors.textPrimary, marginTop: 4 },
  planPeriod: { fontSize: 13, color: Colors.textTertiary, marginTop: 2 },
  planDivider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  featureText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  featureDisabled: { color: Colors.textTertiary, textDecorationLine: 'line-through' },
  upgradeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white, borderRadius: 14, paddingVertical: 16, gap: 8, marginTop: 16 },
  upgradeBtnDisabled: { opacity: 0.75 },
  upgradeBtnText: { fontSize: 16, fontWeight: '800', color: Colors.accent },
  verifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, gap: 6, paddingVertical: 8 },
  verifyBtnText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  stripeInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 24, marginBottom: 8 },
  stripeInfoText: { fontSize: 11, color: Colors.textTertiary, flex: 1, textAlign: 'center' },
  whyProSection: { paddingHorizontal: 16, marginTop: 16 },
  whyProTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 },
  whyProGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  whyCard: { width: '47%' as any, backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, flexGrow: 1 },
  whyIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E8F5E2', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  whyCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  whyCardDesc: { fontSize: 11, color: Colors.textTertiary, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  verifyModal: { backgroundColor: Colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  verifyModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  verifyIconBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#E8F5E2', alignItems: 'center', justifyContent: 'center' },
  verifyCloseBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  verifyModalTitle: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, marginBottom: 8 },
  verifyModalDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  verifyConfirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, gap: 8, marginBottom: 10 },
  verifyConfirmText: { fontSize: 16, fontWeight: '800', color: Colors.white },
  verifyCancelBtn: { alignItems: 'center', paddingVertical: 12 },
  verifyCancelText: { fontSize: 14, color: Colors.textTertiary, fontWeight: '600' },
  confettiContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, alignItems: 'center', justifyContent: 'center' },
  confettiPiece: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
});
