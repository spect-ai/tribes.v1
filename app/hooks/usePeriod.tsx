import { useMoralis } from 'react-moralis';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { Chain, Task, Token } from '../types';
import useMoralisFunction from './useMoralisFunction';
import { notify } from '../components/modules/settingsTab';

export default function usePeriod() {
  const { space, setSpace, setRefreshEpochs, handleTabChange } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();

  const createPeriod = (
    name: string,
    description: string,
    members: any,
    choices: string[],
    value: number,
    token: Token,
    chain: Chain,
    strategy: string,
    duration: number,
    isRecurring: boolean,
    recurringPeriod: number
  ) => {
    runMoralisFunction('createPeriod', {
      teamId: space.teamId,
      spaceId: space.objectId,
      name,
      description,
      duration: duration * 86400000, // convert days to milliseconds
      strategy,
      budget: value,
      startTime: Date.now(),
      token,
      chain,
      members,
      choices,
      isRecurring,
      recurringPeriod,
    })
      .then((res: any) => {
        setRefreshEpochs(true);
        handleTabChange({} as any, 1);
        notify('Created retro period!', 'success');
      })
      .catch((err: any) => {
        console.log(err);
        notify(err.message, 'error');
      });
  };

  return { createPeriod };
}
