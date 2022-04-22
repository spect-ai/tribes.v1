import { useState } from 'react';
import useDistributor from './useDistributor';
import { notify } from '../components/modules/settingsTab';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { Member } from '../types';

export type DistributionInfo = {
  cardIds: string[];
  epochId?: string;
  type: 'tokens' | 'currency';
  contributors: Array<string>;
  tokenAddresses: Array<string>;
  tokenValues: Array<number>;
};

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

  function getEthAddresses(contributors: any, memberDetails: MemberDetails) {
    return contributors.map((a: string) => memberDetails[a].ethAddress);
  }

  async function executeBatchPay(
    type: 'tokens' | 'currency',
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
      notify(err.message, 'error');
      setIsLoading(false);
      console.log(err.message);
    }
  }

  return {
    batchPay,
    isLoading,
  };
}
