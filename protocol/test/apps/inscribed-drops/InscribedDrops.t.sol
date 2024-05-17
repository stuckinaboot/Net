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
import {IERC1155Receiver} from "@openzeppelin/contracts/interfaces/IERC1155Receiver.sol";

contract InscribedDropsTest is PRBTest, StdCheats, IERC1155Receiver {
    using stdStorage for StdStorage;

    StdStorage private stdstore;

    // Test users
    address[10] users;

    InscribedDrops drops = new InscribedDrops();

    address constant NET_ADDRESS =
        address(0x00000000B24D62781dB359b07880a105cD0b64e6);
    Net public net = Net(NET_ADDRESS);

    function setUp() public {
        // Deploy Net code to NET_ADDRESS
        bytes memory code = address(new Net()).code;
        vm.etch(NET_ADDRESS, code);

        vm.deal(address(this), 1000 ether);

        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }
    }

    function testInscribeTokens(
        uint256 mintPrice,
        uint256 maxSupply,
        uint256 mintEndTimestamp,
        string calldata tokenUri
    ) public {
        vm.assume(mintPrice < 1 ether);
        vm.assume(maxSupply < 100000);
        vm.assume(mintEndTimestamp < block.timestamp + 52 weeks);
        vm.startPrank(users[1]);

        for (uint256 i = 0; i < 5; i++) {
            uint256 mintPriceI = mintPrice + i;
            uint256 maxSupplyI = maxSupply + i;
            uint256 mintEndTimestampI = mintEndTimestamp + i;

            bool tokenUriEmpty = bytes(tokenUri).length == 0;
            if (tokenUriEmpty) {
                vm.expectRevert(InscribedDrops.TokenUriEmpty.selector);
            }
            drops.inscribe(mintPriceI, maxSupplyI, mintEndTimestampI, tokenUri);

            // Check total drops
            assertEq(drops.totalDrops(), tokenUriEmpty ? 0 : i + 1);

            // Check total supply
            assertEq(drops.totalSupply(i), tokenUriEmpty ? 0 : 1);

            // Check total net messages for app
            uint256 totalMessages = net.getTotalMessagesForAppCount(
                address(drops)
            );
            assertEq(totalMessages, tokenUriEmpty ? 0 : i + 1);

            if (tokenUriEmpty) {
                return;
            }

            // Check data on token is correct
            Net.Message memory message = net.getMessageForApp(
                totalMessages - 1,
                address(drops)
            );

            // Parse data
            (
                uint256 actualMintPrice,
                uint256 actualMaxSupply,
                uint256 actualMintEndTimestamp
            ) = abi.decode(message.data, (uint256, uint256, uint256));
            assertEq(actualMintPrice, mintPriceI);
            assertEq(actualMaxSupply, maxSupplyI);
            assertEq(actualMintEndTimestamp, mintEndTimestampI);
        }
    }

    function testName() public {
        assertEq(drops.name(), "Net Inscribed Drops");
    }

    function testSymbol() public {
        assertEq(drops.symbol(), "NET");
    }

    function testUri(
        uint256 mintPrice,
        uint256 maxSupply,
        uint256 mintEndTimestamp,
        string calldata tokenUri
    ) public {
        vm.assume(mintPrice < 1 ether);
        vm.assume(maxSupply < 100000);
        vm.assume(mintEndTimestamp < block.timestamp + 52 weeks);
        vm.assume(bytes(tokenUri).length > 0);
        vm.startPrank(users[1]);

        for (uint256 i = 0; i < 5; i++) {
            drops.inscribe(mintPrice, maxSupply, mintEndTimestamp, tokenUri);

            for (uint256 j = 0; j <= i; j++) {
                // No revert
                drops.uri(j);
            }
            vm.expectRevert(InscribedDrops.TokenDoesNotExist.selector);
            drops.uri(i + 1);

            vm.expectRevert(InscribedDrops.TokenDoesNotExist.selector);
            drops.uri(i + 2);
        }
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) external view returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }

    receive() external payable {}
}
