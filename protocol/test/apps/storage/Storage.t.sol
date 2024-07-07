// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {console2} from "forge-std/console2.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdStorage, stdStorage} from "forge-std/StdStorage.sol";
import {Net} from "../../../src/net/Net.sol";
import {Storage} from "../../../src/apps/storage/Storage.sol";
import {PRBTest} from "@prb/test/PRBTest.sol";

contract StorageTest is PRBTest, StdCheats {
    using stdStorage for StdStorage;

    StdStorage private stdstore;

    // Test users
    address[10] users;

    Storage netStorage;

    address constant NET_ADDRESS =
        address(0x00000000B24D62781dB359b07880a105cD0b64e6);
    Net public net;

    function setUp() public {
        // Deploy Net code to NET_ADDRESS
        net = Net(NET_ADDRESS);
        bytes memory code = address(new Net()).code;
        vm.etch(NET_ADDRESS, code);
    }

    function testStoreData() public {}

    function testStoreAndGetData() public {}
}
