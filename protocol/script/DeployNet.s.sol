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

        bytes32 salt = 0x55907c168c574e27db88b930067414f206b306245c0f5212497ad7aad3c0c8a4;
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

        vm.startBroadcast();
        willieNet = new Net{salt: salt}();
        vm.stopBroadcast();

        console.logString("Actual address:");
        console.logAddress(address(willieNet));
    }
}
