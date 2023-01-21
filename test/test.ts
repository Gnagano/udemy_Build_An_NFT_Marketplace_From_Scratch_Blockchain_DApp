import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import * as chai from "chai";

describe("KBMarket", function () {
  it("Should mint and trade NFTs", async function () {
    // Test to receive contract addresses
    const Market = await ethers.getContractFactory("KBMarket");
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deploy();

    // Test to receive listing price and auction price
    const nftContractAddress = nft.address;

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits("100", "ether");

    // test for minting
    await nft.mintToken("https-t1");
    await nft.mintToken("https-t2");

    await market.marketMarketItem(nftContractAddress, 1, auctionPrice, {
      value: listingPrice
    });
    await market.marketMarketItem(nftContractAddress, 2, auctionPrice, {
      value: listingPrice
    });

    // Test for different addresses from different users - test accounts
    // return an array of however many addresses
    const [_, buyerAddress] = await ethers.getSigners();

    // Create a market sale with address, id and price
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, {
      value: auctionPrice
    });

    const items = await market.fetchMarketTokens();

    // Test out all the items
    console.log("items", items);
  });
});
