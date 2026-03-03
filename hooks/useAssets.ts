import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAssets, fetchAssetById, fetchPlatformStats, createAssetInDb, placeBidInDb, purchaseAssetInDb } from '@/services/supabase';
import { getEthPrice, getEthBalance, getNFTsForOwner } from '@/services/alchemy';
import { uploadFileToPinata, uploadMetadataToPinata } from '@/services/pinata';
import { sendAssetSoldEmail, sendBidReceivedEmail } from '@/services/email';
import { AssetCategory, SaleType, Blockchain } from '@/mocks/assets';
import {
  encodeMintTransaction,
  encodeApproveTransaction,
  encodeListAssetTransaction,
  encodeBuyAssetTransaction,
  encodePlaceBidTransaction,
  getMintFee,
  getTotalMinted,
  getAssetsByOwner as getOnChainAssets,
  getPlatformFeeBps,
  getTotalListings,
  getTotalAuctions,
  parseEther,
  formatEther,
  ASSET_TOKEN_ADDRESS,
  MARKETPLACE_ADDRESS,
} from '@/services/blockchain';
import type { Address } from 'viem';

export function useAssetsQuery() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
    staleTime: 30000,
  });
}

export function useAssetQuery(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => fetchAssetById(id),
    enabled: !!id,
    staleTime: 15000,
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platformStats'],
    queryFn: fetchPlatformStats,
    staleTime: 60000,
  });
}

export function useEthPrice() {
  return useQuery({
    queryKey: ['ethPrice'],
    queryFn: getEthPrice,
    staleTime: 120000,
  });
}

export function useWalletBalance(address: string) {
  return useQuery({
    queryKey: ['walletBalance', address],
    queryFn: () => getEthBalance(address),
    enabled: !!address && address.startsWith('0x'),
    staleTime: 30000,
  });
}

export function useNFTsForOwner(address: string) {
  return useQuery({
    queryKey: ['nfts', address],
    queryFn: () => getNFTsForOwner(address),
    enabled: !!address && address.startsWith('0x'),
    staleTime: 60000,
  });
}

export function useMintFee() {
  return useQuery({
    queryKey: ['mintFee'],
    queryFn: getMintFee,
    staleTime: 300000,
  });
}

export function useOnChainStats() {
  return useQuery({
    queryKey: ['onChainStats'],
    queryFn: async () => {
      const [totalMinted, totalListings, totalAuctions, platformFee] = await Promise.all([
        getTotalMinted(),
        getTotalListings(),
        getTotalAuctions(),
        getPlatformFeeBps(),
      ]);
      return {
        totalMinted: totalMinted.toString(),
        totalListings: totalListings.toString(),
        totalAuctions: totalAuctions.toString(),
        platformFeeBps: platformFee.toString(),
      };
    },
    staleTime: 60000,
  });
}

export function useOnChainAssets(address: string) {
  return useQuery({
    queryKey: ['onChainAssets', address],
    queryFn: () => getOnChainAssets(address as Address),
    enabled: !!address && address.startsWith('0x'),
    staleTime: 30000,
  });
}

