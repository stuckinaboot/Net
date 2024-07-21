// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Net} from "../../net/Net.sol";

/// @title Storage
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice Data storage with persistent history using Net
contract Storage {
    event Stored(bytes32 indexed key, address indexed operator);

    Net internal net = Net(0x00000000B24D62781dB359b07880a105cD0b64e6);

    /// @notice Store value for a given key
    /// @param key key
    /// @param value value
    function put(bytes32 key, bytes calldata value) external {}
}
