// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {Net} from "../../../src/net/Net.sol";
import {Inscriptions} from "../../../src/apps/inscriptions/Inscriptions.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract DeployApp is Script {
    address internal deployer;
    Inscriptions internal app;
    address constant NET_ADDRESS =
        address(0x00000000B24D62781dB359b07880a105cD0b64e6);

    function setUp() public virtual {}

    function run() public {
        string memory root = vm.projectRoot();

        vm.startBroadcast();
        bytes32 salt = 0x8778eb550373ae80f95672f08511b2445d5d44311a547477e8ef7de73c4dab41;
        app = new Inscriptions(NET_ADDRESS);
        vm.stopBroadcast();

        console.logString("App address:");
        console.logAddress(address(app));
    }
}
