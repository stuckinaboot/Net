// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {BazaarV1} from "../../../src/apps/bazaar/BazaarV1.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract DeployApp is Script {
    address internal deployer;
    BazaarV1 internal app;

    function setUp() public virtual {}

    function run() public {
        string memory root = vm.projectRoot();
        bytes32 salt = 0xd95417bf80bdb9e77286b6eaaeab7eb4b4e1cc71a20c0e898ae18f42fcc03f56;

        // uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // vm.startBroadcast(deployerPrivateKey);
        vm.startBroadcast();
        app = new BazaarV1{salt: salt}();
        vm.stopBroadcast();

        console.logString("App address:");
        console.logAddress(address(app));
    }
}
