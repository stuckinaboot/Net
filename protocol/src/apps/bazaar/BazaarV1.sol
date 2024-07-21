// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {Net} from "../../net/Net.sol";
import {OrderParameters} from "@seaport-types/lib/ConsiderationStructs.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Bazaar
/// @author Aspyn Palatnick (aspyn.eth, stuckinaboot.eth)
contract BazaarV1 {
    event Submitted(address indexed tokenAddress, uint256 indexed tokenId);
    error OfferItemsMustContainOneItem();
    // TODO confirm consideration items scenario
    error ConsiderationItemsMustContainTwoItems();

    Net internal net = Net(0x00000000B24D62781dB359b07880a105cD0b64e6);

    struct Submission {
        OrderParameters parameters;
        uint256 counter;
        bytes signature;
    }

    function submit(Submission calldata submission) external {
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

        uint256 totalAmount = submission.parameters.consideration[0].endAmount +
            submission.parameters.consideration[1].endAmount;

        emit Submitted(offerItemAddress, tokenId);

        net.sendMessageViaApp(
            msg.sender,
            string.concat(
                "List ",
                Strings.toHexString(offerItemAddress),
                " #",
                Strings.toString(tokenId),
                "\nPrice: ",
                weiToEthString(totalAmount),
                "\nExpiration Date: ",
                Strings.toString(submission.parameters.endTime)
            ),
            string(abi.encodePacked(offerItemAddress)),
            abi.encode(submission)
        );
    }

    function weiToEthString(
        uint256 weiValue
    ) internal pure returns (string memory) {
        uint256 ethValueWhole = weiValue / 1e18;
        uint256 ethValueFraction = (weiValue % 1e18) / 1e10; // 8 decimal places

        string memory wholePart = Strings.toString(ethValueWhole);
        string memory fractionPart = Strings.toString(ethValueFraction);

        // Pad the fraction part with leading zeros if necessary
        while (bytes(fractionPart).length < 8) {
            fractionPart = string(abi.encodePacked("0", fractionPart));
        }

        return string(abi.encodePacked(wholePart, ".", fractionPart));
    }
}
