import { ethers } from "hardhat";
const fs = require("fs");

async function main() {
  const NFTMarket = await ethers.getContractFactory("KBMarket");
  const nftMarket = await NFTMarket.deploy();

  await nftMarket.deployed();
  console.log("nftMarket contract deployed to: ", nftMarket.address);

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("NFT contract deployed to: ", nft.address);

  let config = `export const nftmarketaddress = '${nftMarket.address}';
export const nftaddress = '${nft.address}';`;

  let data = JSON.stringify(config);
  fs.writeFileSync("config.js", JSON.parse(data));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
