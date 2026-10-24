// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {FYXRewardVault} from "../src/FYXRewardVault.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface DeployVm {
    function envAddress(string calldata) external returns (address);
    function startBroadcast() external;
    function stopBroadcast() external;
}

/// @notice Run with an authorized encrypted Foundry account; no private key is read by this script.
contract Deploy {
    DeployVm internal constant vm = DeployVm(address(uint160(uint256(keccak256("hevm cheat code")))));
    address internal constant TOKEN = 0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73;

    function run() external returns (FYXRewardVault vault) {
        require(block.chainid == 10143, "Monad Testnet only");
        require(TOKEN.code.length > 0 && IERC20Metadata(TOKEN).decimals() == 6, "Unexpected test token");
        address verifier = vm.envAddress("FYX_VERIFIER_ADDRESS");
        address treasury = vm.envAddress("FYX_TREASURY_ADDRESS");
        require(verifier != address(0) && treasury != address(0), "Missing verifier or treasury");
        vm.startBroadcast();
        vault = new FYXRewardVault(TOKEN, verifier, treasury);
        vm.stopBroadcast();
    }
}
