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

    bytes32 key1 = keccak256("key1");
    bytes32 key2 = keccak256("key2");
    bytes32 key3 = keccak256("key3");

    function setUp() public {
        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }

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
        netStorage.put(key1, "abc");
        netStorage.put(key1, "def");
        netStorage.put(key1, "ghi");
        netStorage.put(key2, "123");
        netStorage.put(key2, "456");
        netStorage.put(key2, "789");
    }

    function testStoreAndGetOneValue() public {
        netStorage.put(key1, "abc");
        assertEq(netStorage.get(key1, address(this)), "abc");
    }

    function testStoreAndGetMultipleValues() public {
        vm.startPrank(users[0]);
        netStorage.put(key1, "abc");
        assertEq(netStorage.get(key1, users[0]), "abc");
        netStorage.put(key1, "def");
        assertEq(netStorage.get(key1, users[0]), "def");
        netStorage.put(key1, "ghi");
        assertEq(netStorage.get(key1, users[0]), "ghi");

        vm.startPrank(users[1]);
        netStorage.put(key2, "jfk");
        assertEq(netStorage.get(key2, address(users[1])), "jfk");
        netStorage.put(key2, "lmo");
        assertEq(netStorage.get(key2, address(users[1])), "lmo");
        netStorage.put(key2, "qrs");
        assertEq(netStorage.get(key2, address(users[1])), "qrs");
    }

    function testStoreAndGetSingleKeyMultipleValuesMultipleOperators() public {
        vm.startPrank(users[0]);
        netStorage.put(key1, "abc");
        assertEq(netStorage.get(key1, address(users[0])), "abc");

        vm.startPrank(users[1]);
        netStorage.put(key1, "def");
        assertEq(netStorage.get(key1, address(users[1])), "def");
        assertEq(netStorage.get(key1, address(users[0])), "abc");

        vm.startPrank(users[2]);
        netStorage.put(key1, "ghi");
        assertEq(netStorage.get(key1, address(users[2])), "ghi");
        assertEq(netStorage.get(key1, address(users[1])), "def");
        assertEq(netStorage.get(key1, address(users[0])), "abc");
    }

    function testGetTotalWrites() public {
        vm.startPrank(address(this));
        assertEq(netStorage.getTotalWrites(key1, address(this)), 0);
        netStorage.put(key1, "def");
        assertEq(netStorage.getTotalWrites(key1, address(this)), 1);
        netStorage.put(key1, "ghi");
        assertEq(netStorage.getTotalWrites(key1, address(this)), 2);

        assertEq(netStorage.getTotalWrites(key2, address(this)), 0);
        netStorage.put(key2, "ghi");
        assertEq(netStorage.getTotalWrites(key2, address(this)), 1);
        netStorage.put(key2, "lmo");
        assertEq(netStorage.getTotalWrites(key2, address(this)), 2);
        netStorage.put(key2, "qrs");
        assertEq(netStorage.getTotalWrites(key2, address(this)), 3);

        assertEq(netStorage.getTotalWrites(key1, address(this)), 2);

        assertEq(netStorage.getTotalWrites(key3, address(this)), 0);

        vm.startPrank(users[1]);
        assertEq(netStorage.getTotalWrites(key3, users[1]), 0);
        assertEq(netStorage.getTotalWrites(key1, users[1]), 0);
        netStorage.put(key1, "qrs");
        assertEq(netStorage.getTotalWrites(key1, users[1]), 1);
        netStorage.put(key2, "def");
        assertEq(netStorage.getTotalWrites(key1, users[1]), 1);
        assertEq(netStorage.getTotalWrites(key2, users[1]), 1);
        netStorage.put(key1, "qrs");
        assertEq(netStorage.getTotalWrites(key1, users[1]), 2);
        assertEq(netStorage.getTotalWrites(key2, users[1]), 1);
        assertEq(netStorage.getTotalWrites(key3, address(this)), 0);
        assertEq(netStorage.getTotalWrites(key2, address(this)), 3);

        vm.startPrank(address(this));
        assertEq(netStorage.getTotalWrites(key1, address(this)), 2);
        netStorage.put(key1, "xyz");
        assertEq(netStorage.getTotalWrites(key1, address(this)), 3);
    }

    function testStoreAndGetValueAtIndex() public {}
}
