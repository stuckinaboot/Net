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
import NftGatingControls from "./nft-gating/NftGatingControls";
import { useSearchParams } from "next/navigation";

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
  const [scrollingToBottom, setScrollingToBottom] = useState(false);
  const [ready, setReady] = useState(false);

  const scrollToBottom = () => {
    setScrollingToBottom(true);
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
    setScrollingToBottom((currScrollingToBottom) => {
      if (currScrollingToBottom && isScrolledToBottom()) {
        // Already scrolled to bottom, so set scrolling to bottom to false
        return false;
      } else if (currScrollingToBottom) {
        // Currently scrolling to bottom, so don't perform any updates
        return currScrollingToBottom;
      }

      const shouldShowScrollBottomButton = !isScrolledToBottom();
      if (shouldShowScrollBottomButton == null) {
        // Null result, so return current value
        return currScrollingToBottom;
      }

      setShowScrollButton((currShowScrollButton) => {
        if (!currShowScrollButton && shouldShowScrollBottomButton) {
          // If not currently showing scroll button and should show scroll button,
          // implies we were previously scrolled to bottom to see latest message.
          // So scroll to bottom again to see the new latest message and continue
          // to not show scroll button
          scrollToBottom();
        }
        return shouldShowScrollBottomButton;
      });
      return currScrollingToBottom;
    });
  }

  useEffect(() => {
    // Component mounted
    setReady(true);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    scrollContainer?.addEventListener(
      "scroll",
      checkAndUpdateShouldShowScrollToBottomButton
    );
    return () => {
      scrollContainer?.removeEventListener(
        "scroll",
        checkAndUpdateShouldShowScrollToBottomButton
      );
    };
  }, []);

  const disableSendMessageSection = ready && !isConnected;
  const appConfig =
    app != null ? { appAddress: app, controlsState: controlsState } : undefined;
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-col">
        <div className="flex flex-row justify-between">
          <CardTitle>Net</CardTitle>
          <ConnectButton />
        </div>
        <CardDescription>
          All messages are stored and read onchain and are publicly accessible.
          {app ? (
            <NftGatingControls
              userAddress={userAddress}
              controlsState={controlsState}
              updateControlsState={(updatedState) =>
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
          appConfig={appConfig}
        />
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="flex flex-col">
        {showScrollButton && (
          <FloatingScrollToBottomButton onClick={scrollToBottom} />
        )}
      </div>
      <CardFooter className="flex flex-col justify-end">
        <Separator className="m-3" />
        {app != null ? (
          <SendMessageSection
            appConfig={appConfig}
            disabled={disableSendMessageSection}
          />
        ) : (
          <SendMessageSection
            appConfig={appConfig}
            disabled={disableSendMessageSection}
          />
        )}
      </CardFooter>
    </Card>
  );
}
