import { useRouter } from "next/router";

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
  const [formInput, setFormInput] = useState({
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
}
