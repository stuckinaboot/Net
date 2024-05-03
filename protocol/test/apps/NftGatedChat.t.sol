// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {console2} from "forge-std/console2.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdStorage, stdStorage} from "forge-std/StdStorage.sol";
import {Net} from "../../src/net/Net.sol";
import {INet} from "../../src/net/INet.sol";
import {NftGatedChat} from "../../src/apps/nft-gated-chat/NftGatedChat.sol";
import {EventsAndErrors} from "../../src/apps/nft-gated-chat/EventsAndErrors.sol";
import {OnchainSteamboatWillie} from "../../src/onchain-steamboat-willie/OnchainSteamboatWillie.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import {TestUtils} from "../TestUtils.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract NftGatedChatTest is
    EventsAndErrors,
    TestUtils,
    StdCheats,
    IERC721Receiver
{
    using stdStorage for StdStorage;

    StdStorage private stdstore;

    // Test users
    address[10] users;

    uint256 constant NFT_MINT_PRICE = 0.005 ether;

    Net public net = new Net();
    OnchainSteamboatWillie public nft =
        new OnchainSteamboatWillie(bytes32(0), 0, 0);
    NftGatedChat chat = new NftGatedChat(address(net));

    function setUp() public {
        vm.deal(address(this), 1000 ether);

        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }

        nft.updatePublicMintEnabled(true);
    }

    function testSendMessageNotNftOwner() public {
        nft.mintPublic{value: NFT_MINT_PRICE}(1);
        vm.prank(users[0]);
        vm.expectRevert(EventsAndErrors.MsgSenderNotOwnerOfNft.selector);
        chat.sendMessage(address(nft), 1, "Hello, world!");
    }

    function testSendMessageNftOwner() public {
        vm.startPrank(users[0]);
        nft.mintPublic{value: NFT_MINT_PRICE}(1);

        Net.Message memory expectedMessage = INet.Message({
            app: address(chat),
            sender: users[0],
            timestamp: block.timestamp,
            extraData: "",
            text: "Hello, world!",
            topic: Strings.toHexString(uint160(address(nft)), 20)
        });

        chat.sendMessage(address(nft), 1, expectedMessage.text);

        verifyMessage(expectedMessage, net.getMessage(0));
        assertEq(chat.getMessageSender(address(nft), 0), 1);
    }

    // Helpers

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    receive() external payable {}
}
