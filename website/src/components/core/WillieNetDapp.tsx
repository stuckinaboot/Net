import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SendMessageSection from "./SendMessageSection";
import { Separator } from "@/components/ui/separator";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import MessagesDisplay from "./MessagesDisplay";
import FloatingScrollToBottomButton from "./FloatingScrollToBottomButton";
import { useSearchParams } from "next/navigation";
import { APP_TO_CONFIG } from "./net-apps/AppManager";

export default function WillieNetDapp(props: {
  specificMessageIndex?: number;
}) {
  const { isConnected, address: userAddress } = useAccount();
  const [controlsState, setControlsState] = useState<any>({});

  const params = useSearchParams();
  const app = params.get("app");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollIsAtBottomRef = useRef(false);
  const scrollingToBottomRef = useRef(false);
  const [ready, setReady] = useState(false);

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

    setShowScrollButton(shouldShowScrollBottomButton);
  }

  useEffect(() => {
    // Component mounted
    setReady(true);
  }, []);

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

  const disableSendMessageSection = ready && !isConnected;
  const appConfig =
    app != null ? { appAddress: app, controlsState: controlsState } : undefined;

  const Controls = app != null ? APP_TO_CONFIG[app].controls : null;
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-col">
        <div className="flex flex-row justify-between">
          <CardTitle>Net</CardTitle>
          <ConnectButton />
        </div>
        <CardDescription>
          All messages are stored and read onchain and are publicly accessible.
          Scroll down to see all messages.
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
        </CardDescription>
      </CardHeader>
      <CardContent
        className="flex-1 flex-col overflow-y-auto"
        ref={scrollContainerRef}
      >
        <MessagesDisplay
          initialVisibleMessageIndex={props.specificMessageIndex}
          scrollToBottom={scrollToBottom}
          checkAndUpdateShouldShowScrollToBottomButton={
            checkAndUpdateShouldShowScrollToBottomButton
          }
          appContext={appConfig}
        />
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="flex flex-col">
        {showScrollButton && (
          <FloatingScrollToBottomButton onClick={() => scrollToBottom(false)} />
        )}
      </div>
      <CardFooter className="flex flex-col justify-end">
        <Separator className="m-3" />
        <SendMessageSection
          appContext={appConfig}
          disabled={disableSendMessageSection}
        />
      </CardFooter>
    </Card>
  );
}
