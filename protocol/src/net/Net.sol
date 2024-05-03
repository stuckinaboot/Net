// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {EventsAndErrors} from "./EventsAndErrors.sol";
import {INet} from "./INet.sol";

/// @title Net
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice Fully decentralized onchain messaging protocol
contract Net is INet, EventsAndErrors {
    // Use a single global mapping to map hashes to message indexes
    mapping(bytes32 hashVal => uint256[] messageIndexes)
        public hashToMessageIndexes;

    Message[] public messages;

    bytes32 constant ZERO_HASH = keccak256(abi.encodePacked(address(0)));

    // Empty topic "" will not impact a hash, which could result in collisions
    // between hash values that use topic and don't use topic. For that reason,
    // we prefix the relevant hash topic keys with these values to ensure collisions don't occur
    // Example if this prefix didn't exist:
    // keccak256(abi.encodePacked(address(0))) == keccak256(abi.encodePacked(address(0), "" /* where "" represents topic */)) evaluates to true
    uint8 constant APP_TOPIC_HASH_PREFIX = 1;
    uint8 constant APP_USER_TOPIC_HASH_PREFIX = 2;

    // ************
    // Send message
    // ************

    function sendMessageViaApp(
        address sender,
        string calldata text,
        string calldata topic,
        bytes calldata extraData
    ) external {
        // Revert if message length is none to prevent empty messages
        if (bytes(text).length == 0 && bytes(extraData).length == 0) {
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
        messages.push(
            Message({
                app: msg.sender,
                sender: sender,
                extraData: extraData,
                text: text,
                topic: topic,
                timestamp: block.timestamp
            })
        );
    }

    function sendMessage(
        string calldata text,
        string calldata topic,
        bytes calldata extraData
    ) external {
        // Revert if message length is none to prevent empty messages
        if (bytes(text).length == 0 && bytes(extraData).length == 0) {
            revert MsgEmpty();
        }

        // Track message index in topic and user mappings
        uint256 messagesLength = messages.length;

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
        messages.push(
            Message({
                app: address(0),
                sender: msg.sender,
                extraData: extraData,
                text: text,
                topic: topic,
                timestamp: block.timestamp
            })
        );
    }

    // **************
    // Fetch Messages
    // **************

    // Fetch message indexes

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
            hashToMessageIndexes[
                keccak256(abi.encodePacked(APP_TOPIC_HASH_PREFIX, app, topic))
            ][idx];
    }

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
                hashToMessageIndexes[
                    keccak256(
                        abi.encodePacked(APP_TOPIC_HASH_PREFIX, app, topic)
                    )
                ][idx]
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
                    keccak256(
                        abi.encodePacked(
                            APP_USER_TOPIC_HASH_PREFIX,
                            app,
                            user,
                            topic
                        )
                    )
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
        uint256 querySetLength = messages.length;
        if (startIdx + 1 > querySetLength) {
            revert InvalidStartIndex();
        }
        if (endIdx > querySetLength) {
            revert InvalidEndIndex();
        }

        uint256 length = endIdx - startIdx;
        Message[] memory messagesSlice = new Message[](length);
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
        uint256 querySetLength = hashToMessageIndexes[hashVal].length;
        if (startIdx + 1 > querySetLength) {
            revert InvalidStartIndex();
        }
        if (endIdx > querySetLength) {
            revert InvalidEndIndex();
        }

        uint256 length = endIdx - startIdx;
        Message[] memory messagesSlice = new Message[](length);
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
                keccak256(abi.encodePacked(APP_TOPIC_HASH_PREFIX, app, topic))
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
                keccak256(abi.encodePacked(APP_TOPIC_HASH_PREFIX, app, topic))
            );
    }

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
