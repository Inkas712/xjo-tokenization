import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

export type StripePlan = 'monthly' | 'annual';

export interface CreatePaymentResult {
  success: boolean;
  sessionUrl?: string;
  sessionId?: string;
  error?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  isPaid: boolean;
  plan?: StripePlan;
  error?: string;
}

export async function createStripeCheckoutSession(
  plan: StripePlan,
  walletAddress: string,
  userEmail?: string
): Promise<CreatePaymentResult> {
  if (!SUPABASE_URL) {
    console.warn('[Stripe] Supabase URL not configured');
    return { success: false, error: 'Payment service not configured' };
  }

  try {
    console.log(`[Stripe] Creating ${plan} checkout session for wallet: ${walletAddress}`);

    const res = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, walletAddress, userEmail }),
    });

    const data = await res.json();

    if (!data.success) {
      console.warn('[Stripe] Create payment error:', data.error);
      return { success: false, error: data.error || 'Failed to create checkout session' };
    }

    console.log(`[Stripe] Session created: ${data.sessionId}`);
    return { success: true, sessionUrl: data.sessionUrl, sessionId: data.sessionId };
  } catch (err: any) {
    console.warn('[Stripe] Network error creating session:', err?.message);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function openStripeCheckout(sessionUrl: string): Promise<WebBrowser.WebBrowserResult> {
  console.log('[Stripe] Opening checkout URL in browser');

  if (Platform.OS === 'web') {
    window.open(sessionUrl, '_blank');
    return { type: 'opened' } as any;
  }

  return WebBrowser.openBrowserAsync(sessionUrl, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    showTitle: true,
    enableBarCollapsing: false,
  });
}

export async function verifyStripePayment(
  sessionId: string,
  walletAddress: string
): Promise<VerifyPaymentResult> {
  if (!SUPABASE_URL) {
    return { success: false, isPaid: false, error: 'Payment service not configured' };
  }

  try {
    console.log(`[Stripe] Verifying session: ${sessionId}`);

    const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, walletAddress }),
    });

    const data = await res.json();

    if (!data.success) {
      console.warn('[Stripe] Verify payment error:', data.error);
      return { success: false, isPaid: false, error: data.error };
    }

    console.log(`[Stripe] Payment verified: isPaid=${data.isPaid}, plan=${data.plan}`);
    return { success: true, isPaid: data.isPaid, plan: data.plan };
  } catch (err: any) {
    console.warn('[Stripe] Network error verifying payment:', err?.message);
    return { success: false, isPaid: false, error: 'Could not verify payment' };
  }
}
