// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

interface EventsAndErrors {
    error MsgSenderNotNftOwner();
    error MsgEmpty();

    // TODO remove if unused
    error MessageExceedsMaxLength();
    error TopicExceedsMaxLength();

    event MessageSent(
        address indexed sender,
        string indexed topic,
        uint256 messageIndex
    );

    event MessageSentViaApp(
        address indexed app,
        address indexed sender,
        string indexed topic,
        uint256 messageIndex
    );
}
