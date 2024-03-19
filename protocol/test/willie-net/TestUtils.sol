// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {WillieNet} from "../../src/willie-net/WillieNet.sol";
import {OnchainSteamboatWillie} from "../../src/onchain-steamboat-willie/OnchainSteamboatWillie.sol";

contract TestUtils {
    WillieNet willieNet;
    OnchainSteamboatWillie willieNft;

    constructor(WillieNet net, OnchainSteamboatWillie nft) {
        willieNet = net;
        willieNft = nft;
    }

    function mintNft(uint8 amount) public {
        willieNft.mintPublic{value: amount * 0.005 ether}(amount);
    }
}
