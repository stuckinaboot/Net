// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

/// @title Renderer
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
interface IRenderer {
    // TODO throw error if token isn't supported
    function getArt(uint256 tokenId) external returns (string memory svg, string memory html);
    function getTraits(uint256 tokenId) external returns (string memory);
}
