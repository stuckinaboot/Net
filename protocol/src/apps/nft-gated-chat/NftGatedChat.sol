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

    struct NFTMessageSender {
        address nftContract;
        uint256 nftTokenId;
    }

    // Track a mapping of each NFT contract to message sender for each message sent
    mapping(address nftContract => NFTMessageSender[]) public nftMessageSenders;

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
        nftMessageSenders[nftContract].push(
            NFTMessageSender({nftContract: nftContract, nftTokenId: nftTokenId})
        );

        // Send message
        net.sendMessageViaApp(
            msg.sender,
            message,
            // Topic is the nft contract address
            Strings.toHexString(uint160(nftContract), 20),
            ""
        );
    }
}
