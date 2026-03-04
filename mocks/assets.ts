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

export const categories: AssetCategory[] = ['Real Estate', 'Art', 'Collectibles', 'Intellectual Property', 'Commodities'];

export const defaultOwner: AssetOwner = {
  id: 'unknown',
  name: 'Unknown',
  avatar: '',
  wallet: '0x0000...0000',
};
