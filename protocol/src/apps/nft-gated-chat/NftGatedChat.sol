// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {WillieNet} from "../../willie-net/WillieNet.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {EventsAndErrors} from "./EventsAndErrors.sol";

/// @title NftGatedChat
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
contract NftGatedChat is EventsAndErrors {
    WillieNet net;

    // Track a mapping of each NFT contract to message sender token id
    mapping(address nftContract => uint256[]) public nftMessageSenders;

    constructor(address willieNet) {
        net = WillieNet(willieNet);
    }

    function sendMessage(
        address nftContract,
        uint256 nftTokenId,
        string memory message
    ) public {
        // Check user is owner of NFT
        if (IERC721(nftContract).ownerOf(nftTokenId) != msg.sender) {
            revert MsgSenderNotOwnerOfNft();
        }

        // Add message sender
        nftMessageSenders[nftContract].push(nftTokenId);

        // Send message
        net.sendMessageViaApp(
            msg.sender,
            message,
            // Topic is the nft contract address
            Strings.toHexString(uint160(nftContract), 20),
            ""
        );
    }

    function getMessageSender(
        address nftContract,
        uint256 idx
    ) external view returns (uint256) {
        return nftMessageSenders[nftContract][idx];
    }

    function getMessageSendersInRange(
        address nftContract,
        uint256 startIdx,
        uint256 endIdx
    ) external view returns (uint256[] memory) {
        if (startIdx >= endIdx) {
            revert InvalidRange();
        }
        uint256 querySetLength = nftMessageSenders[nftContract].length;
        if (startIdx + 1 > querySetLength) {
            revert InvalidStartIndex();
        }
        if (endIdx > querySetLength) {
            revert InvalidEndIndex();
        }

        uint256 length = endIdx - startIdx;
        uint256[] memory sendersSlice = new uint256[](length);
        uint256 idxInSenders = startIdx;
        unchecked {
            for (uint256 i; i < length && idxInSenders < endIdx; ) {
                sendersSlice[i] = nftMessageSenders[nftContract][idxInSenders];
                ++i;
                ++idxInSenders;
            }
        }
        return sendersSlice;
    }
}
