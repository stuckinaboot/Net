// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {WillieNet} from "../src/willie-net/WillieNet.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract DeployWillieNet is Script {
    address internal deployer;
    WillieNet internal willieNet;

    function setUp() public virtual {}

    function run() public {
        string memory root = vm.projectRoot();

        vm.startBroadcast();
        willieNet = new WillieNet{
            salt: 0x4e59b44847b379578588920ca78fbf26c0b4956c073919017544a0fed5260008
        }();
        console.logString("Address:");
        console.logAddress(address(willieNet));
        vm.stopBroadcast();
    }
}
