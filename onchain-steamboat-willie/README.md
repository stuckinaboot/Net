# Pop Willies

`cast send --rpc-url=$BASE_SEPOLIA_RPC_URL 0x2B906731e3a4287093FE27A6A18FC24fCb638b09 "mint(uint8)" 1 --private-key=$SEPOLIA_PRIVATE_KEY --value "0.02 ether"`

- Verify contract:
  `forge verify-contract 0x60b90558946e636dc62ca92e6ce17c7217267fe2 src/warhol/PopWillies.sol:PopWillies --watch --optimizer-runs 20 --show-standard-json-input > stdjson.json`,
  just worked no constructor args needed
- Go to OpenSea, set up drop
  - Creator payout address should be the Pop Willies contract address
  - Number of items should be 300
  - Price 0.023
  - Start mint now, end in a week
  - Limit 3 per wallet on OS page

# Tips

- Ethereum unit converter: https://eth-converter.com/
- Polygon mumbai: https://mumbai.polygonscan.com/tx/0xc41b4e2de8bbf956b1220ab2f2d4a839b43b03716946bf819a4fbb5f287a324c
- Gwei calculator: https://justjooz.com/gwei-calculator/
- Deploy NFT:
  `forge script script/DeployNFT.s.sol --rpc-url $GOERLI_RPC_URL --private-key $GOERLI_PRIVATE_KEY --verify --broadcast --etherscan-api-key $ETHERSCAN_API_KEY`
- Get token uri from deployed: comment out requirement for token to be minted, include console.log(nft.tokenURI(0))
  `forge script script/DeployNFT.s.sol --rpc-url $GOERLI_RPC_URL --private-key $GOERLI_PRIVATE_KEY -vvv`
- Mint XXYYZZ:
  `cast send --rpc-url=$SEPOLIA_RPC_URL 0xff6000a85baac9c4854faa7155e70ba850bf726b "mint()" --private-key=$MUMBAI_PRIVATE_KEY --value "0.005 ether"`
- Color background:
  `cast send --rpc-url=$SEPOLIA_RPC_URL 0xb7F437893C6c61C87c642d07Ae1c33814dA3D4fF "colorBackground(uint256,uint24)" 12 4568758 --private-key=$MUMBAI_PRIVATE_KEY`

- Deploy to testnet:
  `forge script script/DeployNFT.s.sol --rpc-url $MUMBAI_RPC_URL --private-key $MUMBAI_PRIVATE_KEY --broadcast`
- Mint from testnet (no value, AL false):
  `cast send --rpc-url=$MUMBAI_RPC_URL 0x7bcdb3bf9f26dd053ca3832277c4fb6334c8ff97 "mint(uint16)" 1 --private-key=$MUMBAI_PRIVATE_KEY --value "0.00001 ether"`
- Get tokenURI from deployed:
  `cast call --rpc-url=$MUMBAI_RPC_URL 0xfb3162ea73a383256100f511fd94eeaa95033fd8 "tokenURI(uint256)" 0 | xxd -r -p`

- Update public mint enabled:
  `cast send --rpc-url=$MUMBAI_RPC_URL 0x319da624fae6f4b02161f7b42a41f1fb1ac0e46a "updatePublicMintEnabled(bool)" true --private-key=$MUMBAI_PRIVATE_KEY`
- Withdraw:
  `cast send --rpc-url=$MUMBAI_RPC_URL 0x413d1fc4a61b5f95920a470615287cc8b95b3b96 "withdraw()" --private-key=$MUMBAI_PRIVATE_KEY`
- Test coverage: `forge coverage --report lcov`, `genhtml -o report lcov.info --branch-coverage`
- Mint:
  `cast send --rpc-url=$SEPOLIA_RPC_URL 0xBD1ae3055e5b1044B38D0d2ED1653E183031617C "mint(uint16)" 100 --private-key=$MUMBAI_PRIVATE_KEY --value "0.0000000000100 ether"`
