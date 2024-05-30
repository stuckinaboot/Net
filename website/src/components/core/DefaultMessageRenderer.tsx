import {
  chainIdToChain,
  chainIdToOpenSeaChainString,
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
import React, { useState } from "react";
import { INSCRIBED_DROPS_CONTRACT } from "./net-apps/inscribed-drops/constants";
import Link from "next/link";

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

const transformedMessageForApp = memoize(
  async (
    appAddress: string,
    chainId: number,
    message: string
  ): Promise<string | React.ReactNode> => {
    try {
      const hashTagIndex = message.indexOf("#");
      if (hashTagIndex === -1) {
        return message;
      }
      const dropId = message.substring(hashTagIndex + 1);
      if (appAddress === INSCRIBED_DROPS_CONTRACT.address) {
        const chain = chainIdToChain(chainId);
        if (chain == null) {
          return undefined;
        }
        const uri = (await readContract(publicClient(chain), {
          address: appAddress as any,
          abi: INSCRIBED_DROPS_CONTRACT.abi,
          functionName: "uri",
          args: [dropId],
        })) as any;
        const json = atob(
          uri.substring("data:application/json;base64,".length)
        );
        const drop = JSON.parse(json);
        if (drop.name) {
          return (
            <>
              {message.substring(0, hashTagIndex)}
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
      } else {
        return message;
      }
    } catch (e) {
      // This may throw due to RPC errors or the contract not implementing the above function.
      // In either case, gracefully return undefined
      return undefined;
    }
  }
);

export default function DefaultMessageRenderer(props: AppMessageRendererProps) {
  const { idx, message } = props;
  const [appName, setAppName] = useState<string>();
  const [finalMessage, setFinalMessage] = useState<React.ReactNode>(
    props.message.text
  );

  useAsyncEffect(async () => {
    const name = await getAppName(props.message.app, props.chainId);
    if (name != null) {
      setAppName(name);
    }
  }, [props.message.app, props.chainId]);

  useAsyncEffect(async () => {
    const messageText = await transformedMessageForApp(
      props.message.app,
      props.chainId,
      message.text
    );
    if (messageText != null) {
      setFinalMessage(messageText);
    }
  }, [props.message.app, props.chainId, message.text]);

  return (
    <>
      <p className="flex text-left">
        {appName && `[${appName}] `}
        {finalMessage}
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
