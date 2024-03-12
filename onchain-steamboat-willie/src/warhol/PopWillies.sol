// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import { NFTEventsAndErrors } from "./NFTEventsAndErrors.sol";
import { Utils } from "./Utils.sol";
import { LibString } from "../utils/LibString.sol";
import { OnchainSteamboatWillie } from "../OnchainSteamboatWillie.sol";
import { ERC721SeaDrop } from "seadrop/src/ERC721SeaDrop.sol";
import { SharedConstants } from "./SharedConstants.sol";
import { Renderer } from "./Renderer.sol";

/// @title Pop Willies
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
contract PopWillies is ERC721SeaDrop, NFTEventsAndErrors, SharedConstants {
    using LibString for uint16;
    using LibString for uint8;

    mapping(uint256 => uint16[4]) public tokenIdTo4Willies;
    mapping(uint256 => uint16[9]) public tokenIdTo9Willies;

    OnchainSteamboatWillie internal onchainSteamboatWillie;
    Renderer public renderer;

    address internal mintSeaDropRecipient;

    address payable internal constant _VAULT_ADDRESS = payable(address(0x39Ab90066cec746A032D67e4fe3378f16294CF6b));
    uint256 internal constant ONCHAIN_STEAMBOAT_WILLIES_MINT_PRICE = 0.005 ether;
    uint16 internal constant MAX_SUPPLY = 300;
    uint8 internal constant MAX_MINTS_PER_TRANSACTION = 3;

    bool public mintEnabled = true;

    constructor(
        address onchainSteamboatWillieAddr,
        address rendererAddr,
        address[] memory allowedSeaDrop
    )
        ERC721SeaDrop("Pop Willies", "POPWIL", allowedSeaDrop)
    {
        onchainSteamboatWillie = OnchainSteamboatWillie(onchainSteamboatWillieAddr);
        renderer = Renderer(rendererAddr);
    }

    /// @notice Set mint enabled.
    /// @param enabled started
    function setMintEnabled(bool enabled) external onlyOwner {
        mintEnabled = enabled;
    }

    /// @notice Set renderer.
    /// @param newRenderer new renderer
    function setRenderer(address newRenderer) external onlyOwner {
        renderer = Renderer(newRenderer);
    }

    /// @notice Mint tokens to msg.sender.
    /// @param amount amount
    /// @param large mint 3x3 tokens if true, 2x2 tokens if false
    function mint(uint8 amount, bool large) public payable {
        mintTo(msg.sender, amount, large);
    }

    /// @notice Mint tokens.
    /// @param to address tokens should be minted to
    /// @param amount amount
    /// @param large mint 3x3 tokens if true, 2x2 tokens if false
    function mintTo(address to, uint8 amount, bool large) public payable {
        // Checks
        unchecked {
            if (!mintEnabled) {
                // Check mint started
                revert MintNotEnabled();
            }

            if (amount > MAX_MINTS_PER_TRANSACTION) {
                // Check max mints per transaction not exceeded
                revert MaxMintsPerTransactionExceeded();
            }

            uint8 totalAmountOfWilliesToMint = amount * (large ? LARGE_TOKEN_COUNT : SMALL_TOKEN_COUNT);

            if (totalAmountOfWilliesToMint * ONCHAIN_STEAMBOAT_WILLIES_MINT_PRICE != msg.value) {
                // Check payment by sender is correct
                revert IncorrectPayment();
            }

            if (MAX_SUPPLY + 1 < _nextTokenId() + amount) {
                // Check max supply not exceeded
                revert MaxSupplyReached();
            }

            uint16 mintedWillieTokenId = uint16(OnchainSteamboatWillie(onchainSteamboatWillie).totalSupply() + 1);

            uint256 nextTokenIdToBeMinted = _nextTokenId();
            uint8 mintedSoFar = 0;
            if (large) {
                for (uint256 i = nextTokenIdToBeMinted; i < nextTokenIdToBeMinted + amount;) {
                    uint16 mintedWilliesOffset = mintedWillieTokenId + mintedSoFar * LARGE_TOKEN_COUNT;
                    tokenIdTo9Willies[i] = [
                        mintedWilliesOffset,
                        mintedWilliesOffset + 1,
                        mintedWilliesOffset + 2,
                        mintedWilliesOffset + 3,
                        mintedWilliesOffset + 4,
                        mintedWilliesOffset + 5,
                        mintedWilliesOffset + 6,
                        mintedWilliesOffset + 7,
                        mintedWilliesOffset + 8
                    ];
                    ++i;
                    ++mintedSoFar;
                }
            } else {
                for (uint256 i = nextTokenIdToBeMinted; i < nextTokenIdToBeMinted + amount;) {
                    uint16 mintedWilliesOffset = mintedWillieTokenId + mintedSoFar * SMALL_TOKEN_COUNT;
                    tokenIdTo4Willies[i] =
                        [mintedWilliesOffset, mintedWilliesOffset + 1, mintedWilliesOffset + 2, mintedWilliesOffset + 3];
                    ++i;
                    ++mintedSoFar;
                }
            }

            _mint(to, amount);

            // Interactions

            // Mint tokens from Onchain Steamboat Willie
            OnchainSteamboatWillie(onchainSteamboatWillie).mintPublic{ value: msg.value }(totalAmountOfWilliesToMint);

            // Transfer Onchain Steamboat Willies to `to`
            for (uint8 i; i < totalAmountOfWilliesToMint;) {
                OnchainSteamboatWillie(onchainSteamboatWillie).transferFrom(address(this), to, mintedWillieTokenId + i);
                ++i;
            }
        }
    }

    /// @notice Paint 2x2 token with onchain steamboat willies.
    /// @param tokenId token to paint
    /// @param willie1 onchain steamboat willie 1
    /// @param willie2 onchain steamboat willie 2
    /// @param willie3 onchain steamboat willie 3
    /// @param willie4 onchain steamboat willie 4
    function paintWillies4(uint256 tokenId, uint16 willie1, uint16 willie2, uint16 willie3, uint16 willie4) external {
        // Check user owns this token
        if (msg.sender != ownerOf(tokenId)) {
            revert MsgSenderNotOwnerOfPopWillie();
        }

        // Check token is correct size
        if (tokenIdTo4Willies[tokenId][0] == 0) {
            revert PaintIncorrectPopWillieSize();
        }

        // Check and paint token
        checkAndPaintWillies4(tokenId, 1, willie1, willie2, willie3, willie4);

        // Emit metadata update event
        emit MetadataUpdate(tokenId);
    }

    /// @notice Paint 3x3 token with onchain steamboat willies.
    /// @param tokenId token to paint
    /// @param willie1 onchain steamboat willie 1
    /// @param willie2 onchain steamboat willie 2
    /// @param willie3 onchain steamboat willie 3
    /// @param willie4 onchain steamboat willie 4
    /// @param willie5 onchain steamboat willie 5
    /// @param willie6 onchain steamboat willie 6
    /// @param willie7 onchain steamboat willie 7
    /// @param willie8 onchain steamboat willie 8
    /// @param willie9 onchain steamboat willie 9
    function paintWillies9(
        uint256 tokenId,
        uint16 willie1,
        uint16 willie2,
        uint16 willie3,
        uint16 willie4,
        uint16 willie5,
        uint16 willie6,
        uint16 willie7,
        uint16 willie8,
        uint16 willie9
    )
        external
    {
        // Check user owns this token
        if (msg.sender != ownerOf(tokenId)) {
            revert MsgSenderNotOwnerOfPopWillie();
        }

        // Check token is correct size
        if (tokenIdTo9Willies[tokenId][0] == 0) {
            revert PaintIncorrectPopWillieSize();
        }

        // Check and paint token
        checkAndPaintWillies9(
            tokenId, 1, willie1, willie2, willie3, willie4, willie5, willie6, willie7, willie8, willie9
        );

        // Emit metadata update event
        emit MetadataUpdate(tokenId);
    }

    function checkAndPaintWillies4(
        uint256 startTokenId,
        uint8 amount,
        uint16 willie1,
        uint16 willie2,
        uint16 willie3,
        uint16 willie4
    )
        internal
    {
        // Check Willies all unique
        uint8[1112] memory willieIds;
        ++willieIds[willie1];
        if (
            // If any value for particular willie id is greater than 0, that implies the willie id was already seen
            willieIds[willie2]++ > 0 || willieIds[willie3]++ > 0 || willieIds[willie4]++ > 0
        ) {
            revert OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken();
        }

        // Check Willies ownership
        if (
            onchainSteamboatWillie.ownerOf(willie1) != msg.sender
                || onchainSteamboatWillie.ownerOf(willie2) != msg.sender
                || onchainSteamboatWillie.ownerOf(willie3) != msg.sender
                || onchainSteamboatWillie.ownerOf(willie4) != msg.sender
        ) {
            revert MsgSenderNotOwnerOfOnchainSteamboatWillie();
        }

        // Set Willies
        unchecked {
            uint256 nextTokenIdToBeMinted = startTokenId;
            for (uint256 i = nextTokenIdToBeMinted; i < nextTokenIdToBeMinted + amount;) {
                tokenIdTo4Willies[i] = [willie1, willie2, willie3, willie4];
                ++i;
            }
        }
    }

    function checkAndPaintWillies9(
        uint256 startTokenId,
        uint8 amount,
        uint16 willie1,
        uint16 willie2,
        uint16 willie3,
        uint16 willie4,
        uint16 willie5,
        uint16 willie6,
        uint16 willie7,
        uint16 willie8,
        uint16 willie9
    )
        internal
    {
        // Check Willies all unique
        uint8[1112] memory willieIds;
        ++willieIds[willie1];
        if (
            // If any value for particular willie id is greater than 0, that implies the willie id was already seen
            willieIds[willie2]++ > 0 || willieIds[willie3]++ > 0 || willieIds[willie4]++ > 0 || willieIds[willie5]++ > 0
                || willieIds[willie6]++ > 0 || willieIds[willie7]++ > 0 || willieIds[willie8]++ > 0
                || willieIds[willie9]++ > 0
        ) {
            revert OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken();
        }

        // Check Willies ownership
        if (
            onchainSteamboatWillie.ownerOf(willie1) != msg.sender
                || onchainSteamboatWillie.ownerOf(willie2) != msg.sender
                || onchainSteamboatWillie.ownerOf(willie3) != msg.sender
                || onchainSteamboatWillie.ownerOf(willie4) != msg.sender
                || onchainSteamboatWillie.ownerOf(willie5) != msg.sender
                || onchainSteamboatWillie.ownerOf(willie6) != msg.sender
                || onchainSteamboatWillie.ownerOf(willie7) != msg.sender
                || onchainSteamboatWillie.ownerOf(willie8) != msg.sender
                || onchainSteamboatWillie.ownerOf(willie9) != msg.sender
        ) {
            revert MsgSenderNotOwnerOfOnchainSteamboatWillie();
        }

        // Effects

        // Set Willies
        unchecked {
            uint256 nextTokenIdToBeMinted = startTokenId;
            for (uint256 i = nextTokenIdToBeMinted; i < nextTokenIdToBeMinted + amount;) {
                tokenIdTo9Willies[i] = [willie1, willie2, willie3, willie4, willie5, willie6, willie7, willie8, willie9];
                ++i;
            }
        }
    }

    /// @notice Mint 2x2 token with onchain steamboat willies.
    /// @param willie1 onchain steamboat willie 1
    /// @param willie2 onchain steamboat willie 2
    /// @param willie3 onchain steamboat willie 3
    /// @param willie4 onchain steamboat willie 4
    /// @param amount amount to mint
    function mintPopWillies4(uint16 willie1, uint16 willie2, uint16 willie3, uint16 willie4, uint8 amount) public {
        // Checks
        unchecked {
            if (!mintEnabled) {
                // Check mint started
                revert MintNotEnabled();
            }

            if (amount > MAX_MINTS_PER_TRANSACTION) {
                // Check max mints per transaction not exceeded
                revert MaxMintsPerTransactionExceeded();
            }

            if (MAX_SUPPLY + 1 < _nextTokenId() + amount) {
                // Check max supply not exceeded
                revert MaxSupplyReached();
            }
        }

        checkAndPaintWillies4(_nextTokenId(), amount, willie1, willie2, willie3, willie4);

        // Effects
        _mint(msg.sender, amount);
    }

    /// @notice Mint 3x3 token with onchain steamboat willies.
    /// @param willie1 onchain steamboat willie 1
    /// @param willie2 onchain steamboat willie 2
    /// @param willie3 onchain steamboat willie 3
    /// @param willie4 onchain steamboat willie 4
    /// @param willie5 onchain steamboat willie 5
    /// @param willie6 onchain steamboat willie 6
    /// @param willie7 onchain steamboat willie 7
    /// @param willie8 onchain steamboat willie 8
    /// @param willie9 onchain steamboat willie 9
    /// @param amount amount to mint
    function mintPopWillies9(
        uint16 willie1,
        uint16 willie2,
        uint16 willie3,
        uint16 willie4,
        uint16 willie5,
        uint16 willie6,
        uint16 willie7,
        uint16 willie8,
        uint16 willie9,
        uint8 amount
    )
        public
    {
        // Checks
        unchecked {
            if (!mintEnabled) {
                // Check mint started
                revert MintNotEnabled();
            }

            if (amount > MAX_MINTS_PER_TRANSACTION) {
                // Check max mints per transaction not exceeded
                revert MaxMintsPerTransactionExceeded();
            }

            if (MAX_SUPPLY + 1 < _nextTokenId() + amount) {
                // Check max supply not exceeded
                revert MaxSupplyReached();
            }
        }

        checkAndPaintWillies9(
            _nextTokenId(), amount, willie1, willie2, willie3, willie4, willie5, willie6, willie7, willie8, willie9
        );

        // Mint
        _mint(msg.sender, amount);
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    /// @notice Get art svg and animation script for token.
    /// @param tokenId token id
    /// @return (art, animation script)
    function art(uint256 tokenId) public view returns (string memory, string memory) {
        if (!_exists(tokenId)) {
            revert URIQueryForNonexistentToken();
        }

        bool large = tokenIdTo9Willies[tokenId][0] != 0;
        uint8 totalWillies = large ? LARGE_TOKEN_COUNT : SMALL_TOKEN_COUNT;

        uint16[] memory willies = new uint16[](totalWillies);
        unchecked {
            if (large) {
                for (uint8 i; i < LARGE_TOKEN_COUNT;) {
                    willies[i] = tokenIdTo9Willies[tokenId][i];
                    ++i;
                }
            } else {
                for (uint8 i; i < SMALL_TOKEN_COUNT;) {
                    willies[i] = tokenIdTo4Willies[tokenId][i];
                    ++i;
                }
            }
        }

        return (renderer.art(willies), renderer.artScript(willies));
    }

    /// @notice Withdraw all ETH from the contract.
    function withdraw() external {
        (bool success,) = _VAULT_ADDRESS.call{ value: address(this).balance }("");
        require(success);
    }

    /// @notice Get token uri for token.
    /// @param tokenId token id
    /// @return tokenURI
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) {
            revert URIQueryForNonexistentToken();
        }

        uint8 totalWillies = tokenIdTo9Willies[tokenId][0] != 0 ? LARGE_TOKEN_COUNT : SMALL_TOKEN_COUNT;
        string memory traits;
        // Add composed willies traits
        unchecked {
            for (uint8 i; i < totalWillies;) {
                traits = string.concat(
                    traits,
                    Utils.willieTrait(
                        totalWillies == LARGE_TOKEN_COUNT
                            ? tokenIdTo9Willies[tokenId][i]
                            : tokenIdTo4Willies[tokenId][i],
                        i + 1,
                        true
                    )
                );
                ++i;
            }
        }
        // Add size trait
        traits = string.concat(traits, Utils.getTrait("Size", totalWillies == LARGE_TOKEN_COUNT ? "3x3" : "2x2", false));

        (string memory artSvg, string memory artScript) = art(tokenId);
        return Utils.formatTokenURI(
            tokenId,
            string.concat("data:image/svg+xml;base64,", Utils.encodeBase64(bytes(artSvg))),
            string.concat(
                "data:text/html;base64,",
                Utils.encodeBase64(
                    bytes(
                        string.concat(
                            '<html style="overflow:hidden"><body style="margin:0">', artSvg, artScript, "</body></html>"
                        )
                    )
                )
            ),
            string.concat("[", traits, "]")
        );
    }

    /**
     * @notice Mint tokens, restricted to the SeaDrop contract.
     *
     * @dev    NOTE: If a token registers itself with multiple SeaDrop
     *         contracts, the implementation of this function should guard
     *         against reentrancy. If the implementing token uses
     *         _safeMint(), or a feeRecipient with a malicious receive() hook
     *         is specified, the token or fee recipients may be able to execute
     *         another mint in the same transaction via a separate SeaDrop
     *         contract.
     *         This is dangerous if an implementing token does not correctly
     *         update the minterNumMinted and currentTotalSupply values before
     *         transferring minted tokens, as SeaDrop references these values
     *         to enforce token limits on a per-wallet and per-stage basis.
     *
     *         ERC721A tracks these values automatically, but this note and
     *         nonReentrant modifier are left here to encourage best-practices
     *         when referencing this contract.
     *
     * @param minter   The address to mint to.
     * @param quantity The number of tokens to mint.
     */
    function mintSeaDrop(address minter, uint256 quantity) external virtual override nonReentrant {
        // Ensure the SeaDrop is allowed.
        _onlyAllowedSeaDrop(msg.sender);

        // Set seadrop recipient to minter
        mintSeaDropRecipient = minter;
    }

    fallback() external payable {
        uint8 amount = uint8(msg.value / (SMALL_TOKEN_COUNT * ONCHAIN_STEAMBOAT_WILLIES_MINT_PRICE));
        this.mintTo{ value: amount * SMALL_TOKEN_COUNT * ONCHAIN_STEAMBOAT_WILLIES_MINT_PRICE }(
            mintSeaDropRecipient, amount, false
        );
        mintSeaDropRecipient = address(0);
    }
}
