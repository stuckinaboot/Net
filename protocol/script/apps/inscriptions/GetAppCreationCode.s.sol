// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {Inscriptions} from "../../../src/apps/inscriptions/Inscriptions.sol";

contract GetAppCreationCode is Script {
    function run() public {
        // https://ethereum.stackexchange.com/questions/76334/what-is-the-difference-between-bytecode-init-code-deployed-bytecode-creation
        bytes memory creationCode = type(Inscriptions).creationCode;
        vm.writeFile(
            "./script/out/app/inscriptions/creation-code.bin",
            vm.toString(creationCode)
        );
    }
}
