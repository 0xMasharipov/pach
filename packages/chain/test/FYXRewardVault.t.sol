// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {FYXRewardVault} from "../src/FYXRewardVault.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface Vm {
    function chainId(uint256) external;
    function addr(uint256) external returns (address);
    function sign(uint256, bytes32) external returns (uint8, bytes32, bytes32);
    function prank(address) external;
    function startPrank(address) external;
    function stopPrank() external;
    function expectRevert(bytes4) external;
    function expectRevert() external;
    function warp(uint256) external;
    function etch(address, bytes calldata) external;
}

contract MockUSDC is ERC20 {
    bool public fail;
    bool public chargeFee;
    address public failRecipient;
    address public reenterTarget;
    bytes public reenterData;
    bool public reentryBlocked;

    constructor() ERC20("Test USDC", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setFail(bool value) external {
        fail = value;
    }

    function setFee(bool value) external {
        chargeFee = value;
    }

    function setFailRecipient(address recipient) external {
        failRecipient = recipient;
    }

    function setReentry(address target, bytes calldata data) external {
        reenterTarget = target;
        reenterData = data;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        if (fail || to == failRecipient) return false;
        if (reenterTarget != address(0)) {
            (bool ok, bytes memory reason) = reenterTarget.call(reenterData);
            reentryBlocked = !ok && bytes4(reason) == bytes4(keccak256("ReentrancyGuardReentrantCall()"));
        }
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        if (fail) return false;
        if (chargeFee) {
            super.transferFrom(from, to, amount - 1);
            return true;
        }
        return super.transferFrom(from, to, amount);
    }
}

contract FYXRewardVaultTest {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    // Deliberately public test-vector scalar; never used by deployment scripts or runtime.
    uint256 internal constant TEST_SIGNER_KEY = 0xA11CE;
    address internal constant TOKEN = 0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73;
    address internal constant SPONSOR = address(0x1001);
    address internal constant FINDER = address(0x1002);
    address internal constant DEVELOPER = address(0x1003);
    address internal constant TREASURY = address(0x1004);
    MockUSDC internal token;
    FYXRewardVault internal vault;
    uint256 internal campaign;
    uint64 internal expiry;

    function setUp() public {
        vm.chainId(10143);
        vm.warp(1_000_000);
        MockUSDC template = new MockUSDC();
        vm.etch(TOKEN, address(template).code);
        token = MockUSDC(TOKEN);
        vault = new FYXRewardVault(TOKEN, vm.addr(TEST_SIGNER_KEY), TREASURY);
        expiry = uint64(block.timestamp + 1 days);
        token.mint(SPONSOR, 100_000_000);
        vm.startPrank(SPONSOR);
        token.approve(address(vault), 100_000_000);
        campaign = vault.createChallenge(expiry);
        vm.stopPrank();
    }

    function approval(uint8 role, uint256 nonce) internal view returns (FYXRewardVault.Claim memory) {
        return FYXRewardVault.Claim(
            campaign,
            role,
            role == 0 ? FINDER : DEVELOPER,
            role == 0 ? 4_000_000 : 14_000_000,
            keccak256("controlled evidence"),
            nonce,
            expiry - 1
        );
    }

    function signature(FYXRewardVault.Claim memory item) internal returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(TEST_SIGNER_KEY, vault.hashClaim(item));
        return abi.encodePacked(r, s, v);
    }

    function redeem(uint8 role, uint256 nonce) internal {
        FYXRewardVault.Claim memory item = approval(role, nonce);
        bytes memory sig = signature(item);
        vm.prank(item.claimant);
        vault.claim(item, sig);
    }

    function conservation() internal view {
        require(
            vault.totalDeposited()
                == vault.totalClaimed() + vault.totalFeesPaid() + vault.totalRefunded() + vault.totalEscrow(),
            "accounting conservation"
        );
        require(token.balanceOf(address(vault)) == vault.totalEscrow(), "escrow backing");
    }

    function testBothClaimsAndFee() public {
        redeem(0, 1);
        require(token.balanceOf(TREASURY) == 0, "fee must wait for developer");
        redeem(1, 2);
        require(token.balanceOf(FINDER) == 4_000_000, "finder amount");
        require(token.balanceOf(DEVELOPER) == 14_000_000, "developer amount");
        require(token.balanceOf(TREASURY) == 2_000_000, "fee amount");
        conservation();
    }

    function testReverseClaimOrder() public {
        redeem(1, 2);
        redeem(0, 1);
        conservation();
    }

    function testRefundAllAfterExpiry() public {
        vm.warp(expiry);
        vm.prank(SPONSOR);
        vault.refundUnspent(campaign);
        require(token.balanceOf(SPONSOR) == 100_000_000, "refund");
        conservation();
    }

    function testFinderOnlyRefundIncludesUnpaidFee() public {
        redeem(0, 1);
        vm.warp(expiry);
        vm.prank(SPONSOR);
        vault.refundUnspent(campaign);
        require(token.balanceOf(SPONSOR) == 96_000_000, "remaining refund");
        require(token.balanceOf(TREASURY) == 0, "unearned fee");
        conservation();
    }

    function testDeveloperOnlyRefundFinder() public {
        redeem(1, 1);
        vm.warp(expiry);
        vm.prank(SPONSOR);
        vault.refundUnspent(campaign);
        require(token.balanceOf(SPONSOR) == 84_000_000, "finder refund");
        conservation();
    }

    function testReplayNonceRejected() public {
        FYXRewardVault.Claim memory item = approval(0, 1);
        bytes memory sig = signature(item);
        vm.prank(FINDER);
        vault.claim(item, sig);
        vm.expectRevert(FYXRewardVault.NonceUsed.selector);
        vm.prank(FINDER);
        vault.claim(item, sig);
    }

    function testSecondRoleClaimWithNewNonceRejected() public {
        redeem(0, 1);
        FYXRewardVault.Claim memory item = approval(0, 2);
        bytes memory sig = signature(item);
        vm.expectRevert(FYXRewardVault.AlreadyClaimed.selector);
        vm.prank(FINDER);
        vault.claim(item, sig);
    }

    function testNonceIsGlobalAcrossRolesAndCampaigns() public {
        redeem(0, 1);
        vm.prank(SPONSOR);
        campaign = vault.createChallenge(expiry);
        FYXRewardVault.Claim memory item = approval(1, 1);
        bytes memory sig = signature(item);
        vm.expectRevert(FYXRewardVault.NonceUsed.selector);
        vm.prank(DEVELOPER);
        vault.claim(item, sig);
    }

    function testWrongClaimantRejected() public {
        FYXRewardVault.Claim memory item = approval(0, 1);
        bytes memory sig = signature(item);
        vm.expectRevert(FYXRewardVault.WrongClaimant.selector);
        vm.prank(DEVELOPER);
        vault.claim(item, sig);
    }

    function testTamperedRecipientRejected() public {
        FYXRewardVault.Claim memory item = approval(0, 1);
        bytes memory sig = signature(item);
        item.claimant = DEVELOPER;
        vm.expectRevert(FYXRewardVault.UnauthorizedVerifier.selector);
        vm.prank(DEVELOPER);
        vault.claim(item, sig);
    }

    function testWrongAmountRejectedEvenIfSigned() public {
        FYXRewardVault.Claim memory item = approval(0, 1);
        item.amount = 20_000_000;
        bytes memory sig = signature(item);
        vm.expectRevert(FYXRewardVault.WrongAmount.selector);
        vm.prank(FINDER);
        vault.claim(item, sig);
    }

    function testInvalidRole() public {
        FYXRewardVault.Claim memory item = approval(2, 1);
        bytes memory sig = signature(item);
        vm.expectRevert(FYXRewardVault.InvalidRole.selector);
        vm.prank(DEVELOPER);
        vault.claim(item, sig);
    }

    function testExpiredAuthorization() public {
        FYXRewardVault.Claim memory item = approval(0, 1);
        item.deadline = block.timestamp - 1;
        bytes memory sig = signature(item);
        vm.expectRevert(FYXRewardVault.ClaimExpired.selector);
        vm.prank(FINDER);
        vault.claim(item, sig);
    }

    function testExpiredCampaign() public {
        FYXRewardVault.Claim memory item = approval(0, 1);
        bytes memory sig = signature(item);
        vm.warp(expiry);
        vm.expectRevert(FYXRewardVault.ChallengeExpired.selector);
        vm.prank(FINDER);
        vault.claim(item, sig);
    }

    function testUnauthorizedSigner() public {
        FYXRewardVault.Claim memory item = approval(0, 1);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xBAD, vault.hashClaim(item));
        vm.expectRevert(FYXRewardVault.UnauthorizedVerifier.selector);
        vm.prank(FINDER);
        vault.claim(item, abi.encodePacked(r, s, v));
    }

    function testWrongContractDomain() public {
        FYXRewardVault other = new FYXRewardVault(TOKEN, vm.addr(TEST_SIGNER_KEY), TREASURY);
        FYXRewardVault.Claim memory item = approval(0, 1);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(TEST_SIGNER_KEY, other.hashClaim(item));
        vm.expectRevert(FYXRewardVault.UnauthorizedVerifier.selector);
        vm.prank(FINDER);
        vault.claim(item, abi.encodePacked(r, s, v));
    }

    function testWrongChainDomainSignature() public {
        FYXRewardVault.Claim memory item = approval(0, 1);
        vm.chainId(143);
        bytes memory sig = signature(item);
        vm.chainId(10143);
        vm.expectRevert(FYXRewardVault.UnauthorizedVerifier.selector);
        vm.prank(FINDER);
        vault.claim(item, sig);
    }

    function testMainnetOperationsRejected() public {
        vm.chainId(143);
        vm.expectRevert(FYXRewardVault.WrongChain.selector);
        vault.createChallenge(expiry);
        vm.expectRevert(FYXRewardVault.WrongChain.selector);
        new FYXRewardVault(TOKEN, FINDER, TREASURY);
    }

    function testWrongTokenRejected() public {
        vm.expectRevert(FYXRewardVault.WrongToken.selector);
        new FYXRewardVault(address(0xBAD), FINDER, TREASURY);
    }

    function testZeroVerifierAndTreasuryRejected() public {
        vm.expectRevert(FYXRewardVault.ZeroAddress.selector);
        new FYXRewardVault(TOKEN, address(0), TREASURY);
        vm.expectRevert(FYXRewardVault.ZeroAddress.selector);
        new FYXRewardVault(TOKEN, FINDER, address(0));
    }

    function testEarlyAndUnauthorizedRefundsRejected() public {
        vm.expectRevert(FYXRewardVault.NotExpired.selector);
        vm.prank(SPONSOR);
        vault.refundUnspent(campaign);
        vm.warp(expiry);
        vm.expectRevert(FYXRewardVault.NotSponsor.selector);
        vm.prank(FINDER);
        vault.refundUnspent(campaign);
    }

    function testRepeatedRefundRejected() public {
        vm.warp(expiry);
        vm.prank(SPONSOR);
        vault.refundUnspent(campaign);
        vm.expectRevert(FYXRewardVault.NothingToRefund.selector);
        vm.prank(SPONSOR);
        vault.refundUnspent(campaign);
    }

    function testDepositFeeTokenRejected() public {
        token.setFee(true);
        vm.expectRevert(FYXRewardVault.InvalidDeposit.selector);
        vm.prank(SPONSOR);
        vault.createChallenge(expiry);
        conservation();
    }

    function testUnderfundedSponsorRejected() public {
        vm.startPrank(FINDER);
        token.approve(address(vault), 20_000_000);
        vm.expectRevert();
        vault.createChallenge(expiry);
        vm.stopPrank();
        conservation();
    }

    function testTransferFailureRollsBackClaim() public {
        FYXRewardVault.Claim memory item = approval(1, 2);
        bytes memory sig = signature(item);
        token.setFail(true);
        vm.expectRevert();
        vm.prank(DEVELOPER);
        vault.claim(item, sig);
        require(!vault.usedNonces(2), "nonce rollback");
        require(vault.totalFeesPaid() == 0, "fee rollback");
        conservation();
        token.setFail(false);
        vm.prank(DEVELOPER);
        vault.claim(item, sig);
        conservation();
    }

    function testReentrancyBlocked() public {
        token.setReentry(address(vault), abi.encodeCall(vault.refundUnspent, (campaign)));
        redeem(0, 1);
        require(token.reentryBlocked(), "reentrancy not blocked");
        conservation();
    }

    function testPlatformTransferFailureRollsBackEntireSettlement() public {
        FYXRewardVault.Claim memory item = approval(1, 2);
        bytes memory sig = signature(item);
        token.setFailRecipient(TREASURY);
        vm.expectRevert();
        vm.prank(DEVELOPER);
        vault.claim(item, sig);
        require(token.balanceOf(DEVELOPER) == 0, "developer transfer rollback");
        require(!vault.usedNonces(2), "nonce rollback");
        require(vault.totalFeesPaid() == 0, "fee rollback");
        conservation();
    }

    function testTamperedProofNonceAndDeadlineRejected() public {
        FYXRewardVault.Claim memory item = approval(0, 1);
        bytes memory sig = signature(item);
        item.proofHash = keccak256("different evidence");
        vm.expectRevert(FYXRewardVault.UnauthorizedVerifier.selector);
        vm.prank(FINDER);
        vault.claim(item, sig);
        item = approval(0, 2);
        vm.expectRevert(FYXRewardVault.UnauthorizedVerifier.selector);
        vm.prank(FINDER);
        vault.claim(item, sig);
        item = approval(0, 1);
        item.deadline -= 1;
        vm.expectRevert(FYXRewardVault.UnauthorizedVerifier.selector);
        vm.prank(FINDER);
        vault.claim(item, sig);
    }

    function testUnknownCampaignRejected() public {
        FYXRewardVault.Claim memory item = approval(0, 1);
        item.challengeId = 42;
        bytes memory sig = signature(item);
        vm.expectRevert(FYXRewardVault.UnknownChallenge.selector);
        vm.prank(FINDER);
        vault.claim(item, sig);
        vm.expectRevert(FYXRewardVault.UnknownChallenge.selector);
        vault.refundUnspent(42);
    }

    function testExpiredCreationRejected() public {
        vm.expectRevert(FYXRewardVault.InvalidExpiry.selector);
        vm.prank(SPONSOR);
        vault.createChallenge(uint64(block.timestamp));
    }

    function testAllMutationsRejectWrongChain() public {
        FYXRewardVault.Claim memory item = approval(0, 1);
        bytes memory sig = signature(item);
        vm.chainId(143);
        vm.expectRevert(FYXRewardVault.WrongChain.selector);
        vm.prank(FINDER);
        vault.claim(item, sig);
        vm.expectRevert(FYXRewardVault.WrongChain.selector);
        vm.prank(SPONSOR);
        vault.refundUnspent(campaign);
    }

    function testFuzzMultipleCampaignConservation(uint8 count, uint8 actions) public {
        uint256 campaigns = uint256(count % 4) + 1;
        for (uint256 i; i < campaigns; i++) {
            if (i != 0) {
                vm.prank(SPONSOR);
                campaign = vault.createChallenge(expiry);
            }
            if ((actions & 1) != 0) redeem(0, i * 2 + 1);
            if ((actions & 2) != 0) redeem(1, i * 2 + 2);
            (,, uint256 remaining, bool finder, bool developer,) = vault.challenges(campaign);
            require(
                20_000_000 == remaining + (finder ? 4_000_000 : 0) + (developer ? 16_000_000 : 0),
                "campaign conservation"
            );
            conservation();
        }
        vm.warp(expiry);
        for (uint256 i = 1; i <= campaigns; i++) {
            (,, uint256 remaining,,,) = vault.challenges(i);
            if (remaining != 0) {
                vm.prank(SPONSOR);
                vault.refundUnspent(i);
            }
            conservation();
        }
    }

    function testFuzzConservation(bool finder, bool developer, bool reverseOrder) public {
        if (reverseOrder && developer) redeem(1, 2);
        if (finder) redeem(0, 1);
        if (!reverseOrder && developer) redeem(1, 2);
        conservation();
        vm.warp(expiry);
        if (!(finder && developer)) {
            vm.prank(SPONSOR);
            vault.refundUnspent(campaign);
        }
        conservation();
    }
}
