import { useState } from 'react';
import { useMoralis } from 'react-moralis';
import useDistributor from './useDistributor';
import { notify } from '../components/modules/settingsTab';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { Member, DistributionInfo } from '../types';
import { useGlobal } from '../context/globalContext';
import useERC20 from './useERC20';

export default function usePaymentGateway(
  handleStatusUpdate?: Function,
  handleNextStep?: Function
) {
  const { user } = useMoralis();
  const { distributeEther, distributeTokens } = useDistributor();
  const { hasBalances } = useERC20();
  const [isLoading, setIsLoading] = useState(false);
  const {
    state: { registry },
  } = useGlobal();
  async function handlePaymentError(
    err: any,
    expectedNetwork: string,
    tokenAddresses: Array<string>,
    tokenValues: Array<number>
  ) {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    if (accounts.length === 0) {
      notify(`Cannot fetch account, wallet is most likely locked`, 'error');
      return;
    }
    if (window.ethereum.networkVersion !== expectedNetwork)
      notify(
        `Please switch to ${registry[expectedNetwork]?.name} network`,
        'error'
      );
    else {
      const [sufficientBalance, insufficientBalanceTokenAddress] =
        await hasBalances(tokenAddresses, tokenValues, user?.get('ethAddress'));
      console.log(sufficientBalance, insufficientBalanceTokenAddress);
      if (!sufficientBalance) {
        notify(
          `Insufficient balance of ${
            registry[expectedNetwork].tokens[
              insufficientBalanceTokenAddress as string
            ].name
          }`,
          'error'
        );
      } else {
        notify(`${err.message}`, 'error');
      }
    }
  }

  async function executeBatchPay(
    type: string,
    chainId: string,
    userAddresses: string[],
    amounts: number[],
    tokenAddresses: string[]
  ) {
    let tx;
    if (type === 'tokens') {
      tx = await distributeTokens(
        tokenAddresses,
        userAddresses,
        amounts,
        '',
        chainId
      );
    } else if (type === 'currency') {
      tx = await distributeEther(userAddresses, amounts, '', chainId);
    }
    return tx;
  }

  async function batchPay(
    chainId: string,
    type: string,
    ethAddresses: Array<string>,
    tokenValues: Array<number>,
    tokenAddresses: Array<string>,
    cardIds?: string[],
    epochId?: string
  ) {
    setIsLoading(true);
    try {
      const tx = await executeBatchPay(
        type,
        chainId,
        ethAddresses,
        tokenValues,
        tokenAddresses
      );
      if (handleStatusUpdate) {
        await handleStatusUpdate(epochId || cardIds, tx.transactionHash);
      }
      notify('Payment done succesfully!', 'success');
      if (handleNextStep) {
        handleNextStep();
      }
      setIsLoading(false);
    } catch (err: any) {
      handlePaymentError(err, chainId, tokenAddresses, tokenValues);
      setIsLoading(false);
      console.log(err);
    }
  }

  return {
    batchPay,
    isLoading,
  };
}
