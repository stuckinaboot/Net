// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {WillieNet} from "../src/willie-net/WillieNet.sol";
import {PRBTest} from "@prb/test/PRBTest.sol";

contract TestUtils is PRBTest {
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