- Commence:
  `cast send --rpc-url=$SEPOLIA_RPC_URL 0xBD1ae3055e5b1044B38D0d2ED1653E183031617C "commence()" --private-key=$MUMBAI_PRIVATE_KEY`
  - Update public mint enabled:
    `cast send --rpc-url=$SEPOLIA_RPC_URL 0xdD20b4932394ca0DECFb67472BdDBef479aCC863 "updatePublicMintEnabled(bool)" true --private-key=$MUMBAI_PRIVATE_KEY`
- Mint in loop:
  `for i in {1..10}; do cast send --rpc-url=$SEPOLIA_RPC_URL 0xb7F437893C6c61C87c642d07Ae1c33814dA3D4fF "mint(uint16)" 10 --private-key=$MUMBAI_PRIVATE_KEY --value "0.0000000000010 ether"; done`
- Update merkle root for allowlist:
  `cast send --rpc-url=$SEPOLIA_RPC_URL 0xeCC9E4eab1ed76C9c0617bF3eE5A503B0f6e968D "setMerkleRoot(bytes32)" 0x2d107cbb32e49adaafb9cc9c8409afc10b7e64df0fac665c4c9e9ad805b585c6 --private-key=$MUMBAI_PRIVATE_KEY`

- Verify already deployed contract with constructor args:
  `forge verify-contract 0xb04B8B5A0ba5e9e8029DD01DE2CA22Af50926353 src/OnchainDinos.sol:OnchainDinos --watch --constructor-args $(cast abi-encode "constructor(bytes32,uint16,uint8)" 0xd1413436ac25d03aca50f1065e5c13af57f2d6b99ba49602405b80ae9f2a6c9a 800 2 )`
  - If that verifying doesn't work, to verify manually
    1. Find optimizer runs in foundry.toml
    2. Generate standard json input here:
       `forge verify-contract 0xb9572ac486e18dab9bc0cfec730027678f8aed20 src/painter/Painter.sol:Painter --watch --etherscan-api-key $ETHERSCAN_API_KEY --optimizer-runs 20 --show-standard-json-input`
    3. Go to manually verify on etherscan and choose stdjson input
    4. Look at solc compiler version in foundry.toml
    5. Use that compiler version on etherscan
    6. Things should work

# Foundry Template [![Open in Gitpod][gitpod-badge]][gitpod] [![Github Actions][gha-badge]][gha] [![Foundry][foundry-badge]][foundry] [![License: MIT][license-badge]][license]

[gitpod]: https://gitpod.io/#https://github.com/PaulRBerg/foundry-template
[gitpod-badge]: https://img.shields.io/badge/Gitpod-Open%20in%20Gitpod-FFB45B?logo=gitpod
[gha]: https://github.com/PaulRBerg/foundry-template/actions
[gha-badge]: https://github.com/PaulRBerg/foundry-template/actions/workflows/ci.yml/badge.svg
[foundry]: https://getfoundry.sh/
[foundry-badge]: https://img.shields.io/badge/Built%20with-Foundry-FFDB1C.svg
[license]: https://opensource.org/licenses/MIT
[license-badge]: https://img.shields.io/badge/License-MIT-blue.svg

A Foundry-based template for developing Solidity smart contracts, with sensible defaults.

## What's Inside

