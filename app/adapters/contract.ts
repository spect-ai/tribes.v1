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

export async function distributeTokensForContribution(epoch: Epoch) {
  const distributions = await preprocessContributionDistribution(epoch);
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  let contract = new ethers.Contract(
    distributorAddress.Distributor,
    distributorABI.abi,
    provider.getSigner()
  );
  let overrides: any = {
    gasLimit: 500000,
    value: ethers.utils.parseEther("2"),
  };
  const tx = await contract.distributeEther(
    distributions[0],
    distributions[1],
    "1",
    overrides
  );

  return tx.wait();
}

export async function distributeTokensForTask(task: Task) {
  console.log(task);
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  let contract = new ethers.Contract(
    distributorAddress.Distributor,
    distributorABI.abi,
    provider.getSigner()
  );
  let overrides: any = {
    value: ethers.utils.parseEther(task.value.toString()),
  };
  const tx = await contract.distributeEther(
    ["0xb35662a30222c0a7e55482E4602f2DA749519beB"],
    [ethers.utils.parseEther(task.value.toString())],
    "2",
    overrides
  );

  return tx.wait();
}

async function preprocessContributionDistribution(epoch: Epoch) {
  const memberStats = epoch.memberStats;
  var addresses = [];
  var amounts = [];
  for (var member of memberStats) {
    addresses.push(member.ethAddress);
    amounts.push(ethers.utils.parseEther(member.reward.toString()));
  }
  console.log(addresses);
  console.log(amounts);

  return [addresses, amounts];
}

async function preprocessTaskDistribution(epoch: Epoch) {}

// export function initializePolygonContracts() {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//   let distributorContract = new ethers.Contract(
//     distributorAddress.Distributor,
//     distributorABI.abi,
//     provider.getSigner()
//   );
//   return {
//     distributorContract
//   };
//   }
export function toEther(val: string) {
  return ethers.utils.parseEther(val);
}

export function fromWei(val: any) {
  if (!val) {
    return val;
  }
  return ethers.utils.formatEther(val);
}
