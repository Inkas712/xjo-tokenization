// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Marketplace is Ownable, ReentrancyGuard {
    struct Listing {
        address seller;
        address tokenContract;
        uint256 tokenId;
        uint256 price;
        bool isActive;
        uint256 listedAt;
    }

    struct Auction {
        address seller;
        address tokenContract;
        uint256 tokenId;
        uint256 startPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }

    uint256 public platformFeeBps = 250; // 2.5%
    uint256 public proFeeBps = 0; // 0% for Pro users
    uint256 private _listingIdCounter;
    uint256 private _auctionIdCounter;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(address => bool) public proUsers;
    mapping(uint256 => mapping(address => uint256)) public auctionBids;

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address tokenContract,
        uint256 tokenId,
        uint256 price
    );

    event Sold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );

    event ListingCancelled(uint256 indexed listingId);

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address tokenContract,
        uint256 tokenId,
        uint256 startPrice,
        uint256 endTime
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionSettled(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 amount
    );

    event AuctionCancelled(uint256 indexed auctionId);
    event ProStatusUpdated(address indexed user, bool isPro);
    event PlatformFeeUpdated(uint256 newFeeBps);

    constructor() Ownable(msg.sender) {}

    // --- Fixed Price Listings ---

    function listAsset(
        address _tokenContract,
        uint256 _tokenId,
        uint256 _price
    ) external returns (uint256) {
        require(_price > 0, "Price must be > 0");
        IERC721 nft = IERC721(_tokenContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not token owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
            nft.getApproved(_tokenId) == address(this),
            "Marketplace not approved"
        );

        _listingIdCounter++;
        uint256 listingId = _listingIdCounter;

        listings[listingId] = Listing({
            seller: msg.sender,
            tokenContract: _tokenContract,
            tokenId: _tokenId,
            price: _price,
            isActive: true,
            listedAt: block.timestamp
        });

        emit Listed(listingId, msg.sender, _tokenContract, _tokenId, _price);
        return listingId;
    }

    function buyAsset(uint256 _listingId) external payable nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own listing");

        listing.isActive = false;

        uint256 feeBps = proUsers[listing.seller] ? proFeeBps : platformFeeBps;
        uint256 platformFee = (listing.price * feeBps) / 10000;

        (address royaltyReceiver, uint256 royaltyAmount) = _getRoyalty(
            listing.tokenContract,
            listing.tokenId,
            listing.price
        );

        uint256 sellerProceeds = listing.price - platformFee - royaltyAmount;

        IERC721(listing.tokenContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        (bool sellerPaid, ) = payable(listing.seller).call{value: sellerProceeds}("");
        require(sellerPaid, "Seller payment failed");

        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            (bool royaltyPaid, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
            require(royaltyPaid, "Royalty payment failed");
        }

        if (msg.value > listing.price) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refunded, "Refund failed");
        }

        emit Sold(_listingId, msg.sender, listing.seller, listing.price);
    }

    function cancelListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");

        listing.isActive = false;
        emit ListingCancelled(_listingId);
    }

    // --- Auctions ---

    function createAuction(
        address _tokenContract,
        uint256 _tokenId,
        uint256 _startPrice,
        uint256 _duration
    ) external returns (uint256) {
        require(_startPrice > 0, "Start price must be > 0");
        require(_duration >= 1 hours, "Min duration 1 hour");
        require(_duration <= 30 days, "Max duration 30 days");

        IERC721 nft = IERC721(_tokenContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not token owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
            nft.getApproved(_tokenId) == address(this),
            "Marketplace not approved"
        );

        _auctionIdCounter++;
        uint256 auctionId = _auctionIdCounter;

        auctions[auctionId] = Auction({
            seller: msg.sender,
            tokenContract: _tokenContract,
            tokenId: _tokenId,
            startPrice: _startPrice,
            highestBid: 0,
            highestBidder: address(0),
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            isActive: true
        });

        emit AuctionCreated(
            auctionId,
            msg.sender,
            _tokenContract,
            _tokenId,
            _startPrice,
            block.timestamp + _duration
        );

        return auctionId;
    }

    function placeBid(uint256 _auctionId) external payable nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Cannot bid on own auction");
        require(msg.value >= auction.startPrice, "Bid below start price");
        require(msg.value > auction.highestBid, "Bid not high enough");

        address previousBidder = auction.highestBidder;
        uint256 previousBid = auction.highestBid;

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;
        auctionBids[_auctionId][msg.sender] = msg.value;

        if (previousBidder != address(0) && previousBid > 0) {
            (bool refunded, ) = payable(previousBidder).call{value: previousBid}("");
            require(refunded, "Refund to previous bidder failed");
        }

        // Extend auction by 10 minutes if bid within last 10 minutes
        if (auction.endTime - block.timestamp < 10 minutes) {
            auction.endTime = block.timestamp + 10 minutes;
        }

        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }

    function settleAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");

        auction.isActive = false;

        if (auction.highestBidder == address(0)) {
            emit AuctionCancelled(_auctionId);
            return;
        }

        uint256 salePrice = auction.highestBid;
        uint256 feeBps = proUsers[auction.seller] ? proFeeBps : platformFeeBps;
        uint256 platformFee = (salePrice * feeBps) / 10000;

        (address royaltyReceiver, uint256 royaltyAmount) = _getRoyalty(
            auction.tokenContract,
            auction.tokenId,
            salePrice
        );

        uint256 sellerProceeds = salePrice - platformFee - royaltyAmount;

        IERC721(auction.tokenContract).safeTransferFrom(
            auction.seller,
            auction.highestBidder,
            auction.tokenId
        );

        (bool sellerPaid, ) = payable(auction.seller).call{value: sellerProceeds}("");
        require(sellerPaid, "Seller payment failed");

        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            (bool royaltyPaid, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
            require(royaltyPaid, "Royalty payment failed");
        }

        emit AuctionSettled(_auctionId, auction.highestBidder, salePrice);
    }

    function cancelAuction(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];
        require(auction.isActive, "Auction not active");
        require(auction.seller == msg.sender, "Not auction owner");
        require(auction.highestBidder == address(0), "Bids already placed");

        auction.isActive = false;
        emit AuctionCancelled(_auctionId);
    }

    // --- Admin ---

    function setPlatformFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Fee cannot exceed 10%");
        platformFeeBps = _feeBps;
        emit PlatformFeeUpdated(_feeBps);
    }

    function setProStatus(address _user, bool _isPro) external onlyOwner {
        proUsers[_user] = _isPro;
        emit ProStatusUpdated(_user, _isPro);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // --- Internal ---

    function _getRoyalty(
        address _tokenContract,
        uint256 _tokenId,
        uint256 _salePrice
    ) internal view returns (address receiver, uint256 amount) {
        try ERC2981(_tokenContract).royaltyInfo(_tokenId, _salePrice) returns (
            address _receiver,
            uint256 _amount
        ) {
            return (_receiver, _amount);
        } catch {
            return (address(0), 0);
        }
    }

    // --- View ---

    function getListing(uint256 _listingId) external view returns (Listing memory) {
        return listings[_listingId];
    }

    function getAuction(uint256 _auctionId) external view returns (Auction memory) {
        return auctions[_auctionId];
    }

    function totalListings() external view returns (uint256) {
        return _listingIdCounter;
    }

    function totalAuctions() external view returns (uint256) {
        return _auctionIdCounter;
    }
}
