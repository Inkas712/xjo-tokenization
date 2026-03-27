import {
  createPublicClient,
  http,
  parseEther,
  formatEther,
  encodeFunctionData,
  decodeEventLog,
  type Hash,
  type Address,
  type TransactionReceipt,
} from 'viem';
import {
  polygonAmoy,
  ASSET_TOKEN_ADDRESS,
  MARKETPLACE_ADDRESS,
  ASSET_TOKEN_ABI,
  MARKETPLACE_ABI,
} from '@/constants/contracts';

export const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(),
});

export interface MintParams {
  tokenURI: string;
  category: string;
  royaltyBps: number;
  mintFee?: bigint;
}

export interface ListAssetParams {
  tokenId: bigint;
  priceWei: bigint;
}

export interface BuyAssetParams {
  listingId: bigint;
  priceWei: bigint;
}

export interface CreateAuctionParams {
  tokenId: bigint;
  startPriceWei: bigint;
  durationSeconds: bigint;
}

export interface PlaceBidParams {
  auctionId: bigint;
  bidAmountWei: bigint;
}

export async function getMintFee(): Promise<bigint> {
  try {
    console.log('[Blockchain] Reading mint fee from AssetToken...');
    const fee = await publicClient.readContract({
      address: ASSET_TOKEN_ADDRESS,
      abi: ASSET_TOKEN_ABI,
      functionName: 'mintFee',
    });
    console.log('[Blockchain] Mint fee:', formatEther(fee), 'POL');
    return fee;
  } catch (err) {
    console.error('[Blockchain] Failed to read mint fee:', err);
    return BigInt(0);
  }
}

export async function getTotalMinted(): Promise<bigint> {
  try {
    const total = await publicClient.readContract({
      address: ASSET_TOKEN_ADDRESS,
      abi: ASSET_TOKEN_ABI,
      functionName: 'totalMinted',
    });
    console.log('[Blockchain] Total minted:', total.toString());
    return total;
  } catch (err) {
    console.error('[Blockchain] Failed to read total minted:', err);
    return BigInt(0);
  }
}

export async function getTokenOwner(tokenId: bigint): Promise<Address | null> {
  try {
    const owner = await publicClient.readContract({
      address: ASSET_TOKEN_ADDRESS,
      abi: ASSET_TOKEN_ABI,
      functionName: 'ownerOf',
      args: [tokenId],
    });
    return owner;
  } catch (err) {
    console.error('[Blockchain] Failed to get token owner:', err);
    return null;
  }
}

export async function getAssetMetadata(tokenId: bigint) {
  try {
    const metadata = await publicClient.readContract({
      address: ASSET_TOKEN_ADDRESS,
      abi: ASSET_TOKEN_ABI,
      functionName: 'getAssetMetadata',
      args: [tokenId],
    });
    return {
      category: metadata.category,
      creator: metadata.creator,
      mintedAt: metadata.mintedAt,
      isVerified: metadata.isVerified,
    };
  } catch (err) {
    console.error('[Blockchain] Failed to get asset metadata:', err);
    return null;
  }
}

export async function getAssetsByOwner(ownerAddress: Address): Promise<bigint[]> {
  try {
    const tokenIds = await publicClient.readContract({
      address: ASSET_TOKEN_ADDRESS,
      abi: ASSET_TOKEN_ABI,
      functionName: 'getAssetsByOwner',
      args: [ownerAddress],
    });
    console.log('[Blockchain] Assets owned by', ownerAddress, ':', tokenIds.length);
    return [...tokenIds];
  } catch (err) {
    console.error('[Blockchain] Failed to get assets by owner:', err);
    return [];
  }
}

export function encodeMintTransaction(params: MintParams) {
  const royaltyBps = BigInt(Math.round(params.royaltyBps * 100));
  console.log('[Blockchain] Encoding mint tx - URI:', params.tokenURI, 'Category:', params.category, 'Royalty:', royaltyBps.toString(), 'bps');

  const data = encodeFunctionData({
    abi: ASSET_TOKEN_ABI,
    functionName: 'mint',
    args: [params.tokenURI, params.category, royaltyBps],
  });

  return {
    to: ASSET_TOKEN_ADDRESS,
    data,
    value: params.mintFee ?? BigInt(0),
  };
}

export function encodeApproveTransaction(tokenId: bigint, spender: Address) {
  console.log('[Blockchain] Encoding approve tx - TokenId:', tokenId.toString(), 'Spender:', spender);

  const data = encodeFunctionData({
    abi: ASSET_TOKEN_ABI,
    functionName: 'approve',
    args: [spender, tokenId],
  });

  return {
    to: ASSET_TOKEN_ADDRESS,
    data,
    value: BigInt(0),
  };
}

export function encodeSetApprovalForAllTransaction(operator: Address, approved: boolean) {
  const data = encodeFunctionData({
    abi: ASSET_TOKEN_ABI,
    functionName: 'setApprovalForAll',
    args: [operator, approved],
  });

  return {
    to: ASSET_TOKEN_ADDRESS,
    data,
    value: BigInt(0),
  };
}

export function encodeListAssetTransaction(params: ListAssetParams) {
  console.log('[Blockchain] Encoding listAsset tx - TokenId:', params.tokenId.toString(), 'Price:', formatEther(params.priceWei), 'POL');

  const data = encodeFunctionData({
    abi: MARKETPLACE_ABI,
    functionName: 'listAsset',
    args: [ASSET_TOKEN_ADDRESS, params.tokenId, params.priceWei],
  });

  return {
    to: MARKETPLACE_ADDRESS,
    data,
    value: BigInt(0),
  };
}

