// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import { Script, console } from "forge-std/Script.sol";
import { PopWillies } from "../src/warhol/PopWillies.sol";
import { Renderer } from "../src/warhol/Renderer.sol";

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract DeployWarhol is Script {
    address internal deployer;
    PopWillies internal nft;

    function setUp() public virtual { }

    function run() public {
        string memory root = vm.projectRoot();

        // address testnetSteamboatWillies = 0x8a5948492eeF6D5C63C343b3E719296D40a87dF6;
        address mainnetSteamboatWillies = 0x2b3D24EA6c291Eb761e00c65Ff85872B040c7a88;

        address onchainSteamboatWillies = address(mainnetSteamboatWillies);
        address[] memory seadropAddrs = new address[](1);
        // https://docs.opensea.io/docs/deploying-a-seadrop-compatible-contract
        seadropAddrs[0] = address(0x00005EA00Ac477B1030CE78506496e8C2dE24bf5);
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        // vm.startBroadcast();
        Renderer renderer = new Renderer(onchainSteamboatWillies);
        nft = new PopWillies(onchainSteamboatWillies, address(renderer), seadropAddrs);
        nft.mintPopWillies4(1, 9, 12, 6, 1);
        nft.setMintEnabled(false);
        // nft.mint{ value: 2 * 4 * 0.005 ether * 1 }(2, false);
        // nft.mint{ value: 2 * 9 * 0.005 ether }(2, true);
        vm.stopBroadcast();
    }
}
