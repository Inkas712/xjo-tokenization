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
  { id: 'a1', category: 'trading', name: 'First Purchase', description: 'Buy your first tokenized asset', icon: '🛒', xp: 50, progress: 0, maxProgress: 1, unlocked: false },
  { id: 'a2', category: 'trading', name: 'First Sale', description: 'Sell your first asset on the marketplace', icon: '💰', xp: 50, progress: 0, maxProgress: 1, unlocked: false },
  { id: 'a3', category: 'trading', name: 'Volume Trader', description: 'Trade over $10,000 in volume', icon: '📊', xp: 200, progress: 0, maxProgress: 10000, unlocked: false },
  { id: 'a4', category: 'trading', name: 'Whale', description: 'Accumulate 100+ ETH in trading volume', icon: '🐋', xp: 500, progress: 0, maxProgress: 100, unlocked: false },
  { id: 'a5', category: 'trading', name: 'Diamond Hands', description: 'Hold an asset for over 1 year', icon: '💎', xp: 300, progress: 0, maxProgress: 365, unlocked: false },
  { id: 'a6', category: 'creating', name: 'First Mint', description: 'Mint your first token', icon: '🎨', xp: 50, progress: 0, maxProgress: 1, unlocked: false },
  { id: 'a7', category: 'creating', name: 'Verified Creator', description: 'Get verified as a creator', icon: '✅', xp: 200, progress: 0, maxProgress: 1, unlocked: false },
  { id: 'a8', category: 'creating', name: 'Collection Creator', description: 'Create your first collection', icon: '📁', xp: 100, progress: 0, maxProgress: 1, unlocked: false },
  { id: 'a9', category: 'creating', name: '10 Assets Minted', description: 'Mint 10 tokens on the platform', icon: '🏭', xp: 150, progress: 0, maxProgress: 10, unlocked: false },
  { id: 'a10', category: 'creating', name: 'Popular Creator', description: 'Reach 100 followers', icon: '🌟', xp: 300, progress: 0, maxProgress: 100, unlocked: false },
  { id: 'a11', category: 'social', name: 'First Follow', description: 'Follow another creator', icon: '👋', xp: 25, progress: 0, maxProgress: 1, unlocked: false },
  { id: 'a12', category: 'social', name: 'Community Member', description: 'Reach 50 followers', icon: '👥', xp: 150, progress: 0, maxProgress: 50, unlocked: false },
  { id: 'a13', category: 'social', name: 'Influencer', description: 'Reach 500 followers', icon: '🎤', xp: 500, progress: 0, maxProgress: 500, unlocked: false },
  { id: 'a14', category: 'platform', name: 'Early Adopter', description: 'Join the platform in its first year', icon: '🚀', xp: 100, progress: 0, maxProgress: 1, unlocked: false },
  { id: 'a15', category: 'platform', name: 'Feedback Hero', description: 'Submit 5 bug reports or suggestions', icon: '🐛', xp: 75, progress: 0, maxProgress: 5, unlocked: false },
  { id: 'a16', category: 'platform', name: 'Governance Voter', description: 'Vote on 10 governance proposals', icon: '🗳️', xp: 200, progress: 0, maxProgress: 10, unlocked: false },
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

export interface WhaleEntry {
  id: string;
  wallet: string;
  totalVolume: number;
  trades: number;
  avgTradeSize: number;
  favoriteCategory: string;
  lastActive: string;
}

export interface Referral {
  id: string;
  username: string;
  avatar: string;
  joinDate: string;
  transactions: number;
  earnings: number;
  status: 'active' | 'inactive';
}

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

export const riskFactors: { name: string; score: number; description: string }[] = [];

export const riskRecommendations: string[] = [
  'Diversify into more asset categories to reduce concentration risk',
  'Consider listing illiquid assets to improve portfolio flexibility',
  'Reduce single-asset concentration below 30% of total value',
];

export const riskScoreHistory: { month: string; score: number }[] = [];
