// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { plan, userEmail, walletAddress } = await req.json()

    if (!plan || !['monthly', 'annual'].includes(plan)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid plan. Must be monthly or annual.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    if (!STRIPE_SECRET_KEY) {
      console.error('[CreatePayment] STRIPE_SECRET_KEY not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'Stripe not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const monthlyPriceId = Deno.env.get('STRIPE_MONTHLY_PRICE_ID') || ''
    const annualPriceId = Deno.env.get('STRIPE_ANNUAL_PRICE_ID') || ''
    const priceId = plan === 'monthly' ? monthlyPriceId : annualPriceId

    if (!priceId) {
      console.error(`[CreatePayment] Price ID not configured for plan: ${plan}`)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Price ID not set. Add STRIPE_MONTHLY_PRICE_ID or STRIPE_ANNUAL_PRICE_ID to Supabase Edge Function secrets.`,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[CreatePayment] Creating ${plan} checkout for wallet=${walletAddress}`)

    const params = new URLSearchParams()
    params.set('mode', 'subscription')
    params.set('line_items[0][price]', priceId)
    params.set('line_items[0][quantity]', '1')
    params.set('success_url', `https://xjo.app/payment/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&wallet=${encodeURIComponent(walletAddress || '')}`)
    params.set('cancel_url', `https://xjo.app/payment/cancel`)
    params.set('metadata[wallet_address]', walletAddress || '')
    params.set('metadata[plan]', plan)

    if (userEmail) {
      params.set('customer_email', userEmail)
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const session = await stripeRes.json()

    if (!stripeRes.ok) {
      console.error('[CreatePayment] Stripe error:', session.error?.message)
      return new Response(
        JSON.stringify({ success: false, error: session.error?.message || 'Failed to create checkout session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[CreatePayment] Session created: ${session.id}`)

    return new Response(
      JSON.stringify({ success: true, sessionUrl: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[CreatePayment] Unexpected error:', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
