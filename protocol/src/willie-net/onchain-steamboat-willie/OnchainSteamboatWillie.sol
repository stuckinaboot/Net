// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import { ERC721A } from "@erc721a/ERC721A.sol";
import { NFTEventsAndErrors } from "./NFTEventsAndErrors.sol";
import { Utils } from "./utils/Utils.sol";
import { Constants } from "./utils/Constants.sol";
import { LibString } from "./utils/LibString.sol";
import { LibPRNG } from "./LibPRNG.sol";
import { SVG } from "./utils/SVG.sol";
import { AllowList } from "./utils/AllowList.sol";
import { SSTORE2 } from "@solady/utils/SSTORE2.sol";

/// @title Onchain Steamboat Willie
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
contract OnchainSteamboatWillie is ERC721A, NFTEventsAndErrors, Constants, AllowList {
    using LibString for uint16;
    using LibPRNG for LibPRNG.PRNG;

    bool public publicMintEnabled;
    uint16 internal immutable _allowListMintMaxTotal;
    uint8 internal immutable _allowListMintMaxPerWallet;
    mapping(address user => uint8 minted) internal _allowListMinted;
    mapping(uint256 token => bytes32 seed) public tokenToSeed;

    address public artPtr0;
    address public artPtr1;
    address public artPtr2;

    string public ANIMATION_SCRIPT =
        '<script>let a=!1,b=!1,s=e=>new Promise(t=>setTimeout(t,e)),c=()=>Math.floor(256*Math.random()),randomRgb=()=>`rgb(${c()},${c()},${c()})`;document.body.addEventListener("click",async()=>{if(b&&!a){a=!0;return}if(b)return;b=!0;let e=document.getElementsByTagName("path"),t=document.getElementsByTagName("ellipse");for(;b;){for(let l=0;l<e.length;l++)("p"!==e[l].getAttribute("id")||a)&&(e[l].style.stroke=randomRgb(),e[l].style.fill=randomRgb());for(let r=0;r<t.length;r++)t[r].style.stroke=randomRgb(),t[r].style.fill=randomRgb();await s(60)}b=!1},!0);</script>';

    constructor(
        bytes32 allowListMerkleRoot,
        uint16 allowListMintMaxTotalVal,
        uint8 allowListMintMaxPerWalletVal
    )
        AllowList(allowListMerkleRoot)
        ERC721A("Onchain Steamboat Willie", "ONCHAINWILLIE")
    {
        _allowListMintMaxTotal = allowListMintMaxTotalVal;
        _allowListMintMaxPerWallet = allowListMintMaxPerWalletVal;
    }

    // Art

    /// @notice Set art for the collection.
    function setArt(uint8 ptrNum, string calldata art) external onlyOwner {
        if (ptrNum == 0) {
            artPtr0 = SSTORE2.write(bytes(art));
        } else if (ptrNum == 1) {
            artPtr1 = SSTORE2.write(bytes(art));
        } else if (ptrNum == 2) {
            artPtr2 = SSTORE2.write(bytes(art));
        }
    }

    /// @notice Update public mint enabled.
    /// @param enabled public mint enabled.
    function updatePublicMintEnabled(bool enabled) external onlyOwner {
        publicMintEnabled = enabled;
    }

    /// @notice Mint tokens for allowlist minters.
    /// @param proof proof
    /// @param amount amount of tokens to mint
    function mintAllowList(bytes32[] calldata proof, uint8 amount) external onlyAllowListed(proof) {
        // Checks
        unchecked {
            if (_totalMinted() + amount > _allowListMintMaxTotal) {
                // Check allowlist mint total is not exceeding max allowed to be minted during allowlist phase
                revert AllowListMintCapExceeded();
            }

            if (_allowListMinted[msg.sender] + amount > _allowListMintMaxPerWallet) {
                // Check wallet is not exceeding max allowed during allowlist phase
                revert AllowListMintCapPerWalletExceeded();
            }
        }

        // Effects

        // Increase allowlist minted by amount
        unchecked {
            _allowListMinted[msg.sender] += amount;
        }

        // Perform mint
        _coreMint(msg.sender, amount);
    }

    /// @notice Mint tokens.
    /// @param amount amount of tokens to mint
    function mintPublic(uint8 amount) external payable {
        // Checks
        if (!publicMintEnabled) {
            // Check public mint enabled
            revert PublicMintNotEnabled();
        }

        unchecked {
            if (amount * PRICE != msg.value) {
                // Check payment by sender is correct
                revert IncorrectPayment();
            }
        }

        _coreMint(msg.sender, amount);
    }

    function _coreMint(address to, uint8 amount) internal {
        // Checks
        uint256 nextTokenIdToBeMinted = _nextTokenId();

        unchecked {
            if (MAX_SUPPLY + 1 < nextTokenIdToBeMinted + amount) {
                // Check max supply not exceeded
                revert MaxSupplyReached();
            }

            // Set seed
            for (uint256 i = nextTokenIdToBeMinted; i < nextTokenIdToBeMinted + amount;) {
                tokenToSeed[i] = keccak256(abi.encodePacked(block.prevrandao, i));
                ++i;
            }
        }

        // Perform mint
        _mint(to, amount);
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    /// @notice Withdraw all ETH from the contract.
    function withdraw() external {
        (bool success,) = _VAULT_ADDRESS.call{ value: address(this).balance }("");
        require(success);
    }

    /// @notice Get art color hue.
    /// @param tokenId token id
    /// @return hue
    function getColorHue(uint256 tokenId) public view returns (uint16 hue) {
        LibPRNG.PRNG memory prng;
        prng.seed(keccak256(abi.encodePacked(tokenToSeed[tokenId], uint256(1001))));
        return uint16(prng.uniform(360));
    }

    /// @notice Get art svg for token.
    /// @param tokenId token id
    /// @return art
    function art(uint256 tokenId) public view returns (string memory) {
        if (!_exists(tokenId)) {
            revert URIQueryForNonexistentToken();
        }

        string memory colorHueStr = getColorHue(tokenId).toString();
        string memory backgroundColor = string.concat("hsla(", colorHueStr, ",50%,92%,100%);");
        return string.concat(
            string(SSTORE2.read(artPtr0)),
            "hsla(",
            colorHueStr,
            ",50%,13%,100%)}#v{background-color:",
            backgroundColor,
            "}.h{fill:",
            backgroundColor,
            "}",
            string(SSTORE2.read(artPtr1)),
            string(SSTORE2.read(artPtr2))
        );
    }

    /// @notice Get token uri for token.
    /// @param tokenId token id
    /// @return tokenURI
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) {
            revert URIQueryForNonexistentToken();
        }

        string memory artSvg = art(tokenId);

        return Utils.formatTokenURI(
            tokenId,
            string.concat("data:image/svg+xml;base64,", Utils.encodeBase64(bytes(artSvg))),
            string.concat(
                "data:text/html;base64,",
                Utils.encodeBase64(
                    bytes(
                        string.concat(
                            '<html style="overflow:hidden"><body style="margin:0">',
                            artSvg,
                            ANIMATION_SCRIPT,
                            "</body></html>"
                        )
                    )
                )
            ),
            string.concat("[", Utils.getTrait("Hue", getColorHue(tokenId).toString(), true, false), "]")
        );
    }
}
