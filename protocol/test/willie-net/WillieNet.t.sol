// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {PRBTest} from "@prb/test/PRBTest.sol";
import {console2} from "forge-std/console2.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdStorage, stdStorage} from "forge-std/StdStorage.sol";
import {WillieNet} from "../../src/willie-net/WillieNet.sol";
import {IWillieNet} from "../../src/willie-net/IWillieNet.sol";
import {Constants} from "../../src/willie-net/Constants.sol";
import {TwoStepOwnable} from "../../src/utils/TwoStepOwnable.sol";
import {EventsAndErrors} from "../../src/willie-net/EventsAndErrors.sol";
import {IERC721A} from "@erc721a/ERC721A.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Utils} from "../../src/utils/Utils.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import {TwoStepOwnable} from "../../src/utils/TwoStepOwnable.sol";
import {OnchainSteamboatWillie} from "../../src/willie-net/onchain-steamboat-willie/OnchainSteamboatWillie.sol";
import {Renderer} from "../../src/willie-net/renderer/Renderer.sol";
import {TestUtils} from "./TestUtils.sol";

contract WillieNetTest is
    TestUtils,
    EventsAndErrors,
    Constants,
    PRBTest,
    StdCheats,
    IERC721Receiver
{
    using stdStorage for StdStorage;

    StdStorage private stdstore;
    uint256 _MINT_AMOUNT_DURING_COMMENCE = 0;

    // Test users
    address[100] users;

    uint16 ALLOWLIST_MINT_CAP = 45;
    uint8 ALLOWLIST_MINT_MAX_PER_WALLET = 15;
    OnchainSteamboatWillie public willie =
        new OnchainSteamboatWillie(
            bytes32(0),
            ALLOWLIST_MINT_CAP,
            ALLOWLIST_MINT_MAX_PER_WALLET
        );
    WillieNet public nft = new WillieNet(address(willie));

    constructor() TestUtils(nft) {}

    function setUp() public {
        vm.deal(address(this), 1000 ether);

        willie.setArt(0, "abc");
        willie.setArt(1, "def");
        willie.setArt(2, "ghi");
        willie.updatePublicMintEnabled(true);

        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }
    }

    function verifyMessage(
        WillieNet.Message memory expectedMessage,
        WillieNet.Message memory actualMessage
    ) public {
        assertEq(actualMessage.senderTokenId, expectedMessage.senderTokenId);
        assertEq(actualMessage.sender, expectedMessage.sender);
        assertEq(actualMessage.timestamp, expectedMessage.timestamp);
        assertEq(actualMessage.extraData, expectedMessage.extraData);
        assertEq(actualMessage.message, expectedMessage.message);
        assertEq(actualMessage.topic, expectedMessage.topic);
    }

    function sendAndVerifyMessage(
        address user,
        uint256 senderTokenId,
        string memory messageContents,
        string memory topic
    ) public {
        uint256 currMessagesLength = nft.getTotalMessagesCount();
        uint256 topicMessagesLength = nft.getTotalMessagesForTopicCount(topic);
        uint256 userMessagesLength = nft.getTotalMessagesForUserCount(user);
        uint256 senderTokenIdMessagesLength = nft
            .getTotalMessagesForSenderTokenIdCount(senderTokenId);

        vm.startPrank(user);
        vm.expectEmit(true, true, true, false);
        emit MessageSent(topic, user, currMessagesLength);
        nft.sendMessage(senderTokenId, bytes32(0), messageContents, topic);
        vm.stopPrank();

        WillieNet.Message memory expectedMessage = IWillieNet.Message({
            senderTokenId: senderTokenId,
            sender: user,
            timestamp: block.timestamp,
            extraData: bytes32(0),
            message: messageContents,
            topic: topic
        });

        // Verify message fetched via get message
        WillieNet.Message memory messageGlobal = nft.getMessage(
            currMessagesLength
        );
        verifyMessage(expectedMessage, messageGlobal);

        // Verify message fetched via get message for topic
        WillieNet.Message memory messageTopic = nft.getMessageForTopic(
            topicMessagesLength,
            topic
        );
        verifyMessage(expectedMessage, messageTopic);

        // Verify message fetched via get message for user
        WillieNet.Message memory messageUser = nft.getMessageForUser(
            userMessagesLength,
            user
        );
        verifyMessage(expectedMessage, messageUser);

        // Verify message fetched via get message for sender
        WillieNet.Message memory messageSender = nft.getMessageForSender(
            senderTokenIdMessagesLength,
            senderTokenId
        );
        verifyMessage(expectedMessage, messageSender);
    }

    function testSendOneMessage(bool notableMint) public {
        mint(notableMint, 1);

        string
            memory messageContents = "hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hell";
        string memory topic = "Topic";
        sendAndVerifyMessage(address(this), 1, messageContents, topic);
    }

    function testSendMultipleMessagesOnSameToken(bool notableMint) public {
        mint(notableMint, 1);

        sendAndVerifyMessage(address(this), 1, "message 1", "t1");
        sendAndVerifyMessage(address(this), 1, "message 2", "t2");
        sendAndVerifyMessage(address(this), 1, "message 3", "t3");
    }

    function testSendMultipleMessagesOnDifferentTokens(
        bool notableMint
    ) public {
        mint(notableMint, 3);

        sendAndVerifyMessage(address(this), 1, "message 1", "t1");
        sendAndVerifyMessage(address(this), 2, "message 2", "t2");
        sendAndVerifyMessage(address(this), 3, "message 3", "t3");
    }

    function testSendMultipleMessagesOnDifferentTokensFromDifferentUsers(
        bool notableMint
    ) public {
        for (uint256 i; i < 3; i++) {
            vm.startPrank(users[i]);
            mint(notableMint, 1);
            vm.stopPrank();
            assertEq(nft.ownerOf(i + 1), users[i]);
        }

        sendAndVerifyMessage(users[0], 1, "message 1", "t1");
        sendAndVerifyMessage(users[1], 2, "message 2", "t2");
        sendAndVerifyMessage(users[2], 3, "message 3", "t3");
    }

    function testSendOneMessageRevertsWhenUserNotOwner(
        bool notableMint
    ) public {
        mint(notableMint, 1);

        vm.startPrank(users[1]);
        vm.expectRevert(EventsAndErrors.UserNotTokenOwner.selector);
        nft.sendMessage(1, bytes32(0), "hello", "Topic");
    }

    function testOneMint(bool notableMint) external {
        mint(notableMint, 5);
    }

    function testMint(uint256 numToMint, bool notableMint) external {
        vm.assume(numToMint < 20);

        for (uint256 i = 1; i < users.length && i <= numToMint; i++) {
            vm.startPrank(users[i]);

            if (notableMint) {
                nft.mintPublicNotable{value: nft.PRICE()}(1);
            } else {
                nft.mintPublic(1);
            }

            vm.stopPrank();
            assertEq(nft.ownerOf(i), users[i]);
        }
        // Owner of 0 should always revert
        vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
        nft.ownerOf(0);
        // Both these ownerOf calls should succeed
        if (numToMint >= 1) {
            nft.ownerOf(1);
        }
    }

    function testMintIncorrectPriceError(uint256 invalidPrice) external {
        vm.assume(invalidPrice < 0.01 ether);
        vm.assume(invalidPrice != PRICE);

        vm.expectRevert(EventsAndErrors.IncorrectPayment.selector);
        nft.mintPublicNotable{value: invalidPrice}(1);
    }

    // function testTokenUriForNonExistentToken() public {
    //
    //     vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
    //     nft.tokenURI(0);

    //     vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
    //     nft.tokenURI(1);

    //     nft.mintPublic{ value: PRICE }(1);
    //     nft.tokenURI(1);

    //     vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
    //     nft.tokenURI(2);
    // }

    // Mainly used for local testing
    // function testTokenUriForExistingToken() public {
    //
    //     uint256 amount = 201;

    //     for (uint256 i = 0; i < amount; i++) {
    //         nft.mintPublic{ value: nft.PRICE() }(1);
    //     }
    //     emit LogNamedString("Token URI", nft.tokenURI(amount));
    // }

    // function testArt() external {
    //
    //     nft.mintPublic{ value: nft.PRICE() }(1);
    //     nft.mintPublic{ value: nft.PRICE() }(1);
    //     emit LogNamedString("Art", nft.art(2));
    // }

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

    // Outdated but keeping around for now

    // function testPublicMintExceedMaxPerTransaction(uint8 amount) public {
    //     // TODO implement test
    //     vm.assume(amount > 0 && amount < 25);
    // }

    // function testIterativelyMintToMaxSupply(bool notableMint) public {
    //     // Iteratively mint maxSupply tokens
    //     uint256 amtRemaining = MAX_SUPPLY;
    //     uint256 price = nft.PRICE();
    //     while (amtRemaining > 0) {
    //         uint256 amtToMint = amtRemaining > 200 ? 200 : amtRemaining;
    //         uint256 totalValue = amtToMint * price;
    //         if (notableMint) {
    //             nft.mintPublicNotable{ value: totalValue }(uint8(amtToMint));
    //         } else {
    //             nft.mintPublic(uint8(amtToMint));
    //         }

    //         amtRemaining -= amtToMint;
    //     }

    //     assertEq(nft.totalSupply(), MAX_SUPPLY);

    //     // Expect a revert when attempting to mint more than max supply
    //     vm.expectRevert(MaxSupplyReached.selector);
    //     if (notableMint) {
    //         nft.mintPublicNotable{ value: price }(1);
    //     } else {
    //         nft.mintPublic(1);
    //     }
    // }
}
