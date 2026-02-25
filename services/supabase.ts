import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react-native';
import { Asset as AppAsset, AssetOwner, AssetCategory, SaleType, AssetStatus, Blockchain, ActivityEvent } from '@/mocks/assets';
import { assets as mockAssets, stats as mockStats, owners as mockOwners } from '@/mocks/assets';

export interface DbAsset {
  id: string;
  name: string;
  description: string;
  image: string;
  category: AssetCategory;
  price: number;
  price_usd: number;
  owner_id: string;
  creator_id: string;
  token_id: string;
  contract_address: string;
  blockchain: Blockchain;
  token_standard: string;
  status: AssetStatus;
  sale_type: SaleType;
  royalty: number;
  supply: number;
  views: number;
  favorites: number;
  listed_at: string;
  created_at: string;
  updated_at: string;
}

export interface DbUser {
  id: string;
  name: string;
  avatar: string;
  wallet: string;
  bio?: string;
  is_verified?: boolean;
  followers_count?: number;
  following_count?: number;
}

export interface DbBid {
  id: string;
  asset_id: string;
  bidder_id: string;
  amount: number;
  amount_usd: number;
  created_at: string;
}

export interface DbActivity {
  id: string;
  asset_id: string;
  type: string;
  from_address: string;
  to_address: string;
  price?: number;
  created_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  asset_id?: string;
  created_at: string;
}

export interface DbTransaction {
  id: string;
  type: string;
  asset_id: string;
  from_address: string;
  to_address: string;
  price: number;
  status: string;
  created_at: string;
}

export type Asset = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  metadata_uri: string;
  owner_address: string;
  creator_address: string;
  price: number;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  blockchain: string;
  royalty_percent: number;
  view_count: number;
  created_at: string;
};

export type Bid = {
  id: string;
  asset_id: string;
  bidder_address: string;
  amount: number;
  status: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  asset_id: string;
  from_address: string;
  to_address: string;
  transaction_type: string;
  price: number;
  tx_hash: string;
  status: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_address: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  wallet_address: string;
  username: string;
  avatar_url: string;
  is_verified: boolean;
  is_pro: boolean;
  created_at: string;
};

type PriceHistoryRow = {
  id: string;
  asset_id: string;
  month: string;
  price: number;
  recorded_at: string;
};

type PlatformStatsRow = {
  id: string;
  total_volume: number;
  assets_listed: number;
  active_users: number;
};

type ProfileRow = {
  id: string;
  wallet: string;
  is_pro: boolean;
  pro_plan: string | null;
  pro_since: string | null;
  pro_renews_at: string | null;
};

type Database = {
  public: {
    Tables: {
      assets: {
        Row: DbAsset;
        Insert: Partial<DbAsset>;
        Update: Partial<DbAsset>;
      };
      users: {
        Row: DbUser;
        Insert: Partial<DbUser>;
        Update: Partial<DbUser>;
      };
      bids: {
        Row: DbBid;
        Insert: Partial<DbBid>;
        Update: Partial<DbBid>;
      };
      activities: {
        Row: DbActivity;
        Insert: Partial<DbActivity>;
        Update: Partial<DbActivity>;
      };
      notifications: {
        Row: DbNotification;
        Insert: Partial<DbNotification>;
        Update: Partial<DbNotification>;
      };
      transactions: {
        Row: DbTransaction;
        Insert: Partial<DbTransaction>;
        Update: Partial<DbTransaction>;
      };
      price_history: {
        Row: PriceHistoryRow;
        Insert: Partial<PriceHistoryRow>;
        Update: Partial<PriceHistoryRow>;
      };
      platform_stats: {
        Row: PlatformStatsRow;
        Insert: Partial<PlatformStatsRow>;
        Update: Partial<PlatformStatsRow>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow>;
        Update: Partial<ProfileRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    });
    console.log('[Supabase] Client initialized with URL:', SUPABASE_URL.substring(0, 30) + '...');
  } else {
    console.warn('[Supabase] Missing URL or anon key, using mock data');
  }
} catch (initErr) {
  console.error('[Supabase] Failed to initialize client:', initErr);
  supabaseInstance = null;
}

export const supabase = supabaseInstance;

const isConfigured = (): boolean => {
  return !!supabase;
};

