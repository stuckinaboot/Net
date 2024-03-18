// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {OnchainSteamboatWillie} from "../src/willie-net/onchain-steamboat-willie/OnchainSteamboatWillie.sol";

contract DeployNFT is Script {
    address internal deployer;
    OnchainSteamboatWillie internal nft;

    function setUp() public virtual {}

    function run() public {
        string memory root = vm.projectRoot();
        bytes32 allowListMerkleRoot = vm.parseBytes32(
            vm.readFile(
                string.concat(root, "/assets/allowlist-merkle-root.txt")
            )
        );

        string memory art0 = vm.readFile(
            string.concat(root, "/assets/art0.txt")
        );
        string memory art1 = vm.readFile(
            string.concat(root, "/assets/art1.txt")
        );
        string memory art2 = vm.readFile(
            string.concat(root, "/assets/art2.txt")
        );

        uint16 ALLOWLIST_MINT_CAP = 500;
        uint8 ALLOWLIST_MINT_MAX_PER_WALLET = 15;

        vm.startBroadcast();
        nft = new OnchainSteamboatWillie(
            allowListMerkleRoot,
            ALLOWLIST_MINT_CAP,
            ALLOWLIST_MINT_MAX_PER_WALLET
        );
        nft.setArt(0, art0);
        nft.setArt(1, art1);
        nft.setArt(2, art2);

        // Now that it's already deployed, always enable public mint for testing
        nft.updatePublicMintEnabled(true);

        nft.mintPublic{value: 0.005 ether}(1);
        vm.stopBroadcast();
    }
}
