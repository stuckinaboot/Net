// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import {PRBTest} from "@prb/test/PRBTest.sol";
import {console2} from "forge-std/console2.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdStorage, stdStorage} from "forge-std/StdStorage.sol";
import {WillieNet} from "../../../src/willie-net/WillieNet.sol";
import {Constants} from "../../../src/willie-net/Constants.sol";
import {NFTEventsAndErrors} from "../../../src/willie-net/onchain-steamboat-willie/NFTEventsAndErrors.sol";
import {IERC721A} from "@erc721a/ERC721A.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Utils} from "../../../src/willie-net/renderer/Utils.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import {TwoStepOwnable} from "../../../src/willie-net/renderer/TwoStepOwnable.sol";
import {OnchainSteamboatWillie} from "../../../src/willie-net/onchain-steamboat-willie/OnchainSteamboatWillie.sol";
import {Renderer} from "../../../src/willie-net/renderer/Renderer.sol";

contract RendererTest is PRBTest, StdCheats {
    using stdStorage for StdStorage;

    StdStorage private stdstore;
    uint256 _MINT_AMOUNT_DURING_COMMENCE = 0;

    // Test users
    address[100] users;

    uint16 ALLOWLIST_MINT_CAP = 45;
    uint8 ALLOWLIST_MINT_MAX_PER_WALLET = 15;
    OnchainSteamboatWillie public willie =
        new OnchainSteamboatWillie(
            bytes32(0),
            ALLOWLIST_MINT_CAP,
            ALLOWLIST_MINT_MAX_PER_WALLET
        );
    WillieNet public nft = new WillieNet();
    Renderer public renderer = new Renderer(address(nft));

    function setUp() public {
        vm.deal(address(this), 1000 ether);

        willie.setArt(0, "abc");
        willie.setArt(1, "def");
        willie.setArt(2, "ghi");
        willie.updatePublicMintEnabled(true);

        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }
    }

    function postSendMessageChecks(
        uint256 expectedMsgsCnt,
        uint256 expectedAddressesCnt,
        string memory expectedMessage
    ) public {
        (string memory messages, address[] memory addresses) = renderer
            .getMessagesEncoded();
        assertEq(nft.getTotalMessagesCount(), expectedMsgsCnt);
        // TODO add addresses check
        // assertEq(addresses.length, expectedAddressesCnt);
        assertEq(messages, expectedMessage);
    }

    function testSendAndGetMessagesEncodedOneUserOneToken() public {
        assertEq(nft.getTotalMessagesCount(), 0);

        // 280 character message
        nft.sendMessage(bytes32(0), "abc", "Topic");
        nft.sendMessage(bytes32(0), "def", "Topic");
        nft.sendMessage(bytes32(0), "ghi", "Topic");
        postSendMessageChecks(
            3,
            1,
            '["ghi","0x7fa9385be102ac3eac297483dd6233d62b3e1496","Topic","def","0x7fa9385be102ac3eac297483dd6233d62b3e1496","Topic","abc","0x7fa9385be102ac3eac297483dd6233d62b3e1496","Topic"]'
        );
    }

    function testOneUserSendsThreeMessagesAnimationUrl() public {
        assertEq(nft.getTotalMessagesCount(), 0);

        // 280 character message
        nft.sendMessage(bytes32(0), "abc", "Topic");
        nft.sendMessage(bytes32(0), "def", "Topic");
        nft.sendMessage(bytes32(0), "ghi", "Topic");
        postSendMessageChecks(
            3,
            1,
            '["ghi","0x7fa9385be102ac3eac297483dd6233d62b3e1496","Topic","def","0x7fa9385be102ac3eac297483dd6233d62b3e1496","Topic","abc","0x7fa9385be102ac3eac297483dd6233d62b3e1496","Topic"]'
        );
        string memory animationUrl = renderer.animationUrl();
        emit LogNamedString("Animation url", animationUrl);
    }

    function testSendAndGetMessagesEncodedOneUserMultipleTokens() public {
        assertEq(nft.getTotalMessagesCount(), 0);

        // 280 character message
        nft.sendMessage(bytes32(0), "abc", "Topic");
        nft.sendMessage(bytes32(0), "def", "Topic");
        nft.sendMessage(bytes32(0), "ghi", "Topic");
        postSendMessageChecks(
            3,
            1,
            '["ghi","0x7fa9385be102ac3eac297483dd6233d62b3e1496","Topic","def","0x7fa9385be102ac3eac297483dd6233d62b3e1496","Topic","abc","0x7fa9385be102ac3eac297483dd6233d62b3e1496","Topic"]'
        );
    }

    function testSendAndGetMessagesEncodedMultipleUsersMultipleTokens(
        bool notableMint
    ) public {
        assertEq(nft.getTotalMessagesCount(), 0);

        vm.startPrank(users[0]);
        nft.sendMessage(bytes32(0), "apple", "Topic1");
        vm.stopPrank();
        vm.startPrank(users[1]);
        nft.sendMessage(bytes32(0), "banana", "Topic2");
        vm.stopPrank();
        vm.startPrank(users[2]);
        nft.sendMessage(bytes32(0), "cars", "Topic3");
        vm.stopPrank();

        postSendMessageChecks(
            3,
            3,
            '["cars","0x0000000000000000000000000000000000000003","Topic3","banana","0x0000000000000000000000000000000000000002","Topic2","apple","0x0000000000000000000000000000000000000001","Topic1"]'
        );
    }

    function testSendAndGetUserAttributesOneUser() public {
        assertEq(nft.getTotalMessagesCount(), 0);

        // 280 character message
        nft.sendMessage(bytes32(0), "abc", "Topic");
        nft.sendMessage(bytes32(0), "def", "Topic");
        (string memory messages, address[] memory addresses) = renderer
            .getMessagesEncoded();
        assertEq(
            renderer.getUserAttributesEncoded(addresses),
            // TODO get actual attributes showing
            '{"0x7fa9385be102ac3eac297483dd6233d62b3e1496":["",],"0x7fa9385be102ac3eac297483dd6233d62b3e1496":["",]}'
        );
    }
}
