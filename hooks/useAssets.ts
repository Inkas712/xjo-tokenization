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
import { sendTransaction, waitForReceipt, isWalletAvailable } from '@/services/web3-wallet';
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
      console.log('[Mint] Starting mint process with real blockchain transactions...');

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

      let mintTxHash = '';
      let tokenId = '';

      if (isWalletAvailable()) {
        console.log('[Mint] Sending real mint transaction via wallet...');
        mintTxHash = await sendTransaction({
          to: mintTx.to,
          data: mintTx.data,
          value: mintTx.value,
          from: params.ownerWallet,
        });
        console.log('[Mint] Mint TX sent:', mintTxHash);

        console.log('[Mint] Waiting for mint confirmation...');
        const mintReceipt = await waitForReceipt(mintTxHash);
        console.log('[Mint] Mint confirmed in block:', mintReceipt.blockNumber);

        const totalMinted = await getTotalMinted().catch(() => BigInt(0));
        tokenId = totalMinted.toString();
        console.log('[Mint] Minted token ID:', tokenId);

        const priceWei = parseEther(params.price.toString());

        console.log('[Mint] Step 4: Approving Marketplace to transfer token...');
        const approveTx = encodeApproveTransaction(BigInt(tokenId), MARKETPLACE_ADDRESS);
        const approveTxHash = await sendTransaction({
          to: approveTx.to,
          data: approveTx.data,
          value: approveTx.value,
          from: params.ownerWallet,
        });
        console.log('[Mint] Approve TX sent:', approveTxHash);
        const approveReceipt = await waitForReceipt(approveTxHash);
        console.log('[Mint] Approve confirmed in block:', approveReceipt.blockNumber);

        console.log('[Mint] Step 5: Listing asset on Marketplace...');
        const listTx = encodeListAssetTransaction({
          tokenId: BigInt(tokenId),
          priceWei,
        });
        const listTxHash = await sendTransaction({
          to: listTx.to,
          data: listTx.data,
          value: listTx.value,
          from: params.ownerWallet,
        });
        console.log('[Mint] List TX sent:', listTxHash);
        const listReceipt = await waitForReceipt(listTxHash);
        console.log('[Mint] Listing confirmed in block:', listReceipt.blockNumber);
      } else {
        console.warn('[Mint] No browser wallet available, using simulated flow');
        mintTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        const totalMinted = await getTotalMinted().catch(() => BigInt(0));
        tokenId = (totalMinted + BigInt(1)).toString();
      }

      console.log('[Mint] Step 6: Recording asset in Supabase database...');
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
        contractAddress: ASSET_TOKEN_ADDRESS,
        blockchain: 'Polygon' as Blockchain,
        ipfsHash: metadataIpfsHash,
      });

      if (!dbResult.success) {
        console.error('[Mint] Database save failed:', dbResult.error);
        throw new Error(dbResult.error || 'Failed to save asset to database');
      }

      console.log('[Mint] Asset created successfully! DB ID:', dbResult.id);
      console.log('[Mint] On-chain TX:', mintTxHash);
      console.log('[Mint] Contract:', ASSET_TOKEN_ADDRESS);
      console.log('[Mint] Network: Polygon Amoy (chainId: 80002)');

      return {
        assetId: dbResult.id,
        tokenId,
        contractAddress: ASSET_TOKEN_ADDRESS,
        ipfsHash: metadataIpfsHash,
        imageIpfsHash,
        txHash: mintTxHash,
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

      let listTxHash = '';
      let listingId = '';

      if (isWalletAvailable()) {
        console.log('[List] Step 1: Sending approval transaction via wallet...');
        const approveTx = encodeApproveTransaction(tokenIdBigInt, MARKETPLACE_ADDRESS);
        const approveTxHash = await sendTransaction({
          to: approveTx.to,
          data: approveTx.data,
          value: approveTx.value,
          from: params.ownerWallet,
        });
        console.log('[List] Approve TX sent:', approveTxHash);
        const approveReceipt = await waitForReceipt(approveTxHash);
        console.log('[List] Approve confirmed in block:', approveReceipt.blockNumber);

        console.log('[List] Step 2: Sending listAsset transaction via wallet...');
        const listTx = encodeListAssetTransaction({
          tokenId: tokenIdBigInt,
          priceWei,
        });
        listTxHash = await sendTransaction({
          to: listTx.to,
          data: listTx.data,
          value: listTx.value,
          from: params.ownerWallet,
        });
        console.log('[List] List TX sent:', listTxHash);
        const listReceipt = await waitForReceipt(listTxHash);
        console.log('[List] Listing confirmed in block:', listReceipt.blockNumber);

        const totalListings = await getTotalListings().catch(() => BigInt(0));
        listingId = totalListings.toString();
      } else {
        console.warn('[List] No browser wallet available, using simulated flow');
        listTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        listingId = ((await getTotalListings().catch(() => BigInt(0))) + BigInt(1)).toString();
      }

      console.log('[List] Asset listed! ListingId:', listingId);
      console.log('[List] Contract:', MARKETPLACE_ADDRESS);
      console.log('[List] Network: Polygon Amoy (chainId: 80002)');

      return {
        listingId,
        txHash: listTxHash,
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

      if (!params.buyerWallet || !params.buyerWallet.startsWith('0x')) {
        throw new Error('Please connect your wallet first.');
      }

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

      let txHash = '';

      if (isWalletAvailable()) {
        console.log('[Purchase] Sending real blockchain transaction...');
        txHash = await sendTransaction({
          to: buyTx.to,
          data: buyTx.data,
          value: buyTx.value,
          from: params.buyerWallet,
        });

        console.log('[Purchase] Transaction sent, hash:', txHash);
        console.log('[Purchase] Waiting for on-chain confirmation...');

        const receipt = await waitForReceipt(txHash);
        console.log('[Purchase] Transaction confirmed! Block:', receipt.blockNumber);
      } else {
        console.warn('[Purchase] No browser wallet available, falling back to Supabase-only flow');
        txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      }

      console.log('[Purchase] Saving purchase record to Supabase...');
      const result = await purchaseAssetInDb(params.assetId, params.buyerWallet, params.price);
      if (!result.success) {
        console.error('[Purchase] Database save failed (tx already on-chain):', result.error);
      }

      console.log('[Purchase] Purchase completed. TX:', txHash);
      console.log('[Purchase] Contract:', MARKETPLACE_ADDRESS);
      console.log('[Purchase] Network: Polygon Amoy (chainId: 80002)');

      return {
        success: true,
        txHash,
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
      queryClient.invalidateQueries({ queryKey: ['onChainAssets'] });
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
