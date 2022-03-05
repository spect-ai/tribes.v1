import { ethers } from "ethers";

import ERC20 from "../contracts/mumbai/erc20.json";
import distributorABI from "../contracts/mumbai/distributor.json";
import distributorAddress from "../contracts/mumbai/distributor-address.json";
import { Epoch, Task } from "../types";

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

function getContract() {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  return new ethers.Contract(
    distributorAddress.Distributor,
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
  taskId: string
) {
  let contract = getContract();
  var valuesInWei = [];
  var totalValue = 0;
  for (var val of values) {
    valuesInWei.push(ethers.utils.parseEther(`${val}`));
    totalValue += val;
  }

  let overrides: any = {
    value: ethers.utils.parseEther(totalValue.toString()),
  };

  const tx = await contract.distributeEther(
    contributors,
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

export function approve(address: string) {
  let contract = getERC20Contract(address);
  return contract.approve(
    distributorAddress.Distributor,
    ethers.constants.MaxInt256
  );
}

export function getPendingApprovals(addresses: string[], values: number[]) {
  let contract = getContract();
  var valuesInWei = values.map((v) => ethers.utils.parseEther(v.toString()));
  return contract.pendingApprovals(addresses, valuesInWei);
}

export async function batchPayTokens(
  tokenAddresses: string[],
  recipients: string[],
  values: number[],
  taskIds: string
) {
  let contract = getContract();

  var valuesInWei = values.map((v) => ethers.utils.parseEther(v.toString()));
  const tx = await contract.distributeTokens(
    tokenAddresses,
    recipients,
    valuesInWei,
    taskIds
  );
  console.log(`done`);
  return tx.wait();
}
