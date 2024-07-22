// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Script, console} from "forge-std/Script.sol";
import {BazaarV1} from "../../../src/apps/bazaar/BazaarV1.sol";

contract GetAppCreationCode is Script {
    function run() public {
        // https://ethereum.stackexchange.com/questions/76334/what-is-the-difference-between-bytecode-init-code-deployed-bytecode-creation
        bytes memory creationCode = type(BazaarV1).creationCode;
        vm.writeFile(
            "./script/out/creation-code.bin",
            vm.toString(creationCode)
        );
    }
}
