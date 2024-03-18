// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {WillieNet} from "../../src/willie-net/WillieNet.sol";

contract TestUtils {
    WillieNet willieNet;

    constructor(WillieNet net) {
        willieNet = net;
    }
}
