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
        bytes32 salt = 0x55b65043934328110df71d1ca0eb2d9f40564e53b660da828320332809f4db6d;

        // uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // vm.startBroadcast(deployerPrivateKey);
        vm.startBroadcast();
        app = new InscribedDrops{salt: salt}();
        vm.stopBroadcast();

        console.logString("App address:");
        console.logAddress(address(app));
    }
}
