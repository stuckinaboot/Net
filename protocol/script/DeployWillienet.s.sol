// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
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

        vm.startBroadcast();
        willieNet = new WillieNet();
        vm.stopBroadcast();
    }
}
