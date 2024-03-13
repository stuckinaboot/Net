// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

// TODO copy in the relevant files
import {ERC721A} from "@erc721a/ERC721A.sol";
import {NFTEventsAndErrors} from "./NFTEventsAndErrors.sol";
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
contract WillieNet is
    IWillieNet,
    ERC721A,
    NFTEventsAndErrors,
    Constants,
    TwoStepOwnable
{
    using LibString for uint16;

    address public immutable onchainSteamboatWillie;
    mapping(uint256 tokenId => bool special) public tokenToNotable;

    mapping(bytes32 topicHash => uint256[] messageIndexes)
        public topicToMessageIndexes;
    mapping(address sender => uint256[] messageIndexes)
        public userToMessageIndexes;
    mapping(uint256 tokenId => uint256[] messageIndexes)
        public senderTokenIdToMessageIndexes;

    Message[] public messages;

    // ***********
    // Constructor
    // ***********

    constructor(
        address onchainSteamboatWillieAddr
    ) ERC721A("WillieNet", "WNET") {
        onchainSteamboatWillie = onchainSteamboatWillieAddr;
    }

    // ************
    // Send message
    // ************

    function sendMessage(
        uint256 tokenId,
        bytes32 extraData,
        string calldata message,
        string calldata topic
    ) external {
        // Check user owns token
        if (ownerOf(tokenId) != msg.sender) {
            revert UserNotTokenOwner();
        }

        // TODO revert if message length is none to prevent empty messages

        // Track message index in topic and user mappings
        uint256 messagesLength = messages.length;
        topicToMessageIndexes[keccak256(bytes(topic))].push(messagesLength);
        userToMessageIndexes[msg.sender].push(messagesLength);
        senderTokenIdToMessageIndexes[tokenId].push(messagesLength);

        // Emit message sent using current messages length as the index
        emit MessageSent(topic, msg.sender, messagesLength);

        // Store message
        messages.push(
            Message({
                senderTokenId: tokenId,
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

    // ***
    // NFT
    // ***

    /// @notice Mint tokens.
    /// @param amount amount of tokens to mint
    function mintPublic(uint8 amount) external {
        // Checks
        unchecked {
            // TODO consider open edition
            if (MAX_SUPPLY + 1 < _nextTokenId() + amount) {
                // Check max supply not exceeded
                revert MaxSupplyReached();
            }
        }

        // Mint NFTs
        _mint(msg.sender, amount);
    }

    /// @notice Mint notable tokens.
    /// @param amount amount of tokens to mint
    function mintPublicNotable(uint8 amount) external payable {
        // Checks
        unchecked {
            if (amount * PRICE != msg.value) {
                // Check payment by sender is correct
                revert IncorrectPayment();
            }
        }

        unchecked {
            // TODO consider open edition
            uint256 nextTokenId = _nextTokenId();
            if (MAX_SUPPLY + 1 < nextTokenId + amount) {
                // Check max supply not exceeded
                revert MaxSupplyReached();
            }

            // Mark minted tokens as notable
            for (uint256 i; i < nextTokenId + amount; ++i) {
                tokenToNotable[i] = true;
            }
        }

        // Mint NFTs
        _mint(msg.sender, amount);

        // TODO could do free mint is one color art for sender, paid is another

        // Mint willies
        OnchainSteamboatWillie(onchainSteamboatWillie).mintPublic{
            value: msg.value
        }(amount);
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    /// @notice Get token uri for token.
    /// @param tokenId token id
    /// @return tokenURI
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) {
            revert URIQueryForNonexistentToken();
        }

        string memory artSvg = "TODO";

        return
            Utils.formatTokenURI(
                tokenId,
                string.concat(
                    "data:image/svg+xml;base64,",
                    Utils.encodeBase64(bytes(artSvg))
                ),
                string.concat(
                    "data:text/html;base64,",
                    Utils.encodeBase64(
                        bytes(
                            string.concat(
                                '<html style="overflow:hidden"><body style="margin:0">',
                                "",
                                "</body></html>"
                            )
                        )
                    )
                ),
                string.concat(
                    "[",
                    Utils.getTrait("Hue", "todo", true, false),
                    "]"
                )
            );
    }
}
