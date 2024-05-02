// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {Net} from "../src/net/Net.sol";
import {NftGatedChat} from "../src/apps/nft-gated-chat/NftGatedChat.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract DeployWillieNetAndNftGatedChat is Script {
    address internal deployer;
    Net internal willieNet;
    NftGatedChat internal chat;

    function setUp() public virtual {}

    function run() public {
        string memory root = vm.projectRoot();

        vm.startBroadcast();
        willieNet = new Net();
        chat = new NftGatedChat(address(willieNet));
        vm.stopBroadcast();
    }
}
