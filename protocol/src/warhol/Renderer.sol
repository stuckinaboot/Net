// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import { NFTEventsAndErrors } from "./NFTEventsAndErrors.sol";
import { Utils } from "./Utils.sol";
import { LibString } from "../utils/LibString.sol";
import { LibPRNG } from "../LibPRNG.sol";
import { OnchainSteamboatWillie } from "../OnchainSteamboatWillie.sol";
import { SharedConstants } from "./SharedConstants.sol";

/// @title Renderer
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
contract Renderer is SharedConstants {
    using LibString for uint16;
    using LibString for uint8;

    OnchainSteamboatWillie internal onchainSteamboatWillie;

    constructor(address onchainSteamboatWillieAddr) {
        onchainSteamboatWillie = OnchainSteamboatWillie(onchainSteamboatWillieAddr);
    }

    /// @notice Get complete art.
    /// @param willies willies
    function art(uint16[] calldata willies) public view returns (string memory) {
        return string.concat(
            '<svg id="rt" width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
            '<svg width="100%" height="100%" shape-rendering="crispEdges">',
            artBaseWillies(willies, true),
            "</svg>",
            artBaseWillies(willies, false),
            artStyle(willies),
            "</svg>"
        );
    }

    function xyStr(uint8 i, uint8 rowSize) internal pure returns (string memory) {
        string memory x = Utils.getDecimalStringFrom1e18ScaledUint256(uint256(i % rowSize) * 1e18 * 100 / rowSize);
        string memory y = Utils.getDecimalStringFrom1e18ScaledUint256(uint256(i / rowSize) * 1e18 * 100 / rowSize);
        return string.concat(' x="', x, '%" y="', y, '%" ');
    }

    /// @notice Get base art.
    /// @param willies willies
    /// @param onlyRects only rects
    function artBaseWillies(uint16[] calldata willies, bool onlyRects) public view returns (string memory art) {
        bool large = willies.length == LARGE_TOKEN_COUNT;
        uint8 totalWillies = large ? LARGE_TOKEN_COUNT : SMALL_TOKEN_COUNT;
        uint8 rowSize = large ? 3 : 2;
        string memory rowScale = large ? "33.33333%" : "50%";
        string memory widthHeight = string.concat('width="', rowScale, '" height="', rowScale, '">');

        string[LARGE_TOKEN_COUNT] memory willieArt;
        unchecked {
            for (uint8 i; i < willies.length;) {
                uint16 willieId = willies[i];
                string memory xyStr = xyStr(i, rowSize);
                willieArt[i] = onlyRects
                    ? string.concat(
                        "<rect", xyStr, 'width="', rowScale, '" height="', rowScale, '" class="h', i.toString(), '" />'
                    )
                    : string.concat(
                        '<svg class="k" id="foo',
                        i.toString(),
                        '"',
                        xyStr,
                        widthHeight,
                        onchainSteamboatWillie.art(willieId),
                        "</svg>"
                    );
                ++i;
            }
            art = string.concat(
                willieArt[0],
                willieArt[1],
                willieArt[2],
                willieArt[3],
                // These will be empty if large is false, which is fine
                willieArt[4],
                willieArt[5],
                willieArt[6],
                willieArt[7],
                willieArt[8]
            );
        }
    }

    /// @notice Get art style.
    /// @param willies willies
    function artStyle(uint16[] calldata willies) public view returns (string memory art) {
        bool large = willies.length == LARGE_TOKEN_COUNT;
        uint8 totalWillies = large ? LARGE_TOKEN_COUNT : SMALL_TOKEN_COUNT;

        art = "<style>#rt {max-width: 1200px; max-height: 1200px; } ";
        unchecked {
            for (uint8 i; i < willies.length;) {
                string memory colorHueStr = onchainSteamboatWillie.getColorHue(willies[i]).toString();
                string memory backgroundColor = string.concat("hsla(", colorHueStr, ",50%,92%,100%);");

                string memory id = string.concat("#foo", i.toString());
                art = string.concat(
                    art,
                    id,
                    " .d{fill:hsla(",
                    colorHueStr,
                    ",70%,70%,100%);} ",
                    id,
                    " #v {background-color:",
                    backgroundColor,
                    "} ",
                    id,
                    " .h, .h",
                    i.toString(),
                    " {fill:",
                    backgroundColor,
                    "}"
                );
                ++i;
            }
        }
        art = string.concat(art, "</style>");
    }

    /// @notice Get art animation script.
    /// @param willies willies
    function artScript(uint16[] calldata willies) public view returns (string memory art) {
        bool large = willies.length == LARGE_TOKEN_COUNT;
        uint8 totalWillies = large ? LARGE_TOKEN_COUNT : SMALL_TOKEN_COUNT;

        art = "<script>let bH=[";
        unchecked {
            for (uint8 i; i < willies.length;) {
                string memory colorHueStr = onchainSteamboatWillie.getColorHue(willies[i]).toString();
                art = string.concat(art, colorHueStr, i < willies.length - 1 ? "," : "");
                ++i;
            }
        }
        return string.concat(
            art,
            '],a=!1,b=!1,s=t=>new Promise(e=>setTimeout(e,t)),c=()=>Math.floor(256*Math.random()),randomBrightHsla=t=>`hsl(${t},70%,70%`,currentlyRendering=!1,paths=Array.from(document.getElementsByTagName("path")),ellipses=Array.from(document.getElementsByTagName("ellipse"));const originalPathData=Array.from(paths).map(t=>({fill:t.getAttribute("fill"),class:t.getAttribute("class"),stroke:t.getAttribute("stroke")})),originalEllipseData=Array.from(ellipses).map(t=>({fill:t.getAttribute("fill"),class:t.getAttribute("class"),stroke:t.getAttribute("stroke")}));let renderFlow=async()=>{if(currentlyRendering)return;currentlyRendering=!0;for(let t=0;t<paths.length;t++)paths[t].setAttribute("fill","none"),paths[t].setAttribute("class",""),paths[t].setAttribute("pathLength",100),paths[t].setAttribute("stroke-dasharray","100"),paths[t].setAttribute("stroke-dashoffset","100");for(let e=0;e<ellipses.length;e++)ellipses[e].setAttribute("stroke-dasharray","100"),ellipses[e].setAttribute("stroke-dashoffset","100");async function l(t,e,l){let r=parseFloat(paths[t].getAttribute("stroke-dashoffset"));for(l||"d"!==originalPathData[t].class||paths[t].setAttribute("fill",randomBrightHsla(bH[e])),l&&0==t&&(r=150);r<200;)0!=(r=Math.min(200,r+.5))&&(all0offset=!1),paths[t].setAttribute("stroke-dashoffset",r),r=parseFloat(paths[t].getAttribute("stroke-dashoffset")),await s(15)}async function r(t,e,r,i){let n=[];for(let o=t;o<e;o++)n.push(l(o,r,i)),await s(25);await Promise.all(n)}let i=document.getElementsByClassName("k").length,n=paths.length/i;ellipses.length;let o=[];for(let h=0;h<i;h++)o.push([h*n,(h+1)*n]);await Promise.all(o.map(async(t,e)=>{await s(1e3*e),await r(t[0],t[1],e,!0)})),await Promise.all(o.map(async(t,e)=>{await s(200*e),await r(t[0],t[1],e,!1)}));for(let $=0;$<ellipses.length;$++)ellipses[$].setAttribute("stroke-dashoffset",200);currentlyRendering=!1};renderFlow(),document.body.addEventListener("click",renderFlow,!0);</script>'
        );
    }
}
