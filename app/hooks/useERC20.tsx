import { ethers } from 'ethers';
import { useMoralis } from 'react-moralis';
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

  function getERC20ContractWithCustomProvider(
    address: string,
    web3providerUrl: string
  ) {
    const provider = new ethers.providers.JsonRpcProvider(web3providerUrl);
    return new ethers.Contract(address, ERC20.abi, provider);
  }

  async function approve(chainId: string, erc20Address: string) {
    const contract = getERC20Contract(erc20Address);

    const tx = await contract.approve(
      registry[chainId].distributorAddress,
      ethers.constants.MaxInt256
    );
    return tx.wait();
  }

  function aggregateBalances(
    erc20Addresses: Array<string>,
    values: Array<number>
  ) {
    const addressToValue: any = {};
    if (!erc20Addresses || !values) return addressToValue;
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
    const numDecimals = await contract.decimals();
    const allowance = await contract.allowance(ethAddress, spenderAddress);

    return ethers.BigNumber.from(
      `0x${(value * 10 ** numDecimals).toString(16)}`
    ).lte(allowance);
  }

  async function areApproved(
    erc20Addresses: string[],
    spenderAddress: string,
    values: number[],
    ethAddress: string
  ) {
    const aggregateValues = aggregateBalances(erc20Addresses, values);
    const uniqueTokenAddresses = [];
    const aggregatedTokenValues = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const [erc20Address, value] of Object.entries(aggregateValues)) {
      // eslint-disable-next-line no-await-in-loop
      const tokenIsApproved = await isApproved(
        erc20Address,
        spenderAddress,
        value as number,
        ethAddress
      );
      if (!tokenIsApproved) {
        uniqueTokenAddresses.push(erc20Address);
        aggregatedTokenValues.push(value);
      }
    }
    return [uniqueTokenAddresses, aggregatedTokenValues];
  }

  // eslint-disable-next-line consistent-return
  async function hasBalance(
    erc20Address: string,
    value: number,
    ethAddress: string
  ) {
    if (isCurrency(erc20Address)) {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [ethAddress],
      });
      return parseFloat(ethers.utils.formatEther(balance)) >= value;
      // eslint-disable-next-line no-else-return
    } else {
      const contract = getERC20Contract(erc20Address);

      const numDecimals = await contract.decimals();

      const balance = await contract.balanceOf(ethAddress);

      return ethers.BigNumber.from(
        `0x${(value * 10 ** numDecimals).toString(16)}`
      ).lte(balance);
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

  async function decimals(erc20Address: string) {
    if (isCurrency(erc20Address)) {
      return 18;
    }
    const contract = getERC20Contract(erc20Address);
    // eslint-disable-next-line no-return-await
    return await contract.decimals();
  }

  async function symbol(erc20Address: string, networkVersion: string) {
    const contract = getERC20ContractWithCustomProvider(
      erc20Address,
      registry[networkVersion].provider
    );
    // eslint-disable-next-line no-return-await
    return await contract.symbol();
  }

  async function name(erc20Address: string, networkVersion: string) {
    const contract = getERC20ContractWithCustomProvider(
      erc20Address,
      registry[networkVersion].provider
    );
    // eslint-disable-next-line no-return-await
    return await contract.name();
  }

  async function balanceOf(erc20Address: string, ethAddress: string) {
    const contract = getERC20Contract(erc20Address);
    // eslint-disable-next-line no-return-await
    return await contract.balanceOf(ethAddress);
  }

  return {
    approve,
    isApproved,
    areApproved,
    isCurrency,
    hasBalance,
    hasBalances,
    decimals,
    symbol,
    name,
    balanceOf,
  };
}
