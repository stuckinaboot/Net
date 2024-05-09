export type SanitizedOnchainMessage = {
  sender: string;
  timestamp: number;
  data: string;
  text: string;
  app: string;
  topic: string;
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

export type AppMessageRendererProps = {
  idx: number;
  message: SanitizedOnchainMessage;
};
