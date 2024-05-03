// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

// TODO decide if this interface is needed
interface INet {
    // TODO update to include all relevant functions from Willienet main
    struct Message {
        address app;
        address sender;
        uint256 timestamp;
        bytes extraData;
        string text;
        string topic;
    }

    function sendMessageViaApp(
        address sender,
        string calldata text,
        string calldata topic,
        bytes calldata extraData
    ) external;

    function sendMessage(
        string calldata text,
        string calldata topic,
        bytes calldata extraData
    ) external;

    // **************
    // Fetch Messages
    // **************

    // Fetch message indexes

    function getMessageIdxForApp(
        uint256 idx,
        address app
    ) external view returns (uint256);

    function getMessageIdxForAppUser(
        uint256 idx,
        address app,
        address user
    ) external view returns (uint256);

    function getMessageIdxForAppTopic(
        uint256 idx,
        address app,
        string calldata topic
    ) external view returns (uint256);

    function getMessageIdxForAppUserTopic(
        uint256 idx,
        address app,
        address user,
        string calldata topic
    ) external view returns (uint256);

    // Fetch single message

    function getMessage(uint256 idx) external view returns (Message memory);

    function getMessageForApp(
        uint256 idx,
        address app
    ) external view returns (Message memory);

    function getMessageForAppUser(
        uint256 idx,
        address app,
        address user
    ) external view returns (Message memory);

    function getMessageForAppTopic(
        uint256 idx,
        address app,
        string calldata topic
    ) external view returns (Message memory);

    function getMessageForAppUserTopic(
        uint256 idx,
        address app,
        address user,
        string calldata topic
    ) external view returns (Message memory);

    // Fetch multiple messages

    function getMessagesInRange(
        uint256 startIdx,
        uint256 endIdx
    ) external view returns (Message[] memory);

    function getMessagesInRangeForApp(
        uint256 startIdx,
        uint256 endIdx,
        address app
    ) external view returns (Message[] memory);

    function getMessagesInRangeForAppUser(
        uint256 startIdx,
        uint256 endIdx,
        address app,
        address user
    ) external view returns (Message[] memory);

    function getMessagesInRangeForAppTopic(
        uint256 startIdx,
        uint256 endIdx,
        address app,
        string calldata topic
    ) external view returns (Message[] memory);

    function getMessagesInRangeForAppUserTopic(
        uint256 startIdx,
        uint256 endIdx,
        address app,
        address user,
        string calldata topic
    ) external view returns (Message[] memory);

    // **************
    // Message counts
    // **************

    function getTotalMessagesCount() external view returns (uint256);

    function getTotalMessagesForAppCount(
        address app
    ) external view returns (uint256);

    function getTotalMessagesForAppUserCount(
        address app,
        address user
    ) external view returns (uint256);

    function getTotalMessagesForAppTopicCount(
        address app,
        string calldata topic
    ) external view returns (uint256);

    function getTotalMessagesForAppUserTopicCount(
        address app,
        address user,
        string calldata topic
    ) external view returns (uint256);
}
