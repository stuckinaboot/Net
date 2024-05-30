import { WILLIE_NET_CONTRACT } from "@/app/constants";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import truncateEthAddress from "truncate-eth-address";
import { useChainId, useReadContract } from "wagmi";
import {
  NetAppContext,
  OnchainMessage,
  SanitizedOnchainMessage,
} from "./types";
import DefaultMessageRenderer from "./DefaultMessageRenderer";
import { APP_TO_CONFIG } from "./net-apps/AppManager";
import { getEnsName } from "../utils/utils";
import useAsyncEffect from "use-async-effect";
import Link from "next/link";
import {
  chainIdToChain,
  chainIdToOpenSeaChainString,
  publicClient,
} from "@/app/utils";
import { readContract } from "viem/actions";
import { INSCRIBED_DROPS_CONTRACT } from "./net-apps/inscribed-drops/constants";
import memoize from "memoizee";

// TODO work on improving this to a lower value. Currently, if its too low,
// we run into issues where it won't scroll at all
const PRE_SCROLL_TIMEOUT_MS = 250;

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

export default function MessagesDisplay(props: {
  scrollToBottom: (onlyIfAlreadyOnBottom: boolean) => void;
  checkAndUpdateShouldShowScrollToBottomButton: () => void;
  initialVisibleMessageIndex?: number;
  appContext?: NetAppContext;
}) {
  const [chainChanged, setChainChanged] = useState(false);
  const [messages, setMessages] = useState<SanitizedOnchainMessage[]>([]);
  const [firstLoadedMessages, setFirstLoadedMessages] = useState(false);
  const [loadedMessages, setLoadedMessages] = useState(false);
  const specificMessageRef = useRef<HTMLDivElement | null>(null);
  const chainId = useChainId();

  const totalMessagesReadContractArgs =
    props.appContext != null &&
    APP_TO_CONFIG[props.appContext.appAddress]?.getContractReadArgsFunction !=
      null
      ? APP_TO_CONFIG[props.appContext.appAddress].getContractReadArgsFunction(
          props.appContext
        ).totalMessages
      : {
          abi: WILLIE_NET_CONTRACT.abi,
          address: WILLIE_NET_CONTRACT.address as any,
          functionName: "getTotalMessagesCount",
          query: {
            refetchInterval: 2000,
          },
          args: [],
        };

  const totalMessagesResult = useReadContract(totalMessagesReadContractArgs);
  const messagesResultsReadContractArgs =
    props.appContext &&
    APP_TO_CONFIG[props.appContext.appAddress]?.getContractReadArgsFunction !=
      null
      ? APP_TO_CONFIG[props.appContext.appAddress]
          .getContractReadArgsFunction(props.appContext)
          .messages({
            startIndex: 0,
            endIndex: +(totalMessagesResult.data || 0).toString(),
          })
      : {
          abi: WILLIE_NET_CONTRACT.abi,
          address: WILLIE_NET_CONTRACT.address as any,
          functionName: "getMessagesInRange",
          args: [BigInt(0), totalMessagesResult.data],
        };
  const messagesResult = useReadContract(messagesResultsReadContractArgs);
  const onchainMessages =
    (messagesResult.data as OnchainMessage[] | undefined) || [];
  const sanitizedOnchainMessages: SanitizedOnchainMessage[] =
    onchainMessages.map((message) => ({
      ...message,
      timestamp: +message.timestamp.toString(),
    }));

  function scrollToSpecificMessageAfterTimeout() {
    // Attempt to scroll after a short timeout to ensure everything has been rendered before
    // we attempt to scroll. Otherwise, we won't scroll at all
    setTimeout(() => {
      specificMessageRef.current?.scrollIntoView({ behavior: "instant" });
    }, PRE_SCROLL_TIMEOUT_MS);
  }

  useEffect(() => {
    setChainChanged(true);
  }, [chainId]);

  useEffect(() => {
    if (!chainChanged || !messagesResult.isFetched) {
      return;
    }
    setChainChanged(false);
    // Scroll on chain changed and messages fetched
    setTimeout(() => {
      // Force scroll to bottom
      props.scrollToBottom(false);
    }, PRE_SCROLL_TIMEOUT_MS);
  }, [chainChanged, messagesResult.isFetched]);

  useAsyncEffect(async () => {
    if (!messagesResult.isFetched) {
      return;
    }

    const finalMessages = await Promise.all(
      sanitizedOnchainMessages.map(async (message) => ({
        ...message,
        sender: truncateEthAddress(message.sender),
        senderEnsName:
          (await getEnsName({ address: message.sender, chainId })) || undefined,
      }))
    );

    // Updating messages using state and skipping when not fetched
    // gets rid of the flicker of loading messages
    setLoadedMessages(false);
    setMessages(finalMessages);
  }, [sanitizedOnchainMessages.length, messagesResult.isFetched]);

  useEffect(() => {
    // This is called whenever the state finishes being set, implying the messages
    // are rendered.
    if (!loadedMessages) {
      setLoadedMessages(true);

      if (messages.length > 0) {
        if (!firstLoadedMessages) {
          setFirstLoadedMessages(true);
          props.scrollToBottom(false);
        } else {
          props.scrollToBottom(true);
        }
      }
    }
    props.checkAndUpdateShouldShowScrollToBottomButton();
  }, [messages.length]);

  useEffect(() => {
    // TODO ensure this logic works
    if (firstLoadedMessages || sanitizedOnchainMessages.length === 0) {
      return;
    }
    scrollToSpecificMessageAfterTimeout();
  }, [sanitizedOnchainMessages.length, firstLoadedMessages]);

  const ConditionalAppProvider = ({
    children,
  }: {
    children?: React.ReactNode;
  }) => {
    const AppProvider =
      props.appContext != null &&
      APP_TO_CONFIG[props.appContext.appAddress] != null
        ? APP_TO_CONFIG[props.appContext.appAddress].provider
        : null;
    if (AppProvider == null || props.appContext == null) {
      return <>{children}</>;
    }

    return (
      <AppProvider
        messageRange={{
          startIndex: 0,
          endIndex: +(totalMessagesResult.data != null
            ? +totalMessagesResult.data.toString()
            : 0),
        }}
        appContext={props.appContext}
      >
        {children}
      </AppProvider>
    );
  };

  const ConditionalMessageRenderer = ({
    idx,
    message,
  }: {
    idx: number;
    message: SanitizedOnchainMessage;
  }) => {
    const AppMessageRenderer =
      props.appContext != null &&
      APP_TO_CONFIG[props.appContext.appAddress] != null
        ? APP_TO_CONFIG[props.appContext.appAddress].messageRenderer
        : null;
    if (AppMessageRenderer == null) {
      return (
        <DefaultMessageRenderer idx={idx} message={message} chainId={chainId} />
      );
    }

    return <AppMessageRenderer idx={idx} message={message} chainId={chainId} />;
  };

  return (
    <ConditionalAppProvider>
      <div className="flex flex-col">
        <div
          className={cn(
            "flex",
            "flex-col",
            "whitespace-break-spaces",
            "w-full",
            "overflow-x-hidden"
          )}
        >
          {messages.map((message, idx) => (
            <div
              key={idx}
              className="flex flex-col"
              ref={
                idx == props.initialVisibleMessageIndex
                  ? specificMessageRef
                  : undefined
              }
            >
              <ConditionalMessageRenderer idx={idx} message={message} />
            </div>
          ))}
        </div>
      </div>
    </ConditionalAppProvider>
  );
}
