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
import debounce from "debounce";
import { useToast } from "../ui/use-toast";

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
  const scrollingToBottomRef = useRef(false);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();

  const scrollToBottom = () => {
    console.log("HIT!");
    // setScrollingToBottom(true);
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
    console.log(
      "is scrolled to bottom",
      !scrollIsAboveBottom,
      top > containerTop,
      bottom > containerTop + scrollContainer.clientHeight,
      bottom,
      containerTop + scrollContainer.clientHeight
    );
    return !scrollIsAboveBottom;
  }

  function checkAndUpdateShouldShowScrollToBottomButton() {
    // console.log(
    //   "checkAndUpdateShouldShowScrollToBottomButton entered",
    //   isScrolledToBottom()
    // );
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

    setShowScrollButton((currShowScrollButton) => {
      if (!currShowScrollButton && shouldShowScrollBottomButton) {
        // If not currently showing scroll button and should show scroll button,
        // implies we were previously scrolled to bottom to see latest message.
        // So scroll to bottom again to see the new latest message and continue
        // to not show scroll button
        // NOTE: this is the culprit
        // if (scrollingToBottomRef.current) {
        //   return false;
        // }
        //
        console.log(
          "Trigger!",
          isScrolledToBottom(),
          shouldShowScrollBottomButton
        );
        // scrollToBottom();
      }
      return shouldShowScrollBottomButton;
    });
    return;

    // setScrollingToBottom((currScrollingToBottom) => {
    //   if (currScrollingToBottom && isScrolledToBottom()) {
    //     // Already scrolled to bottom, so set scrolling to bottom to false
    //     return false;
    //   } else if (currScrollingToBottom) {
    //     // Currently scrolling to bottom, so don't perform any updates
    //     return currScrollingToBottom;
    //   }

    //   const shouldShowScrollBottomButton = !isScrolledToBottom();

    //   if (shouldShowScrollBottomButton == null) {
    //     // Null result, so return current value
    //     return currScrollingToBottom;
    //   }

    //   setShowScrollButton((currShowScrollButton) => {
    //     if (!currShowScrollButton && shouldShowScrollBottomButton) {
    //       // If not currently showing scroll button and should show scroll button,
    //       // implies we were previously scrolled to bottom to see latest message.
    //       // So scroll to bottom again to see the new latest message and continue
    //       // to not show scroll button
    //       // NOTE: this is the culprit
    //       scrollToBottom();
    //     }
    //     return shouldShowScrollBottomButton;
    //   });
    //   return currScrollingToBottom;
    // });
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
          Scroll down to see all messages. {showScrollButton ? 1 : 0}{" "}
          {scrollingToBottom ? 1 : 0} {scrollingToBottomRef.current ? 1 : 0}{" "}
          {isScrolledToBottom() ? 1 : 0}
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
        <div
          ref={messagesEndRef}
          style={{ width: "100%", height: "10px", backgroundColor: "red" }}
        />
      </CardContent>
      <div className="flex flex-col">
        {showScrollButton && (
          <FloatingScrollToBottomButton onClick={scrollToBottom} />
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
