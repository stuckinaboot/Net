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
        address(0x00000000B24D62781DB359B07880A105cd0b64e5);
    Net public net;
    Storage public store;
    Profiles public profiles = new Profiles();

    function setUp() public {
        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }

        // Deploy Net code to NET_ADDRESS
        net = Net(NET_ADDRESS);
        bytes memory netCode = address(new Net()).code;
        vm.etch(NET_ADDRESS, netCode);

        // Deploy Storage code to STORAGE_ADDRESS
        store = Storage(STORAGE_ADDRESS);
        bytes memory storeCode = address(new Storage()).code;
        vm.etch(STORAGE_ADDRESS, storeCode);

        net.sendMessage("abc", "def", "");
        // store.put(keccak256(abi.encodePacked(address(0))), bytes("abc"));
    }

    function testSetProfile() public {
        // profiles.setFullProfile(1, address(0), 1, "title", "body");
    }
}
