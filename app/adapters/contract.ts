import { ethers } from "ethers";

import ERC20 from "../contracts/mumbai/erc20.json";
import distributorABI from "../contracts/mumbai/distributor.json";
import distributorAddress from "../contracts/mumbai/distributor-address.json";
import { Epoch, Task } from "../types";
import { registryTemp } from "../constants";

export function initializeMumbaiContracts() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  let distributorContract = new ethers.Contract(
    distributorAddress.Distributor,
    distributorABI.abi,
    provider.getSigner()
  );
  return {
    distributorContract,
  };
}

function getDistributorContract(chainId: string) {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  return new ethers.Contract(
    registryTemp[chainId].distributorAddress as string,
    distributorABI.abi,
    provider.getSigner()
  );
}

function getERC20Contract(address: string) {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  return new ethers.Contract(address, ERC20.abi, provider.getSigner());
}

export async function distributeEther(
  contributors: any,
  values: any,
  taskId: string,
  chainId: string
) {
  let contract = getDistributorContract(chainId);
  var valuesInWei = [];
  var contributorsWithPositiveAllocation = [];
  var totalValue = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > 0) {
      valuesInWei.push(ethers.utils.parseEther(`${values[i]}`));
      contributorsWithPositiveAllocation.push(contributors[i]);
      totalValue += values[i];
    }
  }

  let overrides: any = {
    value: ethers.utils.parseEther(totalValue.toString()),
  };

  const tx = await contract.distributeEther(
    contributorsWithPositiveAllocation,
    valuesInWei,
    taskId,
    overrides
  );
  return tx.wait();
}

export function toEther(val: string) {
  return ethers.utils.parseEther(val);
}

export function fromWei(val: any) {
  if (!val) {
    return val;
  }
  return ethers.utils.formatEther(val);
}

export async function approve(chainId: string, address: string) {
  let contract = getERC20Contract(address);
  let tx = await contract.approve(
    registryTemp[chainId].distributorAddress,
    ethers.constants.MaxInt256
  );
  return tx.wait();
}

export function getPendingApprovals(
  addresses: string[],
  values: number[],
  chainId: string
) {
  if (addresses[0] === "0x0") {
    return true;
  }
  let contract = getDistributorContract(chainId);
  var valuesInWei = values.map((v) => ethers.utils.parseEther(v.toString()));
  return contract.pendingApprovals(addresses, valuesInWei);
}

export async function isApprovalRequired(
  callerAddress: string,
  tokenAddress: string,
  value: number,
  chainId: string
) {
  let distributorContract = getDistributorContract(chainId);
  let erc20Contract = getERC20Contract(tokenAddress);
  const allowance = await erc20Contract.allowance(
    callerAddress,
    distributorContract.address
  );
  return allowance < ethers.utils.parseEther(value.toString());
}

export async function batchPayTokens(
  tokenAddresses: string[],
  recipients: string[],
  values: number[],
  taskIds: string,
  chainId: string
) {
  // @ts-ignore
  [tokenAddresses, recipients, values] = filterInvalidValues(
    tokenAddresses,
    recipients,
    values
  );
  var valuesInWei = values.map((v) => ethers.utils.parseEther(v.toString()));
  let contract = getDistributorContract(chainId);
  const tx = await contract.distributeTokens(
    tokenAddresses,
    recipients,
    valuesInWei,
    taskIds
  );
  return tx.wait();
}

function filterInvalidValues(
  tokenAddresses: string[],
  recipients: string[],
  values: number[]
) {
  var filteredTokenAddresses = [];
  var filteredRecipients = [];
  var filteredValues = [];

  for (let i = 0; i < values.length; i++) {
    if (values[i] > 0) {
      filteredValues.push(values[i]);
      filteredRecipients.push(recipients[i]);
      filteredTokenAddresses.push(tokenAddresses[i]);
    }
  }

  return [
    filteredTokenAddresses as string[],
    filteredRecipients as string[],
    filteredValues as number[],
  ];
}
