import { owners } from './assets';

export interface Collection {
  id: string;
  name: string;
  description: string;
  cover: string;
  creator: typeof owners[0];
  category: string;
  floorPrice: number;
  totalVolume: number;
  items: number;
  ownersCount: number;
}

export interface Comment {
  id: string;
  user: typeof owners[0];
  text: string;
  timestamp: string;
  reported?: boolean;
}

export interface ResaleEntry {
  id: string;
  date: string;
  from: string;
  to: string;
  price: number;
  priceUsd: number;
}

export interface FractionHolder {
  id: string;
  user: typeof owners[0];
  sharesPercent: number;
  value: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  volume: number;
  transactions: number;
  verified: boolean;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface TransactionRecord {
  id: string;
  type: 'Mint' | 'Buy' | 'Sell' | 'Bid' | 'Transfer';
  asset: string;
  assetId: string;
  from: string;
  to: string;
  price: number;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Failed';
}

export const collections: Collection[] = [
  {
    id: 'c1',
    name: 'Urban Estates',
    description: 'Premium tokenized real estate in major cities worldwide',
    cover: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=300&fit=crop',
    creator: owners[0],
    category: 'Real Estate',
    floorPrice: 6.8,
    totalVolume: 1243,
    items: 24,
    ownersCount: 156,
  },
  {
    id: 'c2',
    name: 'Digital Visions',
    description: 'Cutting-edge generative and AI-assisted artwork',
    cover: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&h=300&fit=crop',
    creator: owners[1],
    category: 'Art',
    floorPrice: 1.2,
    totalVolume: 567,
    items: 42,
    ownersCount: 89,
  },
  {
    id: 'c3',
    name: 'Vault Treasures',
    description: 'Rare collectibles stored in bonded vaults globally',
    cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=300&fit=crop',
    creator: owners[2],
    category: 'Collectibles',
    floorPrice: 15.3,
    totalVolume: 2890,
    items: 18,
    ownersCount: 45,
  },
  {
    id: 'c4',
    name: 'IP Vault',
    description: 'Tokenized intellectual property and patent portfolios',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=300&fit=crop',
    creator: owners[3],
    category: 'Intellectual Property',
    floorPrice: 0.75,
    totalVolume: 345,
    items: 31,
    ownersCount: 210,
  },
  {
    id: 'c5',
    name: 'Precious Metals',
    description: 'Gold, silver, and platinum tokens backed by physical assets',
    cover: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&h=300&fit=crop',
    creator: owners[4],
    category: 'Commodities',
    floorPrice: 0.035,
    totalVolume: 4560,
    items: 56,
    ownersCount: 890,
  },
];

export const generateComments = (): Comment[] => [
  { id: 'cm1', user: owners[1], text: 'Incredible asset! The documentation is thorough and the vault storage gives me confidence.', timestamp: '2h ago' },
  { id: 'cm2', user: owners[3], text: 'Been watching this one for a while. Great price point for fractional ownership.', timestamp: '5h ago' },
  { id: 'cm3', user: owners[5], text: 'Just bought 10 fractions. Excited to be part of this!', timestamp: '1d ago' },
  { id: 'cm4', user: owners[0], text: 'The royalty structure is fair. Would recommend to other investors.', timestamp: '2d ago' },
  { id: 'cm5', user: owners[2], text: 'How often are the rental yields distributed? Monthly or quarterly?', timestamp: '3d ago' },
];

export const generateResaleHistory = (basePrice: number): ResaleEntry[] => [
  { id: 'r1', date: '2026-02-15', from: '0x7a3B...9f2E', to: '0x4eD1...3a8C', price: +(basePrice * 1.1).toFixed(4), priceUsd: +(basePrice * 1.1 * 2450).toFixed(2) },
  { id: 'r2', date: '2026-01-28', from: '0x9bF2...7d1A', to: '0x7a3B...9f2E', price: +(basePrice * 0.95).toFixed(4), priceUsd: +(basePrice * 0.95 * 2450).toFixed(2) },
  { id: 'r3', date: '2026-01-10', from: '0x2cA8...5e9B', to: '0x9bF2...7d1A', price: +(basePrice * 0.85).toFixed(4), priceUsd: +(basePrice * 0.85 * 2450).toFixed(2) },
  { id: 'r4', date: '2025-12-22', from: '0x6fE3...1b4D', to: '0x2cA8...5e9B', price: +(basePrice * 0.78).toFixed(4), priceUsd: +(basePrice * 0.78 * 2450).toFixed(2) },
  { id: 'r5', date: '2025-12-05', from: '0x8dB5...2c7F', to: '0x6fE3...1b4D', price: +(basePrice * 0.7).toFixed(4), priceUsd: +(basePrice * 0.7 * 2450).toFixed(2) },
];

export const generateFractionHolders = (): FractionHolder[] => [
  { id: 'f1', user: owners[0], sharesPercent: 35, value: 10712 },
  { id: 'f2', user: owners[1], sharesPercent: 20, value: 6121 },
  { id: 'f3', user: owners[3], sharesPercent: 15, value: 4591 },
  { id: 'f4', user: owners[5], sharesPercent: 10, value: 3060 },
  { id: 'f5', user: owners[2], sharesPercent: 8, value: 2448 },
  { id: 'f6', user: owners[4], sharesPercent: 12, value: 3672 },
];

export const leaderboardSellers: LeaderboardUser[] = [
  { id: 'ls1', name: 'Elena Voss', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', volume: 245.8, transactions: 47, verified: true },
  { id: 'ls2', name: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', volume: 198.3, transactions: 35, verified: true },
  { id: 'ls3', name: 'Aria Nakamura', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', volume: 167.5, transactions: 29, verified: true },
  { id: 'ls4', name: 'James Okafor', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', volume: 134.2, transactions: 22, verified: false },
  { id: 'ls5', name: 'Sofia Laurent', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', volume: 112.7, transactions: 18, verified: true },
  { id: 'ls6', name: 'Kai Patel', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', volume: 98.4, transactions: 15, verified: false },
  { id: 'ls7', name: 'Luna Rivera', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', volume: 87.1, transactions: 12, verified: true },
  { id: 'ls8', name: 'Theo Zhang', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', volume: 76.9, transactions: 11, verified: false },
  { id: 'ls9', name: 'Mira Johansson', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop', volume: 65.3, transactions: 9, verified: true },
  { id: 'ls10', name: 'Dante Rossi', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop', volume: 54.8, transactions: 8, verified: false },
];

export const leaderboardBuyers: LeaderboardUser[] = [
  { id: 'lb1', name: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', volume: 312.5, transactions: 52, verified: true },
  { id: 'lb2', name: 'Sofia Laurent', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', volume: 278.1, transactions: 41, verified: true },
  { id: 'lb3', name: 'James Okafor', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', volume: 234.7, transactions: 38, verified: false },
  { id: 'lb4', name: 'Elena Voss', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', volume: 189.3, transactions: 31, verified: true },
  { id: 'lb5', name: 'Kai Patel', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', volume: 156.8, transactions: 24, verified: false },
  { id: 'lb6', name: 'Aria Nakamura', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', volume: 123.4, transactions: 19, verified: true },
  { id: 'lb7', name: 'Theo Zhang', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', volume: 98.2, transactions: 14, verified: false },
  { id: 'lb8', name: 'Luna Rivera', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', volume: 87.6, transactions: 12, verified: true },
  { id: 'lb9', name: 'Dante Rossi', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop', volume: 72.1, transactions: 10, verified: false },
  { id: 'lb10', name: 'Mira Johansson', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop', volume: 61.5, transactions: 8, verified: true },
];

export const leaderboardCreators: LeaderboardUser[] = [
  { id: 'lc1', name: 'Aria Nakamura', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', volume: 456.2, transactions: 67, verified: true },
  { id: 'lc2', name: 'Elena Voss', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', volume: 389.7, transactions: 53, verified: true },
  { id: 'lc3', name: 'Kai Patel', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', volume: 298.4, transactions: 42, verified: false },
  { id: 'lc4', name: 'James Okafor', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', volume: 234.1, transactions: 34, verified: false },
  { id: 'lc5', name: 'Sofia Laurent', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', volume: 178.9, transactions: 25, verified: true },
  { id: 'lc6', name: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', volume: 145.6, transactions: 21, verified: true },
  { id: 'lc7', name: 'Luna Rivera', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', volume: 112.3, transactions: 16, verified: true },
  { id: 'lc8', name: 'Mira Johansson', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop', volume: 89.7, transactions: 13, verified: true },
  { id: 'lc9', name: 'Dante Rossi', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop', volume: 67.4, transactions: 9, verified: false },
  { id: 'lc10', name: 'Theo Zhang', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', volume: 45.2, transactions: 6, verified: false },
];

export const faqItems: FAQItem[] = [
  { id: 'faq1', category: 'Getting Started', question: 'What is XJO Tokenization?', answer: 'XJO Tokenization is a marketplace for tokenizing real-world and digital assets on the blockchain. You can buy, sell, and trade fractional ownership of properties, artwork, collectibles, intellectual property, and commodities.' },
  { id: 'faq2', category: 'Getting Started', question: 'How do I create an account?', answer: 'Simply connect your crypto wallet (MetaMask, WalletConnect, or Coinbase Wallet) to get started. No separate account creation is needed — your wallet address serves as your identity on the platform.' },
  { id: 'faq3', category: 'Buying', question: 'How do I buy a tokenized asset?', answer: 'Browse the marketplace, find an asset you like, and click "Buy Now" for fixed-price items or "Place Bid" for auctions. Confirm the transaction in your wallet, and the token will be transferred to you.' },
  { id: 'faq4', category: 'Buying', question: 'What are fractions?', answer: 'Fractions allow you to buy partial ownership of high-value assets. Instead of buying the entire token, you can purchase a percentage of it and receive proportional benefits like rental income or appreciation.' },
  { id: 'faq5', category: 'Selling', question: 'How do I list an asset for sale?', answer: 'Go to your Portfolio, find the asset you want to sell, and click "List for Sale" or "Resell." Set your price, choose between fixed price or auction, and confirm. Your listing will appear on the marketplace immediately.' },
  { id: 'faq6', category: 'Selling', question: 'What are royalties?', answer: 'Royalties are a percentage of secondary sales that goes back to the original creator. When you set a royalty during minting, you earn that percentage every time your token is resold on the marketplace.' },
  { id: 'faq7', category: 'Wallet', question: 'Which wallets are supported?', answer: 'We currently support MetaMask, WalletConnect, and Coinbase Wallet. We plan to add support for more wallets in the future. All wallets must be compatible with Ethereum and Polygon networks.' },
  { id: 'faq8', category: 'Wallet', question: 'Are my funds safe?', answer: 'Your private keys never leave your wallet. We only request view permissions to display your balance and assets. All transactions require your explicit approval through your wallet.' },
  { id: 'faq9', category: 'Fees', question: 'What are the platform fees?', answer: 'XJO charges a 2.5% fee on all sales. Gas fees for Ethereum transactions vary based on network congestion. Polygon transactions have minimal gas fees, typically under $0.01.' },
  { id: 'faq10', category: 'Fees', question: 'Are there fees for minting?', answer: 'Minting on Ethereum requires gas fees which vary. Minting on Polygon is nearly free. There is no platform fee for minting — only a fee when the asset is sold.' },
  { id: 'faq11', category: 'Security', question: 'How are physical assets verified?', answer: 'Physical assets go through our verification process which includes proof of ownership documentation, third-party appraisal, and vault storage confirmation. Verified assets display a blue checkmark badge.' },
  { id: 'faq12', category: 'Security', question: 'What happens if there is a dispute?', answer: 'We have a dispute resolution system. You can report any asset or user through the platform. Our team reviews all reports within 48 hours and takes appropriate action.' },
];

export const transactions: TransactionRecord[] = [
  { id: 'tx1', type: 'Buy', asset: 'Skyline Penthouse #42', assetId: '1', from: '0x4eD1...3a8C', to: '0x7a3B...9f2E', price: 12.5, date: '2026-02-20', status: 'Confirmed' },
  { id: 'tx2', type: 'Sell', asset: 'Digital Aurora #7', assetId: '2', from: '0x7a3B...9f2E', to: '0x9bF2...7d1A', price: 3.2, date: '2026-02-19', status: 'Confirmed' },
  { id: 'tx3', type: 'Bid', asset: 'Vintage Rolex Daytona Token', assetId: '3', from: '0x7a3B...9f2E', to: 'Marketplace', price: 42.5, date: '2026-02-18', status: 'Pending' },
  { id: 'tx4', type: 'Mint', asset: 'Neo-Tokyo Drift #33', assetId: '6', from: 'NullAddress', to: '0x7a3B...9f2E', price: 0, date: '2026-02-17', status: 'Confirmed' },
  { id: 'tx5', type: 'Transfer', asset: 'Gold Bar 1kg', assetId: '5', from: '0x6fE3...1b4D', to: '0x7a3B...9f2E', price: 2.1, date: '2026-02-16', status: 'Confirmed' },
  { id: 'tx6', type: 'Buy', asset: 'BioGen Patent Portfolio', assetId: '4', from: '0x2cA8...5e9B', to: '0x7a3B...9f2E', price: 8.75, date: '2026-02-15', status: 'Confirmed' },
  { id: 'tx7', type: 'Sell', asset: 'Beachfront Villa Costa Rica', assetId: '7', from: '0x7a3B...9f2E', to: '0x4eD1...3a8C', price: 28.0, date: '2026-02-14', status: 'Confirmed' },
  { id: 'tx8', type: 'Bid', asset: 'Rare Stamp: Inverted Jenny', assetId: '8', from: '0x7a3B...9f2E', to: 'Marketplace', price: 14.5, date: '2026-02-13', status: 'Failed' },
  { id: 'tx9', type: 'Buy', asset: 'Crude Oil Barrel Token', assetId: '9', from: '0x8dB5...2c7F', to: '0x7a3B...9f2E', price: 0.035, date: '2026-02-12', status: 'Confirmed' },
  { id: 'tx10', type: 'Mint', asset: 'Music Royalty: Echoes', assetId: '10', from: 'NullAddress', to: '0x7a3B...9f2E', price: 0, date: '2026-02-11', status: 'Confirmed' },
  { id: 'tx11', type: 'Sell', asset: 'Abstract Dimension #12', assetId: '11', from: '0x7a3B...9f2E', to: '0x9bF2...7d1A', price: 5.4, date: '2026-02-10', status: 'Confirmed' },
  { id: 'tx12', type: 'Transfer', asset: 'Tokyo Apartment Complex', assetId: '12', from: '0x2cA8...5e9B', to: '0x7a3B...9f2E', price: 6.8, date: '2026-02-09', status: 'Confirmed' },
  { id: 'tx13', type: 'Buy', asset: 'Diamond 2.5ct', assetId: '13', from: '0x6fE3...1b4D', to: '0x7a3B...9f2E', price: 18.9, date: '2026-02-08', status: 'Confirmed' },
  { id: 'tx14', type: 'Bid', asset: 'First Edition Charizard PSA 10', assetId: '14', from: '0x7a3B...9f2E', to: 'Marketplace', price: 90.0, date: '2026-02-07', status: 'Confirmed' },
  { id: 'tx15', type: 'Buy', asset: 'Skyline Penthouse #42', assetId: '1', from: '0x9bF2...7d1A', to: '0x7a3B...9f2E', price: 11.8, date: '2026-02-06', status: 'Confirmed' },
];

export const analyticsVolumeByMonth = [
  { month: 'Sep', volume: 1234 },
  { month: 'Oct', volume: 1567 },
  { month: 'Nov', volume: 2103 },
  { month: 'Dec', volume: 1890 },
  { month: 'Jan', volume: 2456 },
  { month: 'Feb', volume: 2890 },
];

export const analyticsVolumeByCategory = [
  { category: 'Real Estate', volume: 4521 },
  { category: 'Art', volume: 2345 },
  { category: 'Collectibles', volume: 3210 },
  { category: 'IP', volume: 1567 },
  { category: 'Commodities', volume: 2880 },
];

export const portfolioValueHistory = [
  { month: 'Mar', value: 45000 },
  { month: 'Apr', value: 52000 },
  { month: 'May', value: 48000 },
  { month: 'Jun', value: 61000 },
  { month: 'Jul', value: 58000 },
  { month: 'Aug', value: 67000 },
  { month: 'Sep', value: 72000 },
  { month: 'Oct', value: 85000 },
  { month: 'Nov', value: 79000 },
  { month: 'Dec', value: 98000 },
  { month: 'Jan', value: 112000 },
  { month: 'Feb', value: 142000 },
];

export const royaltyData = [
  { id: 'roy1', assetName: 'Skyline Penthouse #42', saleDate: '2026-02-15', salePrice: 13.75, royaltyPercent: 5, amountReceived: 0.6875 },
  { id: 'roy2', assetName: 'Digital Aurora #7', saleDate: '2026-02-10', salePrice: 3.8, royaltyPercent: 10, amountReceived: 0.38 },
  { id: 'roy3', assetName: 'Neo-Tokyo Drift #33', saleDate: '2026-01-28', salePrice: 2.1, royaltyPercent: 10, amountReceived: 0.21 },
  { id: 'roy4', assetName: 'Abstract Dimension #12', saleDate: '2026-01-15', salePrice: 6.2, royaltyPercent: 10, amountReceived: 0.62 },
  { id: 'roy5', assetName: 'Music Royalty: Echoes', saleDate: '2026-01-05', salePrice: 0.95, royaltyPercent: 15, amountReceived: 0.1425 },
];

export const royaltyMonthly = [
  { month: 'Sep', amount: 0.45 },
  { month: 'Oct', amount: 0.72 },
  { month: 'Nov', amount: 0.38 },
  { month: 'Dec', amount: 1.12 },
  { month: 'Jan', amount: 0.97 },
  { month: 'Feb', amount: 1.07 },
];

export const recentSalesTicker = [
  { asset: 'Skyline Penthouse #42', price: '12.5 ETH', time: '2m ago' },
  { asset: 'Digital Aurora #7', price: '3.2 ETH', time: '5m ago' },
  { asset: 'Gold Bar 1kg', price: '2.1 ETH', time: '8m ago' },
  { asset: 'Neo-Tokyo Drift #33', price: '1.8 ETH', time: '12m ago' },
  { asset: 'BioGen Patent Portfolio', price: '8.75 ETH', time: '15m ago' },
  { asset: 'Tokyo Apartment Complex', price: '6.8 ETH', time: '22m ago' },
  { asset: 'Diamond 2.5ct', price: '18.9 ETH', time: '30m ago' },
  { asset: 'Crude Oil Barrel Token', price: '0.035 ETH', time: '35m ago' },
];

export const topAssetsByVolume = [
  { rank: 1, name: 'Skyline Penthouse #42', volume: 245.8, change: 12.5 },
  { rank: 2, name: 'First Edition Charizard PSA 10', volume: 198.3, change: -3.2 },
  { rank: 3, name: 'Vintage Rolex Daytona Token', volume: 167.5, change: 8.7 },
  { rank: 4, name: 'Beachfront Villa Costa Rica', volume: 134.2, change: 15.3 },
  { rank: 5, name: 'Diamond 2.5ct', volume: 112.7, change: -1.8 },
  { rank: 6, name: 'BioGen Patent Portfolio', volume: 98.4, change: 22.1 },
  { rank: 7, name: 'Gold Bar 1kg', volume: 87.1, change: 5.6 },
  { rank: 8, name: 'Tokyo Apartment Complex', volume: 76.9, change: 9.3 },
  { rank: 9, name: 'Music Royalty: Echoes', volume: 65.3, change: -7.4 },
  { rank: 10, name: 'Rare Stamp: Inverted Jenny', volume: 54.8, change: 3.1 },
];

export const sellerReviews = [
  { id: 'rev1', user: owners[1], rating: 5, text: 'Excellent seller! Fast response and smooth transaction.', timestamp: '1 week ago' },
  { id: 'rev2', user: owners[3], rating: 4, text: 'Good experience overall. Asset description was accurate.', timestamp: '2 weeks ago' },
  { id: 'rev3', user: owners[5], rating: 5, text: 'Highly recommended. Documentation was thorough.', timestamp: '1 month ago' },
  { id: 'rev4', user: owners[2], rating: 3, text: 'Transaction took a bit longer than expected but resolved.', timestamp: '1 month ago' },
];
