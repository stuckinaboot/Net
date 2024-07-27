// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Net} from "../../net/Net.sol";
import {Storage} from "../storage/Storage.sol";

/// @title Profiles
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
/// @notice User profiles based on Net
contract Profiles {
    event ProfileUpdated(address indexed user);

    // TODO use correct address
    Storage internal store = Storage(address(0));
    Net internal net = Net(0x00000000B24D62781dB359b07880a105cD0b64e6);

    uint256 constant BODY_KEY_INDICATOR = 1;
    uint256 constant TITLE_INDICATOR = 2;
    uint256 constant PICTURE_INDICATOR = 3;

    struct Picture {
        // We choose to not validate profile picture onchain so that
        // we can allow profile picture to originate on any chain.
        uint256 profilePictureChainId;
        address profilePictureTokenAddress;
        uint256 profilePictureTokenId;
    }

    /// @notice Set profile for a given user
    function setFullProfile(
        uint256 profilePictureChainId,
        address profilePictureTokenAddress,
        uint256 profilePictureTokenId,
        string calldata body,
        string calldata title
    ) external {
        // Store picture
        store.put(
            keccak256(
                abi.encodePacked(
                    // TODO see if this is correct for type conversions for sender
                    bytes20(uint160(msg.sender)),
                    PICTURE_KEY_INDICATOR
                )
            ),
            bytes(
                Picture({
                    profilePictureChainId: profilePictureChainId,
                    profilePictureTokenAddress: profilePictureTokenAddress,
                    profilePictureTokenId: profilePictureTokenId
                })
            )
        );

        // Store body
        store.put(
            keccak256(
                abi.encodePacked(
                    // TODO see if this is correct for type conversions for sender
                    bytes20(uint160(msg.sender)),
                    BODY_KEY_INDICATOR
                )
            ),
            bytes(body)
        );

        // Store title
        store.put(
            keccak256(
                abi.encodePacked(
                    // TODO see if this is correct for type conversions for sender
                    bytes20(uint160(msg.sender)),
                    TITLE_KEY_INDICATOR
                )
            ),
            bytes(title)
        );

        // Send message on Net
        net.sendMessageViaApp(
            msg.sender,
            "Updated profile",
            // TODO decide if topic is needed
            "",
            ""
        );

        // Emit event
        emit ProfileUpdated(msg.sender);
    }

    /// @notice Get value for a particular key and operator
    /// @param key key
    /// @param operator user that stored key
    /// @return value stored value for the particular key-operator pair
    function get(
        bytes32 key,
        address operator
    ) external view returns (bytes memory) {
        string memory topic = string(abi.encodePacked(key));
        // Get most recent message for particular key-operator pair
        return
            net
                .getMessageForAppUserTopic(
                    net.getTotalMessagesForAppUserTopicCount(
                        address(this),
                        operator,
                        topic
                    ) - 1,
                    address(this),
                    operator,
                    topic
                )
                .data;
    }

    /// @notice Get value at index for a particular key and operator
    /// @param key key
    /// @param operator user that stored key
    /// @param idx index
    /// @return value stored value at index for the particular key-operator pair
    function getValueAtIndex(
        bytes32 key,
        address operator,
        uint256 idx
    ) public view returns (bytes memory) {
        return
            net
                .getMessageForAppUserTopic(
                    idx,
                    address(this),
                    operator,
                    string(abi.encodePacked(key))
                )
                .data;
    }

    /// @notice Get total number of writes to a particular key for a given operator
    /// @param key key
    /// @param operator user that stored key
    /// @return total total writes count
    function getTotalWrites(
        bytes32 key,
        address operator
    ) external view returns (uint256) {
        return
            net.getTotalMessagesForAppUserTopicCount(
                address(this),
                operator,
                string(abi.encodePacked(key))
            );
    }
}
