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
    mapping(bytes32 topicHash => uint256[] messageIndexes)
        public topicToMessageIndexes;
    mapping(address sender => uint256[] messageIndexes)
        public userToMessageIndexes;

    Message[] public messages;

    // ************
    // Send message
    // ************

    function sendMessage(
        address senderNftContract,
        uint256 senderNftTokenId,
        bytes32 extraData,
        string calldata message,
        string calldata topic
    ) external {
        // When senderNftContract is a non-zero address, check if the user owns the NFT
        if (
            senderNftContract != address(0) &&
            IERC721(senderNftContract).ownerOf(senderNftTokenId) != msg.sender
        ) {
            revert MsgSenderNotNftOwner();
        }
        // TODO revert if message length is none to prevent empty messages

        // Track message index in topic and user mappings
        uint256 messagesLength = messages.length;
        topicToMessageIndexes[keccak256(bytes(topic))].push(messagesLength);
        userToMessageIndexes[msg.sender].push(messagesLength);

        if (senderNftContract != address(0)) {
            userToMessageIndexes[
                getSenderNftAsAddress(senderNftContract, senderNftTokenId)
            ].push(messagesLength);
        }

        // Emit message sent using current messages length as the index
        emit MessageSent(topic, msg.sender, senderNftContract, messagesLength);

        // Store message
        messages.push(
            Message({
                sender: msg.sender,
                // TODO update tests to account for this
                senderNftContract: senderNftContract,
                senderNftTokenId: senderNftTokenId,
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
        return topicToMessageIndexes[keccak256(bytes(topic))][idx];
    }

    function getMessageIdxForUser(
        uint256 idx,
        address user
    ) external view returns (uint256) {
        return userToMessageIndexes[user][idx];
    }

    function getMessageIdxForSenderNft(
        uint256 idx,
        address senderNftContract,
        uint256 senderNftTokenId
    ) external view returns (uint256) {
        return
            userToMessageIndexes[
                getSenderNftAsAddress(senderNftContract, senderNftTokenId)
            ][idx];
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
        return messages[topicToMessageIndexes[keccak256(bytes(topic))][idx]];
    }

    function getMessageForUser(
        uint256 idx,
        address user
    ) external view returns (Message memory) {
        return messages[userToMessageIndexes[user][idx]];
    }

    function getMessageForSenderNft(
        uint256 idx,
        address senderNftContract,
        uint256 senderNftTokenId
    ) external view returns (Message memory) {
        return
            messages[
                userToMessageIndexes[
                    getSenderNftAsAddress(senderNftContract, senderNftTokenId)
                ][idx]
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

    function getMessagesInRangeForTopic(
        uint256 startIdx,
        uint256 endIdx,
        string calldata topic
    ) external view returns (Message[] memory) {
        // TODO consider adding error for startIdx, endIdx invalid

        uint256 length = endIdx - startIdx;
        Message[] memory messagesSlice = new Message[](length);
        if (messages.length == 0) {
            return messagesSlice;
        }
        uint256 idxInMessages = endIdx;
        bytes32 topicHash = keccak256(bytes(topic));
        unchecked {
            for (uint256 i; i < length && idxInMessages > startIdx; ) {
                --idxInMessages;
                messagesSlice[i] = messages[
                    topicToMessageIndexes[topicHash][idxInMessages]
                ];
                ++i;
            }
        }
        return messagesSlice;
    }

    function getMessagesInRangeForUser(
        uint256 startIdx,
        uint256 endIdx,
        address user
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
                messagesSlice[i] = messages[
                    userToMessageIndexes[user][idxInMessages]
                ];
                ++i;
            }
        }
        return messagesSlice;
    }

    function getMessagesInRangeForSenderNft(
        uint256 startIdx,
        uint256 endIdx,
        address senderNftContract,
        uint256 senderNftTokenId
    ) external view returns (Message[] memory) {
        // TODO consider adding error for startIdx, endIdx invalid

        uint256 length = endIdx - startIdx;
        Message[] memory messagesSlice = new Message[](length);
        if (messages.length == 0) {
            return messagesSlice;
        }
        uint256 idxInMessages = endIdx;
        address senderNftHashAddress = getSenderNftAsAddress(
            senderNftContract,
            senderNftTokenId
        );
        unchecked {
            for (uint256 i; i < length && idxInMessages > startIdx; ) {
                --idxInMessages;
                messagesSlice[i] = messages[
                    userToMessageIndexes[senderNftHashAddress][idxInMessages]
                ];
                ++i;
            }
        }
        return messagesSlice;
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
        return topicToMessageIndexes[keccak256(bytes(topic))].length;
    }

    function getTotalMessagesForUserCount(
        address user
    ) external view returns (uint256) {
        return userToMessageIndexes[user].length;
    }

    function getTotalMessagesForSenderNftCount(
        address senderNftContract,
        uint256 senderNftTokenId
    ) external view returns (uint256) {
        return
            userToMessageIndexes[
                getSenderNftAsAddress(senderNftContract, senderNftTokenId)
            ].length;
    }

    // ************
    // Helpers
    // ************

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
