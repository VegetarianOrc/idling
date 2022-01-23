import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ClickerInterface, PointsDisplay } from "../containers";
import { programs } from "@metaplex/js";

export interface UpdateFuncProps {
  previousLocation: "wallet" | "staked";
  nftMoved: programs.metadata.Metadata;
}

export function Router() {
  const { publicKey } = useWallet();
  const [count, setCount] = useState(0);

  const walletNotConnected = !publicKey;

  return (
    <div className="max-w-4xl m-auto">
      {walletNotConnected && (
        <div className="border-2 rounded p-12 mx-24 my-6">
          Please connect your wallet
        </div>
      )}
      {publicKey && (
        <div className="border-2 rounded p-12 mx-24 my-6">
          <PointsDisplay count={count} />
          <ClickerInterface
            onClick={() => {
              setCount(count + 1);
            }}
          />
        </div>
      )}
    </div>
  );
}
