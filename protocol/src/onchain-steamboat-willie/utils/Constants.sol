// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

contract Constants {
    uint256 public constant PRICE = 0.005 ether;
    // Use 1200 as max supply for onchain steamboat willie testing purposes
    uint256 internal constant MAX_SUPPLY = 1300; //1111;
    address payable internal constant _VAULT_ADDRESS = payable(address(0x39Ab90066cec746A032D67e4fe3378f16294CF6b));
}
