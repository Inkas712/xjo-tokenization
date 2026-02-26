// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AssetToken is ERC721, ERC721URIStorage, ERC721Enumerable, ERC721Royalty, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 public mintFee;
    uint256 public maxRoyaltyBps = 2500; // 25% max royalty

    struct AssetMetadata {
        string category;
        address creator;
        uint256 mintedAt;
        bool isVerified;
    }

    mapping(uint256 => AssetMetadata) public assetMetadata;

    event AssetMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI,
        string category,
        uint96 royaltyBps
    );

    event AssetVerified(uint256 indexed tokenId);
    event MintFeeUpdated(uint256 newFee);

    constructor(
        uint256 _mintFee
    ) ERC721("XJO Asset Token", "XJO") Ownable(msg.sender) {
        mintFee = _mintFee;
    }

    function mint(
        string memory _tokenURI,
        string memory _category,
        uint96 _royaltyBps
    ) external payable returns (uint256) {
        require(msg.value >= mintFee, "Insufficient mint fee");
        require(_royaltyBps <= maxRoyaltyBps, "Royalty exceeds maximum");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        _setTokenRoyalty(tokenId, msg.sender, _royaltyBps);

        assetMetadata[tokenId] = AssetMetadata({
            category: _category,
            creator: msg.sender,
            mintedAt: block.timestamp,
            isVerified: false
        });

        emit AssetMinted(tokenId, msg.sender, _tokenURI, _category, _royaltyBps);

        return tokenId;
    }

    function verifyAsset(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        assetMetadata[tokenId].isVerified = true;
        emit AssetVerified(tokenId);
    }

    function setMintFee(uint256 _newFee) external onlyOwner {
        mintFee = _newFee;
        emit MintFeeUpdated(_newFee);
    }

    function setMaxRoyaltyBps(uint256 _maxBps) external onlyOwner {
        require(_maxBps <= 10000, "Cannot exceed 100%");
        maxRoyaltyBps = _maxBps;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function getAssetsByOwner(address _owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function getAssetMetadata(uint256 tokenId) external view returns (AssetMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return assetMetadata[tokenId];
    }

    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Required overrides

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
