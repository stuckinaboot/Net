// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {OnchainSteamboatWillie} from "../src/onchain-steamboat-willie/OnchainSteamboatWillie.sol";
import {WillieNet} from "../src/willie-net/WillieNet.sol";
import {Renderer} from "../src/willie-net/renderer/Renderer.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract DeployNFT is Script {
    address internal deployer;
    WillieNet internal willieNet;
    Renderer internal renderer;

    function setUp() public virtual {}

    function run() public {
        string memory root = vm.projectRoot();
        address onchainSteamboatWillieAddress = address(0);
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
