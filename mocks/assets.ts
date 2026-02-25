export type AssetCategory = 'Real Estate' | 'Art' | 'Collectibles' | 'Intellectual Property' | 'Commodities';
export type SaleType = 'fixed' | 'auction';
export type AssetStatus = 'Buy Now' | 'Auction' | 'New';
export type Blockchain = 'Ethereum' | 'Polygon';

export interface AssetOwner {
  id: string;
  name: string;
  avatar: string;
  wallet: string;
}

export interface BidOffer {
  id: string;
  bidder: AssetOwner;
  amount: number;
  amountUsd: number;
  timestamp: string;
}

export interface ActivityEvent {
  id: string;
  type: 'Minted' | 'Listed' | 'Sold' | 'Bid' | 'Transfer';
  from: string;
  to: string;
  price?: number;
  timestamp: string;
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  image: string;
  category: AssetCategory;
  price: number;
  priceUsd: number;
  owner: AssetOwner;
  creator: AssetOwner;
  tokenId: string;
  contractAddress: string;
  blockchain: Blockchain;
  tokenStandard: string;
  status: AssetStatus;
  saleType: SaleType;
  royalty: number;
  supply: number;
  views: number;
  favorites: number;
  listedAt: string;
  priceHistory: { month: string; price: number }[];
  bids: BidOffer[];
  activity: ActivityEvent[];
}

