// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

interface EventsAndErrors {
    error MsgEmpty();
    error InvalidRange();
    error InvalidStartIndex();
    error InvalidEndIndex();

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
