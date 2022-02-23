//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "@rari-capital/solmate/src/utils/SafeTransferLib.sol";

contract Distributor {

  using SafeTransferLib for ERC20;

  event ethDistributed(address indexed sender, string indexed id);
  event tokensDistributed(address indexed sender, string indexed id);
  event tokenDistributed(address indexed sender, address indexed token,  string indexed id);
  event tokensApproved(address indexed sender, ERC20[] tokens);

  function distributeEther(
    address[] memory recipients,
    uint256[] memory values,
    string memory id
  ) external payable {
    require(recipients.length == values.length, "DISTRIBUTE_LENGTH_MISMATCH");

    uint256 total = 0;
    for (uint256 i = 0; i < recipients.length; i++) {
      require(recipients[i] != address(0), "INVALID_ADDRESS");
      require(values[i] > 0, "INVALID_ZERO_VALUE_TRANSFER");
      total += values[i];
    }
    require(msg.value >= total, "NOT_ENOUGH_ETH");

    for (uint256 i = 0; i < recipients.length; i++) {
      SafeTransferLib.safeTransferETH(recipients[i], values[i]);
    }

    if (msg.value > total) {
      SafeTransferLib.safeTransferETH(msg.sender, msg.value - total);
    }

    emit ethDistributed(msg.sender, id);
  }

  function distributeToken(
    ERC20 token,
    address[] memory recipients,
    uint256[] memory values,
    string memory id
  ) external {
    require(recipients.length == values.length, "DISTRIBUTE_LENGTH_MISMATCH");

    uint256 total = 0;
    for (uint256 i = 0; i < recipients.length; i++) {
      require(recipients[i] != address(0), "INVALID_ADDRESS");
      require(values[i] > 0, "INVALID_ZERO_VALUE_TRANSFER");
      total += values[i];
    }

    for (uint256 i = 0; i < recipients.length; i++) {
      token.safeTransferFrom(msg.sender, recipients[i], values[i]);
    }

    emit tokenDistributed(msg.sender, address(token), id);
  }

  function distributeTokens(
    ERC20[] memory tokens,
    address[] memory recipients,
    uint256[] memory values,
    string memory id
  ) external {
    require(recipients.length == values.length, "DISTRIBUTE_LENGTH_MISMATCH");
    require(values.length == tokens.length, "DISTRIBUTE_LENGTH_MISMATCH");

    uint256 total = 0;
    for (uint256 i = 0; i < recipients.length; i++) {
      require(recipients[i] != address(0), "INVALID_ADDRESS");
      require(values[i] > 0, "INVALID_ZERO_VALUE_TRANSFER");
      total += values[i];
    }

    for (uint256 i = 0; i < recipients.length; i++) {
      tokens[i].safeTransferFrom(msg.sender, recipients[i], values[i]);
    }

    emit tokensDistributed(msg.sender, id);
  }

  function approveTokens(
    ERC20[] memory tokens
  ) external {
    uint MAX_UINT = 2 ** 256 - 1;
    for (uint256 i = 0; i < tokens.length; i++) {
      tokens[i].approve(address(this), MAX_UINT);
    }

    emit tokensApproved(msg.sender, tokens);
  }

  function pendingApprovals(
    ERC20[] memory tokens,
    uint256[] memory values
  ) external view returns (bool[] memory){
    require(tokens.length == values.length, "APPROVE_LENGTH_MISMATCH");
    bool[] memory approvalPending = new bool[](tokens.length);
    for (uint256 i = 0; i < tokens.length; i++) {
      if (tokens[i].allowance(msg.sender, address(this)) < values[i]){
        approvalPending[i] = false;
      }
    }
    return approvalPending;
  }
}
