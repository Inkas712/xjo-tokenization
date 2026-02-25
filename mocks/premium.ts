import { owners } from './assets';

export type Currency = 'ETH' | 'USD' | 'EUR' | 'BTC';
export type Language = 'en' | 'ru' | 'es' | 'zh';

export const exchangeRates: Record<Currency, number> = {
  ETH: 1,
  USD: 3200,
  EUR: 2950,
  BTC: 0.048,
};

export const currencySymbols: Record<Currency, string> = {
  ETH: 'ETH',
  USD: '$',
  EUR: '€',
  BTC: 'BTC',
};

export const currencyFlags: Record<Currency, string> = {
  ETH: '⟠',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  BTC: '₿',
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  zh: '中文',
};

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  ru: '🇷🇺',
  es: '🇪🇸',
  zh: '🇨🇳',
};

export interface Achievement {
  id: string;
  category: 'trading' | 'creating' | 'social' | 'platform';
  name: string;
  description: string;
  icon: string;
  xp: number;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
}

export const achievements: Achievement[] = [
  { id: 'a1', category: 'trading', name: 'First Purchase', description: 'Buy your first tokenized asset', icon: '🛒', xp: 50, progress: 1, maxProgress: 1, unlocked: true },
  { id: 'a2', category: 'trading', name: 'First Sale', description: 'Sell your first asset on the marketplace', icon: '💰', xp: 50, progress: 1, maxProgress: 1, unlocked: true },
  { id: 'a3', category: 'trading', name: 'Volume Trader', description: 'Trade over $10,000 in volume', icon: '📊', xp: 200, progress: 8500, maxProgress: 10000, unlocked: false },
  { id: 'a4', category: 'trading', name: 'Whale', description: 'Accumulate 100+ ETH in trading volume', icon: '🐋', xp: 500, progress: 24, maxProgress: 100, unlocked: false },
  { id: 'a5', category: 'trading', name: 'Diamond Hands', description: 'Hold an asset for over 1 year', icon: '💎', xp: 300, progress: 180, maxProgress: 365, unlocked: false },
  { id: 'a6', category: 'creating', name: 'First Mint', description: 'Mint your first token', icon: '🎨', xp: 50, progress: 1, maxProgress: 1, unlocked: true },
  { id: 'a7', category: 'creating', name: 'Verified Creator', description: 'Get verified as a creator', icon: '✅', xp: 200, progress: 1, maxProgress: 1, unlocked: true },
  { id: 'a8', category: 'creating', name: 'Collection Creator', description: 'Create your first collection', icon: '📁', xp: 100, progress: 1, maxProgress: 1, unlocked: true },
  { id: 'a9', category: 'creating', name: '10 Assets Minted', description: 'Mint 10 tokens on the platform', icon: '🏭', xp: 150, progress: 7, maxProgress: 10, unlocked: false },
  { id: 'a10', category: 'creating', name: 'Popular Creator', description: 'Reach 100 followers', icon: '🌟', xp: 300, progress: 47, maxProgress: 100, unlocked: false },
  { id: 'a11', category: 'social', name: 'First Follow', description: 'Follow another creator', icon: '👋', xp: 25, progress: 1, maxProgress: 1, unlocked: true },
  { id: 'a12', category: 'social', name: 'Community Member', description: 'Reach 50 followers', icon: '👥', xp: 150, progress: 47, maxProgress: 50, unlocked: false },
  { id: 'a13', category: 'social', name: 'Influencer', description: 'Reach 500 followers', icon: '🎤', xp: 500, progress: 47, maxProgress: 500, unlocked: false },
  { id: 'a14', category: 'platform', name: 'Early Adopter', description: 'Join the platform in its first year', icon: '🚀', xp: 100, progress: 1, maxProgress: 1, unlocked: true },
  { id: 'a15', category: 'platform', name: 'Feedback Hero', description: 'Submit 5 bug reports or suggestions', icon: '🐛', xp: 75, progress: 3, maxProgress: 5, unlocked: false },
  { id: 'a16', category: 'platform', name: 'Governance Voter', description: 'Vote on 10 governance proposals', icon: '🗳️', xp: 200, progress: 4, maxProgress: 10, unlocked: false },
];

