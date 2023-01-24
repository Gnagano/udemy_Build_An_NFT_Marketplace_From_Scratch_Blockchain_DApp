// import * as chai from "chai";
const hre = require("hardhat");
const { ethers } = hre;
import { KBMarket } from "./../typechain-types/contracts/KBMarket";

describe("KBMarket", function () {
  it("Should mint and trade NFTs", async function () {
    // Test to receive contract addresses
    const Market = await ethers.getContractFactory("KBMarket");
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();

    // Test to receive listing price and auction price
    const nftContractAddress = nft.address;

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits("100", "ether");

    // Test for minting
    const receipt1 = await nft.mintToken("https-t1");
    const receipt2 = await nft.mintToken("https-t2");

    const tx1 = await receipt1.wait();
    const tx2 = await receipt2.wait();

    // Event
    console.log({
      mintToken: {
        "https-t1": tx1.events[0],
        "https-t2": tx2.events[0]
      }
    });

    await market.makeMarketItem(nftContractAddress, 1, auctionPrice, {
      value: listingPrice
    });
    await market.makeMarketItem(nftContractAddress, 2, auctionPrice, {
      value: listingPrice
    });

    // Test for different addresses from different users - test accounts
    // return an array of however many addresses
    const [_, buyerAddress] = await ethers.getSigners();

    // Create a market sale with address, id and price
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, {
      value: auctionPrice
    });

    let items = await market.fetchMarketTokens();

    items = await Promise.all(
      items.map(async (i: any) => {
        // get the uri of the value
        const tokenUri = await nft.tokenURI(i.tokenId);
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri
        };
        return item;
      })
    );

    console.log("Unsold items", items);

    let myItems = await market.connect(buyerAddress).fetchMyNFTs();

    myItems = await Promise.all(
      myItems.map(async (i: any) => {
        // get the uri of the value
        const tokenUri = await nft.tokenURI(i.tokenId);
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri
        };
        return item;
      })
    );

    console.log("Sold Items", myItems);
  });
});