- [Forge](https://github.com/foundry-rs/foundry/blob/master/forge): compile, test, fuzz, format, and deploy smart
  contracts
- [PRBTest](https://github.com/PaulRBerg/prb-test): modern collection of testing assertions and logging utilities
- [Forge Std](https://github.com/foundry-rs/forge-std): collection of helpful contracts and cheatcodes for testing
- [Solhint](https://github.com/protofire/solhint): linter for Solidity code
- [Prettier Plugin Solidity](https://github.com/prettier-solidity/prettier-plugin-solidity): code formatter for
  non-Solidity files

## Getting Started

Click the [`Use this template`](https://github.com/PaulRBerg/foundry-template/generate) button at the top of the page to
create a new repository with this repo as the initial state.

Or, if you prefer to install the template manually:

```sh
forge init my-project --template https://github.com/PaulRBerg/foundry-template
cd my-project
pnpm install # install Solhint, Prettier, and other Node.js deps
```

If this is your first time with Foundry, check out the
[installation](https://github.com/foundry-rs/foundry#installation) instructions.

## Features

This template builds upon the frameworks and libraries mentioned above, so for details about their specific features,
please consult their respective documentation.

For example, if you're interested in exploring Foundry in more detail, you should look at the
[Foundry Book](https://book.getfoundry.sh/). In particular, you may be interested in reading the
[Writing Tests](https://book.getfoundry.sh/forge/writing-tests.html) tutorial.

### Sensible Defaults

This template comes with a set of sensible default configurations for you to use. These defaults can be found in the
following files:

```text
├── .editorconfig
├── .gitignore
├── .prettierignore
├── .prettierrc.yml
├── .solhint.json
├── foundry.toml
└── remappings.txt
```

### VSCode Integration

This template is IDE agnostic, but for the best user experience, you may want to use it in VSCode alongside Nomic
Foundation's [Solidity extension](https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity).

For guidance on how to integrate a Foundry project in VSCode, please refer to this
[guide](https://book.getfoundry.sh/config/vscode).

### GitHub Actions

This template comes with GitHub Actions pre-configured. Your contracts will be linted and tested on every push and pull
request made to the `main` branch.

You can edit the CI script in [.github/workflows/ci.yml](./.github/workflows/ci.yml).

## Writing Tests

To write a new test contract, you start by importing [PRBTest](https://github.com/PaulRBerg/prb-test) and inherit from
it in your test contract. PRBTest comes with a pre-instantiated [cheatcodes](https://book.getfoundry.sh/cheatcodes/)
environment accessible via the `vm` property. If you would like to view the logs in the terminal output you can add the
`-vvv` flag and use [console.log](https://book.getfoundry.sh/faq?highlight=console.log#how-do-i-use-consolelog).

This template comes with an example test contract [Foo.t.sol](./test/Foo.t.sol)

## Usage

This is a list of the most frequently needed commands.

### Build

Build the contracts:

```sh
$ forge build
```

### Clean

Delete the build artifacts and cache directories:

```sh
$ forge clean
```

### Compile

Compile the contracts:

```sh
$ forge build
```

### Coverage

Get a test coverage report:

```sh
$ forge coverage
```

### Deploy

Deploy to Anvil:

```sh
$ forge script script/DeployFoo.s.sol --broadcast --fork-url http://localhost:8545
```

For this script to work, you need to have a `MNEMONIC` environment variable set to a valid
[BIP39 mnemonic](https://iancoleman.io/bip39/).

For instructions on how to deploy to a testnet or mainnet, check out the
[Solidity Scripting](https://book.getfoundry.sh/tutorials/solidity-scripting.html) tutorial.

### Format

Format the contracts:

```sh
$ forge fmt
```

### Gas Usage

Get a gas report:

```sh
$ forge test --gas-report
```

### Lint

Lint the contracts:

```sh
$ pnpm lint
```

### Test

Run the tests:

```sh
$ forge test
```

## Notes

1. Foundry uses [git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) to manage dependencies. For
   detailed instructions on working with dependencies, please refer to the
   [guide](https://book.getfoundry.sh/projects/dependencies.html) in the book
2. You don't have to create a `.env` file, but filling in the environment variables may be useful when debugging and
   testing against a fork.

## Related Efforts

- [abigger87/femplate](https://github.com/abigger87/femplate)
- [cleanunicorn/ethereum-smartcontract-template](https://github.com/cleanunicorn/ethereum-smartcontract-template)
- [foundry-rs/forge-template](https://github.com/foundry-rs/forge-template)
- [FrankieIsLost/forge-template](https://github.com/FrankieIsLost/forge-template)

## License

[MIT](./LICENSE.md) © Paul Razvan Berg
