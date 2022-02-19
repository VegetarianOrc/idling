// Next, React
import { FC, useState, useEffect } from "react";
import { plantSourceData, PlantSource } from "models/plantSourceData";
import { usePlanterAddresses, useAddresses, useProgram } from "hooks";
import { useConnection } from "@solana/wallet-adapter-react";
import { programs } from "@metaplex/js";
import { submitGoods } from "./actions";

interface EntryItemProps {
  source: PlantSource;
  inputVal: string;
  onInputChange: (input: string) => void;
}

const EntryItem: FC<EntryItemProps> = ({ source, inputVal, onInputChange }) => {
  const { connection } = useConnection();
  const [currentHoldings, setAmount] = useState(0);
  const plantAddresses = usePlanterAddresses(source.plantMintPubKey);
  const program = useProgram();
  useEffect(() => {
    const fetch = async () => {
      if (!plantAddresses) return;
      const amt = await connection.getAccountInfo(
        plantAddresses.playerPlantRewardDest
      );
      if (amt) {
        const parsed = programs.core.deserialize(amt.data);
        setAmount(parsed.amount.toNumber());
      }
    };
    fetch();
  }, [plantAddresses]);

  return (
    <div className="grid grid-cols-3 cursor-pointer p-1 m-1">
      <div>
        <div className="flex justify-center text-3xl border-2 border-gray-300 rounded-xl p-3 cursor-pointer relative">
          <span className="absolute text-xs top-1 right-1">
            {currentHoldings || 0}
          </span>
          {source.emojiIcon}
        </div>
      </div>
      <div className="flex px-2 justify-center">
        <input
          value={inputVal}
          min="0"
          max={currentHoldings}
          type="range"
          className="w-24 border-2 border-gray-100 rounded text-center text-xl"
          onChange={(i) => onInputChange(i.target.value)}
          onFocus={(evt) => {
            evt.target.select();
          }}
        />
      </div>
      <div className="flex px-2 justify-center items-center">
        {inputVal}/{currentHoldings}
        <a
          className="px-2 underline"
          onClick={() => {
            onInputChange(currentHoldings.toString());
          }}
        >
          max
        </a>
      </div>
    </div>
  );
};

const SubmitModal: FC<{ modalId: string }> = ({ modalId }) => {
  const addresses = useAddresses();
  const [inputValues, setInputValues] = useState(
    plantSourceData.map(() => "0")
  );
  return (
    <>
      <input type="checkbox" id={modalId} className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <div className="flex flex-col items-center">
            {plantSourceData.map((p, idx) => (
              <EntryItem
                key={p.name}
                source={p}
                inputVal={inputValues[idx]}
                onInputChange={(newVal) => {
                  let clone = Array.from(inputValues);
                  clone[idx] = newVal;
                  setInputValues(clone);
                }}
              />
            ))}
          </div>
          <div className="modal-action">
            <label
              htmlFor={modalId}
              className="btn btn-primary"
              onClick={() => {
                submitGoods({
                  plants: plantSourceData,
                  amounts: inputValues.map((s) => Number.parseInt(s)),
                });
              }}
            >
              Submit
            </label>
            <label htmlFor={modalId} className="btn">
              Cancel
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export const SubmitView: FC = ({}) => {
  const modalId = "submit-modal";
  return (
    <>
      <div className="hero mx-auto min-h-16">
        <div className="hero-content flex flex-col max-w-lg justify-center">
          <h2 className="text-xl">Show me what you got</h2>
          <div className="container mx-auto ">
            <div className="flex justify-center py-2">
              <img src="/images/show_me.png" className="h-40" />
            </div>
            <div className="flex justify-center">
              <div>
                <label
                  htmlFor={modalId}
                  className="btn btn-primary modal-button"
                >
                  Submit for judging
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SubmitModal modalId={modalId} />
    </>
  );
};
