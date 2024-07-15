import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { MutableRefObject, useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function BasePageCard(props: {
  description: React.ReactNode;
  content: {
    node: React.ReactNode;
    ref?: MutableRefObject<HTMLDivElement | null>;
  };
  footer?: (disableFooter: boolean) => React.ReactNode;
  betweenContentAndFooter?: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const { isConnected } = useAccount();

  const disableFooter = ready && !isConnected;

  useEffect(() => {
    // Component mounted
    setReady(true);
  }, []);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-col">
        <div className="flex flex-row justify-between">
          <CardTitle>Net</CardTitle>
          <ConnectButton />
        </div>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      <CardContent
        className="flex-1 flex-col overflow-y-auto"
        ref={props.content.ref}
      >
        {props.content.node}
      </CardContent>
      {props.betweenContentAndFooter}
      <CardFooter className="flex flex-col justify-end">
        <Separator className="m-3" />
        {props.footer && props.footer(disableFooter)}
      </CardFooter>
    </Card>
  );
}
