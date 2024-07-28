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

    uint256 constant BODY_INDICATOR = 1;
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
                    PICTURE_INDICATOR
                )
            ),
            abi.encode(
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
                    BODY_INDICATOR
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
                    TITLE_INDICATOR
                )
            ),
            bytes(title)
        );

        // Send message on Net
        net.sendMessageViaApp(
            msg.sender,
            "Updated complete profile",
            // TODO decide if topic is needed
            "",
            ""
        );

        // Emit event
        emit ProfileUpdated(msg.sender);
    }

    /// @notice Set picture for a given user
    function setPicture(
        uint256 profilePictureChainId,
        address profilePictureTokenAddress,
        uint256 profilePictureTokenId
    ) external {
        // Store picture
        store.put(
            keccak256(
                abi.encodePacked(
                    // TODO see if this is correct for type conversions for sender
                    bytes20(uint160(msg.sender)),
                    PICTURE_INDICATOR
                )
            ),
            abi.encode(
                Picture({
                    profilePictureChainId: profilePictureChainId,
                    profilePictureTokenAddress: profilePictureTokenAddress,
                    profilePictureTokenId: profilePictureTokenId
                })
            )
        );

        // Send message on Net
        net.sendMessageViaApp(
            msg.sender,
            "Updated profile picture",
            // TODO decide if topic is needed
            "",
            ""
        );

        // Emit event
        emit ProfileUpdated(msg.sender);
    }

    /// @notice Set profile body for a given user
    function setBody(string calldata body) external {
        // Store body
        store.put(
            keccak256(
                abi.encodePacked(
                    // TODO see if this is correct for type conversions for sender
                    bytes20(uint160(msg.sender)),
                    BODY_INDICATOR
                )
            ),
            bytes(body)
        );

        // Send message on Net
        net.sendMessageViaApp(
            msg.sender,
            "Updated profile body",
            // TODO decide if topic is needed
            "",
            ""
        );

        // Emit event
        emit ProfileUpdated(msg.sender);
    }

    /// @notice Set profile title for a given user
    function setTitle(string calldata title) external {
        // Store title
        store.put(
            keccak256(
                abi.encodePacked(
                    // TODO see if this is correct for type conversions for sender
                    bytes20(uint160(msg.sender)),
                    TITLE_INDICATOR
                )
            ),
            bytes(title)
        );

        // Send message on Net
        net.sendMessageViaApp(
            msg.sender,
            "Updated profile title",
            // TODO decide if topic is needed
            "",
            ""
        );

        // Emit event
        emit ProfileUpdated(msg.sender);
    }

    /// @notice Get title
    /// @param user user
    /// @return title title
    function getTitle(address user) external view returns (string memory) {
        return
            string(
                store.get(
                    keccak256(
                        abi.encodePacked(
                            // TODO see if this is correct for type conversions for sender
                            bytes20(uint160(msg.sender)),
                            TITLE_INDICATOR
                        )
                    ),
                    user
                )
            );
    }

    /// @notice Get body
    /// @param user user
    /// @return body body
    function getBody(address user) external view returns (string memory) {
        return
            string(
                store.get(
                    keccak256(
                        abi.encodePacked(
                            // TODO see if this is correct for type conversions for sender
                            bytes20(uint160(msg.sender)),
                            BODY_INDICATOR
                        )
                    ),
                    user
                )
            );
    }

    /// @notice Get picture
    /// @param user user
    /// @return picture picture
    function getPicture(address user) external view returns (Picture memory) {
        return
            abi.decode(
                store.get(
                    keccak256(
                        abi.encodePacked(
                            // TODO see if this is correct for type conversions for sender
                            bytes20(uint160(msg.sender)),
                            PICTURE_INDICATOR
                        )
                    ),
                    user
                ),
                (Picture)
            );
    }
}
