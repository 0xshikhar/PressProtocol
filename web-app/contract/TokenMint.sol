// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract RateLimitedToken is ERC20, Ownable {
  using SafeMath for uint256;

  // Minting limits
  uint256 public constant MAX_MINT_PER_DAY = 10;
  uint256 public constant MINT_COOLDOWN = 24 hours;

  // Mapping to track last mint time and amount for each address
  mapping(address => uint256) public lastMintTime;
  mapping(address => uint256) public mintedInCurrentPeriod;

  // Token price in ETH (if free, set to 0)
  uint256 public mintPrice = 0 ether;

  // Events
  event TokensMinted(address indexed to, uint256 amount, uint256 timestamp);

  constructor(
    string memory name,
    string memory symbol
  ) ERC20(name, symbol) Ownable(msg.sender) {}

  /**
   * @dev Mint tokens to caller's address, enforcing rate limits
   * @param amount Number of tokens to mint
   */
  function mint(uint256 amount) external payable {
    require(amount > 0, "Amount must be greater than 0");
    require(msg.value >= mintPrice.mul(amount), "Insufficient payment");

    // Check if 24 hours have passed since last mint
    if (block.timestamp >= lastMintTime[msg.sender].add(MINT_COOLDOWN)) {
      // Reset counter if 24 hours passed
      mintedInCurrentPeriod[msg.sender] = 0;
    }

    // Enforce daily limit
    require(
      mintedInCurrentPeriod[msg.sender].add(amount) <= MAX_MINT_PER_DAY,
      "Exceeds daily minting limit"
    );

    // Update minting records
    lastMintTime[msg.sender] = block.timestamp;
    mintedInCurrentPeriod[msg.sender] = mintedInCurrentPeriod[msg.sender].add(
      amount
    );

    // Mint tokens
    _mint(msg.sender, amount * (10 ** decimals()));

    emit TokensMinted(msg.sender, amount, block.timestamp);
  }

  /**
   * @dev Get remaining mintable tokens in current period
   * @param user Address to check
   * @return uint256 Number of tokens still mintable in current period
   */
  function getRemainingMintAllowance(
    address user
  ) external view returns (uint256) {
    // Check if 24 hours have passed
    if (block.timestamp >= lastMintTime[user].add(MINT_COOLDOWN)) {
      return MAX_MINT_PER_DAY;
    }

    return MAX_MINT_PER_DAY - mintedInCurrentPeriod[user];
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
