// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

interface EventsAndErrors {
    error MsgSenderNotNftOwner();
    error MsgEmpty();

    // TODO remove if unused
    error MessageExceedsMaxLength();
    error TopicExceedsMaxLength();

    event MessageSent(
        string indexed topic,
        address indexed sender,
        uint256 messageIndex
    );

    event MessageSentViaApp(
        address indexed app,
        string indexed topic,
        address indexed sender,
        uint256 messageIndex
    );
}