const owners: AssetOwner[] = [
  { id: 'u1', name: 'Elena Voss', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', wallet: '0x7a3B...9f2E' },
  { id: 'u2', name: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', wallet: '0x4eD1...3a8C' },
  { id: 'u3', name: 'Aria Nakamura', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', wallet: '0x9bF2...7d1A' },
  { id: 'u4', name: 'James Okafor', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', wallet: '0x2cA8...5e9B' },
  { id: 'u5', name: 'Sofia Laurent', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', wallet: '0x6fE3...1b4D' },
  { id: 'u6', name: 'Kai Patel', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', wallet: '0x8dB5...2c7F' },
];

export { owners };

const generatePriceHistory = (basePrice: number): { month: string; price: number }[] => {
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  return months.map((month, i) => ({
    month,
    price: +(basePrice * (0.6 + Math.random() * 0.8 + i * 0.05)).toFixed(4),
  }));
};

const generateBids = (basePrice: number): BidOffer[] => [
  { id: 'b1', bidder: owners[1], amount: +(basePrice * 0.95).toFixed(4), amountUsd: +(basePrice * 0.95 * 2450).toFixed(2), timestamp: '2h ago' },
  { id: 'b2', bidder: owners[3], amount: +(basePrice * 0.9).toFixed(4), amountUsd: +(basePrice * 0.9 * 2450).toFixed(2), timestamp: '5h ago' },
  { id: 'b3', bidder: owners[5], amount: +(basePrice * 0.85).toFixed(4), amountUsd: +(basePrice * 0.85 * 2450).toFixed(2), timestamp: '1d ago' },
];

const generateActivity = (): ActivityEvent[] => [
  { id: 'a1', type: 'Listed', from: 'Owner', to: 'Marketplace', price: 2.5, timestamp: '1d ago' },
  { id: 'a2', type: 'Transfer', from: '0x7a3B...9f2E', to: '0x4eD1...3a8C', timestamp: '3d ago' },
  { id: 'a3', type: 'Sold', from: '0x9bF2...7d1A', to: '0x7a3B...9f2E', price: 1.8, timestamp: '1w ago' },
  { id: 'a4', type: 'Minted', from: 'NullAddress', to: '0x9bF2...7d1A', timestamp: '2w ago' },
];

export const assets: Asset[] = [
  {
    id: '1',
    name: 'Skyline Penthouse #42',
    description: 'Fractional ownership token representing a 1/100 share of a luxury penthouse in Manhattan, NYC. This token grants voting rights on property management decisions and proportional rental income distribution.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
    category: 'Real Estate',
    price: 12.5,
    priceUsd: 30625,
    owner: owners[0],
    creator: owners[0],
    tokenId: '42',
    contractAddress: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
    blockchain: 'Ethereum',
    tokenStandard: 'ERC-1155',
    status: 'Buy Now',
    saleType: 'fixed',
    royalty: 5,
    supply: 100,
    views: 1243,
    favorites: 89,
    listedAt: '2025-12-15',
    priceHistory: generatePriceHistory(12.5),
    bids: generateBids(12.5),
    activity: generateActivity(),
  },
  {
    id: '2',
    name: 'Digital Aurora #7',
    description: 'A mesmerizing generative art piece capturing the dance of northern lights through algorithmic computation. One of 10 unique editions minted on Ethereum.',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=400&fit=crop',
    category: 'Art',
    price: 3.2,
    priceUsd: 7840,
    owner: owners[1],
    creator: owners[2],
    tokenId: '7',
    contractAddress: '0x2b3c4d5e6f7890ab1234567890abcdef12345678',
    blockchain: 'Ethereum',
    tokenStandard: 'ERC-721',
    status: 'Auction',
    saleType: 'auction',
    royalty: 10,
    supply: 1,
    views: 892,
    favorites: 156,
    listedAt: '2026-01-03',
    priceHistory: generatePriceHistory(3.2),
    bids: generateBids(3.2),
    activity: generateActivity(),
  },
  {
    id: '3',
    name: 'Vintage Rolex Daytona Token',
    description: 'Tokenized certificate of authenticity for a 1963 Rolex Daytona Paul Newman. The physical watch is stored in a bonded vault in Zurich.',
    image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=400&fit=crop',
    category: 'Collectibles',
    price: 45.0,
    priceUsd: 110250,
    owner: owners[2],
    creator: owners[4],
    tokenId: '1963',
    contractAddress: '0x3c4d5e6f7890ab1234567890abcdef1234567890',
    blockchain: 'Polygon',
    tokenStandard: 'ERC-721',
    status: 'Buy Now',
    saleType: 'fixed',
    royalty: 2.5,
    supply: 1,
    views: 2341,
    favorites: 312,
    listedAt: '2025-11-28',
    priceHistory: generatePriceHistory(45.0),
    bids: generateBids(45.0),
    activity: generateActivity(),
  },
  {
    id: '4',
    name: 'BioGen Patent Portfolio',
    description: 'Fractional IP rights to a portfolio of 3 biotech patents covering novel CRISPR delivery mechanisms. Revenue-sharing token with quarterly distributions.',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop',
    category: 'Intellectual Property',
    price: 8.75,
    priceUsd: 21437,
    owner: owners[3],
    creator: owners[3],
    tokenId: '301',
    contractAddress: '0x4d5e6f7890ab1234567890abcdef123456789012',
    blockchain: 'Ethereum',
    tokenStandard: 'ERC-1155',
    status: 'New',
    saleType: 'fixed',
    royalty: 7.5,
    supply: 500,
    views: 567,
    favorites: 43,
    listedAt: '2026-02-10',
    priceHistory: generatePriceHistory(8.75),
    bids: generateBids(8.75),
    activity: generateActivity(),
  },
  {
    id: '5',
    name: 'Gold Bar 1kg — Vault #19',
    description: 'Tokenized 1kg gold bar stored in the Singapore FreePort vault. Each token represents 1 gram of 99.99% pure gold. Redeemable for physical delivery.',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&h=400&fit=crop',
    category: 'Commodities',
    price: 2.1,
    priceUsd: 5145,
    owner: owners[4],
    creator: owners[5],
    tokenId: '1000',
    contractAddress: '0x5e6f7890ab1234567890abcdef12345678901234',
    blockchain: 'Polygon',
    tokenStandard: 'ERC-1155',
    status: 'Buy Now',
    saleType: 'fixed',
    royalty: 1,
    supply: 1000,
    views: 3456,
    favorites: 201,
    listedAt: '2025-10-20',
    priceHistory: generatePriceHistory(2.1),
    bids: generateBids(2.1),
    activity: generateActivity(),
  },
  {
    id: '6',
    name: 'Neo-Tokyo Drift #33',
    description: 'A cyberpunk digital artwork from the acclaimed Neo-Tokyo collection. Features hand-drawn elements combined with AI-assisted rendering.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop',
    category: 'Art',
    price: 1.8,
    priceUsd: 4410,
    owner: owners[5],
    creator: owners[1],
    tokenId: '33',
    contractAddress: '0x6f7890ab1234567890abcdef1234567890123456',
    blockchain: 'Ethereum',
    tokenStandard: 'ERC-721',
    status: 'Auction',
    saleType: 'auction',
    royalty: 10,
    supply: 1,
    views: 1567,
    favorites: 234,
    listedAt: '2026-01-20',
    priceHistory: generatePriceHistory(1.8),
    bids: generateBids(1.8),
    activity: generateActivity(),
  },
  {
    id: '7',
    name: 'Beachfront Villa Costa Rica',
    description: 'Tokenized deed for a 4-bedroom beachfront villa in Guanacaste. Token holders receive proportional rental income and usage rights.',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
    category: 'Real Estate',
    price: 28.0,
    priceUsd: 68600,
    owner: owners[0],
    creator: owners[2],
    tokenId: '88',
    contractAddress: '0x7890ab1234567890abcdef12345678901234abcd',
    blockchain: 'Polygon',
    tokenStandard: 'ERC-1155',
    status: 'Buy Now',
    saleType: 'fixed',
    royalty: 3,
    supply: 50,
    views: 4521,
    favorites: 387,
    listedAt: '2025-09-14',
    priceHistory: generatePriceHistory(28.0),
    bids: generateBids(28.0),
    activity: generateActivity(),
  },
  {
    id: '8',
    name: 'Rare Stamp: Inverted Jenny',
    description: 'Digital certificate of ownership for a 1918 Inverted Jenny postage stamp. Physical stamp insured and stored in a climate-controlled vault.',
    image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&h=400&fit=crop',
    category: 'Collectibles',
    price: 15.3,
    priceUsd: 37485,
    owner: owners[3],
    creator: owners[0],
    tokenId: '1918',
    contractAddress: '0x890ab1234567890abcdef1234567890123456789',
    blockchain: 'Ethereum',
    tokenStandard: 'ERC-721',
    status: 'Auction',
    saleType: 'auction',
    royalty: 5,
    supply: 1,
    views: 987,
    favorites: 145,
    listedAt: '2026-02-01',
    priceHistory: generatePriceHistory(15.3),
    bids: generateBids(15.3),
    activity: generateActivity(),
  },
  {
    id: '9',
    name: 'Crude Oil Barrel Token',
    description: 'Each token represents 1 barrel of WTI crude oil stored at the Cushing, Oklahoma facility. Real-time price tracking with Oracle integration.',
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&h=400&fit=crop',
    category: 'Commodities',
    price: 0.035,
    priceUsd: 85.75,
    owner: owners[5],
    creator: owners[4],
    tokenId: '5000',
    contractAddress: '0x90ab1234567890abcdef12345678901234567890',
    blockchain: 'Polygon',
    tokenStandard: 'ERC-1155',
    status: 'Buy Now',
    saleType: 'fixed',
    royalty: 0.5,
    supply: 10000,
    views: 6789,
    favorites: 445,
    listedAt: '2025-08-05',
    priceHistory: generatePriceHistory(0.035),
    bids: generateBids(0.035),
    activity: generateActivity(),
  },
  {
    id: '10',
    name: 'Music Royalty: Echoes',
    description: 'Own a share of streaming royalties from the platinum single "Echoes" by Nova. Token holders receive monthly distributions from all platforms.',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop',
    category: 'Intellectual Property',
    price: 0.75,
    priceUsd: 1837,
    owner: owners[1],
    creator: owners[5],
    tokenId: '777',
    contractAddress: '0xab1234567890abcdef123456789012345678abcd',
    blockchain: 'Ethereum',
    tokenStandard: 'ERC-1155',
    status: 'New',
    saleType: 'fixed',
    royalty: 15,
    supply: 2000,
    views: 2134,
    favorites: 567,
    listedAt: '2026-02-18',
    priceHistory: generatePriceHistory(0.75),
    bids: generateBids(0.75),
    activity: generateActivity(),
  },
  {
    id: '11',
    name: 'Abstract Dimension #12',
    description: 'Part of the Abstract Dimension series exploring the boundaries between physical and digital art. Created using mixed media and tokenized as a 1/1.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop',
    category: 'Art',
    price: 5.4,
    priceUsd: 13230,
    owner: owners[2],
    creator: owners[1],
    tokenId: '12',
    contractAddress: '0xb1234567890abcdef12345678901234567890abc',
    blockchain: 'Ethereum',
    tokenStandard: 'ERC-721',
    status: 'Buy Now',
    saleType: 'fixed',
    royalty: 10,
    supply: 1,
    views: 1876,
    favorites: 298,
    listedAt: '2025-12-22',
    priceHistory: generatePriceHistory(5.4),
    bids: generateBids(5.4),
    activity: generateActivity(),
  },
  {
    id: '12',
    name: 'Tokyo Apartment Complex',
    description: 'Fractional ownership of a 20-unit apartment complex in Shibuya, Tokyo. Monthly rental yields distributed proportionally to token holders.',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=400&fit=crop',
    category: 'Real Estate',
    price: 6.8,
    priceUsd: 16660,
    owner: owners[4],
    creator: owners[3],
    tokenId: '200',
    contractAddress: '0xc234567890abcdef1234567890123456789012ab',
    blockchain: 'Polygon',
    tokenStandard: 'ERC-1155',
    status: 'New',
    saleType: 'fixed',
    royalty: 4,
    supply: 200,
    views: 3211,
    favorites: 189,
    listedAt: '2026-02-15',
    priceHistory: generatePriceHistory(6.8),
    bids: generateBids(6.8),
    activity: generateActivity(),
  },
  {
    id: '13',
    name: 'Diamond 2.5ct — GIA Certified',
    description: 'Tokenized GIA-certified 2.5 carat diamond. D color, VVS1 clarity. Stored in Brinks vault with full insurance coverage.',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=400&fit=crop',
    category: 'Commodities',
    price: 18.9,
    priceUsd: 46305,
    owner: owners[0],
    creator: owners[2],
    tokenId: '250',
    contractAddress: '0xd34567890abcdef12345678901234567890123ab',
    blockchain: 'Ethereum',
    tokenStandard: 'ERC-721',
    status: 'Buy Now',
    saleType: 'fixed',
    royalty: 2,
    supply: 1,
    views: 1432,
    favorites: 210,
    listedAt: '2026-01-08',
    priceHistory: generatePriceHistory(18.9),
    bids: generateBids(18.9),
    activity: generateActivity(),
  },
  {
    id: '14',
    name: 'First Edition Charizard PSA 10',
    description: 'Tokenized ownership of a PSA 10 graded 1st Edition Base Set Charizard Pokemon card. One of the rarest cards in existence.',
    image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=600&h=400&fit=crop',
    category: 'Collectibles',
    price: 95.0,
    priceUsd: 232750,
    owner: owners[1],
    creator: owners[3],
    tokenId: '4',
    contractAddress: '0xe4567890abcdef123456789012345678901234ab',
    blockchain: 'Ethereum',
    tokenStandard: 'ERC-721',
    status: 'Auction',
    saleType: 'auction',
    royalty: 5,
    supply: 1,
    views: 8976,
    favorites: 1203,
    listedAt: '2026-01-30',
    priceHistory: generatePriceHistory(95.0),
    bids: generateBids(95.0),
    activity: generateActivity(),
  },
];

export const categories: AssetCategory[] = ['Real Estate', 'Art', 'Collectibles', 'Intellectual Property', 'Commodities'];

export const stats = {
  totalVolume: 14523,
  assetsListed: 2847,
  activeUsers: 12340,
};
