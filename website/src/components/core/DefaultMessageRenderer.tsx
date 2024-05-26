import {
  chainIdToChain,
  chainTimeToMilliseconds,
  publicClient,
} from "@/app/utils";
import TimeAgo from "react-timeago";
import { AppMessageRendererProps, SanitizedOnchainMessage } from "./types";
import { SHOW_COPY_MESSAGE_LINK_BUTTON } from "@/app/constants";
import CopyMessageLinkButton from "./CopyMessageLinkButton";
import { readContract } from "viem/actions";
import memoize from "memoizee";
import useAsyncEffect from "use-async-effect";
import { useState } from "react";

const SHOW_MESSAGE_TIMESTAMP = false;

// memoize to reduce the number of RPC calls since this renderer may be called a lot
const getAppName = memoize(async (appAddress: string, chainId: number) => {
  const chain = chainIdToChain(chainId);
  if (chain == null) {
    return undefined;
  }
  try {
    const netAppName = await readContract(publicClient(chain), {
      address: appAddress as any,
      abi: [
        {
          type: "function",
          name: "NET_APP_NAME",
          inputs: [],
          outputs: [{ name: "", type: "string", internalType: "string" }],
          stateMutability: "view",
        },
      ],
      functionName: "NET_APP_NAME",
    });
    return netAppName;
  } catch (e) {
    // This may throw due to RPC errors or the contract not implementing the above function.
    // In either case, gracefully return undefined
    return undefined;
  }
});

export default function DefaultMessageRenderer(props: AppMessageRendererProps) {
  const { idx, message } = props;
  const [appName, setAppName] = useState<string>();

  useAsyncEffect(async () => {
    const name = await getAppName(props.message.app, props.chainId);
    if (name != null) {
      setAppName(name);
    }
  });

  return (
    <>
      <p className="flex text-left">
        {appName && `[${appName}] `}
        {message.text}
      </p>
      <p className="flex justify-end">
        {SHOW_MESSAGE_TIMESTAMP && (
          <TimeAgo date={chainTimeToMilliseconds(message.timestamp)} />
        )}
        {SHOW_MESSAGE_TIMESTAMP && " |"}{" "}
        {message.senderEnsName || message.sender} | #{idx}{" "}
        {SHOW_COPY_MESSAGE_LINK_BUTTON && (
          <CopyMessageLinkButton messageIdx={idx} />
        )}
      </p>
    </>
  );
}
