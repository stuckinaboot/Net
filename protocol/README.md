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

Stop running this after you believe a suitable address has been found.

The output will look roughly as follows:

```
0x4e59b44847b379578588920ca78fbf26c0b4956cbbf060c25139582b45000008 => 0x000000C199F1c7943805c1a2746090bDdCec13b2 => 1
0x4e59b44847b379578588920ca78fbf26c0b4956cbbf060c25139e9eb46000018 => 0x000000179E745F855A11c6fF0B6Af174fE8398ed => 1
0x4e59b44847b379578588920ca78fbf26c0b4956cbbf060c251391a0a5c000080 => 0x000032bc5D5964001bAC5307560059c2C0ED5Cac => 2
0x4e59b44847b379578588920ca78fbf26c0b4956cbbf060c251397b2c70000000 => 0x000000cfC430eb842BF7303Cb7aA0F9a4B64b5f1 => 1
0x4e59b44847b379578588920ca78fbf26c0b4956cbbf060c2513959e674000000 => 0x0000002a01Ad79f58935125C43080577c4218884 => 1
```

The output is the salt => resultant address => value (i.e. approximate rarity)

### Use the salt

Copy the salt for the desired address you want WillieNet to deploy to the `salt` field in deploying the contract for DeployWillieNet.s.sol

### Simulate deployment

Run `forge script script/DeployWillienet.s.sol`. You should see the address for that particular salt that was found via create2 printed.
