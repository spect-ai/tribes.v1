import { ethers } from 'ethers';
import { useMoralis } from 'react-moralis';
import distributorABI from '../contracts/mumbai/distributor.json';
import { useGlobal } from '../context/globalContext';
import useERC20 from './useERC20';

export default function useDistributor() {
  const {
    state: { registry },
  } = useGlobal();
  const { isCurrency, decimals, balanceOf } = useERC20();
  const { user } = useMoralis();

  function getDistributorContract(chainId: string) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(
      registry[chainId].distributorAddress as string,
      distributorABI.abi,
      provider.getSigner()
    );
  }

  function getPendingApprovals(
    addresses: string[],
    values: number[],
    chainId: string
  ) {
    if (isCurrency(addresses[0])) {
      return true;
    }
    const contract = getDistributorContract(chainId);
    const valuesInWei = values.map((v) =>
      ethers.utils.parseEther(v.toString())
    );
    return contract.pendingApprovals(addresses, valuesInWei);
  }

  async function distributeEther(
    contributors: any,
    values: any[],
    id: string,
    chainId: string
  ) {
    const contract = getDistributorContract(chainId);
    const valuesInWei = [];
    const contributorsWithPositiveAllocation: any[] = [];
    let totalValue = 0;
    for (let i = 0; i < values.length; i += 1) {
      if (values[i] > 0) {
        valuesInWei.push(
          ethers.utils.parseEther(values[i].toFixed(5).toString())
        );
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
      id,
      overrides
    );
    return tx.wait();
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

  async function getDecimals(tokenAddresses: string[]) {
    const numDecimals = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const tokenAddress of tokenAddresses) {
      // eslint-disable-next-line no-await-in-loop
      numDecimals.push(await decimals(tokenAddress));
    }
    return numDecimals;
  }

  async function distributeTokens(
    tokenAddresses: string[],
    recipients: string[],
    values: number[],
    id: string,
    chainId: string
  ) {
    const { filteredTokenAddresses, filteredRecipients, filteredValues } =
      filterInvalidValues(tokenAddresses, recipients, values);
    const numDecimals = await getDecimals(filteredTokenAddresses);
    const valuesInWei = filteredValues.map((v, index) =>
      ethers.BigNumber.from(`0x${(v * 10 ** numDecimals[index]).toString(16)}`)
    );
    const contract = getDistributorContract(chainId);
    const tx = await contract.distributeTokens(
      filteredTokenAddresses,
      filteredRecipients,
      valuesInWei,
      id
    );
    return tx.wait();
  }

  return {
    getPendingApprovals,
    distributeEther,
    distributeTokens,
  };
}
