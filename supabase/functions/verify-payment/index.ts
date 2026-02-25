// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId, walletAddress } = await req.json()

    if (!sessionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'sessionId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Stripe not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[VerifyPayment] Verifying session: ${sessionId}`)

    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    })

    const session = await stripeRes.json()

    if (!stripeRes.ok) {
      console.error('[VerifyPayment] Stripe error:', session.error?.message)
      return new Response(
        JSON.stringify({ success: false, isPaid: false, error: session.error?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isPaid = session.payment_status === 'paid'
    const plan = session.metadata?.plan || 'monthly'
    const sessionWallet = session.metadata?.wallet_address || walletAddress || ''

    console.log(`[VerifyPayment] Session status: ${session.status}, payment: ${session.payment_status}, wallet: ${sessionWallet}`)

    if (isPaid && sessionWallet) {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
      const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

      if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

          const renewsAt = new Date()
          if (plan === 'annual') {
            renewsAt.setFullYear(renewsAt.getFullYear() + 1)
          } else {
            renewsAt.setMonth(renewsAt.getMonth() + 1)
          }

          const { error: upsertErr } = await supabase
            .from('profiles')
            .upsert({
              wallet: sessionWallet,
              is_pro: true,
              pro_plan: plan,
              pro_since: new Date().toISOString(),
              pro_renews_at: renewsAt.toISOString(),
              stripe_session_id: sessionId,
            }, { onConflict: 'wallet' })

          if (upsertErr) {
            console.warn('[VerifyPayment] Could not update profiles table:', upsertErr.message)
          } else {
            console.log(`[VerifyPayment] Profile updated to Pro for wallet: ${sessionWallet}`)
          }
        } catch (dbErr) {
          console.warn('[VerifyPayment] DB update error:', dbErr)
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, isPaid, plan, sessionStatus: session.status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[VerifyPayment] Unexpected error:', err)
    return new Response(
      JSON.stringify({ success: false, isPaid: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