async function safeQuery<T>(
  queryFn: () => PromiseLike<{ data: T | null; error: unknown }>,
  fallback: T
): Promise<T> {
  try {
    const { data, error } = await queryFn();
    if (error) {
      const err = error as { message?: string; code?: string; hint?: string };
      console.warn('[Supabase] Query error:', err.message || err.code || JSON.stringify(err));
      Sentry.captureException(new Error(err.message || err.code || 'Supabase query error'), {
        tags: { service: 'supabase' },
        extra: { code: err.code, hint: err.hint },
      });
      return fallback;
    }
    return data ?? fallback;
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.warn('[Supabase] Network/fetch error:', e?.message || 'Unknown error');
    Sentry.captureException(err, { tags: { service: 'supabase', method: 'safeQuery' } });
    return fallback;
  }
}

function mapDbUserToOwner(user: DbUser): AssetOwner {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    wallet: user.wallet,
  };
}

function mapDbAssetToAsset(
  dbAsset: DbAsset,
  owner: DbUser | null,
  creator: DbUser | null,
  bids: DbBid[],
  activities: DbActivity[],
  priceHistory: { month: string; price: number }[]
): AppAsset {
  const ownerMapped: AssetOwner = owner ? mapDbUserToOwner(owner) : mockOwners[0];
  const creatorMapped: AssetOwner = creator ? mapDbUserToOwner(creator) : mockOwners[0];

  return {
    id: dbAsset.id,
    name: dbAsset.name,
    description: dbAsset.description,
    image: dbAsset.image,
    category: dbAsset.category,
    price: dbAsset.price,
    priceUsd: dbAsset.price_usd,
    owner: ownerMapped,
    creator: creatorMapped,
    tokenId: dbAsset.token_id,
    contractAddress: dbAsset.contract_address,
    blockchain: dbAsset.blockchain,
    tokenStandard: dbAsset.token_standard,
    status: dbAsset.status,
    saleType: dbAsset.sale_type,
    royalty: dbAsset.royalty,
    supply: dbAsset.supply,
    views: dbAsset.views,
    favorites: dbAsset.favorites,
    listedAt: dbAsset.listed_at,
    priceHistory,
    bids: bids.map(b => ({
      id: b.id,
      bidder: mockOwners.find(o => o.id === b.bidder_id) || mockOwners[0],
      amount: b.amount,
      amountUsd: b.amount_usd,
      timestamp: b.created_at,
    })),
    activity: activities.map(a => ({
      id: a.id,
      type: a.type as ActivityEvent['type'],
      from: a.from_address,
      to: a.to_address,
      price: a.price,
      timestamp: a.created_at,
    })),
  };
}

export async function fetchAssets(): Promise<AppAsset[]> {
  if (!isConfigured()) {
    console.log('[Supabase] Not configured, returning mock assets');
    return mockAssets;
  }

  try {
    console.log('[Supabase] Fetching assets from database...');
    const data = await safeQuery<DbAsset[]>(
      () => supabase!.from('assets').select('*').order('created_at', { ascending: false }).returns<DbAsset[]>(),
      []
    );

    if (!data || data.length === 0) {
      console.log('[Supabase] No assets found or query failed, returning mock data');
      return mockAssets;
    }

    console.log(`[Supabase] Fetched ${data.length} assets`);

    const assetsWithNulls = await Promise.all(
      data.map(async (dbAsset: DbAsset): Promise<AppAsset | null> => {
        try {
          const [owner, creator, bids, activities, priceHistory] = await Promise.all([
            safeQuery<DbUser | null>(
              () => supabase!.from('users').select('*').eq('id', dbAsset.owner_id).single().returns<DbUser>(),
              null
            ),
            safeQuery<DbUser | null>(
              () => supabase!.from('users').select('*').eq('id', dbAsset.creator_id).single().returns<DbUser>(),
              null
            ),
            safeQuery<DbBid[]>(
              () => supabase!.from('bids').select('*').eq('asset_id', dbAsset.id).order('created_at', { ascending: false }).returns<DbBid[]>(),
              []
            ),
            safeQuery<DbActivity[]>(
              () => supabase!.from('activities').select('*').eq('asset_id', dbAsset.id).order('created_at', { ascending: false }).returns<DbActivity[]>(),
              []
            ),
            safeQuery<PriceHistoryRow[]>(
              () => supabase!.from('price_history').select('*').eq('asset_id', dbAsset.id).order('recorded_at', { ascending: true }).returns<PriceHistoryRow[]>(),
              []
            ),
          ]);

          return mapDbAssetToAsset(
            dbAsset,
            owner,
            creator,
            bids ?? [],
            activities ?? [],
            (priceHistory ?? []).map((p: PriceHistoryRow) => ({ month: p.month, price: p.price })),
          );
        } catch (mapErr) {
          console.warn(`[Supabase] Error mapping asset ${dbAsset.id}, skipping:`, mapErr);
          return null;
        }
      })
    );

    const validAssets = assetsWithNulls.filter((a): a is AppAsset => a !== null);
    return validAssets.length > 0 ? validAssets : mockAssets;
  } catch (err) {
    console.error('[Supabase] Unexpected error fetching assets:', err);
    Sentry.captureException(err, { tags: { service: 'supabase', method: 'fetchAssets' } });
    return mockAssets;
  }
}

