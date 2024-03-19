// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

interface EventsAndErrors {
    error MsgSenderNotNftOwner();

    // TODO remove if unused
    error MessageExceedsMaxLength();
    error TopicExceedsMaxLength();

    event MessageSent(
        string indexed topic,
        address indexed sender,
        address indexed senderNftContract,
        uint256 messageIndex
    );
}
