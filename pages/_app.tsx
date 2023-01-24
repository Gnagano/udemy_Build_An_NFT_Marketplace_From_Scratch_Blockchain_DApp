import "@/styles/globals.css";
import "./app.css";
import Link from "next/link";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";

function KryptoBirdMarketplace({ Component, pageProps }: AppProps) {
  // Next18 requires showChild
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line global-require
    require("tw-elements");
  }, []);

  if (!showChild) return null;

  return (
    <div>
      <nav className="border-b p-6" style={{ backgroundColor: "purple" }}>
        <p className="text-4x1 font-bold text-white">Krypto Bird Marketplace</p>
        <div className="flex mt-4 justify-center">
          <Link href="/">
            <div className="mr-4">Main Marketplace</div>
          </Link>
          <Link href="/mint-item">
            <div className="mr-6">Mint Tokens</div>
          </Link>
          <Link href="/my-nfts">
            <div className="mr-6">My NFTs</div>
          </Link>
          <Link href="/account-dashboard">
            <div className="mr-4">Account Dashboard</div>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default KryptoBirdMarketplace;
