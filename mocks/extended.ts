import { AssetOwner } from './assets';

export interface Collection {
  id: string;
  name: string;
  description: string;
  cover: string;
  creator: AssetOwner;
  category: string;
  floorPrice: number;
  totalVolume: number;
  items: number;
  ownersCount: number;
}

export interface Comment {
  id: string;
  user: AssetOwner;
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
  user: AssetOwner;
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

export const analyticsVolumeByMonth = [
  { month: 'Sep', volume: 0 },
  { month: 'Oct', volume: 0 },
  { month: 'Nov', volume: 0 },
  { month: 'Dec', volume: 0 },
  { month: 'Jan', volume: 0 },
  { month: 'Feb', volume: 0 },
];

export const analyticsVolumeByCategory = [
  { category: 'Real Estate', volume: 0 },
  { category: 'Art', volume: 0 },
  { category: 'Collectibles', volume: 0 },
  { category: 'IP', volume: 0 },
  { category: 'Commodities', volume: 0 },
];
