// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

contract Constants {
    uint256 public constant PRICE = 0.005 ether;
    // Use 1200 as max supply for onchain steamboat willie testing purposes
    uint256 internal constant MAX_SUPPLY = 1300; //1111;

    uint16 constant MAX_MESSAGE_LENGTH = 280;
    uint8 constant MAX_TOPIC_LENGTH = 100;
}
