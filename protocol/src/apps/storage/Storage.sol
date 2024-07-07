// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Net} from "../../net/Net.sol";

/// @title Storage
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice Data storage with persistent history using Net
contract Storage {
    event Stored(bytes32 indexed key, address indexed operator);

    Net internal net = Net(0x00000000B24D62781dB359b07880a105cD0b64e6);

    function put(bytes32 key, bytes calldata value) external {
        // Convert key to string
        string memory topic = string(abi.encodePacked(key));

        // Send message on Net
        net.sendMessageViaApp(
            msg.sender,
            string.concat("Stored ", topic),
            topic,
            value
        );

        // Emit event
        emit Stored(key, msg.sender);
    }

    /// @notice Get data for a particular key and operator
    /// @param key key
    /// @param operator user that stored key
    /// @return data stored data for the particular key-operator pair
    function get(
        bytes32 key,
        address operator
    ) external view returns (bytes memory) {
        // Get most recent message for particular key-operator pair
        return
            getValueAtIndex(
                key,
                operator,
                net.getTotalMessagesForAppUserTopicCount(
                    address(this),
                    operator,
                    topic
                )
            );
    }

    function getValueAtIndex(
        bytes32 key,
        address operator,
        uint256 idx
    ) public view {
        // Convert key to string
        string memory topic = string(abi.encodePacked(key));
        return
            net
                .getMessageForAppUserTopic(idx, address(this), operator, topic)
                .data;
    }

    /// @notice Get total number of writes to a particular key for a given operator
    /// @param key key
    /// @param operator user that stored key
    /// @return total total writes count
    function getTotalWrites(bytes32 key, address operator) external {
        return
            net.getTotalMessagesForAppUserTopicCount(
                address(this),
                operator,
                topic
            );
    }
}
