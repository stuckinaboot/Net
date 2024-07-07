// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Net} from "../../net/Net.sol";

/// @title Storage
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice Data storage with persistent history using Net
contract Storage {
    Net internal net = Net(0x00000000B24D62781dB359b07880a105cD0b64e6);

    function put(bytes32 key, bytes calldata value) external {
        string memory topic = string(abi.encodePacked(key));
        net.sendMessageViaApp(
            msg.sender,
            string.concat("Stored ", topic),
            topic,
            value
        );
    }

    /// @notice Get data for a particular key and operator
    /// @param key key
    /// @param operator user that stored key
    /// @return data stored data for the particular key-operator pair
    function get(
        bytes32 key,
        address operator
    ) external view returns (bytes memory) {
        string memory topic = string(abi.encodePacked(key));
        return
            net
                .getMessageForAppUserTopic(
                    net.getTotalMessagesForAppUserTopicCount(
                        address(this),
                        operator,
                        topic
                    ),
                    address(this),
                    operator,
                    topic
                )
                .data;
    }
}
