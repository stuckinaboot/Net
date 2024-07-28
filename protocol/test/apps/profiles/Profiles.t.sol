// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {console2} from "forge-std/console2.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdStorage, stdStorage} from "forge-std/StdStorage.sol";
import {Net} from "../../../src/net/Net.sol";
import {Storage} from "../../../src/apps/storage/Storage.sol";
import {Profiles} from "../../../src/apps/profiles/Profiles.sol";
import {PRBTest} from "@prb/test/PRBTest.sol";

contract ProfilesTest is PRBTest, StdCheats {
    using stdStorage for StdStorage;

    event ProfileUpdated(address indexed user);

    StdStorage private stdstore;

    // Test users
    address[10] users;

    address constant NET_ADDRESS =
        address(0x00000000B24D62781dB359b07880a105cD0b64e6);
    // TODO use correct storage address
    address constant STORAGE_ADDRESS =
        address(0x000061e2E84b1662dacA23e1aE2acf7b32793350);
    Net public net;
    Storage public store;
    Profiles public profiles = new Profiles();

    function setUp() public {
        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }

        // Deploy Net to NET_ADDRESS.
        // NOTE: had to use `deployCodeTo` since `vm.etch` would
        // result in Net contract code not being found in Storage.sol during tests
        deployCodeTo("Net.sol", "", NET_ADDRESS);
        net = Net(NET_ADDRESS);

        // Deploy Storage to STORAGE_ADDRESS
        deployCodeTo("Storage.sol", "", STORAGE_ADDRESS);
        store = Storage(STORAGE_ADDRESS);
    }

    function testSetFullProfile() public {
        profiles.setFullProfile(1, address(0), 1, "title", "body");
    }
}
