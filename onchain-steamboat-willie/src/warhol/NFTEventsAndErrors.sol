// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

interface NFTEventsAndErrors {
    event MetadataUpdate(uint256 tokenId);

    error MintNotEnabled();
    error MaxSupplyReached();
    error MaxMintsPerTransactionExceeded();
    error IncorrectPayment();
    error MsgSenderNotOwnerOfOnchainSteamboatWillie();
    error OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken();
    error MsgSenderNotOwnerOfPopWillie();
    error PaintIncorrectPopWillieSize();
}
