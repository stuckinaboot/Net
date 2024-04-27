# WillieNet

WillieNet is an onchain decentralized messaging protocol for EVM blockchains. Anybody can read messages and send message on WillieNet, where all messages live fully onchain and are easily queryable onchain. There is no cost to interact with WillieNet outside of gas fees.

WillieNet intentionally stores all messages onchain in order to allow both smart contracts and off-chains to trivially access stored messages. Additionally, each message stores all relevant metadata related to that message. While this does increase the gas costs of sending messages on WillieNet, this simplifies access for developers and serves the purpose of providing a fully onchain messaging protocol that other onchain projects can use and build on top of. This also bets on the belief that gas costs will continue to decrease in the future.

For more information on the WillieNet architecture, see [this thread](https://twitter.com/AspynPalatnick/status/1784072548730171795).

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

## Generate efficient address

### Init code hash

Get the init code hash for WillieNet by running `forge script script/GetWillieNetCreationCode.s.sol `

### Create2crunch

Generate efficient addresses via create2crunch

```
cd utilities/create2crunch
export FACTORY="0x0000000000ffe8b47b3e2130213b802212439497"
export CALLER="0x4e59b44847b379578588920ca78fbf26c0b4956c"
export INIT_CODE_HASH="<init code hash from previous step>" # ex. 0xec792c01ed24b6126e1b79e5edef4e83b0265a3e2f55dcd463f0633ca4fa711c
cargo run --release $FACTORY $CALLER $INIT_CODE_HASH
```
