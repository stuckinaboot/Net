// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Net} from "../../net/Net.sol";
import {Order} from "@seaport-types/lib/ConsiderationStructs.sol";

/// @title Bazaar
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
contract BazaarV1 {
    event Submitted(address indexed tokenAddress, uint256 indexed tokenId);
    error OfferItemsMustContainOneItem();
    // TODO confirm consideration items scenario
    error ConsiderationItemsMustContainTwoItems();

    Net internal net = Net(0x00000000B24D62781dB359b07880a105cD0b64e6);

    function submit(Order calldata submission) external {
        // https://github.com/ProjectOpenSea/seaport-types/blob/main/src/lib/ConsiderationStructs.sol

        // Validate offer items contain 1 items
        if (submission.parameters.offer.length != 1) {
            revert OfferItemsMustContainOneItem();
        }

        // Validate consideration items contain 2 items
        if (submission.parameters.consideration.length != 2) {
            // TODO add fee validation
            revert ConsiderationItemsMustContainTwoItems();
        }

        // Use offer item address for topic
        address offerItemAddress = submission.parameters.offer[0].token;
        uint256 tokenId = submission.parameters.offer[0].identifierOrCriteria;

        emit Submitted(offerItemAddress, tokenId);

        net.sendMessageViaApp(
            msg.sender,
            "Stored submission",
            string(abi.encodePacked(offerItemAddress)),
            abi.encode(submission)
        );
    }
}
