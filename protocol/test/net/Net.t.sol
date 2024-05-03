// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {PRBTest} from "@prb/test/PRBTest.sol";
import {console2} from "forge-std/console2.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdStorage, stdStorage} from "forge-std/StdStorage.sol";
import {Net} from "../../src/net/Net.sol";
import {INet} from "../../src/net/Net.sol";
import {EventsAndErrors} from "../../src/net/EventsAndErrors.sol";
import {IERC721A} from "@erc721a/ERC721A.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import {TestUtils} from "../TestUtils.sol";
import {OnchainSteamboatWillie} from "../../src/onchain-steamboat-willie/OnchainSteamboatWillie.sol";

contract NetTest is TestUtils, EventsAndErrors, StdCheats, IERC721Receiver {
    using stdStorage for StdStorage;

    StdStorage private stdstore;

    // Test users
    address[10] users;

    Net public net = new Net();
    OnchainSteamboatWillie public nft =
        new OnchainSteamboatWillie(bytes32(0), 0, 0);

    constructor() {}

    function setUp() public {
        vm.deal(address(this), 1000 ether);

        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }

        nft.updatePublicMintEnabled(true);
    }

    function sendAndVerifyMessage(
        address user,
        address app,
        string memory messageContents,
        string memory topic,
        bytes memory extraData
    ) public {
        bool isEmptyMessageContents = bytes(messageContents).length == 0 &&
            bytes(extraData).length == 0;

        uint256 currMessagesLength = net.getTotalMessagesCount();
        uint256 topicMessagesLength = net.getTotalMessagesForAppTopicCount(
            app,
            topic
        );

        if (app != address(0)) {
            // Send message via app
            vm.startPrank(app);
            if (isEmptyMessageContents) {
                vm.expectRevert(EventsAndErrors.MsgEmpty.selector);
            } else {
                vm.expectEmit(true, true, true, false);
                emit MessageSentViaApp(app, user, topic, currMessagesLength);
            }
            net.sendMessageViaApp(user, messageContents, topic, extraData);
            vm.stopPrank();
        } else {
            // Send message from user
            vm.startPrank(user);
            if (isEmptyMessageContents) {
                vm.expectRevert(EventsAndErrors.MsgEmpty.selector);
            } else {
                vm.expectEmit(true, true, true, false);
                emit MessageSent(user, topic, currMessagesLength);
            }
            net.sendMessage(messageContents, topic, extraData);
            vm.stopPrank();
        }

        if (isEmptyMessageContents) {
            return;
        }

        Net.Message memory expectedMessage = INet.Message({
            app: app,
            sender: user,
            timestamp: block.timestamp,
            extraData: extraData,
            text: messageContents,
            topic: topic
        });

        // Verify message fetched via get message
        {
            Net.Message memory messageGlobal = net.getMessage(
                currMessagesLength
            );
            verifyMessage(expectedMessage, messageGlobal);
        }

        // Verify message fetched via get message for app
        {
            Net.Message memory messageApp = net.getMessageForApp(
                net.getTotalMessagesForAppCount(app) - 1,
                app
            );
            verifyMessage(expectedMessage, messageApp);

            // Check get message via hash count to ensure this returns same value as getting message via app count
            assertEq(
                net.getTotalMessagesForAppCount(app),
                net.getTotalMessagesForHashCount(
                    keccak256(abi.encodePacked(app))
                )
            );

            uint256 msgIdx = net.getMessageIdxForApp(
                net.getTotalMessagesForAppCount(app) - 1,
                app
            );
            assertEq(msgIdx, currMessagesLength);
        }

        // Verify message fetched via get message for topic
        {
            Net.Message memory messageTopic = net.getMessageForAppTopic(
                topicMessagesLength,
                app,
                topic
            );
            verifyMessage(expectedMessage, messageTopic);

            uint256 msgIdx = net.getMessageIdxForAppTopic(
                topicMessagesLength,
                app,
                topic
            );
            assertEq(msgIdx, currMessagesLength);
        }

        // Verify message fetched via get message for user
        {
            uint256 userMessagesLength = net.getTotalMessagesForAppUserCount(
                app,
                user
            );
            Net.Message memory messageUser = net.getMessageForAppUser(
                userMessagesLength - 1,
                app,
                user
            );
            verifyMessage(expectedMessage, messageUser);

            uint256 msgIdx = net.getMessageIdxForAppUser(
                userMessagesLength - 1,
                app,
                user
            );
            assertEq(msgIdx, currMessagesLength);
        }

        // Verify message fetched via app user topic
        {
            uint256 appUserTopicMessagesLength = net
                .getTotalMessagesForAppUserTopicCount(app, user, topic);
            Net.Message memory messageAppUserTopic = net
                .getMessageForAppUserTopic(
                    appUserTopicMessagesLength - 1,
                    app,
                    user,
                    topic
                );
            verifyMessage(expectedMessage, messageAppUserTopic);
            uint256 msgIdx = net.getMessageIdxForAppUserTopic(
                appUserTopicMessagesLength - 1,
                app,
                user,
                topic
            );
            assertEq(msgIdx, currMessagesLength);
        }
    }

    function testSendOneMessage(
        address app,
        string calldata messageContents,
        string calldata topic,
        bytes calldata extraData
    ) public {
        sendAndVerifyMessage(
            address(this),
            app,
            messageContents,
            topic,
            extraData
        );
    }

    function testSendMultipleMessagesFromSameUserSameApp(
        address app,
        bytes calldata extraData
    ) public {
        sendAndVerifyMessage(address(this), app, "message 1", "t1", extraData);
        sendAndVerifyMessage(address(this), app, "message 2", "t2", extraData);
        sendAndVerifyMessage(address(this), app, "message 3", "t3", extraData);
    }

    function testSendMultipleMessagesFromDifferentUsersSameApp(
        address app,
        bytes calldata extraData
    ) public {
        sendAndVerifyMessage(users[0], app, "message 1", "t1", extraData);
        sendAndVerifyMessage(users[1], app, "message 2", "t2", extraData);
        sendAndVerifyMessage(users[2], app, "message 3", "t3", extraData);
    }

    function testSendMultipleMessagesFromDifferentUsersDifferentApp(
        address app1,
        address app2,
        address app3,
        bytes calldata extraData
    ) public {
        sendAndVerifyMessage(users[0], app1, "message 1", "t1", extraData);
        sendAndVerifyMessage(users[0], app1, "message 1.1", "t1", extraData);
        sendAndVerifyMessage(users[1], app2, "message 2", "t2", extraData);
        sendAndVerifyMessage(users[1], app2, "message 2.2", "t2", extraData);
        sendAndVerifyMessage(users[2], app3, "message 3", "t3", extraData);
        sendAndVerifyMessage(users[2], app3, "message 3.3", "t3", extraData);
    }

    function testSendMultipleMessagesAndQueryFullMessageRangeSingleUser(
        address app,
        bytes calldata extraData
    ) public {
        address user = users[0];
        string memory topic = "topic";
        Net.Message[] memory sentMsgs = sendAndVerifyMultipleMessages(
            5,
            app,
            user,
            topic,
            extraData
        );

        // Check querying all messages works properly
        {
            uint256 maxEndIdx = net.getTotalMessagesCount();
            Net.Message[] memory expectedMessages = net.getMessagesInRange(
                0,
                maxEndIdx
            );
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i]);
            }
        }

        {
            uint256 maxEndIdx = net.getTotalMessagesForAppCount(app);
            Net.Message[] memory expectedMessages = net
                .getMessagesInRangeForApp(0, maxEndIdx, app);
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i]);
            }
        }

        {
            uint256 maxEndIdx = net.getTotalMessagesForAppUserCount(app, user);
            Net.Message[] memory expectedMessages = net
                .getMessagesInRangeForAppUser(0, maxEndIdx, app, user);
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i]);
            }
        }

        {
            uint256 maxEndIdx = net.getTotalMessagesForAppUserTopicCount(
                app,
                user,
                topic
            );
            if (maxEndIdx == 0) {
                vm.expectRevert(EventsAndErrors.InvalidRange.selector);
            }
            Net.Message[] memory expectedMessages = net
                .getMessagesInRangeForAppUserTopic(
                    0,
                    maxEndIdx,
                    app,
                    user,
                    topic
                );
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i]);
            }
        }
    }

    function testSendMultipleMessagesAndQueryPartialMessageRangeForAllMessagesSingleUser(
        address app,
        bytes calldata extraData
    ) public {
        address user = users[0];
        string memory topic = "topic";
        Net.Message[] memory sentMsgs = sendAndVerifyMultipleMessages(
            5,
            app,
            user,
            topic,
            extraData
        );

        // Check querying all messages works properly
        {
            // Query partial range from start
            Net.Message[] memory expectedMessages = net.getMessagesInRange(
                0,
                2
            );
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i]);
            }

            // Query partial range in middle
            expectedMessages = net.getMessagesInRange(1, 4);
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i + 1]);
            }

            // Query partial range at end
            expectedMessages = net.getMessagesInRange(2, 5);
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i + 2]);
            }
        }
    }

    function testSendMultipleMessagesAndQueryPartialMessageRangeForAppMessagesSingleUser(
        address app,
        bytes calldata extraData
    ) public {
        address user = users[0];
        string memory topic = "topic";
        Net.Message[] memory sentMsgs = sendAndVerifyMultipleMessages(
            5,
            app,
            user,
            topic,
            extraData
        );

        // Check querying all messages works properly
        {
            // Query partial range from start
            Net.Message[] memory expectedMessages = net
                .getMessagesInRangeForApp(0, 2, app);
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i]);
            }

            // Query partial range in middle
            expectedMessages = net.getMessagesInRangeForApp(1, 4, app);
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i + 1]);
            }

            // Query partial range at end
            expectedMessages = net.getMessagesInRangeForApp(2, 5, app);
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i + 2]);
            }
        }
    }

    function testSendMultipleMessagesAndQueryPartialMessageRangeForAppTopicMessagesSingleUser(
        address app,
        bytes calldata extraData
    ) public {
        address user = users[0];
        string memory topic = "topic";
        Net.Message[] memory sentMsgs = sendAndVerifyMultipleMessages(
            5,
            app,
            user,
            topic,
            extraData
        );

        // Check querying all messages works properly
        {
            // Query partial range from start
            Net.Message[] memory expectedMessages = net
                .getMessagesInRangeForAppTopic(0, 2, app, topic);
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i]);
            }

            // Query partial range in middle
            expectedMessages = net.getMessagesInRangeForAppTopic(
                1,
                4,
                app,
                topic
            );
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i + 1]);
            }

            // Query partial range at end
            expectedMessages = net.getMessagesInRangeForAppTopic(
                2,
                5,
                app,
                topic
            );
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i + 2]);
            }
        }
    }

    function testSendMultipleMessagesAndQueryPartialMessageRangeForAppUserTopicMessagesSingleUser(
        address app,
        bytes calldata extraData
    ) public {
        address user = users[0];
        string memory topic = "topic";
        Net.Message[] memory sentMsgs = sendAndVerifyMultipleMessages(
            5,
            app,
            user,
            topic,
            extraData
        );

        // Check querying all messages works properly
        {
            // Query partial range from start
            Net.Message[] memory expectedMessages = net
                .getMessagesInRangeForAppUserTopic(0, 2, app, user, topic);
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i]);
            }

            // Query partial range in middle
            expectedMessages = net.getMessagesInRangeForAppUserTopic(
                1,
                4,
                app,
                user,
                topic
            );
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i + 1]);
            }

            // Query partial range at end
            expectedMessages = net.getMessagesInRangeForAppUserTopic(
                2,
                5,
                app,
                user,
                topic
            );
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i + 2]);
            }
        }
    }

    function testSendMultipleMessagesAndQueryPartialMessageRangeForAppUserMessagesSingleUser(
        address app,
        bytes calldata extraData
    ) public {
        address user = users[0];
        string memory topic = "topic";
        Net.Message[] memory sentMsgs = sendAndVerifyMultipleMessages(
            5,
            app,
            user,
            topic,
            extraData
        );

        // Check querying all messages works properly
        {
            // Query partial range from start
            Net.Message[] memory expectedMessages = net
                .getMessagesInRangeForAppUser(0, 2, app, user);
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i]);
            }

            // Query partial range in middle
            expectedMessages = net.getMessagesInRangeForAppUser(
                1,
                4,
                app,
                user
            );
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i + 1]);
            }

            // Query partial range at end
            expectedMessages = net.getMessagesInRangeForAppUser(
                2,
                5,
                app,
                user
            );
            for (uint256 i; i < expectedMessages.length; i++) {
                verifyMessage(expectedMessages[i], sentMsgs[i + 2]);
            }
        }
    }

    function testSendEmptyMessageExpectsRevert(
        address app,
        string calldata text,
        bytes calldata extraData
    ) public {
        vm.assume(bytes(text).length > 0);
        vm.assume(bytes(extraData).length > 0);

        // Just empty text
        sendAndVerifyMessage(users[0], app, "", "Topic", extraData);

        // Just empty extraData
        bytes memory empty;
        sendAndVerifyMessage(users[0], app, text, "Topic", empty);

        // Both empty text and extra data
        sendAndVerifyMessage(users[0], app, "", "Topic", empty);
    }

    function testGetMessagesInRangeInvalidRangeReverts(
        uint256 startIdx,
        uint256 endIdx,
        bytes32 hashVal,
        address app,
        address user,
        string calldata topic
    ) public {
        vm.assume(startIdx < 100);
        vm.assume(endIdx < 100);
        vm.assume(startIdx >= endIdx);

        vm.expectRevert(EventsAndErrors.InvalidRange.selector);
        net.getMessagesInRange(startIdx, endIdx);

        vm.expectRevert(EventsAndErrors.InvalidRange.selector);
        net.getMessagesInRangeForApp(startIdx, endIdx, app);

        vm.expectRevert(EventsAndErrors.InvalidRange.selector);
        net.getMessagesInRangeForAppUser(startIdx, endIdx, app, user);

        vm.expectRevert(EventsAndErrors.InvalidRange.selector);
        net.getMessagesInRangeForAppTopic(startIdx, endIdx, app, topic);

        vm.expectRevert(EventsAndErrors.InvalidRange.selector);
        net.getMessagesInRangeForAppUserTopic(
            startIdx,
            endIdx,
            app,
            user,
            topic
        );

        vm.expectRevert(EventsAndErrors.InvalidRange.selector);
        net.getMessagesInRangeForHash(startIdx, endIdx, hashVal);
    }

    function testGetMessagesInRangeNoMessagesInvalidStartIndex(
        uint256 startIdx,
        uint256 endIdx,
        address app,
        address user,
        string calldata topic
    ) public {
        vm.assume(startIdx < 100);
        vm.assume(endIdx < 100);
        vm.assume(startIdx < endIdx);

        vm.expectRevert(EventsAndErrors.InvalidStartIndex.selector);
        net.getMessagesInRange(startIdx, endIdx);

        vm.expectRevert(EventsAndErrors.InvalidStartIndex.selector);
        net.getMessagesInRangeForApp(startIdx, endIdx, app);

        vm.expectRevert(EventsAndErrors.InvalidStartIndex.selector);
        net.getMessagesInRangeForAppUser(startIdx, endIdx, app, user);

        vm.expectRevert(EventsAndErrors.InvalidStartIndex.selector);
        net.getMessagesInRangeForAppUserTopic(
            startIdx,
            endIdx,
            app,
            user,
            topic
        );

        vm.expectRevert(EventsAndErrors.InvalidStartIndex.selector);
        net.getMessagesInRangeForAppTopic(startIdx, endIdx, app, topic);
    }

    function testGetMessagesInRangeOneMessageInvalidEndIndex(
        uint256 endIdx,
        address app,
        address user,
        string calldata topic,
        bool sendMessageViaApp
    ) public {
        vm.assume(endIdx > 1 && endIdx < 10);
        uint256 startIdx = 0;

        if (sendMessageViaApp) {
            vm.startPrank(app);
            net.sendMessageViaApp(user, "hi", topic, "");
            vm.stopPrank();
        } else {
            app = address(0);
            vm.startPrank(user);
            net.sendMessage("hi", topic, "");
            vm.stopPrank();
        }

        vm.expectRevert(EventsAndErrors.InvalidEndIndex.selector);
        net.getMessagesInRange(startIdx, endIdx);

        vm.expectRevert(EventsAndErrors.InvalidEndIndex.selector);
        net.getMessagesInRangeForApp(startIdx, endIdx, app);

        vm.expectRevert(EventsAndErrors.InvalidEndIndex.selector);
        net.getMessagesInRangeForAppUser(startIdx, endIdx, app, user);

        vm.expectRevert(EventsAndErrors.InvalidEndIndex.selector);
        net.getMessagesInRangeForAppUserTopic(
            startIdx,
            endIdx,
            app,
            user,
            topic
        );

        vm.expectRevert(EventsAndErrors.InvalidEndIndex.selector);
        net.getMessagesInRangeForAppTopic(startIdx, endIdx, app, topic);
    }

    // Helpers

    function sendAndVerifyMultipleMessages(
        uint256 numMessages,
        address app,
        address user,
        string memory topic,
        bytes calldata extraData
    ) public returns (Net.Message[] memory) {
        Net.Message[] memory sentMsgs = new Net.Message[](numMessages);
        for (uint256 i; i < sentMsgs.length; i++) {
            sentMsgs[i] = INet.Message({
                app: app,
                sender: user,
                timestamp: block.timestamp,
                extraData: extraData,
                text: Strings.toString(i),
                topic: topic
            });
            sendAndVerifyMessage(
                user,
                app,
                sentMsgs[i].text,
                sentMsgs[i].topic,
                extraData
            );
        }
        return sentMsgs;
    }

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
