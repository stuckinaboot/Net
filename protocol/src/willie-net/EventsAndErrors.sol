// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

interface EventsAndErrors {
    // TODO remove if unused
    error MessageExceedsMaxLength();
    error TopicExceedsMaxLength();

    event MessageSent(
        string indexed topic,
        address indexed sender,
        uint256 messageIndex
    );
}
