// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {Net} from "../src/net/Net.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract DeployNet is Script {
    address internal deployer;
    Net internal willieNet;

    function setUp() public virtual {}

    function run() public {
        string memory root = vm.projectRoot();

        bytes32 salt = 0x8778eb550373ae80f95672f08511b2445d5d44311a547477e8ef7de73c4dab41;
        address predictedAddress = address(
            uint160(
                uint(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(0x4e59b44847b379578588920cA78FbF26c0B4956C),
                            salt,
                            keccak256(abi.encodePacked(type(Net).creationCode))
                        )
                    )
                )
            )
        );
        console.logString("Predicted address:");
        console.logAddress(predictedAddress);

        // uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // vm.startBroadcast(deployerPrivateKey);
        vm.startBroadcast();
        willieNet = new Net{salt: salt}();
        vm.stopBroadcast();

        console.logString("Actual address:");
        console.logAddress(address(willieNet));
    }
}
