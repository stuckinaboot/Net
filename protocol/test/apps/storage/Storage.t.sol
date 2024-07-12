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

    event Stored(bytes32 indexed key, address indexed operator);

    StdStorage private stdstore;

    // Test users
    address[10] users;

    Storage netStorage = new Storage();

    address constant NET_ADDRESS =
        address(0x00000000B24D62781dB359b07880a105cD0b64e6);
    Net public net;

    bytes32 key1=keccak256("key1");
        bytes32 key2=keccak256("key2");
        bytes32 key3=keccak256("key3"); 

    function setUp() public {
        // Deploy Net code to NET_ADDRESS
        net = Net(NET_ADDRESS);
        bytes memory code = address(new Net()).code;
        vm.etch(NET_ADDRESS, code);
    }

    function testStoreOneKeyOneValue() public {
        netStorage.put(bytes32(0), "abc");
    }

    function testStoreOneKeyMultipleValues() public {
        netStorage.put(bytes32(0), "abc");
        netStorage.put(bytes32(0), "def");
        netStorage.put(bytes32(0), "ghi");
    }

    function testStoreMultipleKeysOneValueEach() public {
        netStorage.put(key1, "abc");
        netStorage.put(key2, "def");
        netStorage.put(key3, "ghi");
    }

    function testStoreMultipleKeysMultipleValues() public {

    function testStoreAndGetOneValue() public {}

    function testStoreAndGetMultipleValues() public {}

    function testStoreAndGetMultipleValuesMultipleOperators() public {}

    function testGetTotalWrites() public {}

    function testStoreAndGetValueAtIndex() public {}
}
 