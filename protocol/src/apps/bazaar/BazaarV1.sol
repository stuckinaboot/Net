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
    error ConsiderationItemsMustContainTwoItems();
    error ConsiderationItemsMustIncludeMsgSender();
    error ConsiderationItemsMustIncludeFeeAddress();
    error InvalidFee();

    address internal constant FEE_ADDRESS =
        address(0x32D16C15410248bef498D7aF50D10Db1a546b9E5);
    uint256 internal constant MIN_FEE_BPS = 450;

    Net internal net = Net(0x00000000B24D62781dB359b07880a105cD0b64e6);

    struct Submission {
        OrderParameters parameters;
        uint256 counter;
        bytes signature;
    }

    string public constant NET_APP_NAME = "BazaarV1";

    function submit(Submission calldata submission) external {
        // https://github.com/ProjectOpenSea/seaport-types/blob/main/src/lib/ConsiderationStructs.sol

        // Validate offer items contain 1 items
        if (submission.parameters.offer.length != 1) {
            revert OfferItemsMustContainOneItem();
        }

        // Validate consideration items contain 2 items
        if (submission.parameters.consideration.length != 2) {
            revert ConsiderationItemsMustContainTwoItems();
        }

        // Address validation
        if (submission.parameters.consideration[0].recipient != msg.sender) {
            revert ConsiderationItemsMustIncludeMsgSender();
        }
        if (submission.parameters.consideration[1].recipient != FEE_ADDRESS) {
            revert ConsiderationItemsMustIncludeFeeAddress();
        }
        if (
            ((submission.parameters.consideration[1].startAmount * 10_000) /
                (submission.parameters.consideration[0].startAmount +
                    submission.parameters.consideration[1].startAmount)) <
            MIN_FEE_BPS
        ) {
            revert InvalidFee();
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