export async function fetchAssetById(id: string): Promise<AppAsset | null> {
  const mockFallback = mockAssets.find(a => a.id === id) || null;

  if (!isConfigured()) {
    console.log(`[Supabase] Not configured, returning mock asset ${id}`);
    return mockFallback;
  }

  try {
    console.log(`[Supabase] Fetching asset ${id}...`);
    const data = await safeQuery<DbAsset | null>(
      () => supabase!.from('assets').select('*').eq('id', id).single().returns<DbAsset>(),
      null
    );

    if (!data) {
      console.log(`[Supabase] Asset ${id} not found in DB, using mock`);
      return mockFallback;
    }

    const dbAsset = data;
    const [owner, creator, bids, activities, priceHistory] = await Promise.all([
      safeQuery<DbUser | null>(
        () => supabase!.from('users').select('*').eq('id', dbAsset.owner_id).single().returns<DbUser>(),
        null
      ),
      safeQuery<DbUser | null>(
        () => supabase!.from('users').select('*').eq('id', dbAsset.creator_id).single().returns<DbUser>(),
        null
      ),
      safeQuery<DbBid[]>(
        () => supabase!.from('bids').select('*').eq('asset_id', dbAsset.id).order('created_at', { ascending: false }).returns<DbBid[]>(),
        []
      ),
      safeQuery<DbActivity[]>(
        () => supabase!.from('activities').select('*').eq('asset_id', dbAsset.id).order('created_at', { ascending: false }).returns<DbActivity[]>(),
        []
      ),
      safeQuery<PriceHistoryRow[]>(
        () => supabase!.from('price_history').select('*').eq('asset_id', dbAsset.id).order('recorded_at', { ascending: true }).returns<PriceHistoryRow[]>(),
        []
      ),
    ]);

    return mapDbAssetToAsset(
      dbAsset,
      owner,
      creator,
      bids ?? [],
      activities ?? [],
      (priceHistory ?? []).map((p: PriceHistoryRow) => ({ month: p.month, price: p.price })),
    );
  } catch (err) {
    console.error('[Supabase] Error fetching asset:', err);
    Sentry.captureException(err, { tags: { service: 'supabase', method: 'fetchAssetById' } });
    return mockFallback;
  }
}

export async function fetchPlatformStats(): Promise<typeof mockStats> {
  if (!isConfigured()) {
    return mockStats;
  }

  try {
    console.log('[Supabase] Fetching platform stats...');
    const data = await safeQuery<PlatformStatsRow | null>(
      () => supabase!.from('platform_stats').select('*').single().returns<PlatformStatsRow>(),
      null
    );

    if (!data) {
      console.log('[Supabase] No stats in DB, returning mock');
      return mockStats;
    }

    return {
      totalVolume: data.total_volume ?? mockStats.totalVolume,
      assetsListed: data.assets_listed ?? mockStats.assetsListed,
      activeUsers: data.active_users ?? mockStats.activeUsers,
    };
  } catch (err) {
    console.error('[Supabase] Error fetching stats:', err);
    return mockStats;
  }
}

export async function createActivityInDb(activity: {
  assetId: string;
  type: string;
  fromAddress: string;
  toAddress: string;
  price?: number;
}): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    console.log('[Supabase] Not configured, skipping activity log');
    return { success: true };
  }

  try {
    console.log(`[Supabase] Logging activity: ${activity.type} for asset ${activity.assetId}`);
    const { error } = await supabase!
      .from('activities')
      .insert({
        asset_id: activity.assetId,
        type: activity.type,
        from_address: activity.fromAddress,
        to_address: activity.toAddress,
        price: activity.price,
      } as any);

    if (error) {
      console.error('[Supabase] Error logging activity:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Supabase] Error logging activity:', err);
    return { success: false, error: 'Failed to log activity' };
  }
}

