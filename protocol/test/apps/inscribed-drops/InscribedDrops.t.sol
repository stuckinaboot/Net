// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {console2} from "forge-std/console2.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdStorage, stdStorage} from "forge-std/StdStorage.sol";
import {Net} from "../../../src/net/Net.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {InscribedDrops} from "../../../src/apps/inscribed-drops/InscribedDrops.sol";
import {PRBTest} from "@prb/test/PRBTest.sol";

contract InscribedDropsTest is PRBTest, StdCheats {
    using stdStorage for StdStorage;

    StdStorage private stdstore;

    // Test users
    address[10] users;

    Net public net = new Net();
    InscribedDrops drops = new InscribedDrops();

    function setUp() public {
        vm.deal(address(this), 1000 ether);

        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }
    }

    function testInscribe() public {
        string memory tokenUri = "abc";
        uint256 mintPrice = 1;
        uint256 maxSupply = 1;
        uint256 mintEndTimestamp = 2;
        drops.inscribe(mintPrice, maxSupply, mintEndTimestamp, "abc");

        // Check total drops
        assertEq(drops.totalDrops(), 1);

        // Check total supply
        assertEq(drops.totalSupply(0), 1);
    }

    receive() external payable {}
}
