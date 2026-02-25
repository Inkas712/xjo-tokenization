const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const FROM_NAME = 'XJO Tokenization';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

const baseHtml = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FAF7F2; margin: 0; padding: 0; }
    .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #7AB648 0%, #93C572 100%); padding: 32px 32px 24px; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; }
    .body { padding: 28px 32px; }
    .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .highlight { background: #F0F9E8; border-left: 3px solid #7AB648; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
    .highlight .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #7AB648; font-weight: 600; margin-bottom: 4px; }
    .highlight .value { font-size: 22px; font-weight: 700; color: #1A1A1A; }
    .highlight .sub { font-size: 13px; color: #6B7280; margin-top: 2px; }
    .cta { display: inline-block; background: #7AB648; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 8px 0 20px; }
    .footer { background: #F9F9F9; padding: 20px 32px; border-top: 1px solid #F0EDE8; }
    .footer p { color: #9CA3AF; font-size: 12px; margin: 0; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrapper">
    ${content}
    <div class="footer">
      <p>${FROM_NAME} · You're receiving this because you have an account or active alerts on the platform.</p>
    </div>
  </div>
</body>
</html>
`;

export async function sendEmail(params: SendEmailParams): Promise<EmailResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[Email] Supabase not configured, skipping email send');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    console.log(`[Email] Sending "${params.subject}" to ${params.to}`);
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(params),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      console.warn('[Email] Edge function error:', json.error || res.status);
      return { success: false, error: json.error || `HTTP ${res.status}` };
    }

    console.log(`[Email] Successfully sent to ${params.to}`);
    return { success: true };
  } catch (err: any) {
    console.warn('[Email] Send failed:', err?.message || 'Unknown error');
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

export async function sendAssetSoldEmail(params: {
  sellerEmail: string;
  sellerName: string;
  assetName: string;
  salePrice: number;
  buyerWallet: string;
  txHash?: string;
}): Promise<EmailResult> {
  const html = baseHtml(`
    <div class="header">
      <h1>Your asset sold! 🎉</h1>
      <p>Congratulations — a buyer just completed a purchase</p>
    </div>
    <div class="body">
      <p>Hi ${params.sellerName},</p>
      <p>Great news! Your asset <strong>${params.assetName}</strong> has been sold.</p>
      <div class="highlight">
        <div class="label">Sale Price</div>
        <div class="value">${params.salePrice} ETH</div>
        <div class="sub">Buyer: ${params.buyerWallet.slice(0, 6)}...${params.buyerWallet.slice(-4)}</div>
      </div>
      ${params.txHash ? `<p style="font-size:13px;color:#9CA3AF;">Transaction: ${params.txHash.slice(0, 20)}...</p>` : ''}
      <p>The funds have been transferred to your connected wallet.</p>
    </div>
  `);

  return sendEmail({
    to: params.sellerEmail,
    subject: `Your asset "${params.assetName}" sold for ${params.salePrice} ETH`,
    html,
  });
}

export async function sendBidReceivedEmail(params: {
  ownerEmail: string;
  ownerName: string;
  assetName: string;
  bidAmount: number;
  bidderWallet: string;
  auctionEnds?: string;
}): Promise<EmailResult> {
  const html = baseHtml(`
    <div class="header">
      <h1>New bid on your asset</h1>
      <p>Someone placed a bid on your auction listing</p>
    </div>
    <div class="body">
      <p>Hi ${params.ownerName},</p>
      <p>You just received a new bid on <strong>${params.assetName}</strong>.</p>
      <div class="highlight">
        <div class="label">Bid Amount</div>
        <div class="value">${params.bidAmount} ETH</div>
        <div class="sub">From: ${params.bidderWallet.slice(0, 6)}...${params.bidderWallet.slice(-4)}</div>
      </div>
      ${params.auctionEnds ? `<p>Auction ends: <strong>${params.auctionEnds}</strong></p>` : ''}
      <p>Log in to review all bids and manage your auction.</p>
    </div>
  `);

  return sendEmail({
    to: params.ownerEmail,
    subject: `New bid of ${params.bidAmount} ETH on "${params.assetName}"`,
    html,
  });
}

export async function sendAuctionEndingSoonEmail(params: {
  bidderEmail: string;
  bidderName: string;
  assetName: string;
  currentBid: number;
  yourBid: number;
  minutesLeft: number;
}): Promise<EmailResult> {
  const isLeading = params.yourBid >= params.currentBid;
  const html = baseHtml(`
    <div class="header">
      <h1>Auction ending in ${params.minutesLeft < 60 ? `${params.minutesLeft} minutes` : '1 hour'}!</h1>
      <p>${isLeading ? "You're currently the highest bidder" : 'You may be outbid — act fast'}</p>
    </div>
    <div class="body">
      <p>Hi ${params.bidderName},</p>
      <p>The auction for <strong>${params.assetName}</strong> is ending soon.</p>
      <div class="highlight">
        <div class="label">Current Highest Bid</div>
        <div class="value">${params.currentBid} ETH</div>
        <div class="sub">Your bid: ${params.yourBid} ETH · ${isLeading ? '✅ You are leading' : '⚠️ You are not the highest bidder'}</div>
      </div>
      ${!isLeading ? `<p>Place a higher bid now to secure this asset before the auction closes.</p>` : `<p>Hold on — you're in the lead! Keep an eye on the auction in case someone outbids you.</p>`}
    </div>
  `);

  return sendEmail({
    to: params.bidderEmail,
    subject: `⏰ Auction ending soon: "${params.assetName}"`,
    html,
  });
}

export async function sendPriceAlertEmail(params: {
  userEmail: string;
  userName: string;
  assetName: string;
  currentPrice: number;
  alertPrice: number;
  alertType: 'above' | 'below';
}): Promise<EmailResult> {
  const direction = params.alertType === 'above' ? 'risen above' : 'fallen below';
  const emoji = params.alertType === 'above' ? '📈' : '📉';
  const html = baseHtml(`
    <div class="header">
      <h1>${emoji} Price Alert Triggered</h1>
      <p>${params.assetName} has ${direction} your target</p>
    </div>
    <div class="body">
      <p>Hi ${params.userName},</p>
      <p>Your price alert for <strong>${params.assetName}</strong> has been triggered.</p>
      <div class="highlight">
        <div class="label">Current Price</div>
        <div class="value">${params.currentPrice} ETH</div>
        <div class="sub">Your alert: ${params.alertType === 'above' ? 'above' : 'below'} ${params.alertPrice} ETH</div>
      </div>
      <p>Now might be a great time to review your position on this asset.</p>
    </div>
  `);

  return sendEmail({
    to: params.userEmail,
    subject: `${emoji} Price alert: "${params.assetName}" is now ${params.currentPrice} ETH`,
    html,
  });
}
