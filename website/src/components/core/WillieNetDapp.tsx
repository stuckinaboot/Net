import { useEffect, useRef, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import SendMessageSection from "./SendMessageSection";
import { Separator } from "@/components/ui/separator";
import MessagesDisplay from "./MessagesDisplay";
import FloatingScrollToBottomButton from "./FloatingScrollToBottomButton";
import { useSearchParams } from "next/navigation";
import { APP_TO_CONFIG } from "./net-apps/AppManager";
import BasePageCard from "./BasePageCard";
import { base, baseSepolia, degen, sepolia } from "viem/chains";
import { HAM_CHAIN } from "@/app/constants";

const ENABLE_SHOW_SCROLL_BUTTON = false;

export default function WillieNetDapp(props: {
  specificMessageIndex?: number;
}) {
  const { address: userAddress } = useAccount();
  const [controlsState, setControlsState] = useState<any>({});

  const params = useSearchParams();
  const app = params.get("app");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  // NOTE: it's the scroll button showing/hiding that's causing re-renders
  // TODO fix this
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollIsAtBottomRef = useRef(false);
  const scrollingToBottomRef = useRef(false);

  const searchParams = useSearchParams();
  const { switchChain } = useSwitchChain();
  const initialChainSearchParamStr = searchParams
    .get("initialChain")
    ?.toLowerCase();
  const initialChainSearchParam =
    initialChainSearchParamStr === "base"
      ? base
      : initialChainSearchParamStr === "degen"
      ? degen
      : initialChainSearchParamStr === "ham"
      ? HAM_CHAIN
      : initialChainSearchParamStr === "sepolia"
      ? sepolia
      : initialChainSearchParamStr === "baseSepolia"
      ? baseSepolia
      : undefined;

  useEffect(() => {
    if (initialChainSearchParam != null) {
      // Switch to the initial chain, which will automatically only switch if the user isn't
      // already connected to another supported chain.
      // NOTE: rainbowkit `initialChain` doesn't work so we use this approach instead
      switchChain({ chainId: initialChainSearchParam.id });
    }
  }, []);

  const scrollToBottom = (onlyScrollIfAlreadyOnBottom: boolean) => {
    if (onlyScrollIfAlreadyOnBottom && !scrollIsAtBottomRef.current) {
      // Only scroll if already on bottom but we are not already on bottom so return
      return;
    }
    scrollingToBottomRef.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  function isScrolledToBottom() {
    const scrollContainer = scrollContainerRef.current;
    const targetDiv = messagesEndRef.current;
    if (targetDiv == null || scrollContainer == null) {
      return;
    }

    const containerTop = scrollContainer.getBoundingClientRect().top;
    const { top, bottom } = targetDiv.getBoundingClientRect();

    const scrollIsAboveBottom =
      top > containerTop &&
      bottom > containerTop + scrollContainer.clientHeight;
    return !scrollIsAboveBottom;
  }

  function checkAndUpdateShouldShowScrollToBottomButton() {
    if (scrollingToBottomRef.current && isScrolledToBottom()) {
      // Already scrolled to bottom, so set scrolling to bottom to false
      scrollingToBottomRef.current = false;
      return;
    } else if (scrollingToBottomRef.current) {
      // Currently scrolling to bottom, so don't perform any updates
      return;
    }

    const shouldShowScrollBottomButton = !isScrolledToBottom();

    if (shouldShowScrollBottomButton == null) {
      // Null result, so return current value
      return;
    }

    if (ENABLE_SHOW_SCROLL_BUTTON) {
      setShowScrollButton(shouldShowScrollBottomButton);
    }
  }

  function onScroll() {
    // NOTE: this ref is intentionally only set on scroll. That means
    // that if a new message is received, this value will _correctly_
    // not be updated. This is useful because we can use this ref to track if,
    // prior to the new message being received, scroll was at the bottom
    scrollIsAtBottomRef.current = !!isScrolledToBottom();
    checkAndUpdateShouldShowScrollToBottomButton();
  }

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    scrollContainer?.addEventListener("scroll", onScroll);
    return () => {
      scrollContainer?.removeEventListener("scroll", onScroll);
    };
  }, []);

  const appConfig =
    app != null ? { appAddress: app, controlsState: controlsState } : undefined;

  const Controls = app != null ? APP_TO_CONFIG[app].controls : null;

  return (
    <>
      <BasePageCard
        description={
          <>
            All messages are stored and read onchain and are publicly
            accessible. Scroll down to see all messages.
            {Controls ? (
              <Controls
                userAddress={userAddress}
                controlsState={controlsState}
                updateControlsState={(updatedState: any) =>
                  setControlsState(updatedState)
                }
              />
            ) : (
              <></>
            )}
          </>
        }
        content={{
          ref: scrollContainerRef,
          node: (
            <>
              <MessagesDisplay
                initialVisibleMessageIndex={props.specificMessageIndex}
                scrollToBottom={scrollToBottom}
                checkAndUpdateShouldShowScrollToBottomButton={
                  checkAndUpdateShouldShowScrollToBottomButton
                }
                appContext={appConfig}
              />
              <div ref={messagesEndRef} />
            </>
          ),
        }}
        betweenContentAndFooter={
          <div className="flex flex-col">
            {showScrollButton && (
              <FloatingScrollToBottomButton
                onClick={() => scrollToBottom(false)}
              />
            )}
          </div>
        }
        footer={(disabled) => (
          <>
            <SendMessageSection appContext={appConfig} disabled={disabled} />
          </>
        )}
      />
    </>
  );
}
