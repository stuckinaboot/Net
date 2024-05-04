# Net

WillieNet, also known as Net, is an onchain decentralized messaging protocol for EVM blockchains. Anybody can read messages and send message on WillieNet, where all messages live fully onchain and are easily queryable onchain. There is no cost to interact with WillieNet outside of gas fees.

## Breakdown

### Protocol

The smart contracts for WillieNet live in the `protocol` directory. Visit the protocol directory to explore the WillieNet protocol.

There is not yet a canonical deployment for WillieNet on mainnet. The readme will be updated once there is.

### Dapp

This repo provides a dapp that allows you to interact with WillieNet in the `website` directory. That said, anybody can build a dapp to interact with WillieNet.

Currently, the dapp only allows you to interact with WillieNet on the Base Sepolia testnet.

## Ideas for Apps on top of WillieNet

### Onchain apps

Below is a non-exhaustive list of onchain apps that can be built on top of WillieNet.

1. Cross-chain messaging: allow sending messages to WillieNet on other blockchains
1. NFT-gated chats: only allow sending messages by those with a particular NFT
1. ERC20-gated chats: only allow sending messages by those with a particular ERC20
1. Send message on behalf of your NFT: attribute sent messages to NFTs the sender owns
1. Encrypted messaging (e.g. onchain WhatsApp): send encrypted messages onchain
1. Onchain Seaport-based NFT orderbook: create buy/sell orders for NFTs and store them as messages
1. Message-based inscriptions: inscribe NFT metadata in a message and use that to mint a new NFT
1. Onchain generative message-based NFTs: send a message and mint an NFT based on the contents of the sent message
1. Receipt of onchain actions: onchain apps (ex. NFT drops, marketplaces, staking contracts, etc.) can send messages when users mint/trade/stake/transfer

### Off-chain apps

Below is a non-exhaustive list of off-chain apps that can be built on top of WillieNet.

1. Censorship-resistant messaging site: users can send censorship-resistant messages and view each other's messages
1. In-game chats: video games can allow public onchain chats between players
1. File sharing: users can send onchain files, of any type, as bytes in messages
1. Tipping: users can tip each other ERC20s for sending "good" messages
1. Notebook: users can record their messages permanently onchain and can reference them later
1. News: users can publish news onchain as censorship-resistant messages
