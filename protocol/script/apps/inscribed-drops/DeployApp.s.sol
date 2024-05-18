// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {Net} from "../../../src/net/Net.sol";
import {InscribedDrops} from "../../../src/apps/inscribed-drops/InscribedDrops.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract DeployApp is Script {
    address internal deployer;
    InscribedDrops internal app;

    function setUp() public virtual {}

    function run() public {
        string memory root = vm.projectRoot();
        bytes32 salt = 0xd958548ba700dc992b4e1d2af6942abc3c7027a2cd4b2e56949f57e92deabd8e;

        // uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // vm.startBroadcast(deployerPrivateKey);
        vm.startBroadcast();
        app = new InscribedDrops{salt: salt}();
        vm.stopBroadcast();

        console.logString("App address:");
        console.logAddress(address(app));
    }
}
