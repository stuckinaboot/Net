import { WalletClient } from "viem";

export type OnchainMessage = {
  data: string;
  text: string;
  sender: string;
  app: string;
  timestamp: BigInt;
  topic: string;
};

export type SanitizedOnchainMessage = {
  sender: string;
  timestamp: number;
  data: string;
  text: string;
  app: string;
  topic: string;
  senderEnsName?: string;
};

export type MessageRange = { startIndex: number; endIndex: number };

export type NetAppContext = { appAddress: string; controlsState: any };

type ContractReadArgsResult = {
  totalMessages: any;
  messages: (range: MessageRange) => any;
};

type ContractWriteArgsResult = {
  sendMessage: { abi: any; functionName: string; to: string; args: any[] };
};

export type GetContractReadArgsFunction = (
  params: NetAppContext
) => ContractReadArgsResult;

export type GetContractWriteArgsFunction = (params: {
  appConfig: NetAppContext;
  messageText: string;
}) => ContractWriteArgsResult;

export type AppComponentsConfig = {
  provider: (props: AppProviderProps) => React.ReactNode;
  controls: (props: AppControlsProps) => React.ReactNode;
  messageRenderer: (props: AppMessageRendererProps) => React.ReactNode;
  getContractReadArgsFunction: GetContractReadArgsFunction;
  getContractWriteArgsFunction: GetContractWriteArgsFunction;
};

export type AppProviderProps = {
  children?: React.ReactNode;
  messageRange: MessageRange;
  appContext: NetAppContext;
};

export type AppControlsProps = {
  userAddress?: string;
  // Controls state lives in parent so that parent can pass this state into
  // other component
  controlsState: any;
  updateControlsState: (arg: any) => void;
};

export type AppMessageRendererContext = {
  appName?: string;
  transformedMessage?: React.ReactNode;
};

export type SanitizedOnchainMessageWithRenderContext = SanitizedOnchainMessage &
  AppMessageRendererContext;

export type AppMessageRendererProps = {
  idx: number;
  message: SanitizedOnchainMessageWithRenderContext;
  chainId: number;
};

export type InferredAppComponentsConfig = {
  supportedChains: Set<number>;
  infer: (message: string, chainId: number) => boolean;
  dialogContents: (props: {
    message: string;
    chainId: number;
  }) => React.ReactNode;
  transactionExecutor: {
    parameters?: (message: string) => {
      abi: any[];
      args: any[];
      functionName: string;
    };
    // Returns transaction hash
    customExecutor?: (params: {
      message: string;
      wallet: WalletClient;
    }) => Promise<string>;
  };
  toasts: {
    success: { description: string };
  };
};

// Standalone apps are Net apps that might have their own pages in the Net UI
// but do not simply augment the Net chat UI on its own like app components and inferred apps do.
// Don't get confused by the name, standalone could mean that the app still lives in this codebase
// and/or hosted on the Net domain, but it's not required to be.
export type StandaloneAppComponentsConfig = {
  getTransformedMessage: (
    chainId: number,
    messageText: string,
    messageData: string
  ) => Promise<React.ReactNode | string>;
};