export function encodeBuyAssetTransaction(params: BuyAssetParams) {
  console.log('[Blockchain] Encoding buyAsset tx - ListingId:', params.listingId.toString(), 'Price:', formatEther(params.priceWei), 'POL');

  const data = encodeFunctionData({
    abi: MARKETPLACE_ABI,
    functionName: 'buyAsset',
    args: [params.listingId],
  });

  return {
    to: MARKETPLACE_ADDRESS,
    data,
    value: params.priceWei,
  };
}

export function encodeCreateAuctionTransaction(params: CreateAuctionParams) {
  console.log('[Blockchain] Encoding createAuction tx - TokenId:', params.tokenId.toString(), 'StartPrice:', formatEther(params.startPriceWei), 'Duration:', params.durationSeconds.toString(), 's');

  const data = encodeFunctionData({
    abi: MARKETPLACE_ABI,
    functionName: 'createAuction',
    args: [ASSET_TOKEN_ADDRESS, params.tokenId, params.startPriceWei, params.durationSeconds],
  });

  return {
    to: MARKETPLACE_ADDRESS,
    data,
    value: BigInt(0),
  };
}

export function encodePlaceBidTransaction(params: PlaceBidParams) {
  console.log('[Blockchain] Encoding placeBid tx - AuctionId:', params.auctionId.toString(), 'Amount:', formatEther(params.bidAmountWei), 'POL');

  const data = encodeFunctionData({
    abi: MARKETPLACE_ABI,
    functionName: 'placeBid',
    args: [params.auctionId],
  });

  return {
    to: MARKETPLACE_ADDRESS,
    data,
    value: params.bidAmountWei,
  };
}

export async function getListing(listingId: bigint) {
  try {
    const listing = await publicClient.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getListing',
      args: [listingId],
    });
    return {
      seller: listing.seller,
      tokenContract: listing.tokenContract,
      tokenId: listing.tokenId,
      price: listing.price,
      isActive: listing.isActive,
      listedAt: listing.listedAt,
    };
  } catch (err) {
    console.error('[Blockchain] Failed to get listing:', err);
    return null;
  }
}

export async function getAuction(auctionId: bigint) {
  try {
    const auction = await publicClient.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getAuction',
      args: [auctionId],
    });
    return {
      seller: auction.seller,
      tokenContract: auction.tokenContract,
      tokenId: auction.tokenId,
      startPrice: auction.startPrice,
      highestBid: auction.highestBid,
      highestBidder: auction.highestBidder,
      startTime: auction.startTime,
      endTime: auction.endTime,
      isActive: auction.isActive,
    };
  } catch (err) {
    console.error('[Blockchain] Failed to get auction:', err);
    return null;
  }
}

export async function getPlatformFeeBps(): Promise<bigint> {
  try {
    const fee = await publicClient.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'platformFeeBps',
    });
    console.log('[Blockchain] Platform fee:', fee.toString(), 'bps');
    return fee;
  } catch (err) {
    console.error('[Blockchain] Failed to read platform fee:', err);
    return BigInt(250);
  }
}

export async function getTotalListings(): Promise<bigint> {
  try {
    return await publicClient.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'totalListings',
    });
  } catch (err) {
    console.error('[Blockchain] Failed to read total listings:', err);
    return BigInt(0);
  }
}

export async function getTotalAuctions(): Promise<bigint> {
  try {
    return await publicClient.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'totalAuctions',
    });
  } catch (err) {
    console.error('[Blockchain] Failed to read total auctions:', err);
    return BigInt(0);
  }
}

export async function isProUser(address: Address): Promise<boolean> {
  try {
    const isPro = await publicClient.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'proUsers',
      args: [address],
    });
    return isPro;
  } catch (err) {
    console.error('[Blockchain] Failed to check pro status:', err);
    return false;
  }
}

export async function waitForTransaction(txHash: Hash): Promise<TransactionReceipt> {
  console.log('[Blockchain] Waiting for tx confirmation:', txHash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log('[Blockchain] Tx confirmed in block:', receipt.blockNumber.toString(), 'Status:', receipt.status);
  return receipt;
}

export function parseMintedEvent(receipt: TransactionReceipt): { tokenId: bigint; creator: Address } | null {
  try {
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: ASSET_TOKEN_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === 'AssetMinted') {
          const args = decoded.args as { tokenId: bigint; creator: Address };
          console.log('[Blockchain] Parsed AssetMinted event - TokenId:', args.tokenId.toString());
          return { tokenId: args.tokenId, creator: args.creator };
        }
      } catch {
        continue;
      }
    }
    return null;
  } catch (err) {
    console.error('[Blockchain] Failed to parse minted event:', err);
    return null;
  }
}

export function parseListedEvent(receipt: TransactionReceipt): { listingId: bigint } | null {
  try {
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: MARKETPLACE_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === 'Listed') {
          const args = decoded.args as { listingId: bigint };
          console.log('[Blockchain] Parsed Listed event - ListingId:', args.listingId.toString());
          return { listingId: args.listingId };
        }
      } catch {
        continue;
      }
    }
    return null;
  } catch (err) {
    console.error('[Blockchain] Failed to parse listed event:', err);
    return null;
  }
}

export function parseSoldEvent(receipt: TransactionReceipt): { listingId: bigint; buyer: Address; seller: Address; price: bigint } | null {
  try {
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: MARKETPLACE_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === 'Sold') {
          const args = decoded.args as { listingId: bigint; buyer: Address; seller: Address; price: bigint };
          console.log('[Blockchain] Parsed Sold event - ListingId:', args.listingId.toString());
          return args;
        }
      } catch {
        continue;
      }
    }
    return null;
  } catch (err) {
    console.error('[Blockchain] Failed to parse sold event:', err);
    return null;
  }
}

export { parseEther, formatEther };
export { ASSET_TOKEN_ADDRESS, MARKETPLACE_ADDRESS };
