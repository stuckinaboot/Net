# WillieNet

WillieNet is an onchain decentralized messaging protocol for EVM blockchains. Anybody can read messages and send message on WillieNet, where all messages live fully onchain and are easily queryable onchain. There is no cost to interact with WillieNet outside of gas fees.

WillieNet intentionally stores all messages onchain in order to allow both smart contracts and off-chains to trivially access stored messages. While this does increase the gas costs of sending messages on WillieNet, this simplifies access for developers and serves the purpose of providing a fully onchain messaging protocol that other onchain projects can use and build on top of.

## Getting started

### Install dependencies

`forge install`

### Run tests

To run all WillieNet tests, run: `forge test`

### Explore the code

The core code is in `src/willie-net/WillieNet.sol`.

## Deploy

To deploy WillieNet, run: `forge script script/DeployWillienet.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast`

**NOTE: prior to official mainnet launch, this deployment approach will be updated to use create2 so that the same address can be used across chains**
