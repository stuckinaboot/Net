import {
  chainIdToChain,
  chainIdToOpenSeaChainString,
  publicClient,
} from "@/app/utils";
import { StandaloneAppComponentsConfig } from "../../types";
import { readContract } from "viem/actions";
import { INSCRIBED_DROPS_CONTRACT } from "./constants";
import Link from "next/link";

export const config: StandaloneAppComponentsConfig = {
  getTransformedMessage: async (chainId, messageText) => {
    try {
      const hashTagIndex = messageText.indexOf("#");
      if (hashTagIndex === -1) {
        return messageText;
      }
      const dropId = messageText.substring(hashTagIndex + 1);
      const chain = chainIdToChain(chainId);
      if (chain == null) {
        return undefined;
      }
      const uri = (await readContract(publicClient(chain), {
        address: INSCRIBED_DROPS_CONTRACT.address as any,
        abi: INSCRIBED_DROPS_CONTRACT.abi,
        functionName: "uri",
        args: [dropId],
      })) as any;
      const json = atob(uri.substring("data:application/json;base64,".length));
      const drop = JSON.parse(json);
      if (drop.name) {
        return (
          <>
            {messageText.substring(0, hashTagIndex)}
            <Link
              href={`/app/inscribed-drops/mint/${chainIdToOpenSeaChainString(
                chainId
              )}/${dropId}`}
            >
              <p className="underline">{drop.name}</p>
            </Link>
          </>
        );
      }
    } catch (e) {
      // This may throw due to RPC errors or the contract not implementing the above function.
      // In either case, gracefully return undefined
      return messageText;
    }
  },
};
