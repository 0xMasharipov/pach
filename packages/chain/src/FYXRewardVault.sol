// SPDX-License-Identifier: MIT
pragma solidity 0.8.33;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Testnet-only escrow. The verifier authorizes outcomes; this contract does not verify bug reports.
/// @dev No upgrade, owner withdrawal, pause, signer rotation or early sponsor clawback powers.
contract FYXRewardVault is EIP712, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant CHAIN_ID = 10143;
    address public constant TEST_USDC = 0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73;
    uint256 public constant FINDER_AMOUNT = 4_000_000;
    uint256 public constant DEVELOPER_AMOUNT = 14_000_000;
    uint256 public constant PLATFORM_FEE = 2_000_000;
    uint256 public constant DEPOSIT = FINDER_AMOUNT + DEVELOPER_AMOUNT + PLATFORM_FEE;
    bytes32 public constant CLAIM_TYPEHASH = keccak256(
        "Claim(uint256 challengeId,uint8 role,address claimant,uint256 amount,bytes32 proofHash,uint256 nonce,uint256 deadline)"
    );

    IERC20 public immutable token;
    address public immutable verifier;
    address public immutable treasury;
    uint256 public nextChallengeId = 1;
    uint256 public totalDeposited;
    uint256 public totalClaimed;
    uint256 public totalFeesPaid;
    uint256 public totalRefunded;
    uint256 public totalEscrow;

    struct Challenge {
        address sponsor;
        uint64 expiry;
        uint256 remainingBalance;
        bool finderClaimed;
        bool developerClaimed;
        bool refunded;
    }

    struct Claim {
        uint256 challengeId;
        uint8 role;
        address claimant;
        uint256 amount;
        bytes32 proofHash;
        uint256 nonce;
        uint256 deadline;
    }

    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => bool) public usedNonces;

    error WrongChain();
    error WrongToken();
    error ZeroAddress();
    error InvalidExpiry();
    error InvalidDeposit();
    error UnknownChallenge();
    error ChallengeExpired();
    error InvalidRole();
    error WrongClaimant();
    error WrongAmount();
    error ClaimExpired();
    error NonceUsed();
    error AlreadyClaimed();
    error UnauthorizedVerifier();
    error NotSponsor();
    error NotExpired();
    error NothingToRefund();

    event ChallengeCreated(uint256 indexed challengeId, address indexed sponsor, uint64 expiry, uint256 deposit);
    event RewardClaimed(
        uint256 indexed challengeId, uint8 indexed role, address indexed claimant, uint256 amount, bytes32 proofHash
    );
    event PlatformFeePaid(uint256 indexed challengeId, address indexed treasury, uint256 amount);
    event UnspentRefunded(uint256 indexed challengeId, address indexed sponsor, uint256 amount);

    constructor(address token_, address verifier_, address treasury_) EIP712("FYXRewardVault", "1") {
        if (block.chainid != CHAIN_ID) revert WrongChain();
        if (token_ != TEST_USDC || token_.code.length == 0) revert WrongToken();
        if (verifier_ == address(0) || treasury_ == address(0)) revert ZeroAddress();
        token = IERC20(token_);
        verifier = verifier_;
        treasury = treasury_;
    }

    function createChallenge(uint64 expiry) external nonReentrant returns (uint256 challengeId) {
        _checkChain();
        if (expiry <= block.timestamp) revert InvalidExpiry();
        uint256 balanceBefore = token.balanceOf(address(this));
        token.safeTransferFrom(msg.sender, address(this), DEPOSIT);
        if (token.balanceOf(address(this)) != balanceBefore + DEPOSIT) revert InvalidDeposit();
        challengeId = nextChallengeId++;
        challenges[challengeId] = Challenge(msg.sender, expiry, DEPOSIT, false, false, false);
        totalDeposited += DEPOSIT;
        totalEscrow += DEPOSIT;
        emit ChallengeCreated(challengeId, msg.sender, expiry, DEPOSIT);
    }

    function claim(Claim calldata approval, bytes calldata signature) external nonReentrant {
        _checkChain();
        Challenge storage campaign = challenges[approval.challengeId];
        if (campaign.sponsor == address(0)) revert UnknownChallenge();
        if (block.timestamp >= campaign.expiry || campaign.refunded) revert ChallengeExpired();
        if (approval.role > 1) revert InvalidRole();
        if (approval.claimant != msg.sender || approval.claimant == address(0)) revert WrongClaimant();
        uint256 expected = approval.role == 0 ? FINDER_AMOUNT : DEVELOPER_AMOUNT;
        if (approval.amount != expected) revert WrongAmount();
        if (block.timestamp > approval.deadline) revert ClaimExpired();
        if (usedNonces[approval.nonce]) revert NonceUsed();
        if (approval.role == 0 ? campaign.finderClaimed : campaign.developerClaimed) revert AlreadyClaimed();
        if (ECDSA.recover(hashClaim(approval), signature) != verifier) revert UnauthorizedVerifier();

        usedNonces[approval.nonce] = true;
        uint256 fee;
        if (approval.role == 0) {
            campaign.finderClaimed = true;
        } else {
            campaign.developerClaimed = true;
            fee = PLATFORM_FEE;
        }
        campaign.remainingBalance -= expected + fee;
        totalEscrow -= expected + fee;
        totalClaimed += expected;
        totalFeesPaid += fee;
        token.safeTransfer(approval.claimant, expected);
        emit RewardClaimed(approval.challengeId, approval.role, approval.claimant, expected, approval.proofHash);
        if (fee != 0) {
            token.safeTransfer(treasury, fee);
            emit PlatformFeePaid(approval.challengeId, treasury, fee);
        }
    }

    function refundUnspent(uint256 challengeId) external nonReentrant {
        _checkChain();
        Challenge storage campaign = challenges[challengeId];
        if (campaign.sponsor == address(0)) revert UnknownChallenge();
        if (msg.sender != campaign.sponsor) revert NotSponsor();
        if (block.timestamp < campaign.expiry) revert NotExpired();
        uint256 amount = campaign.remainingBalance;
        if (amount == 0) revert NothingToRefund();
        campaign.remainingBalance = 0;
        campaign.refunded = true;
        totalEscrow -= amount;
        totalRefunded += amount;
        token.safeTransfer(msg.sender, amount);
        emit UnspentRefunded(challengeId, msg.sender, amount);
    }

    function hashClaim(Claim calldata approval) public view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    CLAIM_TYPEHASH,
                    approval.challengeId,
                    approval.role,
                    approval.claimant,
                    approval.amount,
                    approval.proofHash,
                    approval.nonce,
                    approval.deadline
                )
            )
        );
    }

    function _checkChain() private view {
        if (block.chainid != CHAIN_ID) revert WrongChain();
    }
}
