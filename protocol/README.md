# Net (AKA WillieNet)

WillieNet, also known as Net, is an onchain decentralized messaging protocol for EVM blockchains. Anybody can read messages and send message on WillieNet, where all messages live fully onchain and are easily queryable onchain. There is no cost to interact with WillieNet outside of gas fees.

WillieNet intentionally stores all messages onchain in order to allow both smart contracts and off-chains to trivially access stored messages. Additionally, each message stores all relevant metadata related to that message. While this does increase the gas costs of sending messages on WillieNet, this simplifies access for developers and serves the purpose of providing a fully onchain messaging protocol that other onchain projects can use and build on top of. This also bets on the belief that gas costs will continue to decrease in the future.

For more information on the WillieNet architecture, see [this thread](https://twitter.com/AspynPalatnick/status/1784072548730171795).

## Getting started

### Install dependencies

`forge install`

### Run tests

To run all WillieNet tests, run: `forge test`

### Explore the code

The core code is in `src/net/Net.sol`.

## Deploy

To deploy WillieNet, run: `forge script script/DeployNet.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast`

## Generate efficient address for deployment

### Init code

Get the init code for WillieNet by running `forge script script/GetNetCreationCode.s.sol`, which will write the init code to `out/creation-code.bin`

### Mine address

```
cast create2 --starts-with 0x000000 --deployer 0x4e59b44847b379578588920cA78FbF26c0B4956C --init-code $(cat script/out/creation-code.bin)
```

The output will looks as follows:

```
Address: 0x1234e557845ca0EE7fFF432214EB23C3320fe1E1
Salt: 0x19b3995d061bd58ff68999f72293078998278a7afe7ab263fff653c89cdf9e5a (11625145314286413592844811312464308937622531664715719632453373514187339177562)
```

### Use the salt

Copy the salt for the desired address you want WillieNet to deploy to the `salt` field in deploying the contract for DeployNet.s.sol

### Simulate deployment

Run `forge script script/DeployNet.s.sol`. You should see the address for that particular salt that was found via create2 printed and should match the predicted address.

# References

- https://2ad.com/deterministic-deployment.html
