// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Net} from "../../net/Net.sol";
import {ERC1155} from "@solady/tokens/ERC1155.sol";
import {Base64} from "@solady/utils/Base64.sol";
import {SafeTransferLib} from "@solady/utils/SafeTransferLib.sol";

/// @title InscribedDrops
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice NFT mints created by inscribing token uris and mint configurations in Net messages.
contract InscribedDrops is ERC1155 {
    uint256 public totalDrops;
    Net internal net = Net(0x00000000B24D62781dB359b07880a105cD0b64e6);

    mapping(uint256 id => uint256 supply) public totalSupply;

    error TokenDoesNotExist();
    error TokenUriEmpty();
    error MintPaymentIncorrect();
    error MintSupplyReached();
    error MintEndTimestampReached();

    function name() public pure returns (string memory) {
        return "Net Inscribed Drops";
    }

    function symbol() public pure returns (string memory) {
        return "NET";
    }

    function inscribe(
        uint256 mintPrice,
        uint256 maxSupply,
        uint256 mintEndTimestamp,
        string calldata tokenUri
    ) public {
        // Check token uri non-empty
        if (bytes(tokenUri).length == 0) {
            revert TokenUriEmpty();
        }

        // Mint first token in drop
        _mint(msg.sender, totalDrops, 1, "");
        // Set total supply to 1
        totalSupply[totalDrops] = 1;

        // Increase total drops
        unchecked {
            ++totalDrops;
        }

        // Call Net to send message
        net.sendMessageViaApp(
            msg.sender,
            tokenUri,
            "",
            abi.encode(mintPrice, maxSupply, mintEndTimestamp)
        );
    }

    function mint(
        uint256 id,
        uint256 quantity,
        address feeAddress,
        uint256 feeBps
    ) public payable {
        if (id >= totalDrops) {
            revert TokenDoesNotExist();
        }

        // Get message
        Net.Message memory message = net.getMessageForApp(id, address(this));

        // Parse data
        (uint256 mintPrice, uint256 maxSupply, uint256 mintEndTimestamp) = abi
            .decode(message.data, (uint256, uint256, uint256));

        // Check payment correct, if non-zero
        if (mintPrice != 0 && msg.value != mintPrice * quantity) {
            revert MintPaymentIncorrect();
        }

        // Check supply not reached, if non-zero
        unchecked {
            if (maxSupply != 0 && totalSupply[id] + quantity > maxSupply) {
                revert MintSupplyReached();
            }
        }

        // Check mint not ended, if non-zero
        if (mintEndTimestamp != 0 && block.timestamp > mintEndTimestamp) {
            revert MintEndTimestampReached();
        }

        // Mint tokens
        _mint(msg.sender, id, quantity, "");

        // Update total supply
        unchecked {
            totalSupply[id] += quantity;
        }

        // If fee address is non-zero, transfer fee
        if (feeAddress != address(0) && feeBps != 0) {
            // Transfer fee
            uint256 fee = (feeBps * msg.value) / 10_000;
            SafeTransferLib.safeTransferETH(payable(feeAddress), fee);

            // Transfer remainder to creator of drop
            SafeTransferLib.safeTransferETH(message.sender, msg.value - fee);
        } else {
            // Transfer full amount to creator of drop
            SafeTransferLib.safeTransferETH(payable(message.sender), msg.value);
        }
    }

    function uri(uint256 id) public view override returns (string memory) {
        if (id >= totalDrops) {
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
