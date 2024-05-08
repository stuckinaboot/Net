export type SanitizedOnchainMessage = {
  sender: string;
  timestamp: number;
  data: string;
  text: string;
  app: string;
  topic: string;
};

export type MessageRange = { startIndex: number; endIndex: number };

export type NetAppConfig = { appAddress: string; controlsState: any };