export async function createNotificationInDb(notification: {
  userId: string;
  type: string;
  title: string;
  message: string;
  assetId?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    console.log('[Supabase] Not configured, skipping notification');
    return { success: true };
  }

  try {
    console.log(`[Supabase] Creating notification: ${notification.type} for user ${notification.userId}`);
    const { error } = await supabase!
      .from('notifications')
      .insert({
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: false,
        asset_id: notification.assetId,
      } as any);

    if (error) {
      console.error('[Supabase] Error creating notification:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Supabase] Error creating notification:', err);
    return { success: false, error: 'Failed to create notification' };
  }
}

export async function createAssetInDb(asset: {
  name: string;
  description: string;
  image: string;
  category: AssetCategory;
  price: number;
  saleType: SaleType;
  royalty: number;
  supply: number;
  ownerWallet: string;
  tokenId: string;
  contractAddress: string;
  blockchain: Blockchain;
  ipfsHash?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isConfigured()) {
    console.log('[Supabase] Not configured, simulating asset creation');
    const mockId = `mock-${Date.now()}`;
    return { success: true, id: mockId };
  }

  try {
    console.log('[Supabase] Creating asset in database...');
    const { data, error } = await supabase!
      .from('assets')
      .insert({
        name: asset.name,
        description: asset.description,
        image: asset.image,
        category: asset.category,
        price: asset.price,
        price_usd: asset.price * 3200,
        token_id: asset.tokenId,
        contract_address: asset.contractAddress,
        blockchain: asset.blockchain,
        token_standard: asset.supply > 1 ? 'ERC-1155' : 'ERC-721',
        status: asset.saleType === 'auction' ? 'Auction' as AssetStatus : 'Buy Now' as AssetStatus,
        sale_type: asset.saleType,
        royalty: asset.royalty,
        supply: asset.supply,
        views: 0,
        favorites: 0,
        listed_at: new Date().toISOString(),
      } as any)
      .select()
      .returns<DbAsset[]>()
      .single();

    if (error) {
      console.error('[Supabase] Error creating asset:', error.message);
      return { success: false, error: error.message };
    }

    const createdAsset = data as DbAsset;
    console.log(`[Supabase] Asset created with ID: ${createdAsset.id}`);

    await createActivityInDb({
      assetId: createdAsset.id,
      type: 'Minted',
      fromAddress: 'NullAddress',
      toAddress: asset.ownerWallet,
      price: asset.price,
    });

    await createActivityInDb({
      assetId: createdAsset.id,
      type: 'Listed',
      fromAddress: asset.ownerWallet,
      toAddress: 'Marketplace',
      price: asset.price,
    });

    return { success: true, id: createdAsset.id };
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error('[Supabase] Error creating asset:', err);
    Sentry.captureException(err, { tags: { service: 'supabase', method: 'createAssetInDb' } });
    return { success: false, error: e?.message || 'Unexpected error creating asset' };
  }
}

export async function placeBidInDb(assetId: string, bidderId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    console.log('[Supabase] Not configured, simulating bid placement');
    return { success: true };
  }

  try {
    console.log(`[Supabase] Placing bid on asset ${assetId}: ${amount} ETH`);
    const { error } = await supabase!
      .from('bids')
      .insert({
        asset_id: assetId,
        bidder_id: bidderId,
        amount,
        amount_usd: amount * 3200,
      } as any);

    if (error) {
      console.error('[Supabase] Error placing bid:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase] Bid placed successfully: ${amount} ETH on ${assetId}`);

    await createActivityInDb({
      assetId,
      type: 'Bid',
      fromAddress: bidderId,
      toAddress: 'Marketplace',
      price: amount,
    });

    try {
      const { data: assetData } = await supabase!
        .from('assets')
        .select('name, owner_id')
        .eq('id', assetId)
        .single()
        .returns<Pick<DbAsset, 'name' | 'owner_id'>>();

      if (assetData) {
        const typedAsset = assetData as Pick<DbAsset, 'name' | 'owner_id'>;
        await createNotificationInDb({
          userId: typedAsset.owner_id || 'system',
          type: 'bid',
          title: 'New Bid Received',
          message: `A bid of ${amount} ETH was placed on ${typedAsset.name}`,
          assetId,
        });
      }
    } catch (notifErr) {
      console.warn('[Supabase] Could not create bid notification:', notifErr);
    }

    return { success: true };
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error('[Supabase] Error placing bid:', err);
    Sentry.captureException(err, { tags: { service: 'supabase', method: 'placeBidInDb' } });
    return { success: false, error: e?.message || 'Unexpected error placing bid' };
  }
}

export async function purchaseAssetInDb(assetId: string, buyerWallet: string, price: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
  if (!isConfigured()) {
    console.log('[Supabase] Not configured, simulating purchase');
    return { success: true, txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}` };
  }

  try {
    console.log(`[Supabase] Recording purchase of asset ${assetId}`);

    let sellerAddress = 'marketplace';
    let assetName = 'Asset';
    try {
      const { data: assetData } = await supabase!
        .from('assets')
        .select('name, owner_id')
        .eq('id', assetId)
        .single()
        .returns<Pick<DbAsset, 'name' | 'owner_id'>>();

      if (assetData) {
        const typedAsset = assetData as Pick<DbAsset, 'name' | 'owner_id'>;
        sellerAddress = typedAsset.owner_id || 'marketplace';
        assetName = typedAsset.name;
      }
    } catch (lookupErr) {
      console.warn('[Supabase] Could not look up asset for purchase:', lookupErr);
    }

    const { error } = await supabase!
      .from('transactions')
      .insert({
        type: 'Buy',
        asset_id: assetId,
        from_address: sellerAddress,
        to_address: buyerWallet,
        price,
        status: 'completed',
      } as any);

    if (error) {
      console.error('[Supabase] Error recording purchase:', error.message);
      return { success: false, error: error.message };
    }

    const txHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    console.log(`[Supabase] Purchase recorded. TX: ${txHash}`);

    await createActivityInDb({
      assetId,
      type: 'Sold',
      fromAddress: sellerAddress,
      toAddress: buyerWallet,
      price,
    });

    try {
      await (supabase! as any)
        .from('assets')
        .update({ owner_id: buyerWallet, status: 'Buy Now' })
        .eq('id', assetId);
      console.log(`[Supabase] Asset ${assetId} ownership transferred to ${buyerWallet}`);
    } catch (updateErr) {
      console.warn('[Supabase] Could not update asset ownership:', updateErr);
    }

    if (sellerAddress !== 'marketplace') {
      await createNotificationInDb({
        userId: sellerAddress,
        type: 'sale',
        title: 'Asset Sold!',
        message: `Your asset "${assetName}" was sold for ${price} ETH`,
        assetId,
      });
    }

    await createNotificationInDb({
      userId: buyerWallet,
      type: 'purchase',
      title: 'Purchase Complete',
      message: `You purchased "${assetName}" for ${price} ETH`,
      assetId,
    });

    return { success: true, txHash };
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error('[Supabase] Error purchasing:', err);
    Sentry.captureException(err, { tags: { service: 'supabase', method: 'purchaseAssetInDb' } });
    return { success: false, error: e?.message || 'Unexpected error during purchase' };
  }
}

export async function fetchNotifications(userId: string): Promise<DbNotification[]> {
  if (!isConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<DbNotification[]>();

    if (error) {
      console.error('[Supabase] Error fetching notifications:', error.message);
      return [];
    }

    return (data as DbNotification[]) || [];
  } catch (err) {
    console.error('[Supabase] Error fetching notifications:', err);
    return [];
  }
}

export async function fetchTransactions(walletAddress: string): Promise<DbTransaction[]> {
  if (!isConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('transactions')
      .select('*')
      .or(`from_address.eq.${walletAddress},to_address.eq.${walletAddress}`)
      .order('created_at', { ascending: false })
      .returns<DbTransaction[]>();

    if (error) {
      console.error('[Supabase] Error fetching transactions:', error.message);
      return [];
    }

    return (data as DbTransaction[]) || [];
  } catch (err) {
    console.error('[Supabase] Error fetching transactions:', err);
    return [];
  }
}

export async function updateUserProfile(userId: string, updates: { name?: string; bio?: string; avatar?: string }): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    return { success: true };
  }

  try {
    const { error } = await (supabase! as any)
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('[Supabase] Error updating profile:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Supabase] Error updating profile:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

export async function subscribeToAssetUpdates(assetId: string, callback: (payload: unknown) => void) {
  if (!isConfigured()) {
    console.log('[Supabase] Not configured, skipping realtime subscription');
    return null;
  }

  console.log(`[Supabase] Subscribing to realtime updates for asset ${assetId}`);
  const channel = supabase!
    .channel(`asset-${assetId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bids',
      filter: `asset_id=eq.${assetId}`,
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'activities',
      filter: `asset_id=eq.${assetId}`,
    }, callback)
    .subscribe();

  return channel;
}

export interface SupabaseConnectionTest {
  configured: boolean;
  connected: boolean;
  canRead: boolean;
  canWrite: boolean;
  latencyMs?: number;
  error?: string;
  tables?: string[];
}

export async function testSupabaseConnection(): Promise<SupabaseConnectionTest> {
  if (!isConfigured()) {
    console.log('[Supabase] Not configured');
    return { configured: false, connected: false, canRead: false, canWrite: false, error: 'Supabase URL or key not set' };
  }

  try {
    const start = Date.now();
    console.log('[Supabase] Testing connection...');

    let readData: DbAsset[] | null = null;
    let readError: { message?: string; code?: string } | null = null;
    try {
      const result = await supabase!
        .from('assets')
        .select('id')
        .limit(1)
        .returns<DbAsset[]>();
      readData = result.data as DbAsset[] | null;
      readError = result.error;
    } catch (fetchErr: unknown) {
      const e = fetchErr as { message?: string };
      const latencyMs = Date.now() - start;
      console.error('[Supabase] Connection fetch error:', e?.message);
      return {
        configured: true,
        connected: false,
        canRead: false,
        canWrite: false,
        latencyMs,
        error: `Network error: ${e?.message || 'Failed to fetch'}. Check CORS and Supabase URL.`,
      };
    }

    const latencyMs = Date.now() - start;

    if (readError) {
      console.error('[Supabase] Read test failed:', readError.message);
      if (readError.message?.includes('does not exist') || readError.code === '42P01') {
        return {
          configured: true,
          connected: true,
          canRead: false,
          canWrite: false,
          latencyMs,
          error: 'Tables not created yet. Run SQL to create assets, bids, transactions, notifications tables.',
        };
      }
      if (readError.message?.includes('permission denied') || readError.code === '42501') {
        return {
          configured: true,
          connected: true,
          canRead: false,
          canWrite: false,
          latencyMs,
          error: 'RLS policy blocking access. Add SELECT policy for anon role on assets table.',
        };
      }
      return { configured: true, connected: true, canRead: false, canWrite: false, latencyMs, error: readError.message };
    }

    console.log(`[Supabase] Read test OK. Found ${readData?.length ?? 0} rows. Latency: ${latencyMs}ms`);

    const tables: string[] = [];
    const tableNames = ['assets', 'bids', 'transactions', 'notifications'] as const;
    for (const table of tableNames) {
      try {
        const { error: tErr } = await supabase!.from(table).select('id').limit(1);
        if (!tErr) {
          tables.push(table);
        } else {
          console.log(`[Supabase] Table '${table}' check: ${tErr.message}`);
        }
      } catch (tableErr) {
        console.log(`[Supabase] Table '${table}' fetch error`);
      }
    }

    console.log(`[Supabase] Available tables: ${tables.join(', ')}`);

    return {
      configured: true,
      connected: true,
      canRead: true,
      canWrite: tables.includes('assets'),
      latencyMs,
      tables,
    };
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error('[Supabase] Connection test error:', err);
    return { configured: true, connected: false, canRead: false, canWrite: false, error: e?.message || 'Connection failed' };
  }
}

export async function updateUserProStatus(
  walletAddress: string,
  isPro: boolean,
  plan?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    console.log('[Supabase] Not configured, skipping pro status update');
    return { success: true };
  }

  try {
    console.log(`[Supabase] Updating pro status for ${walletAddress}: isPro=${isPro}`);

    const renewsAt = isPro ? (() => {
      const d = new Date();
      if (plan === 'annual') d.setFullYear(d.getFullYear() + 1);
      else d.setMonth(d.getMonth() + 1);
      return d.toISOString();
    })() : null;

    const { error } = await supabase!
      .from('profiles')
      .upsert(
        {
          wallet: walletAddress,
          is_pro: isPro,
          pro_plan: plan || null,
          pro_since: isPro ? new Date().toISOString() : null,
          pro_renews_at: renewsAt,
        } as any,
        { onConflict: 'wallet' }
      );

    if (error) {
      console.warn('[Supabase] Could not update pro status (profiles table may not exist):', error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase] Pro status updated for ${walletAddress}`);
    return { success: true };
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.warn('[Supabase] Error updating pro status:', e?.message);
    return { success: false, error: e?.message || 'Unexpected error' };
  }
}

export { isConfigured as isSupabaseConfigured };
