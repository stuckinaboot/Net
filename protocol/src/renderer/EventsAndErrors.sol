// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

interface EventsAndErrors {
    error TokenNotSupported();
    error UserNotTokenOwner();

    event NameUpdated(address indexed user, address tokenAddress, uint256 tokenId);
    event PfpUpdated(address indexed user, address tokenAddress, uint256 tokenId);
}
