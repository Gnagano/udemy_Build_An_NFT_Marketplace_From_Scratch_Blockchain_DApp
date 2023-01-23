import { useRouter } from "next/router";
import Image from "next/image";

// Web3
import { ethers } from "ethers";
import { useState } from "react";
import Web3Modal from "web3modal";

import { create as ipfsHttpClient } from "ipfs-http-client";

// Contract
import KBMarket from "../artifacts/contracts/KBMarket.sol/KBMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";

// Config
import { nftaddress, nftmarketaddress } from "../config";

// In this component we set the ipfs up to host our nft data of
// file storage
const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});

export default function MintItem() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: ""
  });
  const router = useRouter();

  // Set up a function to fireoff when we update files in out form - we can add ourt
  // NFT images - IPFS
  const onChange = async (e: any) => {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`)
      });
      const url = `https://ipfs.infura.io:5001/api/v0/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log(`Error uploading file:`, error);
    }
  };

  const createMarket = async () => {
    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) return;

    // upload to IPFS
    const data = JSON.stringify({ name, description, image: fileUrl });

    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io:5001/api/v0/${added.path}`;

      // Run a function that created sale and passes in the url
      createSale(url);
    } catch (error) {
      console.log(`Error uploading file:`, error);
    }
  };

  const createSale = async (url: string) => {
    // Create the items and list them on the marketplace
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    // We want to create the token
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.mintToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();
    const price = ethers.utils.parseUnits(formInput.price, "ether");

    // List the item for sale on the marketplace
    contract = new ethers.Contract(nftmarketaddress, KBMarket.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.makeMarketItem(nftaddress, tokenId, price, {
      value: listingPrice
    });
    await transaction.wait();
    router.push("./");
  };

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          className="mt-8 border rounded p-4"
          placeholder="Asset Name"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          className="mt-2 border rounded p-4"
          placeholder="Asset Description"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          className="mt-2 border rounded p-4"
          placeholder="Asset Price in Eth"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input className="mt-4" name="Asset" type="file" onChange={onChange} />
        {fileUrl && (
          <Image
            className="rounded mt-4"
            style={{ width: "350px" }}
            src={fileUrl}
            alt=""
          />
        )}
        <button
          className="font-bold mt-4 bg-purple-500 text-white rounded p-4 shadow-lg"
          onClick={createMarket}
        >
          Mint NFT
        </button>
      </div>
    </div>
  );
}
