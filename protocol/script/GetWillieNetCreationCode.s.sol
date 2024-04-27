// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {WillieNet} from "../src/willie-net/WillieNet.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract GetWillieNetCreationCode is Script {
    address internal deployer;
    WillieNet internal willieNet;

    function setUp() public virtual {}

    function bytes32ToString(
        bytes32 _bytes32
    ) public pure returns (string memory) {
        uint8 i = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    function run() public {
        string memory root = vm.projectRoot();

        // https://ethereum.stackexchange.com/questions/76334/what-is-the-difference-between-bytecode-init-code-deployed-bytecode-creation
        bytes memory initCode = type(WillieNet).creationCode;
        bytes32 creationCodeHash = keccak256(initCode);
        console.logString("Init code hash:");
        console.logBytes32(creationCodeHash);
    }
}
