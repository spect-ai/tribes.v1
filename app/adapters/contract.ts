import { ethers } from 'ethers';
// import { registryTemp } from '../constants';
import distributorAddress from '../contracts/mumbai/distributor-address.json';
import distributorABI from '../contracts/mumbai/distributor.json';
import ERC20 from '../contracts/mumbai/erc20.json';

// eslint-disable-next-line import/prefer-default-export
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
