// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

// TODO decide if this interface is needed
interface IWillieNet {
    // TODO update to include all relevant functions from Willienet main
    struct Message {
        uint256 senderTokenId;
        address sender;
        uint256 timestamp;
        bytes32 extraData;
        string message;
        string topic;
    }

    function getMessage(uint256 idx) external returns (Message memory);
    function getTotalMessagesCount() external view returns (uint256);
}
