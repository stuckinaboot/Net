// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Net} from "../../net/Net.sol";
import {ERC721} from "@solady/tokens/ERC721.sol";
import {Base64} from "@solady/utils/Base64.sol";

/// @title NftGatedChat
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
contract Inscriptions is ERC721 {
    uint256 totalSupply = 1;
    Net internal net;

    error TokenDoesNotExist();

    constructor(address netAddr) {
        net = Net(netAddr);
    }

    function name() public view override returns (string memory) {
        return "Net Inscriptions";
    }

    function symbol() public view override returns (string memory) {
        return "NET";
    }

    function inscribe(string memory message) public {
        // Send message
        net.sendMessageViaApp(msg.sender, message, "", "");

        // Mint NFT
        _mint(msg.sender, totalSupply);

        // Increase total supply
        unchecked {
            ++totalSupply;
        }
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        uint256 totalSupply = net.getTotalMessagesForAppCount(address(this));
        if (id > totalSupply) {
            revert TokenDoesNotExist();
        }
        string memory tokenUri = net.getMessageForApp(id, address(this)).text;

        return
            string.concat(
                "data:application/json;base64,",
                Base64.encode(bytes(tokenUri))
            );
    }
}
