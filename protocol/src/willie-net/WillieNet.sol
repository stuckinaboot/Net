// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {EventsAndErrors} from "./EventsAndErrors.sol";
import {Constants} from "./Constants.sol";
import {IERC721} from "forge-std/interfaces/IERC721.sol";
import {IWillieNet} from "./IWillieNet.sol";
import {Utils} from "./Utils.sol";

/// @title WillieNet
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice Fully decentralized onchain messaging protocol.
contract WillieNet is IWillieNet, EventsAndErrors, Constants {
    // Use a single global mapping to map hashes to message indexes
    mapping(bytes32 hashVal => uint256[] messageIndexes)
        public hashToMessageIndexes;

    Message[] public messages;

    // ************
    // Send message
    // ************

    function sendMessageViaApp(
        address sender,
        string calldata message,
        string calldata topic,
        bytes calldata extraData
    ) external {
        // TODO revert if message length is none to prevent empty messages

        // Track message index in topic and user mappings
        uint256 messagesLength = messages.length;

        // App messages
        hashToMessageIndexes[keccak256(bytes(abi.encodePacked(msg.sender)))]
            .push(messagesLength);

        // App-user messages
        hashToMessageIndexes[
            keccak256(bytes(abi.encodePacked(msg.sender, sender)))
        ].push(messagesLength);

        // App-topic messages
        hashToMessageIndexes[
            // msg.sender is the app id
            keccak256(bytes(abi.encodePacked(msg.sender, topic)))
        ].push(messagesLength);
        // TODO use bytes instead of address

        // App-user-topic messages
        // TODO is this one needed?
        hashToMessageIndexes[
            keccak256(bytes(abi.encodePacked(msg.sender, sender, topic)))
        ].push(messagesLength);

        // Emit message sent using current messages length as the index
        emit MessageSentViaApp(msg.sender, topic, sender, messagesLength);

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
        bytes calldata extraData,
        string calldata message,
        string calldata topic
    ) external {
        // TODO revert if message length is none to prevent empty messages

        // Track message index in topic and user mappings
        uint256 messagesLength = messages.length;
        hashToMessageIndexes[keccak256(bytes(topic))].push(messagesLength);
        hashToMessageIndexes[keccak256(abi.encodePacked(msg.sender))].push(
            messagesLength
        );

        // Emit message sent using current messages length as the index
        emit MessageSent(topic, msg.sender, messagesLength);

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

    function getMessageIdxForTopic(
        uint256 idx,
        string calldata topic
    ) external view returns (uint256) {
        return hashToMessageIndexes[keccak256(bytes(topic))][idx];
    }

    function getMessageIdxForUser(
        uint256 idx,
        address user
    ) external view returns (uint256) {
        return hashToMessageIndexes[keccak256(abi.encodePacked(user))][idx];
    }

    // Fetch single message

    function getMessage(uint256 idx) external view returns (Message memory) {
        return messages[idx];
    }

    // TODO should there be function for getting message indexes rather than message itself?
    function getMessageForTopic(
        uint256 idx,
        string calldata topic
    ) external view returns (Message memory) {
        return messages[hashToMessageIndexes[keccak256(bytes(topic))][idx]];
    }

    function getMessageForUser(
        uint256 idx,
        address user
    ) external view returns (Message memory) {
        return
            messages[
                hashToMessageIndexes[keccak256(abi.encodePacked(user))][idx]
            ];
    }

    // Fetch multiple messages

    function getMessagesInRange(
        uint256 startIdx,
        uint256 endIdx
    ) external view returns (Message[] memory) {
        // TODO consider adding error for startIdx, endIdx invalid

        uint256 length = endIdx - startIdx;
        Message[] memory messagesSlice = new Message[](length);
        if (messages.length == 0) {
            return messagesSlice;
        }
        uint256 idxInMessages = endIdx;
        unchecked {
            for (uint256 i; i < length && idxInMessages > startIdx; ) {
                --idxInMessages;
                messagesSlice[i] = messages[idxInMessages];
                ++i;
            }
        }
        return messagesSlice;
    }

    function getMessagesInRangeForHash(
        uint256 startIdx,
        uint256 endIdx,
        bytes32 hashVal
    ) public view returns (Message[] memory) {
        // TODO consider adding error for startIdx, endIdx invalid

        uint256 length = endIdx - startIdx;
        Message[] memory messagesSlice = new Message[](length);
        if (messages.length == 0) {
            return messagesSlice;
        }
        uint256 idxInMessages = endIdx;
        unchecked {
            for (uint256 i; i < length && idxInMessages > startIdx; ) {
                --idxInMessages;
                messagesSlice[i] = messages[
                    hashToMessageIndexes[hashVal][idxInMessages]
                ];
                ++i;
            }
        }
        return messagesSlice;
    }

    function getMessagesInRangeForTopic(
        uint256 startIdx,
        uint256 endIdx,
        string calldata topic
    ) external view returns (Message[] memory) {
        return
            getMessagesInRangeForHash(
                startIdx,
                endIdx,
                keccak256(bytes(topic))
            );
    }

    function getMessagesInRangeForUser(
        uint256 startIdx,
        uint256 endIdx,
        address user
    ) external view returns (Message[] memory) {
        return
            getMessagesInRangeForHash(
                startIdx,
                endIdx,
                keccak256(abi.encodePacked(user))
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

    function getTotalMessagesForTopicCount(
        string calldata topic
    ) external view returns (uint256) {
        return hashToMessageIndexes[keccak256(bytes(topic))].length;
    }

    function getTotalMessagesForUserCount(
        address user
    ) external view returns (uint256) {
        return hashToMessageIndexes[keccak256(abi.encodePacked(user))].length;
    }

    // ************
    // Helpers
    // ************

    // TODO can probs get rid of this, possibly in favor of new helpers
    function getSenderNftAsAddress(
        address senderNftContract,
        uint256 senderNftTokenId
    ) public pure returns (address) {
        return
            address(
                uint160(
                    uint256(
                        keccak256(
                            abi.encodePacked(
                                senderNftContract,
                                senderNftTokenId
                            )
                        )
                    )
                )
            );
    }
}
