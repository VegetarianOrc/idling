import { FC, useState } from "react";
import { useProgram, useNotify, useMint } from "../hooks";
import { web3 } from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const associatedTokenProgram = splToken.ASSOCIATED_TOKEN_PROGRAM_ID;
const tokenProgram = splToken.TOKEN_PROGRAM_ID;
const systemProgram = web3.SystemProgram.programId;
const rent = web3.SYSVAR_RENT_PUBKEY;

interface AccountData {
  authority: PublicKey;
  mintAuthority: PublicKey;
  mint: PublicKey;
  mintAuthorityBump: number;
}

interface Props {}
export const ClickerInterface: FC<Props> = () => {
  const program = useProgram();
  const { connection } = useConnection();
  const { publicKey, ...remainingWallet } = useWallet();
  const [mintId, setMintId] = useState();
  const mint = useMint(mintId);

  const notify = useNotify();
  const handleClick = async () => {
    try {
      if (!program || !publicKey) {
        throw new Error("Program does not exist");
      }
      const [treasury] = await web3.PublicKey.findProgramAddress(
        [Buffer.from("treasury")],
        program.programId
      );

      const [treasuryMintAuthority] = await web3.PublicKey.findProgramAddress(
        [Buffer.from("treasury"), Buffer.from("mint")],
        program.programId
      );
      let data: null | AccountData = null;
      if (program?.account.treasury) {
        data = (await program.account.treasury.fetchNullable(
          treasury
        )) as AccountData;
      }
      if (!data) {
        throw new Error("Unable to gather metadata");
      }

      const playerRewardDest = await splToken.Token.getAssociatedTokenAddress(
        associatedTokenProgram,
        tokenProgram,
        data.mint,
        publicKey
      );
      const mintData = await connection.getAccountInfo(data.mint);
      // splToken.MintLayout.

      if (!mintData?.data) {
        throw new Error("No mint data");
      }
      const mintInfo = splToken.MintLayout.decode(mintData.data);
      // await program.account.treasury.fetchNullable(playerRewardDest);
      // const treasuryMint = new splToken.Token(
      //   connection,
      //   data.mint,
      //   splToken.TOKEN_PROGRAM_ID,
      //   publicKey
      // );
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
    <div className="flex justify-center">
      <button
        className="bg-blue-500 hover:bg-blue-700 font-bold py-1 px-2 rounded"
        onClick={() => {
          handleClick();
        }}
      >
        ???
      </button>
    </div>
  );
};
