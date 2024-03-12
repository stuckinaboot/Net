// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import { PRBTest } from "@prb/test/PRBTest.sol";
import { console2 } from "forge-std/console2.sol";
import { StdCheats } from "forge-std/StdCheats.sol";
import { StdStorage, stdStorage } from "forge-std/StdStorage.sol";
import { OnchainSteamboatWillie } from "../../src/OnchainSteamboatWillie.sol";
import { PopWillies } from "../../src/warhol/PopWillies.sol";
import { TwoStepOwnable } from "../../src/utils/TwoStepOwnable.sol";
import { NFTEventsAndErrors } from "../../src/warhol/NFTEventsAndErrors.sol";
import { IERC721A } from "@erc721a/ERC721A.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Utils } from "../../src/utils/Utils.sol";
import { IERC721Receiver } from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import { TwoStepOwnable } from "../../src/utils/TwoStepOwnable.sol";
import { Renderer } from "../../src/warhol/Renderer.sol";

contract PopWilliesTest is NFTEventsAndErrors, PRBTest, StdCheats, IERC721Receiver {
    using stdStorage for StdStorage;

    StdStorage private stdstore;

    uint256 internal constant MAX_SUPPLY = 300;

    uint256 WILLIE_PRICE = 0.005 ether;

    address payable internal constant _VAULT_ADDRESS = payable(address(0x39Ab90066cec746A032D67e4fe3378f16294CF6b));

    // Test users
    address[100] users;

    uint16 ALLOWLIST_MINT_CAP = 45;
    uint8 ALLOWLIST_MINT_MAX_PER_WALLET = 15;
    OnchainSteamboatWillie public willie =
        new OnchainSteamboatWillie(bytes32(0), ALLOWLIST_MINT_CAP, ALLOWLIST_MINT_MAX_PER_WALLET);
    PopWillies public warhol;

    address[] seadropAddrs;

    function setUp() public {
        willie.setArt(0, "abc");
        willie.setArt(1, "def");
        willie.setArt(2, "ghi");
        willie.updatePublicMintEnabled(true);

        seadropAddrs = new address[](1);
        // https://docs.opensea.io/docs/deploying-a-seadrop-compatible-contract
        seadropAddrs[0] = address(0x00005EA00Ac477B1030CE78506496e8C2dE24bf5);
        Renderer renderer = new Renderer(address(willie));
        warhol = new PopWillies(address(willie), address(renderer), seadropAddrs);
        warhol.setMintEnabled(true);
        vm.deal(address(this), 1000 ether);

        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }
    }

    function testSetMintEnabledByOwner() public {
        warhol.setMintEnabled(true);
        warhol.setMintEnabled(false);
        warhol.setMintEnabled(true);
        warhol.setMintEnabled(false);
    }

    function testSetMintEnabledByNonOwnerFails(uint16 i) public {
        vm.assume(i < 10);
        vm.startPrank(users[i]);
        vm.expectRevert(TwoStepOwnable.OnlyOwner.selector);
        warhol.setMintEnabled(true);
        vm.expectRevert(TwoStepOwnable.OnlyOwner.selector);
        warhol.setMintEnabled(false);
    }

    function testSetRendererByNonOwnerFails(uint16 i) public {
        vm.assume(i < 10);
        vm.startPrank(users[i]);
        vm.expectRevert(TwoStepOwnable.OnlyOwner.selector);
        warhol.setRenderer(address(0));
        vm.expectRevert(TwoStepOwnable.OnlyOwner.selector);
        warhol.setRenderer(users[0]);
        vm.expectRevert(TwoStepOwnable.OnlyOwner.selector);
        warhol.setRenderer(users[2]);
        vm.expectRevert(TwoStepOwnable.OnlyOwner.selector);
        warhol.setRenderer(address(willie));
    }

    function testIterativelyMintToMaxSupply() public {
        // Iteratively mint maxSupply tokens
        uint256 amtRemaining = MAX_SUPPLY;
        uint256 price = WILLIE_PRICE;
        while (amtRemaining > 0) {
            uint256 amtToMint = amtRemaining > 3 ? 3 : amtRemaining;
            uint256 totalValue = amtToMint * price;
            warhol.mint{ value: totalValue * 4 }(uint8(amtToMint), false);
            amtRemaining -= amtToMint;
        }

        assertEq(warhol.totalSupply(), MAX_SUPPLY);

        // Expect a revert when attempting to mint more than max supply using
        // standard mint
        vm.expectRevert(MaxSupplyReached.selector);
        warhol.mint{ value: price * 4 }(1, false);

        // Expect a revert when attempting to mint more than max supply using
        // mintPopWillies4
        willie.mintPublic{ value: WILLIE_PRICE * 4 }(4);
        vm.expectRevert(MaxSupplyReached.selector);
        warhol.mintPopWillies4(1, 2, 3, 4, 1);

        // Expect a revert when attempting to mint more than max supply using
        // mintPopWillies9
        willie.mintPublic{ value: WILLIE_PRICE * 9 }(9);
        vm.expectRevert(MaxSupplyReached.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 7, 8, 9, 1);
    }

    function testOneMintWarhol(bool large, uint8 amount) external {
        vm.assume(amount > 0 && amount <= 3);
        warhol.mint{ value: WILLIE_PRICE * (large ? 9 : 4) * amount }(amount, large);

        // Fail to mint more than max per transaction
        vm.expectRevert(NFTEventsAndErrors.MaxMintsPerTransactionExceeded.selector);
        warhol.mint{ value: WILLIE_PRICE * 11 }(11, large);

        vm.expectRevert(NFTEventsAndErrors.MaxMintsPerTransactionExceeded.selector);
        warhol.mint{ value: WILLIE_PRICE * 13 }(13, large);
    }

    function testOneMintPopWillies4(uint8 amount) external {
        vm.assume(amount > 0 && amount <= 3);
        willie.mintPublic{ value: WILLIE_PRICE * 4 }(4);
        warhol.mintPopWillies4(1, 2, 3, 4, amount);

        // Fail to mint more than max per transaction
        vm.expectRevert(NFTEventsAndErrors.MaxMintsPerTransactionExceeded.selector);
        warhol.mintPopWillies4(1, 2, 3, 4, 11);

        vm.expectRevert(NFTEventsAndErrors.MaxMintsPerTransactionExceeded.selector);
        warhol.mintPopWillies4(1, 2, 3, 4, 13);

        warhol.setMintEnabled(false);
        vm.expectRevert(NFTEventsAndErrors.MintNotEnabled.selector);
        warhol.mintPopWillies4(1, 2, 3, 4, amount);

        warhol.setMintEnabled(true);
        warhol.mintPopWillies4(1, 2, 3, 4, amount);
    }

    function testOneMintPopWillies9(uint8 amount) external {
        vm.assume(amount > 0 && amount <= 3);
        willie.mintPublic{ value: WILLIE_PRICE * 9 }(9);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 7, 8, 9, amount);

        // Fail to mint more than max per transaction
        vm.expectRevert(NFTEventsAndErrors.MaxMintsPerTransactionExceeded.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 7, 8, 9, 11);

        vm.expectRevert(NFTEventsAndErrors.MaxMintsPerTransactionExceeded.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 7, 8, 9, 13);

        warhol.setMintEnabled(false);
        vm.expectRevert(NFTEventsAndErrors.MintNotEnabled.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 7, 8, 9, amount);

        warhol.setMintEnabled(true);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 7, 8, 9, amount);
    }

    function testPopWillies4MsgSenderNotOwnerOfWillie(uint8 amount) external {
        vm.assume(amount > 0 && amount <= 3);
        willie.mintPublic{ value: WILLIE_PRICE * 4 }(4);

        vm.startPrank(users[1]);
        willie.mintPublic{ value: WILLIE_PRICE * 9 }(9);
        vm.stopPrank();

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies4(5, 1, 2, 3, amount);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies4(1, 5, 2, 3, amount);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies4(1, 2, 5, 3, amount);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies4(1, 2, 3, 5, amount);

        warhol.mintPopWillies4(2, 3, 1, 4, amount);
    }

    function testOneMintPopWillies9MsgSenderNotOwnerOfWillie(uint8 amount) external {
        vm.assume(amount > 0 && amount <= 3);
        willie.mintPublic{ value: WILLIE_PRICE * 9 }(9);
        vm.startPrank(users[1]);
        willie.mintPublic{ value: WILLIE_PRICE * 9 }(9);
        vm.stopPrank();

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies9(10, 2, 3, 4, 5, 6, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies9(1, 10, 3, 4, 5, 6, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies9(1, 2, 10, 4, 5, 6, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies9(1, 2, 3, 10, 5, 6, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 10, 6, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 10, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 10, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 7, 10, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 7, 8, 10, amount);

        warhol.mintPopWillies9(9, 8, 7, 6, 5, 4, 3, 2, 1, amount);
    }

    function testPopWillies4DuplicateWillieReverts(uint8 amount) external {
        vm.assume(amount > 0 && amount <= 3);
        willie.mintPublic{ value: WILLIE_PRICE * 10 }(10);

        vm.startPrank(users[1]);
        willie.mintPublic{ value: WILLIE_PRICE * 9 }(9);
        vm.stopPrank();

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies4(1, 1, 1, 1, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies4(3, 3, 3, 3, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies4(1, 1, 2, 3, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies4(2, 1, 2, 3, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies4(1, 4, 3, 4, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies4(1, 2, 4, 4, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies4(1, 4, 4, 4, amount);
    }

    function testPopWillies9DuplicateWillieReverts(uint8 amount) external {
        vm.assume(amount > 0 && amount <= 3);
        willie.mintPublic{ value: WILLIE_PRICE * 10 }(10);

        vm.startPrank(users[1]);
        willie.mintPublic{ value: WILLIE_PRICE * 9 }(9);
        vm.stopPrank();

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 1, 1, 1, 1, 1, 1, 1, 1, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(3, 3, 3, 3, 3, 3, 3, 3, 3, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 1, 2, 3, 4, 5, 6, 7, 8, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(2, 1, 2, 3, 4, 5, 6, 7, 8, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 4, 3, 4, 5, 6, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 2, 4, 4, 5, 6, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 4, 4, 4, 5, 6, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 7, 8, 2, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 7, 1, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 6, 1, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 5, 1, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 2, 3, 4, 1, 6, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 2, 3, 1, 5, 6, 7, 8, 9, amount);

        vm.expectRevert(NFTEventsAndErrors.OnchainSteamboatWillieCanOnlyBeIncludedOncePerToken.selector);
        warhol.mintPopWillies9(1, 2, 1, 4, 5, 6, 7, 8, 9, amount);
    }

    function testMintWarholMintNotEnabled() external {
        warhol.setMintEnabled(false);
        vm.expectRevert(NFTEventsAndErrors.MintNotEnabled.selector);
        warhol.mint{ value: WILLIE_PRICE * 4 * 1 }(1, false);
    }

    function testMintWarhol(uint256 numToMint) external {
        vm.assume(numToMint < 100);

        uint256 baseWillieIdx;
        for (uint256 i = 1; i < users.length && i <= numToMint; i++) {
            vm.startPrank(users[i]);

            warhol.mint{ value: WILLIE_PRICE * 4 * 1 }(1, false);
            baseWillieIdx = (i - 1) * 4;
            assertEq(users[i], willie.ownerOf(baseWillieIdx + 1));
            assertEq(users[i], willie.ownerOf(baseWillieIdx + 2));
            assertEq(users[i], willie.ownerOf(baseWillieIdx + 3));
            assertEq(users[i], willie.ownerOf(baseWillieIdx + 4));
            vm.stopPrank();
            assertEq(warhol.ownerOf(i), users[i]);
        }

        // Owner of 0 should always revert
        vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
        warhol.ownerOf(0);
        // Both these ownerOf calls should succeed
        if (numToMint >= 1) {
            warhol.ownerOf(1);
        }

        warhol.mint{ value: WILLIE_PRICE * 9 * 1 }(1, true);
        if (numToMint > 0) {
            baseWillieIdx += 5;
        } else {
            baseWillieIdx = 1;
        }
        for (uint256 i = 0; i < 9; i++) {
            assertEq(address(this), willie.ownerOf(baseWillieIdx + i));
        }
    }

    function testMintIncorrectPriceError(uint256 invalidPrice) external {
        vm.assume(invalidPrice < 1 ether);
        vm.assume(invalidPrice != WILLIE_PRICE);

        vm.expectRevert(NFTEventsAndErrors.IncorrectPayment.selector);
        warhol.mint{ value: invalidPrice }(1, false);
    }

    function testTokenUriForNonExistentToken() public {
        vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
        warhol.tokenURI(0);

        vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
        warhol.art(0);

        vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
        warhol.tokenURI(1);

        vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
        warhol.art(1);

        warhol.mint{ value: WILLIE_PRICE * 4 }(1, false);
        warhol.tokenURI(1);
        warhol.art(1);

        vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
        warhol.tokenURI(2);

        vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
        warhol.art(2);
    }

    function testWithdrawWarhol() public {
        // Expect revert since not minting from seadrop
        vm.expectRevert();
        warhol.mintSeaDrop(address(this), 3);

        // Mint from seadrop should succeed
        address self = address(this);
        vm.startPrank(seadropAddrs[0]);
        warhol.mintSeaDrop(self, 3);
        vm.stopPrank();

        // Call fallback
        uint256 buffer = 0.0123 ether;
        (bool success,) = address(warhol).call{ value: 3 * WILLIE_PRICE * 4 + buffer }("");
        require(success);

        assertEq(address(warhol).balance, buffer);
        assertEq(address(_VAULT_ADDRESS).balance, 0);

        // Withdraw
        warhol.withdraw();
        assertEq(address(warhol).balance, 0);
        assertEq(address(_VAULT_ADDRESS).balance, buffer);
    }

    function testPaintWillies4() public {
        warhol.mint{ value: WILLIE_PRICE * 4 }(1, false);

        assertEq(willie.ownerOf(1), address(this));
        assertEq(willie.ownerOf(2), address(this));
        assertEq(willie.ownerOf(3), address(this));
        assertEq(willie.ownerOf(4), address(this));

        vm.expectEmit(false, false, false, true);
        emit MetadataUpdate(1);
        warhol.paintWillies4(1, 1, 2, 3, 4);

        // Check errors
        vm.startPrank(users[1]);
        warhol.mint{ value: WILLIE_PRICE * 9 }(1, true);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfPopWillie.selector);
        warhol.paintWillies4(1, 5, 6, 7, 8);

        vm.expectRevert(NFTEventsAndErrors.PaintIncorrectPopWillieSize.selector);
        warhol.paintWillies4(2, 5, 6, 7, 8);
        vm.stopPrank();

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.paintWillies4(1, 1, 2, 3, 5);

        // Check painting with last willie
        uint256 amtRemaining = 1111 - willie.totalSupply();
        uint256 price = WILLIE_PRICE;
        while (amtRemaining > 0) {
            uint256 amtToMint = amtRemaining > 10 ? 10 : amtRemaining;
            uint256 totalValue = amtToMint * price;
            willie.mintPublic{ value: totalValue }(uint8(amtToMint));
            amtRemaining -= amtToMint;
        }

        // Paint with last token should succeed
        warhol.paintWillies4(1, 1, 2, 3, 1111);
        warhol.paintWillies4(1, 1, 2, 1111, 3);
        warhol.paintWillies4(1, 1, 1111, 3, 4);
        warhol.paintWillies4(1, 1111, 2, 3, 4);

        vm.expectRevert();
        warhol.paintWillies4(1, 11_111, 2, 3, 4);

        vm.expectRevert();
        warhol.paintWillies4(1, 0, 2, 3, 4);
    }

    function testPaintWillies9() public {
        warhol.mint{ value: WILLIE_PRICE * 9 }(1, true);

        for (uint256 i = 1; i <= 9; i++) {
            assertEq(willie.ownerOf(i), address(this));
        }

        vm.expectEmit(false, false, false, true);
        emit MetadataUpdate(1);
        warhol.paintWillies9(1, 9, 8, 7, 6, 5, 4, 1, 2, 3);

        // Check errors
        vm.startPrank(users[1]);
        warhol.mint{ value: WILLIE_PRICE * 4 }(1, false);

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfPopWillie.selector);
        warhol.paintWillies9(1, 1, 2, 3, 4, 5, 6, 7, 8, 9);

        vm.expectRevert(NFTEventsAndErrors.PaintIncorrectPopWillieSize.selector);
        warhol.paintWillies9(2, 5, 6, 7, 8, 1, 2, 3, 4, 9);
        vm.stopPrank();

        vm.expectRevert(NFTEventsAndErrors.MsgSenderNotOwnerOfOnchainSteamboatWillie.selector);
        warhol.paintWillies9(1, 1, 2, 3, 10, 4, 5, 6, 7, 8);

        // Check painting with last willie
        uint256 amtRemaining = 1111 - willie.totalSupply();
        uint256 price = WILLIE_PRICE;
        while (amtRemaining > 0) {
            uint256 amtToMint = amtRemaining > 10 ? 10 : amtRemaining;
            uint256 totalValue = amtToMint * price;
            willie.mintPublic{ value: totalValue }(uint8(amtToMint));
            amtRemaining -= amtToMint;
        }

        // Paint with last token should succeed
        warhol.paintWillies9(1, 1, 2, 3, 1111, 4, 5, 6, 7, 8);
        warhol.paintWillies9(1, 1, 2, 3, 9, 4, 5, 6, 7, 1111);
        warhol.paintWillies9(1, 1111, 2, 3, 9, 4, 5, 6, 7, 8);

        vm.expectRevert();
        warhol.paintWillies9(1, 11_111, 2, 3, 9, 4, 5, 6, 7, 8);

        vm.expectRevert();
        warhol.paintWillies9(1, 0, 2, 3, 9, 4, 5, 6, 7, 8);
    }

    function testPlayground() public {
        uint8 f = 10;
        uint256 j = 1 ether;
        assertEq(f * j, 10 ether);
    }

    // Mainly used for local testing.
    // Correctly gets invalid pointer error since we don't yet set art right now,
    // but that signals art is being properly called on onchain steamboat willie contract
    function testTokenUriForExistingTokenWarhol(bool large) public {
        uint256 amount = 5;

        for (uint256 i = 0; i < amount; i++) {
            warhol.mint{ value: WILLIE_PRICE * (large ? 9 : 4) }(1, large);
        }
        emit LogNamedString("Token URI", warhol.tokenURI(amount));

        // Ensure these don't revert (ex. due to out of gas)
        warhol.mint{ value: WILLIE_PRICE * 9 }(1, true);
        warhol.tokenURI(amount + 1);

        warhol.mint{ value: WILLIE_PRICE * 4 }(1, false);
        warhol.tokenURI(amount + 2);
    }

    // function testArt() external {
    //     nft.updatePublicMintEnabled(true);
    //     nft.mintPublic{ value: WILLIE_PRICE }(1);
    //     nft.mintPublic{ value: WILLIE_PRICE }(1);
    //     emit LogNamedString("Art", nft.art(2));
    // }

    // Experiment

    // function testKeccak256() public {
    //     emit LogNamedString("keccak256", Strings.toHexString(uint256(keccak256(abi.encode(5831)))));
    // }

    // https://ethereum.stackexchange.com/questions/72425/how-can-i-pack-two-int16-into-a-single-byte32
    // https://xtremetom.medium.com/save-gas-with-data-packing-dd9a28d4df15
    // get last n bits https://solidity-by-example.org/bitwise/

    // Helpers

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    receive() external payable { }
}
