//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// we will bring in the openzeppelin ERC721 NFT functionality
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract NFT is ERC721URIStorage {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIds; 
  // counters allow us to keep track of tokenIds
  // address of marketplace for NFTs to interact
  address contractAddress;

  // OBJ: give the NFT market the ability to transact with tokens or change ownership
  // setApprovalForAll allows us to do that with contract address

  // constructor set up our address
  constructor(address marketplaceAddress) ERC721('KryptoBirdz', 'KBIRDZ') {
    contractAddress = marketplaceAddress;
  }

  function mintToken(string memory tokenURI) public returns (uint) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    
    // Passing in id and url
    _mint(msg.sender, newItemId);
    // Set the token URI: id and url 
    _setTokenURI(newItemId, tokenURI);
    // Give the marketplace the approval to transact between users
    setApprovalForAll(contractAddress, true);
    // Mint the token and set it for sale - return the id to do so
    return newItemId;
  }
}

