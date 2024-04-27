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

        bytes32 salt = 0x60166827df91d5dca5dc80461987c8188b945961a18aac7d9c5d641661bf3248;
        address predictedAddress = address(
            uint160(
                uint(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(0x4e59b44847b379578588920cA78FbF26c0B4956C),
                            salt,
                            keccak256(
                                abi.encodePacked(type(WillieNet).creationCode)
                            )
                        )
                    )
                )
            )
        );
        console.logString("Predicted address:");
        console.logAddress(predictedAddress);

        vm.startBroadcast();
        willieNet = new WillieNet{salt: salt}();
        console.logString("Actual address:");
        console.logAddress(address(willieNet));
        vm.stopBroadcast();
    }
}
