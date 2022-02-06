import { ethers } from "ethers";

import distributorABI from "../contracts/mumbai/distributor.json";
import distributorAddress from "../contracts/mumbai/distributor-address.json";
import { Epoch } from "../types";

export async function distributeTokensForContribution(epoch: Epoch) {
  const distributions = await preprocessContributionDistribution(epoch);
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  let contract = new ethers.Contract(distributorAddress.Distributor, distributorABI.abi, provider.getSigner());
  //const tx = await contract.distributeToken(ethers.utils.parseEther(reward.toString()), timeToAcceptInMinutes, gigCid);
  console.log(`ddgdfdf`);
  console.log(contract);
  //console.log(epoch._id);
  let overrides: any = {
    gasLimit: 500000,
    value: ethers.utils.parseEther("1"),
  };
  const tx = await contract.distributeEther(distributions[0], distributions[1], "1", overrides);
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
