import { FC } from "react";
import { useProgram, useNotify, useAddresses } from "../hooks";
import { web3 } from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

const associatedTokenProgram = splToken.ASSOCIATED_TOKEN_PROGRAM_ID;
const tokenProgram = splToken.TOKEN_PROGRAM_ID;
const systemProgram = web3.SystemProgram.programId;
const rent = web3.SYSVAR_RENT_PUBKEY;

interface Props {
  onClick?: () => void;
}
export const ClickerInterface: FC<Props> = (props) => {
  const addresses = useAddresses();
  const program = useProgram();
  const { publicKey } = useWallet();
  const notify = useNotify();
  const handleClick = async () => {
    try {
      if (!program || !publicKey || !addresses) {
        throw new Error("Program does not exist");
      }

      const data = await program.account.treasury.fetchNullable(
        addresses.treasury
      );
      if (!data) {
        throw new Error("Unable to gather metadata");
      }

      await program.rpc.doClick({
        accounts: {
          owner: publicKey,
          clicker: addresses.playerClicker,
          treasury: addresses.treasury,
          treasuryMintAuthority: addresses.treasuryMintAuthority,
          treasuryMint: data.mint,
          rewardDest: addresses.playerRewardDest,
          tokenProgram,
          systemProgram,
          associatedTokenProgram,
          rent,
        },
      });

      notify("success", "SUCCESS!");
    } catch (e) {
      if ((e as any).message) {
        console.error(e);
        notify("error", `${(e as any).message}`);
      } else {
        notify("error", "something went wrong");
      }
    }
  };
  return (
    <div>
      <div className="flex justify-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 font-bold py-1 px-2 rounded"
          onClick={async () => {
            await handleClick();
            if (props.onClick) {
              props.onClick();
            }
          }}
        >
          ???
        </button>
      </div>
    </div>
  );
};