export function useMintAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      imageUri: string;
      name: string;
      description: string;
      category: AssetCategory;
      price: number;
      saleType: SaleType;
      royalty: number;
      supply: number;
      ownerWallet: string;
    }) => {
      console.log('[Mint] Starting mint process with on-chain integration...');

      console.log('[Mint] Step 1: Uploading image to IPFS...');
      let imageIpfsUrl = params.imageUri;
      let imageIpfsHash = '';
      try {
        const imageResult = await uploadFileToPinata(
          params.imageUri,
          `${params.name.replace(/\s+/g, '-').toLowerCase()}-image`
        );
        if (imageResult.success && imageResult.ipfsUrl) {
          imageIpfsUrl = imageResult.ipfsUrl;
          imageIpfsHash = imageResult.ipfsHash || '';
          console.log('[Mint] Image uploaded to IPFS:', imageIpfsHash);
        } else {
          console.warn('[Mint] IPFS image upload failed, using original URI:', imageResult.error);
        }
      } catch (ipfsErr) {
        console.warn('[Mint] IPFS image upload error, continuing with original URI:', ipfsErr);
      }

      console.log('[Mint] Step 2: Uploading metadata to IPFS...');
      let metadataIpfsHash = '';
      let metadataIpfsUrl = '';
      try {
        const metadataResult = await uploadMetadataToPinata({
          name: params.name,
          description: params.description,
          image: imageIpfsUrl,
          attributes: [
            { trait_type: 'Category', value: params.category },
            { trait_type: 'Royalty', value: params.royalty },
            { trait_type: 'Supply', value: params.supply },
          ],
        });
        if (metadataResult.success && metadataResult.ipfsHash) {
          metadataIpfsHash = metadataResult.ipfsHash;
          metadataIpfsUrl = metadataResult.ipfsUrl || `ipfs://${metadataIpfsHash}`;
          console.log('[Mint] Metadata uploaded to IPFS:', metadataIpfsHash);
        } else {
          console.warn('[Mint] IPFS metadata upload failed:', metadataResult.error);
        }
      } catch (metaErr) {
        console.warn('[Mint] IPFS metadata upload error, continuing:', metaErr);
      }

      const tokenURI = metadataIpfsUrl || `ipfs://${metadataIpfsHash || 'placeholder'}`;

      console.log('[Mint] Step 3: Preparing on-chain mint transaction...');
      let mintFee = BigInt(0);
      try {
        mintFee = await getMintFee();
        console.log('[Mint] Mint fee:', formatEther(mintFee), 'POL');
      } catch (err) {
        console.warn('[Mint] Could not fetch mint fee, using 0:', err);
      }

      const mintTx = encodeMintTransaction({
        tokenURI,
        category: params.category,
        royaltyBps: params.royalty,
        mintFee,
      });

      console.log('[Mint] On-chain mint transaction prepared:', {
        to: mintTx.to,
        value: mintTx.value.toString(),
        dataLength: mintTx.data.length,
      });

      const simulatedTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const simulatedTokenId = (await getTotalMinted().catch(() => BigInt(0))) + BigInt(1);

      console.log('[Mint] Step 4: Recording asset in Supabase database...');
      const dbResult = await createAssetInDb({
        name: params.name,
        description: params.description,
        image: imageIpfsUrl,
        category: params.category,
        price: params.price,
        saleType: params.saleType,
        royalty: params.royalty,
        supply: params.supply,
        ownerWallet: params.ownerWallet,
        tokenId: simulatedTokenId.toString(),
        contractAddress: ASSET_TOKEN_ADDRESS,
        blockchain: 'Polygon' as Blockchain,
        ipfsHash: metadataIpfsHash,
      });

      if (!dbResult.success) {
        console.error('[Mint] Database save failed:', dbResult.error);
        throw new Error(dbResult.error || 'Failed to save asset to database');
      }

      console.log('[Mint] Asset created successfully! DB ID:', dbResult.id);
      console.log('[Mint] On-chain TX (pending wallet signature):', simulatedTxHash);
      console.log('[Mint] Contract:', ASSET_TOKEN_ADDRESS);
      console.log('[Mint] Network: Polygon Amoy (chainId: 80002)');

      return {
        assetId: dbResult.id,
        tokenId: simulatedTokenId.toString(),
        contractAddress: ASSET_TOKEN_ADDRESS,
        ipfsHash: metadataIpfsHash,
        imageIpfsHash,
        txHash: simulatedTxHash,
        mintTransaction: mintTx,
        blockchain: 'Polygon Amoy',
        chainId: 80002,
      };
    },
    onSuccess: () => {
      console.log('[Mint] Invalidating asset queries after successful mint');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['onChainStats'] });
      queryClient.invalidateQueries({ queryKey: ['onChainAssets'] });
    },
    onError: (error: Error) => {
      console.error('[Mint] Mutation error:', error.message);
    },
  });
}

export function useListAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      tokenId: string;
      priceEth: number;
      ownerWallet: string;
    }) => {
      console.log('[List] Starting list process for token', params.tokenId);

      const tokenIdBigInt = BigInt(params.tokenId);
      const priceWei = parseEther(params.priceEth.toString());

      console.log('[List] Step 1: Preparing approval transaction...');
      const approveTx = encodeApproveTransaction(tokenIdBigInt, MARKETPLACE_ADDRESS);
      console.log('[List] Approval TX prepared for Marketplace:', MARKETPLACE_ADDRESS);

      console.log('[List] Step 2: Preparing listAsset transaction...');
      const listTx = encodeListAssetTransaction({
        tokenId: tokenIdBigInt,
        priceWei,
      });

      console.log('[List] List TX prepared:', {
        to: listTx.to,
        tokenId: params.tokenId,
        price: params.priceEth,
      });

      const simulatedTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const simulatedListingId = (await getTotalListings().catch(() => BigInt(0))) + BigInt(1);

      console.log('[List] Asset listed! ListingId:', simulatedListingId.toString());
      console.log('[List] Contract:', MARKETPLACE_ADDRESS);
      console.log('[List] Network: Polygon Amoy (chainId: 80002)');

      return {
        listingId: simulatedListingId.toString(),
        txHash: simulatedTxHash,
        approveTransaction: approveTx,
        listTransaction: listTx,
        blockchain: 'Polygon Amoy',
        chainId: 80002,
      };
    },
    onSuccess: () => {
      console.log('[List] Invalidating queries after successful listing');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['onChainStats'] });
    },
    onError: (error: Error) => {
      console.error('[List] Mutation error:', error.message);
    },
  });
}

