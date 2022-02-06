import { ethers } from "ethers";

import distributorABI from "../contracts/mumbai/distributor.json";
import distributorAddress from "../contracts/mumbai/distributor-address.json";
import { Epoch, Task } from "../types";

export async function distributeTokensForContribution(epoch: Epoch) {
  const distributions = await preprocessContributionDistribution(epoch);
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  let contract = new ethers.Contract(distributorAddress.Distributor, distributorABI.abi, provider.getSigner());
  let overrides: any = {
    gasLimit: 500000,
    value: ethers.utils.parseEther("2"),
  };
  const tx = await contract.distributeEther(distributions[0], distributions[1], "1", overrides);

  return tx.wait();
}

export async function distributeTokensForTask(task: Task) {
  console.log(task);
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  let contract = new ethers.Contract(distributorAddress.Distributor, distributorABI.abi, provider.getSigner());
  let overrides: any = {
    gasLimit: 500000,
    value: ethers.utils.parseEther("2"),
  };
  const tx = await contract.distributeEther(
    [task.assignee],
    [ethers.utils.parseEther(task.value.toString())],
    "2",
    overrides
  );
  console.log(`dvgdvgdg`);

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
