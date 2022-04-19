import { ethers } from 'ethers';
import { registryTemp } from '../constants';
import distributorAddress from '../contracts/mumbai/distributor-address.json';
import distributorABI from '../contracts/mumbai/distributor.json';
import ERC20 from '../contracts/mumbai/erc20.json';

export function initializeMumbaiContracts() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const distributorContract = new ethers.Contract(
    distributorAddress.Distributor,
    distributorABI.abi,
    provider.getSigner()
  );
  return {
    distributorContract,
  };
}

function getDistributorContract(chainId: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return new ethers.Contract(
    registryTemp[chainId].distributorAddress as string,
    distributorABI.abi,
    provider.getSigner()
  );
}

function getERC20Contract(address: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return new ethers.Contract(address, ERC20.abi, provider.getSigner());
}

export async function distributeEther(
  contributors: never,
  values: never[],
  taskId: string,
  chainId: string
) {
  const contract = getDistributorContract(chainId);
  const valuesInWei = [];
  const contributorsWithPositiveAllocation: never[] = [];
  let totalValue = 0;
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] > 0) {
      valuesInWei.push(ethers.utils.parseEther(`${values[i]}`));
      contributorsWithPositiveAllocation.push(contributors[i]);
      totalValue += values[i];
    }
  }

  const overrides = {
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

export function fromWei(val: never) {
  if (!val) {
    return val;
  }
  return ethers.utils.formatEther(val);
}

export async function approve(chainId: string, address: string) {
  const contract = getERC20Contract(address);
  const tx = await contract.approve(
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
  if (addresses[0] === '0x0') {
    return true;
  }
  const contract = getDistributorContract(chainId);
  const valuesInWei = values.map((v) => ethers.utils.parseEther(v.toString()));
  return contract.pendingApprovals(addresses, valuesInWei);
}

export async function isApprovalRequired(
  callerAddress: string,
  tokenAddress: string,
  value: number,
  chainId: string
) {
  const distributorContract = getDistributorContract(chainId);
  const erc20Contract = getERC20Contract(tokenAddress);
  const allowance = await erc20Contract.allowance(
    callerAddress,
    distributorContract.address
  );
  return allowance < ethers.utils.parseEther(value.toString());
}

function filterInvalidValues(
  tokenAddresses: string[],
  recipients: string[],
  values: number[]
) {
  const filteredTokenAddresses: string[] = [];
  const filteredRecipients: string[] = [];
  const filteredValues: number[] = [];

  for (let i = 0; i < values.length; i += 1) {
    if (values[i] > 0) {
      filteredValues.push(values[i]);
      filteredRecipients.push(recipients[i]);
      filteredTokenAddresses.push(tokenAddresses[i]);
    }
  }

  return { filteredTokenAddresses, filteredRecipients, filteredValues };
}

export async function batchPayTokens(
  tokenAddresses: string[],
  recipients: string[],
  values: number[],
  taskIds: string,
  chainId: string
) {
  const { filteredTokenAddresses, filteredRecipients, filteredValues } =
    filterInvalidValues(tokenAddresses, recipients, values);
  const valuesInWei = filteredValues.map((v) =>
    ethers.utils.parseEther(v.toString())
  );
  const contract = getDistributorContract(chainId);
  const tx = await contract.distributeTokens(
    filteredTokenAddresses,
    filteredRecipients,
    valuesInWei,
    taskIds
  );
  return tx.wait();
}
