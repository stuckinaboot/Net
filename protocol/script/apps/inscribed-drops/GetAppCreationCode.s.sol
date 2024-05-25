// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {InscribedDrops} from "../../../src/apps/inscribed-drops/InscribedDrops.sol";

contract GetAppCreationCode is Script {
    function run() public {
        // https://ethereum.stackexchange.com/questions/76334/what-is-the-difference-between-bytecode-init-code-deployed-bytecode-creation
        bytes memory creationCode = type(InscribedDrops).creationCode;
        vm.writeFile(
            "./script/out/creation-code.bin",
            vm.toString(creationCode)
        );
    }
}
