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
import {OnchainSteamboatWillie} from "../../src/onchain-steamboat-willie/OnchainSteamboatWillie.sol";

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
    OnchainSteamboatWillie public nft =
        new OnchainSteamboatWillie(bytes32(0), 0, 0);

    constructor() TestUtils(net, nft) {}

    function setUp() public {
        vm.deal(address(this), 1000 ether);

        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }

        nft.updatePublicMintEnabled(true);
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
        sendAndVerifyMessage(user, address(0), messageContents, topic);
    }

    function sendAndVerifyMessage(
        address user,
        address app,
        string memory messageContents,
        string memory topic
    ) public {
        uint256 currMessagesLength = net.getTotalMessagesCount();
        uint256 topicMessagesLength = net.getTotalMessagesForTopicCount(topic);
        uint256 userMessagesLength = net.getTotalMessagesForUserCount(user);

        if (app == address(0)) {
            // Send message from user
            vm.startPrank(user);
            vm.expectEmit(true, true, true, false);
            emit MessageSent(user, topic, currMessagesLength);
            net.sendMessage(messageContents, topic, "");
            vm.stopPrank();
        } else {
            // Send message via app
            vm.startPrank(app);
            vm.expectEmit(true, true, true, false);
            emit MessageSentViaApp(app, user, topic, currMessagesLength);
            net.sendMessageViaApp(user, messageContents, topic, "");
            vm.stopPrank();
        }

        WillieNet.Message memory expectedMessage = IWillieNet.Message({
            app: app,
            sender: user,
            timestamp: block.timestamp,
            // TODO use fuzz data
            extraData: "",
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
    }

    function testSendOneMessage() public {
        string
            memory messageContents = "hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello hell";
        string memory topic = "Topic";
        sendAndVerifyMessage(address(this), messageContents, topic);
    }

    function testSendMultipleMessagesOnSameToken(address app) public {
        sendAndVerifyMessage(address(this), app, "message 1", "t1");
        sendAndVerifyMessage(address(this), app, "message 2", "t2");
        sendAndVerifyMessage(address(this), app, "message 3", "t3");
    }

    function testSendMultipleMessagesOnDifferentTokens() public {
        sendAndVerifyMessage(address(this), app, "message 1", "t1");
        sendAndVerifyMessage(address(this), app, "message 2", "t2");
        sendAndVerifyMessage(address(this), app, "message 3", "t3");
    }

    function testSendMultipleMessagesFromDifferentUsers() public {
        sendAndVerifyMessage(users[0], app, "message 1", "t1");
        sendAndVerifyMessage(users[1], app, "message 2", "t2");
        sendAndVerifyMessage(users[2], app, "message 3", "t3");
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
