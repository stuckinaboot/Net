// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

// TODO copy in the relevant files
import {ERC721A} from "@erc721a/ERC721A.sol";
import {EventsAndErrors} from "./EventsAndErrors.sol";
import {Constants} from "./Constants.sol";
import {LibString} from "../utils/LibString.sol";
import {SVG} from "../utils/SVG.sol";
import {TwoStepOwnable} from "../utils/TwoStepOwnable.sol";
import {IERC721} from "forge-std/interfaces/IERC721.sol";
import {OnchainSteamboatWillie} from "./onchain-steamboat-willie/OnchainSteamboatWillie.sol";
import {IWillieNet} from "./IWillieNet.sol";
import {Utils} from "./Utils.sol";

/// @title WillieNet
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice Fully decentralized onchain NFT-based messaging protocol.
contract WillieNet is IWillieNet, EventsAndErrors, Constants {
    using LibString for uint16;

    mapping(bytes32 topicHash => uint256[] messageIndexes)
        public topicToMessageIndexes;
    mapping(address sender => uint256[] messageIndexes)
        public userToMessageIndexes;

    // TODO this is no longer relevant but we can track messages sent by certain NFTs? We can
    // track the particular contract address and the contract-token combo possibly over two mappings
    // (or via userToMessageIndexes, where we hash contract-token and turn that into address or bytes32)
    mapping(uint256 tokenId => uint256[] messageIndexes)
        public senderTokenIdToMessageIndexes;

    Message[] public messages;

    // ************
    // Send message
    // ************

    function sendMessage(
        bytes32 extraData,
        string calldata message,
        string calldata topic
    ) external {
        // TODO revert if message length is none to prevent empty messages

        // Track message index in topic and user mappings
        uint256 messagesLength = messages.length;
        topicToMessageIndexes[keccak256(bytes(topic))].push(messagesLength);
        userToMessageIndexes[msg.sender].push(messagesLength);

        // TODO remove
        // senderTokenIdToMessageIndexes[tokenId].push(messagesLength);

        // Emit message sent using current messages length as the index
        emit MessageSent(topic, msg.sender, messagesLength);

        // Store message
        messages.push(
            Message({
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
        return topicToMessageIndexes[keccak256(bytes(topic))][idx];
    }

    function getMessageIdxForUser(
        uint256 idx,
        address user
    ) external view returns (uint256) {
        return userToMessageIndexes[user][idx];
    }

    function getMessageIdxForSenderTokenId(
        uint256 idx,
        uint256 senderTokenId
    ) external view returns (uint256) {
        return senderTokenIdToMessageIndexes[senderTokenId][idx];
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

    // TODO modify for contract-address
    function getMessageForSender(
        uint256 idx,
        uint256 senderTokenId
    ) external view returns (Message memory) {
        return messages[senderTokenIdToMessageIndexes[senderTokenId][idx]];
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

    function getMessagesInRangeForSenderTokenId(
        uint256 startIdx,
        uint256 endIdx,
        uint256 senderTokenId
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
                    senderTokenIdToMessageIndexes[senderTokenId][idxInMessages]
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

    function getTotalMessagesForSenderTokenIdCount(
        uint256 senderTokenId
    ) external view returns (uint256) {
        return senderTokenIdToMessageIndexes[senderTokenId].length;
    }
}
