import { useState } from 'react';
import useDistributor from './useDistributor';
import { notify } from '../components/modules/settingsTab';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { Member, DistributionInfo } from '../types';
import { useGlobal } from '../context/globalContext';

type MemberDetails = {
  [key: string]: Member;
};

export default function usePaymentGateway(
  handleStatusUpdate?: Function,
  handleNextStep?: Function
) {
  const { distributeEther, distributeTokens } = useDistributor();
  const [isLoading, setIsLoading] = useState(false);
  const { space } = useSpace();
  const {
    state: { registry },
  } = useGlobal();
  function getEthAddresses(contributors: any, memberDetails: MemberDetails) {
    return contributors.map((a: string) => memberDetails[a].ethAddress);
  }

  function handlePaymentError(err: any, expectedNetwork: string) {
    if (window.ethereum.networkVersion !== expectedNetwork)
      notify(
        `Please switch to ${registry[expectedNetwork]?.name} network`,
        'error'
      );
    else {
      notify(err.message, 'error');
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

  async function batchPay(chainId: string, distributionInfo: DistributionInfo) {
    setIsLoading(true);
    try {
      const tx = await executeBatchPay(
        distributionInfo.type,
        chainId,
        getEthAddresses(distributionInfo.contributors, space.memberDetails),
        distributionInfo.tokenValues,
        distributionInfo.tokenAddresses
      );
      if (handleStatusUpdate) {
        await handleStatusUpdate(
          distributionInfo.epochId
            ? distributionInfo.epochId
            : distributionInfo.cardIds,
          tx.transactionHash
        );
      }
      notify('Payment done succesfully!', 'success');
      if (handleNextStep) {
        handleNextStep();
      }
      setIsLoading(false);
    } catch (err: any) {
      handlePaymentError(err, chainId);
      setIsLoading(false);
      console.log(err.message);
    }
  }

  return {
    batchPay,
    isLoading,
  };
}
