// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {PRBTest} from "@prb/test/PRBTest.sol";
import {console2} from "forge-std/console2.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdStorage, stdStorage} from "forge-std/StdStorage.sol";
import {WillieNet} from "../../src/willie-net/WillieNet.sol";
import {IWillieNet} from "../../src/willie-net/IWillieNet.sol";
import {Constants} from "../../src/willie-net/Constants.sol";
import {EventsAndErrors} from "../../src/willie-net/EventsAndErrors.sol";
import {IERC721A} from "@erc721a/ERC721A.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
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

    // Test users
    address[100] users;

    WillieNet public net = new WillieNet();

    constructor() TestUtils(net) {}

    function setUp() public {
        vm.deal(address(this), 1000 ether);

        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }
    }

    function verifyMessage(
        WillieNet.Message memory expectedMessage,
        WillieNet.Message memory actualMessage
    ) public {
        assertEq(actualMessage.sender, expectedMessage.sender);
        assertEq(actualMessage.timestamp, expectedMessage.timestamp);
        assertEq(actualMessage.extraData, expectedMessage.extraData);
        assertEq(actualMessage.message, expectedMessage.message);
        assertEq(actualMessage.topic, expectedMessage.topic);
    }

    function sendAndVerifyMessage(
        address user,
        string memory messageContents,
        string memory topic
    ) public {
        uint256 currMessagesLength = net.getTotalMessagesCount();
        uint256 topicMessagesLength = net.getTotalMessagesForTopicCount(topic);
        uint256 userMessagesLength = net.getTotalMessagesForUserCount(user);

        // TODO use net contract-token
        // uint256 senderTokenIdMessagesLength = net
        //     .getTotalMessagesForSenderTokenIdCount(senderTokenId);

        vm.startPrank(user);
        vm.expectEmit(true, true, true, false);
        emit MessageSent(topic, user, address(0), currMessagesLength);
        net.sendMessage(address(0), 0, bytes32(0), messageContents, topic);
        vm.stopPrank();

        WillieNet.Message memory expectedMessage = IWillieNet.Message({
            sender: user,
            senderNftContract: address(0),
            senderNftTokenId: 0,
            timestamp: block.timestamp,
            extraData: bytes32(0),
            message: messageContents,
            topic: topic
        });

        // Verify message fetched via get message
        WillieNet.Message memory messageGlobal = net.getMessage(
            currMessagesLength
        );
        verifyMessage(expectedMessage, messageGlobal);

        // Verify message fetched via get message for topic
        WillieNet.Message memory messageTopic = net.getMessageForTopic(
            topicMessagesLength,
            topic
        );
        verifyMessage(expectedMessage, messageTopic);

        // Verify message fetched via get message for user
        WillieNet.Message memory messageUser = net.getMessageForUser(
            userMessagesLength,
            user
        );
        verifyMessage(expectedMessage, messageUser);

        // Verify message fetched via get message for sender
        // TODO add verification for contract-token
        // WillieNet.Message memory messageSender = net.getMessageForSender(
        //     // TODO update
        //     0,
        //     // senderTokenIdMessagesLength,
        //     // TODO update
        //     0
        // );
        // verifyMessage(expectedMessage, messageSender);
    }

    function testSendOneMessage() public {
        string
            memory messageContents = "hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hell";
        string memory topic = "Topic";
        sendAndVerifyMessage(address(this), messageContents, topic);
    }

    function testSendMultipleMessagesOnSameToken() public {
        sendAndVerifyMessage(address(this), "message 1", "t1");
        sendAndVerifyMessage(address(this), "message 2", "t2");
        sendAndVerifyMessage(address(this), "message 3", "t3");
    }

    function testSendMultipleMessagesOnDifferentTokens() public {
        // TODO update for net-based test

        sendAndVerifyMessage(address(this), "message 1", "t1");
        sendAndVerifyMessage(address(this), "message 2", "t2");
        sendAndVerifyMessage(address(this), "message 3", "t3");
    }

    function testSendMultipleMessagesFromDifferentUsers() public {
        sendAndVerifyMessage(users[0], "message 1", "t1");
        sendAndVerifyMessage(users[1], "message 2", "t2");
        sendAndVerifyMessage(users[2], "message 3", "t3");
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