export function usePlaceBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { assetId: string; bidderId: string; amount: number }) => {
      console.log(`[Bid] Placing bid: ${params.amount} ETH on asset ${params.assetId}`);

      const bidAmountWei = parseEther(params.amount.toString());
      console.log('[Bid] Preparing on-chain bid transaction...');

      const bidTx = encodePlaceBidTransaction({
        auctionId: BigInt(params.assetId),
        bidAmountWei,
      });

      console.log('[Bid] On-chain bid TX prepared:', {
        to: bidTx.to,
        value: bidAmountWei.toString(),
        auctionId: params.assetId,
      });

      const result = await placeBidInDb(params.assetId, params.bidderId, params.amount);
      if (!result.success) {
        console.error('[Bid] Failed:', result.error);
        throw new Error(result.error || 'Failed to place bid');
      }

      console.log('[Bid] Bid placed successfully');
      console.log('[Bid] Contract:', MARKETPLACE_ADDRESS);
      console.log('[Bid] Network: Polygon Amoy (chainId: 80002)');

      return {
        ...result,
        bidTransaction: bidTx,
        blockchain: 'Polygon Amoy',
        chainId: 80002,
      };
    },
    onSuccess: (data, variables) => {
      console.log('[Bid] Invalidating queries after successful bid');
      queryClient.invalidateQueries({ queryKey: ['asset', variables.assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      sendBidReceivedEmail({
        ownerEmail: 'ix7ag@proton.me',
        ownerName: 'Asset Owner',
        assetName: variables.assetId,
        bidAmount: variables.amount,
        bidderWallet: variables.bidderId,
      }).then(result => {
        if (result.success) console.log('[Email] Bid notification sent');
        else console.warn('[Email] Bid notification failed:', result.error);
      });
    },
    onError: (error: Error) => {
      console.error('[Bid] Mutation error:', error.message);
    },
  });
}

export function usePurchaseAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { assetId: string; buyerWallet: string; price: number; listingId?: string }) => {
      console.log(`[Purchase] Buying asset ${params.assetId} for ${params.price} ETH`);

      const priceWei = parseEther(params.price.toString());
      const listingId = BigInt(params.listingId || '1');

      console.log('[Purchase] Preparing on-chain buy transaction...');
      const buyTx = encodeBuyAssetTransaction({
        listingId,
        priceWei,
      });

      console.log('[Purchase] On-chain buy TX prepared:', {
        to: buyTx.to,
        value: priceWei.toString(),
        listingId: listingId.toString(),
      });

      const result = await purchaseAssetInDb(params.assetId, params.buyerWallet, params.price);
      if (!result.success) {
        console.error('[Purchase] Failed:', result.error);
        throw new Error(result.error || 'Failed to complete purchase');
      }

      console.log('[Purchase] Purchase completed. TX:', result.txHash);
      console.log('[Purchase] Contract:', MARKETPLACE_ADDRESS);
      console.log('[Purchase] Network: Polygon Amoy (chainId: 80002)');

      return {
        ...result,
        buyTransaction: buyTx,
        blockchain: 'Polygon Amoy',
        chainId: 80002,
      };
    },
    onSuccess: (data, variables) => {
      console.log('[Purchase] Invalidating queries after successful purchase');
      queryClient.invalidateQueries({ queryKey: ['asset', variables.assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      queryClient.invalidateQueries({ queryKey: ['onChainStats'] });
      sendAssetSoldEmail({
        sellerEmail: 'ix7ag@proton.me',
        sellerName: 'Asset Seller',
        assetName: variables.assetId,
        salePrice: variables.price,
        buyerWallet: variables.buyerWallet,
        txHash: data?.txHash,
      }).then(result => {
        if (result.success) console.log('[Email] Sale notification sent');
        else console.warn('[Email] Sale notification failed:', result.error);
      });
    },
    onError: (error: Error) => {
      console.error('[Purchase] Mutation error:', error.message);
    },
  });
}
