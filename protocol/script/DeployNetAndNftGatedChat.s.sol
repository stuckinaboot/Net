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
        bytes32 salt = 0xeef2100da60bafc7402aacb06b31cff098a50e334bf4e6678bbf4ebe99c5b16e;
        willieNet = new Net{salt: salt}();
        chat = new NftGatedChat(address(willieNet));
        vm.stopBroadcast();

        console.logString("Net address:");
        console.logAddress(address(willieNet));
    }
}
