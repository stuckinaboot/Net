// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

interface NFTEventsAndErrors {
    error UserNotTokenOwner();

    error MessageExceedsMaxLength();
    error TopicExceedsMaxLength();

    // TODO remove unused
    error MintNotEnabled();
    error MaxSupplyReached();
    error MaxMintsPerTransactionExceeded();
    error IncorrectPayment();
    error MsgSenderNotOwnerOfOnchainSteamboatWillie();
    error OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken();
    error MsgSenderNotOwnerOfPopWillie();
    error PaintIncorrectPopWillieSize();

    event MessageSent(string indexed topic, address indexed sender, uint256 messageIndex);
}
