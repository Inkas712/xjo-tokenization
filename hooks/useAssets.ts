import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAssets, fetchAssetById, fetchPlatformStats, createAssetInDb, placeBidInDb, purchaseAssetInDb } from '@/services/supabase';
import { getEthPrice, getEthBalance, getNFTsForOwner } from '@/services/alchemy';
import { uploadFileToPinata, uploadMetadataToPinata } from '@/services/pinata';
import { sendAssetSoldEmail, sendBidReceivedEmail } from '@/services/email';
import { Asset, AssetCategory, SaleType, Blockchain } from '@/mocks/assets';

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
      console.log('[Mint] Starting mint process...');

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
          console.log('[Mint] Metadata uploaded to IPFS:', metadataIpfsHash);
        } else {
          console.warn('[Mint] IPFS metadata upload failed:', metadataResult.error);
        }
      } catch (metaErr) {
        console.warn('[Mint] IPFS metadata upload error, continuing:', metaErr);
      }

      console.log('[Mint] Step 3: Recording asset in Supabase database...');
      const tokenId = Math.floor(Math.random() * 100000).toString();
      const contractAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

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
        tokenId,
        contractAddress,
        blockchain: 'Ethereum' as Blockchain,
        ipfsHash: metadataIpfsHash,
      });

      if (!dbResult.success) {
        console.error('[Mint] Database save failed:', dbResult.error);
        throw new Error(dbResult.error || 'Failed to save asset to database');
      }

      console.log('[Mint] Asset created successfully! ID:', dbResult.id);
      return {
        assetId: dbResult.id,
        tokenId,
        contractAddress,
        ipfsHash: metadataIpfsHash,
        imageIpfsHash,
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      };
    },
    onSuccess: () => {
      console.log('[Mint] Invalidating asset queries after successful mint');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: Error) => {
      console.error('[Mint] Mutation error:', error.message);
    },
  });
}

export function usePlaceBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { assetId: string; bidderId: string; amount: number }) => {
      console.log(`[Bid] Placing bid: ${params.amount} ETH on asset ${params.assetId}`);
      const result = await placeBidInDb(params.assetId, params.bidderId, params.amount);
      if (!result.success) {
        console.error('[Bid] Failed:', result.error);
        throw new Error(result.error || 'Failed to place bid');
      }
      console.log('[Bid] Bid placed successfully');
      return result;
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
    mutationFn: async (params: { assetId: string; buyerWallet: string; price: number }) => {
      console.log(`[Purchase] Buying asset ${params.assetId} for ${params.price} ETH`);
      const result = await purchaseAssetInDb(params.assetId, params.buyerWallet, params.price);
      if (!result.success) {
        console.error('[Purchase] Failed:', result.error);
        throw new Error(result.error || 'Failed to complete purchase');
      }
      console.log('[Purchase] Purchase completed. TX:', result.txHash);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('[Purchase] Invalidating queries after successful purchase');
      queryClient.invalidateQueries({ queryKey: ['asset', variables.assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
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
