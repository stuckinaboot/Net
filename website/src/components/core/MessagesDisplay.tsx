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

// TODO work on improving this to a lower value. Currently, if its too low,
// we run into issues where it won't scroll at all
const PRE_SCROLL_TIMEOUT_MS = 250;

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
      return <DefaultMessageRenderer idx={idx} message={message} />;
    }

    return <AppMessageRenderer idx={idx} message={message} />;
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
