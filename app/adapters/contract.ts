import { ethers } from "ethers";

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
  return new ethers.Contract(distributorAddress.Distributor, distributorABI.abi, provider.getSigner());
}

export async function distributeEther(contributors: any, values: any, taskId: string) {
  let contract = getContract();
  console.log(contract);
  console.log(contributors);
  console.log(values);
  console.log(taskId);
  var valuesInWei = [];
  values.map((v: any) => valuesInWei.push(ethers.utils.parseEther(`${v}`)));
  console.log(valuesInWei);

  const tx = await contract.distributeEther(contributors, values, taskId);
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
