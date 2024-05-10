// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Net} from "../../net/Net.sol";
import {ERC721} from "@solady/tokens/ERC721.sol";
import {Base64} from "@solady/utils/Base64.sol";

/// @title Inscriptions
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice NFTs created by inscribing token uris in Net messages
contract Inscriptions is ERC721 {
    uint256 public totalSupply;
    Net internal net = Net(0x00000000B24D62781dB359b07880a105cD0b64e6);

    function name() public view override returns (string memory) {
        return "Net Inscriptions";
    }

    function symbol() public view override returns (string memory) {
        return "NET";
    }

    function inscribe(string calldata message) public {
        // Mint NFT
        _mint(msg.sender, totalSupply);

        // Increase total supply
        unchecked {
            ++totalSupply;
        }

        // Send message
        net.sendMessageViaApp(msg.sender, message, "", "");
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        uint256 totalSupply = net.getTotalMessagesForAppCount(address(this));
        if (id >= totalSupply) {
            revert TokenDoesNotExist();
        }

        return
            string.concat(
                "data:application/json;base64,",
                Base64.encode(
                    bytes(net.getMessageForApp(id, address(this)).text)
                )
            );
    }
}
