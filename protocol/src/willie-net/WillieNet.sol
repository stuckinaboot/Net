// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {EventsAndErrors} from "./EventsAndErrors.sol";
import {Constants} from "./Constants.sol";
import {IWillieNet} from "./IWillieNet.sol";
import {Utils} from "./Utils.sol";

/// @title WillieNet
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice Fully decentralized onchain messaging protocol.
contract WillieNet is IWillieNet, EventsAndErrors, Constants {
    // Use a single global mapping to map hashes to message indexes
    // TODO use address(0) to represent non-app messages
    mapping(bytes32 hashVal => uint256[] messageIndexes)
        public hashToMessageIndexes;

    Message[] public messages;

    bytes32 constant ZERO_HASH = keccak256(abi.encodePacked(address(0)));

    // ************
    // Send message
    // ************

    function sendMessageViaApp(
        address sender,
        string calldata message,
        string calldata topic,
        bytes calldata extraData
    ) external {
        // Revert if message length is none to prevent empty messages
        if (bytes(message).length == 0) {
            revert MsgEmpty();
        }

        // Track message index in topic and user mappings
        uint256 messagesLength = messages.length;

        // App messages
        hashToMessageIndexes[keccak256(abi.encodePacked(msg.sender))].push(
            messagesLength
        );

        // App-user messages
        hashToMessageIndexes[keccak256(abi.encodePacked(msg.sender, sender))]
            .push(messagesLength);

        // App-topic messages
        hashToMessageIndexes[
            // msg.sender is the app id
            keccak256(abi.encodePacked(msg.sender, topic))
        ].push(messagesLength);

        // App-user-topic messages
        // TODO is this one needed?
        hashToMessageIndexes[
            keccak256(abi.encodePacked(msg.sender, sender, topic))
        ].push(messagesLength);

        // Emit message sent using current messages length as the index
        emit MessageSentViaApp(msg.sender, sender, topic, messagesLength);

        // Store message
        messages.push(
            Message({
                app: msg.sender,
                sender: sender,
                extraData: extraData,
                message: message,
                topic: topic,
                timestamp: block.timestamp
            })
        );
    }

    function sendMessage(
        string calldata message,
        string calldata topic,
        bytes calldata extraData
    ) external {
        // Revert if message length is none to prevent empty messages
        if (bytes(message).length == 0) {
            revert MsgEmpty();
        }

        // Track message index in topic and user mappings
        uint256 messagesLength = messages.length;

        hashToMessageIndexes[ZERO_HASH].push(messagesLength);
        hashToMessageIndexes[keccak256(abi.encodePacked(address(0), topic))]
            .push(messagesLength);
        hashToMessageIndexes[
            keccak256(abi.encodePacked(address(0), msg.sender))
        ].push(messagesLength);
        // TODO is app user topic necessary
        hashToMessageIndexes[
            keccak256(abi.encodePacked(address(0), msg.sender, topic))
        ].push(messagesLength);

        // Emit message sent using current messages length as the index
        emit MessageSent(msg.sender, topic, messagesLength);

        // Store message
        messages.push(
            Message({
                app: address(0),
                sender: msg.sender,
                extraData: extraData,
                message: message,
                topic: topic,
                timestamp: block.timestamp
            })
        );
    }

    // **************
    // Fetch Messages
    // **************

    // Fetch message indexes

    // function getMessageIdxForTopic(
    //     uint256 idx,
    //     string calldata topic
    // ) external view returns (uint256) {
    //     return
    //         hashToMessageIndexes[
    //             keccak256(abi.encodePacked(address(0), topic))
    //         ][idx];
    // }

    // function getMessageIdxForUser(
    //     uint256 idx,
    //     address user
    // ) external view returns (uint256) {
    //     return
    //         hashToMessageIndexes[keccak256(abi.encodePacked(address(0), user))][
    //             idx
    //         ];
    // }

    function getMessageIdxForApp(
        uint256 idx,
        address app
    ) external view returns (uint256) {
        return hashToMessageIndexes[keccak256(abi.encodePacked(app))][idx];
    }

    function getMessageIdxForAppUser(
        uint256 idx,
        address app,
        address user
    ) external view returns (uint256) {
        return
            hashToMessageIndexes[keccak256(abi.encodePacked(app, user))][idx];
    }

    function getMessageIdxForAppTopic(
        uint256 idx,
        address app,
        string calldata topic
    ) external view returns (uint256) {
        return
            hashToMessageIndexes[keccak256(abi.encodePacked(app, topic))][idx];
    }

    function getMessageIdxForAppUserTopic(
        uint256 idx,
        address app,
        address user,
        string calldata topic
    ) external view returns (uint256) {
        return
            hashToMessageIndexes[keccak256(abi.encodePacked(app, user, topic))][
                idx
            ];
    }

    // Fetch single message

    function getMessage(uint256 idx) external view returns (Message memory) {
        return messages[idx];
    }

    function getMessageForApp(
        uint256 idx,
        address app
    ) external view returns (Message memory) {
        return
            messages[
                hashToMessageIndexes[keccak256(abi.encodePacked(app))][idx]
            ];
    }

    function getMessageForAppUser(
        uint256 idx,
        address app,
        address user
    ) external view returns (Message memory) {
        return
            messages[
                hashToMessageIndexes[keccak256(abi.encodePacked(app, user))][
                    idx
                ]
            ];
    }

    function getMessageForAppTopic(
        uint256 idx,
        address app,
        string calldata topic
    ) external view returns (Message memory) {
        return
            messages[
                hashToMessageIndexes[keccak256(abi.encodePacked(app, topic))][
                    idx
                ]
            ];
    }

    function getMessageForAppUserTopic(
        uint256 idx,
        address app,
        address user,
        string calldata topic
    ) external view returns (Message memory) {
        return
            messages[
                hashToMessageIndexes[
                    keccak256(abi.encodePacked(app, user, topic))
                ][idx]
            ];
    }

    // Fetch multiple messages

    function getMessagesInRange(
        uint256 startIdx,
        uint256 endIdx
    ) external view returns (Message[] memory) {
        if (startIdx >= endIdx) {
            revert InvalidRange();
        }

        uint256 length = endIdx - startIdx;
        Message[] memory messagesSlice = new Message[](length);
        if (messages.length == 0) {
            return messagesSlice;
        }
        uint256 idxInMessages = startIdx;
        unchecked {
            for (uint256 i; i < length && idxInMessages < endIdx; ) {
                messagesSlice[i] = messages[idxInMessages];
                ++i;
                ++idxInMessages;
            }
        }
        return messagesSlice;
    }

    function getMessagesInRangeForHash(
        uint256 startIdx,
        uint256 endIdx,
        bytes32 hashVal
    ) public view returns (Message[] memory) {
        if (startIdx >= endIdx) {
            revert InvalidRange();
        }

        uint256 length = endIdx - startIdx;
        Message[] memory messagesSlice = new Message[](length);
        if (messages.length == 0) {
            return messagesSlice;
        }
        uint256 idxInMessages = startIdx;
        unchecked {
            for (uint256 i; i < length && idxInMessages < endIdx; ) {
                messagesSlice[i] = messages[
                    hashToMessageIndexes[hashVal][idxInMessages]
                ];
                ++i;
                ++idxInMessages;
            }
        }
        return messagesSlice;
    }

    function getMessagesInRangeForApp(
        uint256 startIdx,
        uint256 endIdx,
        address app
    ) external view returns (Message[] memory) {
        return
            getMessagesInRangeForHash(
                startIdx,
                endIdx,
                keccak256(abi.encodePacked(app))
            );
    }

    function getMessagesInRangeForAppUser(
        uint256 startIdx,
        uint256 endIdx,
        address app,
        address user
    ) external view returns (Message[] memory) {
        return
            getMessagesInRangeForHash(
                startIdx,
                endIdx,
                keccak256(abi.encodePacked(app, user))
            );
    }

    function getMessagesInRangeForAppTopic(
        uint256 startIdx,
        uint256 endIdx,
        address app,
        string calldata topic
    ) external view returns (Message[] memory) {
        return
            getMessagesInRangeForHash(
                startIdx,
                endIdx,
                keccak256(abi.encodePacked(app, topic))
            );
    }

    function getMessagesInRangeForAppUserTopic(
        uint256 startIdx,
        uint256 endIdx,
        address app,
        address user,
        string calldata topic
    ) external view returns (Message[] memory) {
        return
            getMessagesInRangeForHash(
                startIdx,
                endIdx,
                keccak256(abi.encodePacked(app, user, topic))
            );
    }

    // **************
    // Message counts
    // **************

    function getTotalMessagesCount() external view returns (uint256) {
        return messages.length;
    }

    function getTotalMessagesForHashCount(
        bytes32 hashVal
    ) public view returns (uint256) {
        return hashToMessageIndexes[hashVal].length;
    }

    function getTotalMessagesForAppCount(
        address app
    ) external view returns (uint256) {
        return getTotalMessagesForHashCount(keccak256(abi.encodePacked(app)));
    }

    function getTotalMessagesForAppUserCount(
        address app,
        address user
    ) external view returns (uint256) {
        return
            getTotalMessagesForHashCount(
                keccak256(abi.encodePacked(app, user))
            );
    }

    function getTotalMessagesForAppTopicCount(
        address app,
        string calldata topic
    ) external view returns (uint256) {
        return
            getTotalMessagesForHashCount(
                keccak256(abi.encodePacked(app, topic))
            );
    }

    function getTotalMessagesForAppUserTopicCount(
        address app,
        address user,
        string calldata topic
    ) external view returns (uint256) {
        return
            getTotalMessagesForHashCount(
                keccak256(abi.encodePacked(app, user, topic))
            );
    }
}
