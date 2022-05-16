import { ethers } from 'ethers';
import { useMoralis } from 'react-moralis';
import fs from 'fs';
import ERC20 from '../contracts/mumbai/erc20.json';
import { useGlobal } from '../context/globalContext';

export default function useERC20() {
  const {
    state: { registry },
  } = useGlobal();
  const { user } = useMoralis();

  function isCurrency(address: string) {
    return address === '0x0';
  }

  function getERC20Contract(address: string) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(address, ERC20.abi, provider.getSigner());
  }

  async function approve(chainId: string, erc20Address: string) {
    const contract = getERC20Contract(erc20Address);

    const tx = await contract.approve(
      registry[chainId].distributorAddress,
      ethers.constants.MaxInt256
    );
    return tx.wait();
  }

  async function isApproved(
    erc20Address: string,
    spenderAddress: string,
    value: number,
    ethAddress: string
  ) {
    if (isCurrency(erc20Address)) {
      return true;
    }
    const contract = getERC20Contract(erc20Address);

    const allowance = await contract.allowance(ethAddress, spenderAddress);
    return parseFloat(ethers.utils.formatEther(allowance)) >= value;
  }

  function aggregateBalances(
    erc20Addresses: Array<string>,
    values: Array<number>
  ) {
    const addressToValue: any = {};
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < erc20Addresses.length; i++) {
      if (!(erc20Addresses[i] in addressToValue)) {
        addressToValue[erc20Addresses[i]] = values[i];
      } else {
        addressToValue[erc20Addresses[i]] += values[i];
      }
    }
    return addressToValue;
  }

  // eslint-disable-next-line consistent-return
  async function hasBalance(
    erc20Address: string,
    value: number,
    ethAddress: string
  ) {
    if (isCurrency(erc20Address)) {
      window.ethereum
        .request({ method: 'eth_getBalance' })
        .then((balance: any) => {
          console.log(balance);
          return parseFloat(ethers.utils.formatEther(balance)) >= value;
        });
    } else {
      const contract = getERC20Contract(erc20Address);

      const balance = await contract.balanceOf(ethAddress);
      return parseFloat(ethers.utils.formatEther(balance)) >= value;
    }
  }

  async function hasBalances(
    erc20Addresses: Array<string>,
    values: Array<number>,
    ethAddress: string
  ) {
    const aggregateValues = aggregateBalances(erc20Addresses, values);
    // eslint-disable-next-line no-plusplus
    // eslint-disable-next-line no-restricted-syntax
    for (const [erc20Address, value] of Object.entries(aggregateValues)) {
      // eslint-disable-next-line no-await-in-loop
      const sufficientBalance = await hasBalance(
        erc20Address,
        value as number,
        ethAddress
      );

      if (!sufficientBalance) return [false, erc20Address];
    }
    return [true, null];
  }

  return {
    approve,
    isApproved,
    isCurrency,
    hasBalance,
    hasBalances,
  };
}
