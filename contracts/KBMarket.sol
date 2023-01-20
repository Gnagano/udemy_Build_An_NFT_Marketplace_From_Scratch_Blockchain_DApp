//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

// Security against transactions for multiple requests
import 'hardhat/console.sol';

contract KBMarket is ReentrancyGuard {
  using Counters for Counters.Counter;

  /* numbers of items minting, number of transactions, tokens that have not beens sold
    keep track of tokens total number - tokenId 
    arrays need to know the length - help to keep track for arrays */

  Counters.Counter private _tokenIds;
  Counters.Counter private _tokensSold;

  // determine who is the owner of the contract
  // charge a listing fee so that owner makes a commission
  address payable owner;

  // we are deploying to matic the API is the same you can use ether the same as matic
  // they both have 18 decimal 
  // 0.045 is in the cents 
  uint256 listingPrice = 0.045 ether;

  constructor() {
    // Set the owner
    owner = payable(msg.sender);
  }

  // Structs can act like objects
  struct MarketToken {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  // TokenId return which MarketToken - fetch which one it is
  mapping(uint256 => MarketToken) private idToMarketToken;

  // Listen to events from front end applications
  event MarketTokenMinted (
    uint indexed itemId, 
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );

  // Get the listing price
  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }

  // Two functions to interact with contract
  // 1. create a market item to put it up for sale
  // 2. create a market sale for buying and selling between parties

  function mintMarketItem(
    address nftContract,
    uint tokenId,
    uint price
  ) 
  public payable nonReentrant {
    // nonReentrant is a modifier to prevent reentry attack
    require(price > 0, 'Price must be at least one wei');
    require(msg.value == listingPrice, 'Price must be equal to listing price');

    _tokenIds.increment();
    uint itemId = _tokenIds.current();

    // Putting it up for sale - bool - no owner
    idToMarketToken[itemId] = MarketToken(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false
    );

    // NFT transaction
    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketTokenMinted(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false
    );
  }

  // function to conduct transactions and market sales
  function createMarketSale(
    address nftContract,
    uint itemId)
    public payable nonReentrant {
    uint price = idToMarketToken[itemId].price;
    uint tokenId = idToMarketToken[itemId].tokenId;
    
    require(msg.value == price, 'Please submit the asking price in order to continue');

    // Transfer the amount to the seller
    idToMarketToken[itemId].seller.transfer(msg.value);
    // Transfer the token from contract address to the buyer
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketToken[itemId].owner = payable(msg.sender);
    idToMarketToken[itemId].sold = true;
    _tokensSold.increment();

    payable(owner).transfer(listingPrice);
  }



  // function to fetchMarketItems 

}

