// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ProfileNFT is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;
  using Strings for uint256;

  // Token ID counter
  Counters.Counter private _tokenIdCounter;

  // Profile information structure
  struct Profile {
    string name;
    string bio;
    string socialLink;
    uint256 creationDate;
  }

  // Mapping from token ID to profile data
  mapping(uint256 => Profile) public profiles;

  // Events
  event ProfileCreated(
    uint256 indexed tokenId,
    address indexed owner,
    string name
  );
  event ProfileUpdated(uint256 indexed tokenId, string name);

  // NFT mint price (set to 0 for free minting)
  uint256 public mintPrice = 0 ether;

  constructor() ERC721("Profile NFT", "PNFT") Ownable(msg.sender) {}

  /**
   * @dev Creates a new profile NFT
   * @param name User's display name
   * @param bio User's biography or description
   * @param socialLink User's social media link
   * @param tokenURI URI pointing to the profile image
   */
  function createProfile(
    string memory name,
    string memory bio,
    string memory socialLink,
    string memory tokenURI
  ) external payable returns (uint256) {
    require(msg.value >= mintPrice, "Insufficient payment");
    require(bytes(name).length > 0, "Name cannot be empty");
    require(bytes(tokenURI).length > 0, "TokenURI cannot be empty");

    // Get new token ID
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();

    // Mint NFT
    _mint(msg.sender, tokenId);
    _setTokenURI(tokenId, tokenURI);

    // Store profile information
    profiles[tokenId] = Profile({
      name: name,
      bio: bio,
      socialLink: socialLink,
      creationDate: block.timestamp
    });

    emit ProfileCreated(tokenId, msg.sender, name);
    return tokenId;
  }

  /**
   * @dev Updates profile information for an existing NFT
   * @param tokenId Token ID to update
   * @param name New display name
   * @param bio New biography
   * @param socialLink New social link
   */
  function updateProfile(
    uint256 tokenId,
    string memory name,
    string memory bio,
    string memory socialLink
  ) external {
    require(_isAuthorized(msg.sender, tokenId), "Not owner or approved");
    require(bytes(name).length > 0, "Name cannot be empty");

    profiles[tokenId].name = name;
    profiles[tokenId].bio = bio;
    profiles[tokenId].socialLink = socialLink;

    emit ProfileUpdated(tokenId, name);
  }

  /**
   * @dev Updates the token URI (image) for an existing NFT
   * @param tokenId Token ID to update
   * @param newTokenURI New token URI pointing to updated image
   */
  function updateProfileImage(
    uint256 tokenId,
    string memory newTokenURI
  ) external {
    require(_isAuthorized(msg.sender, tokenId), "Not owner or approved");
    require(bytes(newTokenURI).length > 0, "TokenURI cannot be empty");

    _setTokenURI(tokenId, newTokenURI);
  }

  /**
   * @dev Helper function to check if an address is authorized to manage a token
   * @param spender Address to check
   * @param tokenId Token ID to check
   * @return bool Whether the address is authorized
   */
  function _isAuthorized(
    address spender,
    uint256 tokenId
  ) internal view returns (bool) {
    address owner = ownerOf(tokenId);
    return (spender == owner ||
      getApproved(tokenId) == spender ||
      isApprovedForAll(owner, spender));
  }

  /**
   * @dev Helper function to check if a token exists
   * @param tokenId Token ID to check
   * @return bool Whether the token exists
   */
  function _tokenExists(uint256 tokenId) internal view returns (bool) {
    try this.ownerOf(tokenId) returns (address) {
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @dev Gets all profile information for a token
   * @param tokenId Token ID to query
   * @return Profile struct containing all profile data
   */
  function getProfile(uint256 tokenId) external view returns (Profile memory) {
    require(_tokenExists(tokenId), "Profile does not exist");
    return profiles[tokenId];
  }

  /**
   * @dev Set the mint price
   * @param newPrice New price in wei
   */
  function setMintPrice(uint256 newPrice) external onlyOwner {
    mintPrice = newPrice;
  }

  /**
   * @dev Withdraw contract balance to owner
   */
  function withdraw() external onlyOwner {
    payable(owner()).transfer(address(this).balance);
  }
}
