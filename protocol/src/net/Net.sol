// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {EventsAndErrors} from "./EventsAndErrors.sol";
import {INet} from "./INet.sol";
import {SSTORE2} from "@solady/utils/SSTORE2.sol";

/// @title Net
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice Fully decentralized onchain messaging protocol
contract Net is INet, EventsAndErrors {
    // Use a single global mapping to map hashes to message indexes
    mapping(bytes32 hashVal => uint256[] messageIndexes)
        public hashToMessageIndexes;

    address[] public messagePointers;

    bytes32 constant ZERO_HASH = keccak256(abi.encodePacked(address(0)));

    // Empty topic "" will not impact a hash, which could result in collisions
    // between hash values that use topic and don't use topic. For that reason,
    // we prefix the relevant hash topic keys with these values to ensure collisions don't occur
    // Example if this prefix didn't exist:
    // keccak256(abi.encodePacked(address(0))) == keccak256(abi.encodePacked(address(0), "" /* where "" represents topic */)) evaluates to true
    uint256 constant APP_TOPIC_HASH_PREFIX = 1;
    uint256 constant APP_USER_TOPIC_HASH_PREFIX = 2;

    // ************
    // Send message
    // ************

    /// @notice Send message via app
    /// @param sender message sender
    /// @param text message text
    /// @param topic message topic
    /// @param data message data
    function sendMessageViaApp(
        address sender,
        string calldata text,
        string calldata topic,
        bytes calldata data
    ) external {
        // Revert if message length is none to prevent empty messages
        if (bytes(text).length == 0 && bytes(data).length == 0) {
            revert MsgEmpty();
        }

        // Track message index in topic and user mappings
        uint256 messagesLength = messagePointers.length;

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
            keccak256(
                abi.encodePacked(APP_TOPIC_HASH_PREFIX, msg.sender, topic)
            )
        ].push(messagesLength);

        // App-user-topic messages
        hashToMessageIndexes[
            keccak256(
                abi.encodePacked(
                    APP_USER_TOPIC_HASH_PREFIX,
                    msg.sender,
                    sender,
                    topic
                )
            )
        ].push(messagesLength);

        // Emit message sent using current messages length as the index
        emit MessageSentViaApp(msg.sender, sender, topic, messagesLength);

        // Store message
        messagePointers.push(
            SSTORE2.write(
                abi.encode(
                    // App
                    msg.sender,
                    // Sender
                    sender,
                    // Timestamp
                    block.timestamp,
                    // Data
                    data,
                    // Text
                    text,
                    // Topic
                    topic
                )
            )
        );
    }

    /// @notice Send message
    /// @param text message text
    /// @param topic message topic
    /// @param data message data
    function sendMessage(
        string calldata text,
        string calldata topic,
        bytes calldata data
    ) external {
        // Revert if message length is none to prevent empty messages
        if (bytes(text).length == 0 && bytes(data).length == 0) {
            revert MsgEmpty();
        }

        // Track message index in topic and user mappings
        uint256 messagesLength = messagePointers.length;

        // address(0) is used to represent messages sent from "no app"
        hashToMessageIndexes[ZERO_HASH].push(messagesLength);
        hashToMessageIndexes[
            keccak256(
                abi.encodePacked(APP_TOPIC_HASH_PREFIX, address(0), topic)
            )
        ].push(messagesLength);
        hashToMessageIndexes[
            keccak256(abi.encodePacked(address(0), msg.sender))
        ].push(messagesLength);
        hashToMessageIndexes[
            keccak256(
                abi.encodePacked(
                    APP_USER_TOPIC_HASH_PREFIX,
                    address(0),
                    msg.sender,
                    topic
                )
            )
        ].push(messagesLength);

        // Emit message sent using current messages length as the index
        emit MessageSent(msg.sender, topic, messagesLength);

        // Store message
        messagePointers.push(
            SSTORE2.write(
                abi.encode(
                    // App
                    address(0),
                    // Sender
                    msg.sender,
                    // Timestamp
                    block.timestamp,
                    // Data
                    data,
                    // Text
                    text,
                    // Topic
                    topic
                )
            )
        );
    }

    // **************
    // Fetch Messages
    // **************

    // Fetch message indexes

    /// @notice Get message pointer index for app
    /// @param idx message index
    /// @param app app
    /// @return index index
    function getMessageIdxForApp(
        uint256 idx,
        address app
    ) external view returns (uint256) {
        return hashToMessageIndexes[keccak256(abi.encodePacked(app))][idx];
    }

    /// @notice Get message pointer index for app user
    /// @param idx message index
    /// @param app app
    /// @param user user
    /// @return index index
    function getMessageIdxForAppUser(
        uint256 idx,
        address app,
        address user
    ) external view returns (uint256) {
        return
            hashToMessageIndexes[keccak256(abi.encodePacked(app, user))][idx];
    }

    /// @notice Get message pointer index for app topic
    /// @param idx message index
    /// @param app app
    /// @param topic topic
    /// @return index index
    function getMessageIdxForAppTopic(
        uint256 idx,
        address app,
        string calldata topic
    ) external view returns (uint256) {
        return
            hashToMessageIndexes[
                keccak256(abi.encodePacked(APP_TOPIC_HASH_PREFIX, app, topic))
            ][idx];
    }

    /// @notice Get message pointer index for app user topic
    /// @param idx message index
    /// @param app app
    /// @param user user
    /// @param topic topic
    /// @return index index
    function getMessageIdxForAppUserTopic(
        uint256 idx,
        address app,
        address user,
        string calldata topic
    ) external view returns (uint256) {
        return
            hashToMessageIndexes[
                keccak256(
                    abi.encodePacked(
                        APP_USER_TOPIC_HASH_PREFIX,
                        app,
                        user,
                        topic
                    )
                )
            ][idx];
    }

    // Fetch single message

    /// @notice Decode encoded message
    /// @param encodedMessage encoded message
    /// @return decodedMessage decoded message
    function decodeMessage(
        bytes memory encodedMessage
    ) public pure returns (Message memory) {
        Message memory message;
        (
            message.app,
            message.sender,
            message.timestamp,
            message.data,
            message.text,
            message.topic
        ) = abi.decode(
            encodedMessage,
            (
                // App
                address,
                // Sender
                address,
                // Timestamp
                uint256,
                // Data
                bytes,
                // Text
                string,
                // Topic
                string
            )
        );
        return message;
    }

    /// @notice Decode message at index in message pointers
    /// @param idx index
    /// @return decodedMessage decoded message
    function decodeMessageAtIndex(
        uint256 idx
    ) public view returns (Message memory) {
        return decodeMessage(SSTORE2.read(messagePointers[idx]));
    }

    /// @notice Get message
    /// @param idx index
    /// @return message message
    function getMessage(uint256 idx) external view returns (Message memory) {
        return decodeMessageAtIndex(idx);
    }

    /// @notice Get message for app
    /// @param idx index
    /// @param app app
    /// @return message message
    function getMessageForApp(
        uint256 idx,
        address app
    ) external view returns (Message memory) {
        return
            decodeMessageAtIndex(
                hashToMessageIndexes[keccak256(abi.encodePacked(app))][idx]
            );
    }

    /// @notice Get message for app user
    /// @param idx index
    /// @param app app
    /// @param user user
    /// @return message message
    function getMessageForAppUser(
        uint256 idx,
        address app,
        address user
    ) external view returns (Message memory) {
        return
            decodeMessageAtIndex(
                hashToMessageIndexes[keccak256(abi.encodePacked(app, user))][
                    idx
                ]
            );
    }

    /// @notice Get message for app topic
    /// @param idx index
    /// @param app app
    /// @param topic topic
    /// @return message message
    function getMessageForAppTopic(
        uint256 idx,
        address app,
        string calldata topic
    ) external view returns (Message memory) {
        return
            decodeMessageAtIndex(
                hashToMessageIndexes[
                    keccak256(
                        abi.encodePacked(APP_TOPIC_HASH_PREFIX, app, topic)
                    )
                ][idx]
            );
    }

    /// @notice Get message for app user topic
    /// @param idx index
    /// @param app app
    /// @param user user
    /// @param topic topic
    /// @return message message
    function getMessageForAppUserTopic(
        uint256 idx,
        address app,
        address user,
        string calldata topic
    ) external view returns (Message memory) {
        return
            decodeMessageAtIndex(
                hashToMessageIndexes[
                    keccak256(
                        abi.encodePacked(
                            APP_USER_TOPIC_HASH_PREFIX,
                            app,
                            user,
                            topic
                        )
                    )
                ][idx]
            );
    }

    // Fetch multiple messages

    /// @notice Get messages in range
    /// @param startIdx start index
    /// @param endIdx end index
    /// @return messages list of messages
    function getMessagesInRange(
        uint256 startIdx,
        uint256 endIdx
    ) external view returns (Message[] memory) {
        if (startIdx >= endIdx) {
            revert InvalidRange();
        }
        uint256 querySetLength = messagePointers.length;
        if (startIdx + 1 > querySetLength) {
            revert InvalidStartIndex();
        }
        if (endIdx > querySetLength) {
            revert InvalidEndIndex();
        }

        Message[] memory messagesSlice = new Message[](endIdx - startIdx);
        uint256 idxInMessages = startIdx;
        unchecked {
            for (; idxInMessages < endIdx; ) {
                messagesSlice[idxInMessages - startIdx] = decodeMessageAtIndex(
                    idxInMessages
                );
                ++idxInMessages;
            }
        }

        return messagesSlice;
    }

    /// @notice Get messages in range for hash
    /// @param startIdx start index
    /// @param endIdx end index
    /// @param hashVal hash
    /// @return messages list of messages
    function getMessagesInRangeForHash(
        uint256 startIdx,
        uint256 endIdx,
        bytes32 hashVal
    ) public view returns (Message[] memory) {
        if (startIdx >= endIdx) {
            revert InvalidRange();
        }
        uint256 querySetLength = hashToMessageIndexes[hashVal].length;
        if (startIdx + 1 > querySetLength) {
            revert InvalidStartIndex();
        }
        if (endIdx > querySetLength) {
            revert InvalidEndIndex();
        }

        Message[] memory messagesSlice = new Message[](endIdx - startIdx);
        uint256 idxInMessages = startIdx;
        unchecked {
            for (; idxInMessages < endIdx; ) {
                messagesSlice[idxInMessages - startIdx] = decodeMessageAtIndex(
                    hashToMessageIndexes[hashVal][idxInMessages]
                );
                ++idxInMessages;
            }
        }

        return messagesSlice;
    }

    /// @notice Get messages in range for app
    /// @param startIdx start index
    /// @param endIdx end index
    /// @param app app
    /// @return messages list of messages
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

    /// @notice Get messages in range for app user
    /// @param startIdx start index
    /// @param endIdx end index
    /// @param app app
    /// @param user user
    /// @return messages list of messages
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

    /// @notice Get messages in range for app topic
    /// @param startIdx start index
    /// @param endIdx end index
    /// @param app app
    /// @param topic topic
    /// @return messages list of messages
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
                keccak256(abi.encodePacked(APP_TOPIC_HASH_PREFIX, app, topic))
            );
    }

    /// @notice Get messages in range for app user topic
    /// @param startIdx start index
    /// @param endIdx end index
    /// @param app app
    /// @param user user
    /// @param topic topic
    /// @return messages list of messages
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
                keccak256(
                    abi.encodePacked(
                        APP_USER_TOPIC_HASH_PREFIX,
                        app,
                        user,
                        topic
                    )
                )
            );
    }

    // **************
    // Message counts
    // **************

    /// @notice Get total messages count
    /// @return count count
    function getTotalMessagesCount() external view returns (uint256) {
        return messagePointers.length;
    }

    /// @notice Get total messages for hash count
    /// @param hashVal hash
    /// @return count count
    function getTotalMessagesForHashCount(
        bytes32 hashVal
    ) public view returns (uint256) {
        return hashToMessageIndexes[hashVal].length;
    }

    /// @notice Get total messages for app count
    /// @param app app
    /// @return count count
    function getTotalMessagesForAppCount(
        address app
    ) external view returns (uint256) {
        return getTotalMessagesForHashCount(keccak256(abi.encodePacked(app)));
    }

    /// @notice Get total messages for app user count
    /// @param app app
    /// @param user user
    /// @return count count
    function getTotalMessagesForAppUserCount(
        address app,
        address user
    ) external view returns (uint256) {
        return
            getTotalMessagesForHashCount(
                keccak256(abi.encodePacked(app, user))
            );
    }

    /// @notice Get total messages for app topic count
    /// @param app app
    /// @param topic topic
    /// @return count count
    function getTotalMessagesForAppTopicCount(
        address app,
        string calldata topic
    ) external view returns (uint256) {
        return
            getTotalMessagesForHashCount(
                keccak256(abi.encodePacked(APP_TOPIC_HASH_PREFIX, app, topic))
            );
    }

    /// @notice Get total messages for app user topic count
    /// @param app app
    /// @param user user
    /// @param topic topic
    /// @return count count
    function getTotalMessagesForAppUserTopicCount(
        address app,
        address user,
        string calldata topic
    ) external view returns (uint256) {
        return
            getTotalMessagesForHashCount(
                keccak256(
                    abi.encodePacked(
                        APP_USER_TOPIC_HASH_PREFIX,
                        app,
                        user,
                        topic
                    )
                )
            );
    }
}
