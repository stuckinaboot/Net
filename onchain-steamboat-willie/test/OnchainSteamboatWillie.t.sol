// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import { PRBTest } from "@prb/test/PRBTest.sol";
import { console2 } from "forge-std/console2.sol";
import { StdCheats } from "forge-std/StdCheats.sol";
import { StdStorage, stdStorage } from "forge-std/StdStorage.sol";
import { OnchainSteamboatWillie } from "../src/OnchainSteamboatWillie.sol";
import { Constants } from "../src/utils/Constants.sol";
import { TwoStepOwnable } from "../src/utils/TwoStepOwnable.sol";
import { NFTEventsAndErrors } from "../src/NFTEventsAndErrors.sol";
import { IERC721A } from "@erc721a/ERC721A.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Utils } from "../src/utils/Utils.sol";
import { IERC721Receiver } from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import { AllowList } from "../src/utils/AllowList.sol";
import { TwoStepOwnable } from "../src/utils/TwoStepOwnable.sol";

contract OnchainSteamboatWillieTest is NFTEventsAndErrors, Constants, PRBTest, StdCheats, IERC721Receiver {
    using stdStorage for StdStorage;

    StdStorage private stdstore;
    uint256 _MINT_AMOUNT_DURING_COMMENCE = 0;

    // Test users
    address[100] users;
    address[3] allowlistUsers;

    bytes32 constant MERKLE_ROOT = bytes32(0x2d107cbb32e49adaafb9cc9c8409afc10b7e64df0fac665c4c9e9ad805b585c6);
    bytes32[][] MERKLE_PROOFS = [
        // For address 0x3264a9468f0B89643F377add8E5fb119D495435e
        [
            bytes32(0xa9d0f1c9a6f546d90e778091985c6d6f44533b0bbeca4d15fa6760de7c7a35d2),
            bytes32(0xaa263d98dedf675fea66a657908f214a9d63f285629fc48c45f1eb423f22907a),
            bytes32(0xf6c05c9247c31ba2609da7bf5c4612719606115572c427bfaf4c4917166e8f99),
            bytes32(0x368be17affb5a592a9956939f914eee2de69e9f3b79ffec504310948bffa0fe4)
        ],
        [
            // For address 0x6B19b1af385e2eC8D5fa9adf52b057B1c00A07fc
            bytes32(0xfbd167d6af9f6087d18f616708afd4250986bb32445773571893a46509dee6b3),
            bytes32(0xaa263d98dedf675fea66a657908f214a9d63f285629fc48c45f1eb423f22907a),
            bytes32(0xf6c05c9247c31ba2609da7bf5c4612719606115572c427bfaf4c4917166e8f99),
            bytes32(0x368be17affb5a592a9956939f914eee2de69e9f3b79ffec504310948bffa0fe4)
        ],
        [
            // For address 0x2248bf80865f89ae6d029c080B344D1B66aCD8C8
            bytes32(0x55d5400f9305ed743f8d8e6e54cf95ee866d514826ddfa209993e36646831df0),
            bytes32(0x68854de8d02b44aa8ad5bed71b5eb089b12386fbe91f34f59cd889c10a497a68),
            bytes32(0xf6c05c9247c31ba2609da7bf5c4612719606115572c427bfaf4c4917166e8f99),
            bytes32(0x368be17affb5a592a9956939f914eee2de69e9f3b79ffec504310948bffa0fe4)
        ]
    ];

    uint16 ALLOWLIST_MINT_CAP = 45;
    uint8 ALLOWLIST_MINT_MAX_PER_WALLET = 15;

    OnchainSteamboatWillie public nft =
        new OnchainSteamboatWillie(MERKLE_ROOT, ALLOWLIST_MINT_CAP, ALLOWLIST_MINT_MAX_PER_WALLET);

    function setUp() public {
        vm.deal(address(this), 1000 ether);

        allowlistUsers[0] = address(0x3264a9468f0B89643F377add8E5fb119D495435e);
        allowlistUsers[1] = address(0x6B19b1af385e2eC8D5fa9adf52b057B1c00A07fc);
        allowlistUsers[2] = address(0x2248bf80865f89ae6d029c080B344D1B66aCD8C8);

        for (uint256 i = 0; i < allowlistUsers.length; i++) {
            vm.deal(allowlistUsers[i], 10 ether);
        }

        for (uint256 i = 0; i < users.length; i++) {
            users[i] = address(uint160(i + 1));
            vm.deal(users[i], 10 ether);
        }
    }

    function testPublicMintExceedMaxPerTransaction(uint8 amount) public {
        nft.updatePublicMintEnabled(true);
        vm.assume(amount > 0 && amount < 25);

        // Iteratively mint maxSupply tokens
        uint256 price = nft.PRICE();
        uint256 totalValue = amount * price;
        nft.mintPublic{ value: totalValue }(amount);

        nft.mintPublic{ value: price * 5 }(5);
    }

    function testIterativelyMintToMaxSupply() public {
        nft.updatePublicMintEnabled(true);
        // Iteratively mint maxSupply tokens
        uint256 amtRemaining = MAX_SUPPLY;
        uint256 price = nft.PRICE();
        while (amtRemaining > 0) {
            uint256 amtToMint = amtRemaining > 5 ? 5 : amtRemaining;
            uint256 totalValue = amtToMint * price;
            nft.mintPublic{ value: totalValue }(uint8(amtToMint));
            amtRemaining -= amtToMint;
        }

        assertEq(nft.totalSupply(), MAX_SUPPLY);

        // Expect a revert when attempting to mint more than max supply
        vm.expectRevert(MaxSupplyReached.selector);
        nft.mintPublic{ value: price }(1);
    }

    function testOneMint() external {
        nft.updatePublicMintEnabled(true);
        nft.mintPublic{ value: nft.PRICE() * 5 }(5);
    }

    function testMint(uint256 numToMint) external {
        nft.updatePublicMintEnabled(true);
        vm.assume(numToMint < 100);

        for (uint256 i = 1; i < users.length && i <= numToMint; i++) {
            vm.startPrank(users[i]);

            nft.mintPublic{ value: PRICE }(1);
            vm.stopPrank();
            assertEq(nft.ownerOf(i), users[i]);
        }
        // Owner of 0 should always revert
        vm.expectRevert(IERC721A.OwnerQueryForNonexistentToken.selector);
        nft.ownerOf(0);
        // Both these ownerOf calls should succeed
        if (numToMint >= 1) {
            nft.ownerOf(1);
        }
    }

    function testOnlyAllowListMintSingleMints() external {
        nft.updatePublicMintEnabled(false);

        for (uint256 i = 0; i < allowlistUsers.length; i++) {
            vm.startPrank(allowlistUsers[i]);

            nft.mintAllowList(MERKLE_PROOFS[i], 1);
            vm.stopPrank();
            assertEq(nft.ownerOf(_MINT_AMOUNT_DURING_COMMENCE + i + 1), allowlistUsers[i]);
        }
    }

    function testOnlyAllowListMintMultipleMints() external {
        nft.updatePublicMintEnabled(false);

        uint8 amountToMint = 5;
        for (uint256 i = 0; i < allowlistUsers.length; i++) {
            vm.startPrank(allowlistUsers[i]);

            nft.mintAllowList(MERKLE_PROOFS[i], amountToMint);
            vm.stopPrank();

            uint256 firstMintedTokenIdForUser = _MINT_AMOUNT_DURING_COMMENCE + i * amountToMint + 1;
            for (uint256 j = firstMintedTokenIdForUser; j < firstMintedTokenIdForUser + amountToMint; j++) {
                assertEq(nft.ownerOf(j), allowlistUsers[i]);
            }
        }
    }

    function testOnlyAllowListTotalMintCapExceeded() external {
        nft.updatePublicMintEnabled(false);

        uint8 amountToMint = ALLOWLIST_MINT_MAX_PER_WALLET;

        vm.startPrank(allowlistUsers[0]);
        nft.mintAllowList(MERKLE_PROOFS[0], amountToMint);
        vm.startPrank(allowlistUsers[1]);
        nft.mintAllowList(MERKLE_PROOFS[1], amountToMint);

        vm.startPrank(allowlistUsers[2]);
        vm.expectRevert(NFTEventsAndErrors.AllowListMintCapExceeded.selector);
        nft.mintAllowList(MERKLE_PROOFS[2], amountToMint + 1);

        uint8 amtToMintNotExceeding =
            uint8(ALLOWLIST_MINT_CAP - _MINT_AMOUNT_DURING_COMMENCE - amountToMint - amountToMint);
        nft.mintAllowList(MERKLE_PROOFS[2], amtToMintNotExceeding);

        uint256 price = nft.PRICE();
        vm.expectRevert(NFTEventsAndErrors.AllowListMintCapExceeded.selector);
        nft.mintAllowList(MERKLE_PROOFS[2], 1);

        // Iteratively mint out in public
        vm.stopPrank();
        nft.updatePublicMintEnabled(true);
        uint256 amtRemaining = MAX_SUPPLY - ALLOWLIST_MINT_CAP;
        while (amtRemaining > 0) {
            uint256 amtToMint = amtRemaining > 20 //_MAX_PUBLIC_MINT_AMOUNT_PER_TRANSACTION
                ? 20 //_MAX_PUBLIC_MINT_AMOUNT_PER_TRANSACTION
                : amtRemaining;
            uint256 totalValue = amtToMint * price;
            nft.mintPublic{ value: totalValue }(uint8(amtToMint));
            amtRemaining -= amtToMint;
        }
    }

    function testOnlyAllowListMintMultipleMintsMaxExceeded(uint8 amtToExceedMintMaxBy) external {
        vm.assume(amtToExceedMintMaxBy > 0 && amtToExceedMintMaxBy < 10);
        nft.updatePublicMintEnabled(false);

        uint8 amountToMint = ALLOWLIST_MINT_MAX_PER_WALLET + amtToExceedMintMaxBy;
        uint256 price1 = amountToMint * nft.PRICE();
        // user 0
        vm.startPrank(allowlistUsers[0]);
        // Revert
        vm.expectRevert(NFTEventsAndErrors.AllowListMintCapPerWalletExceeded.selector);
        nft.mintAllowList(MERKLE_PROOFS[0], amountToMint);

        // Success
        nft.mintAllowList(MERKLE_PROOFS[0], ALLOWLIST_MINT_MAX_PER_WALLET);

        // Mint any more results in revert
        uint256 price2 = nft.PRICE();
        vm.expectRevert(NFTEventsAndErrors.AllowListMintCapPerWalletExceeded.selector);
        nft.mintAllowList(MERKLE_PROOFS[0], 1);

        uint256 price3 = amtToExceedMintMaxBy * nft.PRICE();
        vm.expectRevert(NFTEventsAndErrors.AllowListMintCapPerWalletExceeded.selector);
        nft.mintAllowList(MERKLE_PROOFS[0], amtToExceedMintMaxBy);
        vm.stopPrank();

        // user 1: allowlist mint iteratively to limit
        vm.startPrank(allowlistUsers[1]);
        uint256 singleItemPrice = nft.PRICE();
        for (uint256 i = 0; i < ALLOWLIST_MINT_MAX_PER_WALLET; i++) {
            nft.mintAllowList(MERKLE_PROOFS[1], 1);
        }
        vm.expectRevert(NFTEventsAndErrors.AllowListMintCapPerWalletExceeded.selector);
        nft.mintAllowList(MERKLE_PROOFS[1], 1);

        vm.expectRevert(NFTEventsAndErrors.AllowListMintCapPerWalletExceeded.selector);
        nft.mintAllowList(MERKLE_PROOFS[1], amtToExceedMintMaxBy);

        // user 2 can mint fine
        vm.startPrank(allowlistUsers[2]);
        nft.mintAllowList(MERKLE_PROOFS[2], 1);
    }

    function testAllowListMintFailsForUserNotOnAllowList(
        uint256 userIdx,
        bytes32[] calldata proof,
        uint8 amount
    )
        external
    {
        vm.assume(amount < 10);

        nft.updatePublicMintEnabled(false);
        vm.assume(userIdx < users.length);

        uint256 value = nft.PRICE() * amount;
        address user = users[userIdx];
        vm.startPrank(user);
        vm.expectRevert(AllowList.NotAllowListed.selector);
        nft.mintAllowList(proof, amount);
    }

    function testPublicMintNotEnabled(uint8 amount) external {
        vm.assume(amount < 5 && amount > 0);
        nft.updatePublicMintEnabled(false);

        uint256 value = nft.PRICE() * amount;
        vm.expectRevert(NFTEventsAndErrors.PublicMintNotEnabled.selector);
        nft.mintPublic{ value: value }(amount);

        nft.updatePublicMintEnabled(true);
        nft.mintPublic{ value: value }(amount);

        nft.updatePublicMintEnabled(false);
        vm.expectRevert(NFTEventsAndErrors.PublicMintNotEnabled.selector);
        nft.mintPublic{ value: value }(amount);
    }

    function testMintIncorrectPriceError(uint256 invalidPrice) external {
        nft.updatePublicMintEnabled(true);
        vm.assume(invalidPrice < 1 ether);
        vm.assume(invalidPrice != PRICE);

        vm.expectRevert(NFTEventsAndErrors.IncorrectPayment.selector);
        nft.mintPublic{ value: invalidPrice }(1);
    }

    // function testTokenUriForNonExistentToken() public {
    //     nft.updatePublicMintEnabled(true);
    //     vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
    //     nft.tokenURI(0);

    //     vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
    //     nft.tokenURI(1);

    //     nft.mintPublic{ value: PRICE }(1);
    //     nft.tokenURI(1);

    //     vm.expectRevert(IERC721A.URIQueryForNonexistentToken.selector);
    //     nft.tokenURI(2);
    // }

    // Mainly used for local testing
    // function testTokenUriForExistingToken() public {
    //     nft.updatePublicMintEnabled(true);
    //     uint256 amount = 201;

    //     for (uint256 i = 0; i < amount; i++) {
    //         nft.mintPublic{ value: nft.PRICE() }(1);
    //     }
    //     emit LogNamedString("Token URI", nft.tokenURI(amount));
    // }

    function testWithdraw() external {
        nft.updatePublicMintEnabled(true);
        // Check mint and withdraw increases balance
        uint256 ogBalance = address(_VAULT_ADDRESS).balance;
        vm.startPrank(users[0]);
        nft.mintPublic{ value: nft.PRICE() }(1);
        nft.withdraw();
        assertEq(address(_VAULT_ADDRESS).balance, ogBalance + nft.PRICE());
        assertEq(address(nft).balance, 0);
    }

    // function testArt() external {
    //     nft.updatePublicMintEnabled(true);
    //     nft.mintPublic{ value: nft.PRICE() }(1);
    //     nft.mintPublic{ value: nft.PRICE() }(1);
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
