// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {WillieNet} from "../src/willie-net/WillieNet.sol";
import {PRBTest} from "@prb/test/PRBTest.sol";

contract TestUtils is PRBTest {
    function verifyMessages(
        WillieNet.Message[] memory expectedMessages,
        WillieNet.Message[] memory actualMessages
    ) public {
        assertEq(expectedMessages.length, actualMessages.length);
        for (uint256 i; i < expectedMessages.length; i++) {
            verifyMessage(expectedMessages[i], actualMessages[i]);
        }
    }

    function verifyMessage(
        WillieNet.Message memory expectedMessage,
        WillieNet.Message memory actualMessage
    ) public {
        assertEq(actualMessage.app, expectedMessage.app);
        assertEq(actualMessage.sender, expectedMessage.sender);
        assertEq(actualMessage.timestamp, expectedMessage.timestamp);
        assertEq(actualMessage.extraData, expectedMessage.extraData);
        assertEq(actualMessage.message, expectedMessage.message);
        assertEq(actualMessage.topic, expectedMessage.topic);
    }
}