export interface Referral {
  id: string;
  username: string;
  avatar: string;
  joinDate: string;
  transactions: number;
  earnings: number;
  status: 'active' | 'inactive';
}

export const referrals: Referral[] = [
  { id: 'ref1', username: 'CryptoKnight22', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop', joinDate: '2026-01-15', transactions: 12, earnings: 0.45, status: 'active' },
  { id: 'ref2', username: 'BlockchainBella', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop', joinDate: '2026-01-22', transactions: 8, earnings: 0.28, status: 'active' },
  { id: 'ref3', username: 'TokenMaster_X', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop', joinDate: '2025-12-10', transactions: 23, earnings: 0.92, status: 'active' },
  { id: 'ref4', username: 'DeFi_Diana', avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop', joinDate: '2025-11-28', transactions: 5, earnings: 0.15, status: 'active' },
  { id: 'ref5', username: 'MetaVerse_Max', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop', joinDate: '2026-02-01', transactions: 2, earnings: 0.06, status: 'active' },
  { id: 'ref6', username: 'Web3Wizard', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=80&h=80&fit=crop', joinDate: '2025-10-15', transactions: 0, earnings: 0, status: 'inactive' },
  { id: 'ref7', username: 'NFT_Ninja', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop', joinDate: '2025-09-20', transactions: 0, earnings: 0, status: 'inactive' },
];

export const referralEarningsMonthly = [
  { month: 'Sep', amount: 0.12 },
  { month: 'Oct', amount: 0.28 },
  { month: 'Nov', amount: 0.35 },
  { month: 'Dec', amount: 0.52 },
  { month: 'Jan', amount: 0.41 },
  { month: 'Feb', amount: 0.18 },
];

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  votingEndsIn: number;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  totalVotes: number;
  quorumNeeded: number;
  status: 'active' | 'passed' | 'failed';
  comments: { id: string; user: string; avatar: string; text: string; timestamp: string }[];
}

export const proposals: Proposal[] = [
  {
    id: 'p1', title: 'Reduce platform fee from 2.5% to 2%', description: 'This proposal aims to reduce the platform transaction fee from 2.5% to 2% to attract more traders and increase overall volume. The reduced fee would be offset by higher trading activity.', category: 'Fees', votingEndsIn: 3 * 86400, forVotes: 1247, againstVotes: 453, abstainVotes: 89, totalVotes: 1789, quorumNeeded: 2000, status: 'active',
    comments: [
      { id: 'pc1', user: 'Elena Voss', avatar: owners[0].avatar, text: 'Lower fees will definitely attract more volume. Strongly support this.', timestamp: '2h ago' },
      { id: 'pc2', user: 'Marcus Chen', avatar: owners[1].avatar, text: 'We need to ensure platform sustainability. Maybe 2.25% as a compromise?', timestamp: '5h ago' },
    ],
  },
  {
    id: 'p2', title: 'Add support for Solana blockchain', description: 'Expand the platform to support Solana blockchain for faster and cheaper transactions. This would open up a new user base and provide better options for high-frequency traders.', category: 'Infrastructure', votingEndsIn: 5 * 86400, forVotes: 2156, againstVotes: 312, abstainVotes: 156, totalVotes: 2624, quorumNeeded: 2000, status: 'active',
    comments: [
      { id: 'pc3', user: 'Aria Nakamura', avatar: owners[2].avatar, text: 'Solana integration would be game-changing for microtransactions.', timestamp: '1d ago' },
    ],
  },
  {
    id: 'p3', title: 'Implement quarterly token buyback', description: 'Use 10% of platform revenue for quarterly buybacks of the platform governance token, reducing supply and increasing value for token holders.', category: 'Tokenomics', votingEndsIn: 7 * 86400, forVotes: 890, againstVotes: 678, abstainVotes: 234, totalVotes: 1802, quorumNeeded: 2000, status: 'active',
    comments: [],
  },
];

export const pastProposals: Proposal[] = [
  { id: 'pp1', title: 'Add Polygon support', description: 'Enable Polygon network for low-cost transactions', category: 'Infrastructure', votingEndsIn: 0, forVotes: 3245, againstVotes: 456, abstainVotes: 123, totalVotes: 3824, quorumNeeded: 2000, status: 'passed', comments: [] },
  { id: 'pp2', title: 'Increase max royalty to 25%', description: 'Allow creators to set royalties up to 25%', category: 'Fees', votingEndsIn: 0, forVotes: 876, againstVotes: 2341, abstainVotes: 345, totalVotes: 3562, quorumNeeded: 2000, status: 'failed', comments: [] },
  { id: 'pp3', title: 'Launch mobile app', description: 'Develop native mobile applications for iOS and Android', category: 'Platform', votingEndsIn: 0, forVotes: 4521, againstVotes: 234, abstainVotes: 67, totalVotes: 4822, quorumNeeded: 2000, status: 'passed', comments: [] },
  { id: 'pp4', title: 'Enable fractional ownership', description: 'Allow assets to be split into fractions', category: 'Features', votingEndsIn: 0, forVotes: 3890, againstVotes: 567, abstainVotes: 123, totalVotes: 4580, quorumNeeded: 2000, status: 'passed', comments: [] },
  { id: 'pp5', title: 'Remove minimum listing price', description: 'Remove the 0.01 ETH minimum listing requirement', category: 'Fees', votingEndsIn: 0, forVotes: 1234, againstVotes: 1890, abstainVotes: 456, totalVotes: 3580, quorumNeeded: 2000, status: 'failed', comments: [] },
];

export interface TaxRecord {
  id: string;
  asset: string;
  buyDate: string;
  buyPrice: number;
  sellDate: string;
  sellPrice: number;
  gainLoss: number;
  holdingDays: number;
  type: 'short' | 'long';
}

export const taxRecords: TaxRecord[] = [
  { id: 'tax1', asset: 'Skyline Penthouse #42', buyDate: '2025-03-15', buyPrice: 9.8, sellDate: '2026-01-20', sellPrice: 12.5, gainLoss: 2.7, holdingDays: 311, type: 'long' },
  { id: 'tax2', asset: 'Digital Aurora #7', buyDate: '2025-08-10', buyPrice: 2.1, sellDate: '2026-02-05', sellPrice: 3.2, gainLoss: 1.1, holdingDays: 179, type: 'short' },
  { id: 'tax3', asset: 'Neo-Tokyo Drift #33', buyDate: '2025-11-20', buyPrice: 2.4, sellDate: '2026-01-15', sellPrice: 1.8, gainLoss: -0.6, holdingDays: 56, type: 'short' },
  { id: 'tax4', asset: 'Beachfront Villa Costa Rica', buyDate: '2025-01-05', buyPrice: 22.0, sellDate: '2025-12-28', sellPrice: 28.0, gainLoss: 6.0, holdingDays: 357, type: 'long' },
  { id: 'tax5', asset: 'Gold Bar 1kg', buyDate: '2025-06-12', buyPrice: 1.8, sellDate: '2026-02-10', sellPrice: 2.1, gainLoss: 0.3, holdingDays: 243, type: 'long' },
  { id: 'tax6', asset: 'BioGen Patent Portfolio', buyDate: '2025-09-01', buyPrice: 10.2, sellDate: '2025-11-15', sellPrice: 8.75, gainLoss: -1.45, holdingDays: 75, type: 'short' },
  { id: 'tax7', asset: 'Music Royalty: Echoes', buyDate: '2025-12-01', buyPrice: 0.55, sellDate: '2026-02-18', sellPrice: 0.75, gainLoss: 0.2, holdingDays: 79, type: 'short' },
  { id: 'tax8', asset: 'Abstract Dimension #12', buyDate: '2025-04-20', buyPrice: 3.2, sellDate: '2026-01-05', sellPrice: 5.4, gainLoss: 2.2, holdingDays: 260, type: 'long' },
  { id: 'tax9', asset: 'Diamond 2.5ct', buyDate: '2025-07-08', buyPrice: 15.5, sellDate: '2026-02-12', sellPrice: 18.9, gainLoss: 3.4, holdingDays: 219, type: 'long' },
  { id: 'tax10', asset: 'Crude Oil Barrel Token', buyDate: '2025-10-15', buyPrice: 0.042, sellDate: '2025-12-20', sellPrice: 0.035, gainLoss: -0.007, holdingDays: 66, type: 'short' },
];

export interface WhaleEntry {
  id: string;
  wallet: string;
  totalVolume: number;
  trades: number;
  avgTradeSize: number;
  favoriteCategory: string;
  lastActive: string;
}

export const whaleData: WhaleEntry[] = [
  { id: 'w1', wallet: '0x7a3B...9f2E', totalVolume: 1245.8, trades: 156, avgTradeSize: 7.99, favoriteCategory: 'Real Estate', lastActive: '2m ago' },
  { id: 'w2', wallet: '0x4eD1...3a8C', totalVolume: 987.3, trades: 89, avgTradeSize: 11.09, favoriteCategory: 'Art', lastActive: '15m ago' },
  { id: 'w3', wallet: '0x9bF2...7d1A', totalVolume: 756.1, trades: 134, avgTradeSize: 5.64, favoriteCategory: 'Collectibles', lastActive: '1h ago' },
  { id: 'w4', wallet: '0x2cA8...5e9B', totalVolume: 623.4, trades: 67, avgTradeSize: 9.30, favoriteCategory: 'Commodities', lastActive: '3h ago' },
  { id: 'w5', wallet: '0x6fE3...1b4D', totalVolume: 534.9, trades: 45, avgTradeSize: 11.89, favoriteCategory: 'Real Estate', lastActive: '5h ago' },
  { id: 'w6', wallet: '0x8dB5...2c7F', totalVolume: 478.2, trades: 78, avgTradeSize: 6.13, favoriteCategory: 'IP', lastActive: '8h ago' },
  { id: 'w7', wallet: '0xaB12...4d5E', totalVolume: 412.7, trades: 56, avgTradeSize: 7.37, favoriteCategory: 'Art', lastActive: '12h ago' },
  { id: 'w8', wallet: '0xcD34...6f7G', totalVolume: 367.5, trades: 92, avgTradeSize: 3.99, favoriteCategory: 'Collectibles', lastActive: '1d ago' },
  { id: 'w9', wallet: '0xeF56...8h9I', totalVolume: 298.1, trades: 41, avgTradeSize: 7.27, favoriteCategory: 'Commodities', lastActive: '1d ago' },
  { id: 'w10', wallet: '0x1a2B...3c4D', totalVolume: 245.6, trades: 33, avgTradeSize: 7.44, favoriteCategory: 'Real Estate', lastActive: '2d ago' },
];

export const whaleActivityFeed = [
  { id: 'wa1', wallet: '0x7a3B...9f2E', action: 'bought', asset: 'Skyline Penthouse #42', amount: 12.5, time: '2m ago' },
  { id: 'wa2', wallet: '0x4eD1...3a8C', action: 'sold', asset: 'Digital Aurora #7', amount: 3.8, time: '8m ago' },
  { id: 'wa3', wallet: '0x9bF2...7d1A', action: 'bought', asset: 'First Edition Charizard PSA 10', amount: 95.0, time: '15m ago' },
  { id: 'wa4', wallet: '0x2cA8...5e9B', action: 'bid', asset: 'Vintage Rolex Daytona Token', amount: 48.0, time: '22m ago' },
  { id: 'wa5', wallet: '0x6fE3...1b4D', action: 'bought', asset: 'Beachfront Villa Costa Rica', amount: 28.0, time: '35m ago' },
  { id: 'wa6', wallet: '0x8dB5...2c7F', action: 'sold', asset: 'Gold Bar 1kg', amount: 2.3, time: '45m ago' },
  { id: 'wa7', wallet: '0x7a3B...9f2E', action: 'bought', asset: 'Diamond 2.5ct', amount: 18.9, time: '1h ago' },
  { id: 'wa8', wallet: '0x4eD1...3a8C', action: 'bid', asset: 'Rare Stamp: Inverted Jenny', amount: 16.0, time: '1.5h ago' },
];

export interface Offer {
  id: string;
  assetId: string;
  assetName: string;
  assetImage: string;
  buyer: { name: string; avatar: string; wallet: string };
  offerPrice: number;
  listedPrice: number;
  expires: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  counterPrice?: number;
  thread: { from: string; price: number; message: string; timestamp: string }[];
}

export const mockOffers: Offer[] = [
  {
    id: 'off1', assetId: '1', assetName: 'Skyline Penthouse #42', assetImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop',
    buyer: { name: 'Marcus Chen', avatar: owners[1].avatar, wallet: '0x4eD1...3a8C' }, offerPrice: 11.0, listedPrice: 12.5, expires: '3 days', message: 'Love this property. Willing to close quickly.',
    status: 'pending', thread: [{ from: 'Marcus Chen', price: 11.0, message: 'Love this property. Willing to close quickly.', timestamp: '2h ago' }],
  },
  {
    id: 'off2', assetId: '7', assetName: 'Beachfront Villa Costa Rica', assetImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=200&fit=crop',
    buyer: { name: 'Aria Nakamura', avatar: owners[2].avatar, wallet: '0x9bF2...7d1A' }, offerPrice: 24.5, listedPrice: 28.0, expires: '7 days', message: 'Been watching for months. This is my dream property.',
    status: 'countered', counterPrice: 26.5, thread: [
      { from: 'Aria Nakamura', price: 24.5, message: 'Been watching for months.', timestamp: '1d ago' },
      { from: 'You', price: 26.5, message: 'Meet in the middle?', timestamp: '12h ago' },
    ],
  },
  {
    id: 'off3', assetId: '13', assetName: 'Diamond 2.5ct', assetImage: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=200&h=200&fit=crop',
    buyer: { name: 'James Okafor', avatar: owners[3].avatar, wallet: '0x2cA8...5e9B' }, offerPrice: 17.0, listedPrice: 18.9, expires: '1 day', message: 'Quick buy. Ready to transfer.',
    status: 'pending', thread: [{ from: 'James Okafor', price: 17.0, message: 'Quick buy. Ready to transfer.', timestamp: '5h ago' }],
  },
  {
    id: 'off4', assetId: '5', assetName: 'Gold Bar 1kg — Vault #19', assetImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=200&h=200&fit=crop',
    buyer: { name: 'Sofia Laurent', avatar: owners[4].avatar, wallet: '0x6fE3...1b4D' }, offerPrice: 1.9, listedPrice: 2.1, expires: '3 days', message: 'Looking to diversify into commodities.',
    status: 'accepted', thread: [
      { from: 'Sofia Laurent', price: 1.9, message: 'Looking to diversify.', timestamp: '2d ago' },
      { from: 'You', price: 1.9, message: 'Accepted!', timestamp: '1d ago' },
    ],
  },
];

export interface FlashSale {
  id: string;
  assetId: string;
  assetName: string;
  assetImage: string;
  originalPrice: number;
  discountPercent: number;
  salePrice: number;
  endsIn: number;
  category: string;
}

export const flashSales: FlashSale[] = [
  { id: 'fs1', assetId: '9', assetName: 'Crude Oil Barrel Token', assetImage: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop', originalPrice: 0.035, discountPercent: 20, salePrice: 0.028, endsIn: 3600, category: 'Commodities' },
  { id: 'fs2', assetId: '10', assetName: 'Music Royalty: Echoes', assetImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop', originalPrice: 0.75, discountPercent: 15, salePrice: 0.6375, endsIn: 7200, category: 'IP' },
  { id: 'fs3', assetId: '6', assetName: 'Neo-Tokyo Drift #33', assetImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop', originalPrice: 1.8, discountPercent: 25, salePrice: 1.35, endsIn: 14400, category: 'Art' },
  { id: 'fs4', assetId: '12', assetName: 'Tokyo Apartment Complex', assetImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop', originalPrice: 6.8, discountPercent: 10, salePrice: 6.12, endsIn: 28800, category: 'Real Estate' },
  { id: 'fs5', assetId: '4', assetName: 'BioGen Patent Portfolio', assetImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop', originalPrice: 8.75, discountPercent: 18, salePrice: 7.175, endsIn: 43200, category: 'IP' },
];

export interface Bundle {
  id: string;
  name: string;
  description: string;
  assetIds: string[];
  assetNames: string[];
  assetImages: string[];
  individualTotal: number;
  bundlePrice: number;
  discountPercent: number;
  creator: { name: string; avatar: string };
  expiresIn: number;
}

export const bundles: Bundle[] = [
  {
    id: 'b1', name: 'Real Estate Starter Pack', description: 'Get started with premium tokenized real estate. Includes fractional ownership in 3 properties.',
    assetIds: ['1', '7', '12'], assetNames: ['Skyline Penthouse #42', 'Beachfront Villa Costa Rica', 'Tokyo Apartment Complex'],
    assetImages: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200&h=200&fit=crop'],
    individualTotal: 47.3, bundlePrice: 40.2, discountPercent: 15, creator: { name: 'Elena Voss', avatar: owners[0].avatar }, expiresIn: 172800,
  },
  {
    id: 'b2', name: 'Art Collection Bundle', description: 'Curated digital art collection from top creators.',
    assetIds: ['2', '6', '11'], assetNames: ['Digital Aurora #7', 'Neo-Tokyo Drift #33', 'Abstract Dimension #12'],
    assetImages: ['https://images.unsplash.com/photo-1549490349-8643362247b5?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop'],
    individualTotal: 10.4, bundlePrice: 8.32, discountPercent: 20, creator: { name: 'Marcus Chen', avatar: owners[1].avatar }, expiresIn: 259200,
  },
];

export const adminUsers = [
  { id: 'au1', username: 'Elena Voss', email: 'elena@example.com', avatar: owners[0].avatar, joinDate: '2025-03-15', assets: 12, volume: 245.8, status: 'active' as const, kycStatus: 'verified' as const },
  { id: 'au2', username: 'Marcus Chen', email: 'marcus@example.com', avatar: owners[1].avatar, joinDate: '2025-04-22', assets: 8, volume: 198.3, status: 'active' as const, kycStatus: 'verified' as const },
  { id: 'au3', username: 'Aria Nakamura', email: 'aria@example.com', avatar: owners[2].avatar, joinDate: '2025-05-10', assets: 15, volume: 167.5, status: 'active' as const, kycStatus: 'verified' as const },
  { id: 'au4', username: 'James Okafor', email: 'james@example.com', avatar: owners[3].avatar, joinDate: '2025-06-01', assets: 5, volume: 134.2, status: 'active' as const, kycStatus: 'pending' as const },
  { id: 'au5', username: 'Sofia Laurent', email: 'sofia@example.com', avatar: owners[4].avatar, joinDate: '2025-07-18', assets: 9, volume: 112.7, status: 'active' as const, kycStatus: 'verified' as const },
  { id: 'au6', username: 'Kai Patel', email: 'kai@example.com', avatar: owners[5].avatar, joinDate: '2025-08-25', assets: 3, volume: 98.4, status: 'active' as const, kycStatus: 'none' as const },
  { id: 'au7', username: 'Suspicious_User', email: 'sus@example.com', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop', joinDate: '2026-01-05', assets: 1, volume: 0.5, status: 'banned' as const, kycStatus: 'none' as const },
  { id: 'au8', username: 'NewTrader_2026', email: 'newtrader@example.com', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=80&h=80&fit=crop', joinDate: '2026-02-15', assets: 0, volume: 0, status: 'active' as const, kycStatus: 'pending' as const },
];

export const adminDisputes = [
  { id: 'disp1', ticket: '#2847', reporter: 'Marcus Chen', against: 'Suspicious_User', category: 'Fraud', date: '2026-02-18', priority: 'high' as const, status: 'open' as const, description: 'Listed a fake Rolex token with doctored authentication documents.' },
  { id: 'disp2', ticket: '#2846', reporter: 'Sofia Laurent', against: 'Unknown Seller', category: 'Copyright', date: '2026-02-17', priority: 'medium' as const, status: 'under_review' as const, description: 'Art piece appears to be copied from a known artist without permission.' },
  { id: 'disp3', ticket: '#2845', reporter: 'Kai Patel', against: 'James Okafor', category: 'Incorrect Description', date: '2026-02-15', priority: 'low' as const, status: 'resolved' as const, description: 'Property listing described 4 bedrooms but documents show 3.' },
];

export const adminRevenue = [
  { month: 'Sep', listing: 2400, transaction: 8900, pro: 1200, boost: 800 },
  { month: 'Oct', listing: 2800, transaction: 10200, pro: 1500, boost: 1100 },
  { month: 'Nov', listing: 3200, transaction: 11500, pro: 1800, boost: 1300 },
  { month: 'Dec', listing: 2900, transaction: 9800, pro: 2100, boost: 1500 },
  { month: 'Jan', listing: 3500, transaction: 12800, pro: 2400, boost: 1800 },
  { month: 'Feb', listing: 3800, transaction: 14200, pro: 2700, boost: 2100 },
];

export const paymentHistory = [
  { id: 'pay1', date: '2026-02-01', amount: 29, description: 'Pro Monthly Subscription', status: 'paid' as const },
  { id: 'pay2', date: '2026-01-01', amount: 29, description: 'Pro Monthly Subscription', status: 'paid' as const },
  { id: 'pay3', date: '2025-12-01', amount: 29, description: 'Pro Monthly Subscription', status: 'paid' as const },
  { id: 'pay4', date: '2025-12-15', amount: 25, description: 'Featured Listing — 7 days', status: 'paid' as const },
  { id: 'pay5', date: '2025-11-01', amount: 29, description: 'Pro Monthly Subscription', status: 'paid' as const },
];

export const riskFactors = [
  { name: 'Diversification', score: 65, description: 'Assets spread across 3 of 5 categories' },
  { name: 'Liquidity', score: 42, description: '40% of portfolio in low-liquidity assets' },
  { name: 'Volatility', score: 35, description: 'Moderate price swings in held assets' },
  { name: 'Concentration', score: 28, description: '45% of value in a single asset' },
];

export const riskRecommendations = [
  'Diversify into Commodities category to reduce concentration risk',
  'Consider listing illiquid assets to improve portfolio flexibility',
  'Reduce single-asset concentration below 30% of total value',
];

export const riskScoreHistory = [
  { month: 'Sep', score: 58 },
  { month: 'Oct', score: 52 },
  { month: 'Nov', score: 48 },
  { month: 'Dec', score: 45 },
  { month: 'Jan', score: 44 },
  { month: 'Feb', score: 42 },
];
