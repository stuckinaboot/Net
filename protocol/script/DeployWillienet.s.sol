// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {OnchainSteamboatWillie} from "../src/willie-net/onchain-steamboat-willie/OnchainSteamboatWillie.sol";
import {WillieNet} from "../src/willie-net/WillieNet.sol";
import {Renderer} from "../src/willie-net/renderer/Renderer.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract DeployNFT is Script {
    address internal deployer;
    WillieNet internal willieNet;
    Renderer internal renderer;

    function setUp() public virtual {}

    function deployOnchainSteamboatWillies()
        internal
        returns (address onchainWillies)
    {
        string memory root = vm.projectRoot();

        string memory art0 = vm.readFile(
            string.concat(root, "/assets/art0.txt")
        );
        string memory art1 = vm.readFile(
            string.concat(root, "/assets/art1.txt")
        );
        string memory art2 = vm.readFile(
            string.concat(root, "/assets/art2.txt")
        );

        vm.startBroadcast();
        OnchainSteamboatWillie nft = new OnchainSteamboatWillie(
            bytes32(0),
            0,
            0
        );
        nft.setArt(0, art0);
        nft.setArt(1, art1);
        nft.setArt(2, art2);

        // Now that it's already deployed, always enable public mint for testing
        nft.updatePublicMintEnabled(true);

        vm.stopBroadcast();

        return address(nft);
    }

    function run() public {
        string memory root = vm.projectRoot();
        address onchainSteamboatWillieAddress = deployOnchainSteamboatWillies();
        // TODO
        // vm.parseAddress(vm.readFile(string.concat(root, "/onchain-steamboat-willie-address.txt")));

        vm.startBroadcast();

        willieNet = new WillieNet(onchainSteamboatWillieAddress);
        willieNet.mintPublic(3);
        renderer = new Renderer(address(willieNet));
        renderer.mint(3);

        vm.stopBroadcast();
    }
}
