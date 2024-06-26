// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Net} from "../../net/Net.sol";
import {ERC1155} from "@solady/tokens/ERC1155.sol";
import {Base64} from "@solady/utils/Base64.sol";
import {SafeTransferLib} from "@solady/utils/SafeTransferLib.sol";
import {TwoStepOwnable} from "./TwoStepOwnable.sol";
import {LibString} from "@solady/utils/LibString.sol";

/// @title InscribedDrops
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice NFT mints created by inscribing token uris and mint configurations in Net messages.
contract InscribedDrops is ERC1155, TwoStepOwnable {
    using LibString for uint256;

    uint256 public totalDrops;
    uint256 public feeBps = 500;
    Net internal net = Net(0x00000000B24D62781dB359b07880a105cD0b64e6);

    mapping(uint256 id => uint256 supply) public totalSupply;

    mapping(uint256 id => mapping(address user => uint256 minted))
        public mintedPerWallet;

    error TokenDoesNotExist();
    error TokenUriEmpty();
    error MintPaymentIncorrect();
    error MintSupplyReached();
    error MaxMintsPerWalletReached();
    error MintEndTimestampReached();
    error CannotMintQuantityZero();

    event InscribedDrop(address indexed creator, uint256 id);

    string internal constant INSCRIBE_TOPIC = "i";
    string internal constant MINT_TOPIC = "m";
    string public constant NET_APP_NAME = "Inscribed Drops";

    constructor() {
        _transferOwnership(address(0xcf75Bf188c5CA5198eF571aed3D75ECDe3bcD9D9));
    }

    function name() external pure returns (string memory) {
        return NET_APP_NAME;
    }

    function symbol() external pure returns (string memory) {
        return "NET";
    }

    function inscribe(
        uint256 mintPrice,
        uint256 maxSupply,
        uint256 mintEndTimestamp,
        uint256 maxMintsPerWallet,
        string calldata tokenUri
    ) external {
        // Check token uri non-empty
        if (bytes(tokenUri).length == 0) {
            revert TokenUriEmpty();
        }

        // Mint first token in drop
        _mint(msg.sender, totalDrops, 1, "");
        // Set total supply to 1
        totalSupply[totalDrops] = 1;
        // Set minted per wallet to 1
        mintedPerWallet[totalDrops][msg.sender] = 1;
        // Emit inscribed drop event
        emit InscribedDrop(msg.sender, totalDrops);

        // Increase total drops
        unchecked {
            ++totalDrops;
        }

        // Call Net to send message
        net.sendMessageViaApp(
            msg.sender,
            tokenUri,
            INSCRIBE_TOPIC,
            abi.encode(
                mintPrice,
                maxSupply,
                mintEndTimestamp,
                maxMintsPerWallet
            )
        );
    }

    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        feeBps = newFeeBps;
    }

    function mint(uint256 id, uint256 quantity) external payable {
        if (id >= totalDrops) {
            revert TokenDoesNotExist();
        }
        if (quantity == 0) {
            revert CannotMintQuantityZero();
        }

        // Get message
        Net.Message memory message = net.getMessageForAppTopic(
            id,
            address(this),
            INSCRIBE_TOPIC
        );

        // Parse data
        (
            uint256 mintPrice,
            uint256 maxSupply,
            uint256 mintEndTimestamp,
            uint256 maxMintsPerWallet
        ) = abi.decode(message.data, (uint256, uint256, uint256, uint256));

        unchecked {
            // Check payment correct, if non-zero
            if (mintPrice != 0 && msg.value != mintPrice * quantity) {
                revert MintPaymentIncorrect();
            }

            // Check supply not reached, if non-zero
            if (maxSupply != 0 && totalSupply[id] + quantity > maxSupply) {
                revert MintSupplyReached();
            }

            // Check max mints per wallet not reached, if non-zero
            if (
                maxMintsPerWallet != 0 &&
                mintedPerWallet[id][msg.sender] + quantity > maxMintsPerWallet
            ) {
                revert MaxMintsPerWalletReached();
            }
        }

        // Check mint not ended, if non-zero
        if (mintEndTimestamp != 0 && block.timestamp > mintEndTimestamp) {
            revert MintEndTimestampReached();
        }

        // Mint tokens
        _mint(msg.sender, id, quantity, "");

        unchecked {
            // Update total supply
            totalSupply[id] += quantity;

            // Update minted per wallet
            mintedPerWallet[id][msg.sender] += quantity;
        }

        // If owner is non-zero and fee is non-zero and msg value is non-zero, transfer fee
        if (owner() != address(0) && feeBps != 0 && msg.value > 0) {
            unchecked {
                uint256 fee = (feeBps * msg.value) / 10_000;
                // Transfer fee
                SafeTransferLib.safeTransferETH(payable(owner()), fee);

                // Transfer remainder to creator of drop
                SafeTransferLib.safeTransferETH(
                    message.sender,
                    msg.value - fee
                );
            }
        } else {
            // Transfer full amount to creator of drop
            SafeTransferLib.safeTransferETH(payable(message.sender), msg.value);
        }

        // Send mint message on Net
        net.sendMessageViaApp(
            msg.sender,
            string.concat(
                "Minted ",
                quantity.toString(),
                " of #",
                id.toString()
            ),
            MINT_TOPIC,
            ""
        );
    }

    function uri(uint256 id) public view override returns (string memory) {
        if (id >= totalDrops) {
            revert TokenDoesNotExist();
        }

        return
            string.concat(
                "data:application/json;base64,",
                Base64.encode(
                    bytes(
                        net
                            .getMessageForAppTopic(
                                id,
                                address(this),
                                INSCRIBE_TOPIC
                            )
                            .text
                    )
                )
            );
    }
}
