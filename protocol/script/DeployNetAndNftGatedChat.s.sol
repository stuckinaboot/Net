// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {Net} from "../src/net/Net.sol";
import {NftGatedChat} from "../src/apps/nft-gated-chat/NftGatedChat.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract DeployNetAndNftGatedChat is Script {
    address internal deployer;
    Net internal willieNet;
    NftGatedChat internal chat;

    function setUp() public virtual {}

    function run() public {
        string memory root = vm.projectRoot();

        vm.startBroadcast();
        bytes32 salt = 0x979ec4a79031a5275a7db556de32721f47852bedde3c0fec67c947c2349a9820;
        willieNet = new Net{salt: salt}();
        chat = new NftGatedChat(address(willieNet));
        vm.stopBroadcast();

        console.logString("Net address:");
        console.logAddress(address(willieNet));
    }
}
