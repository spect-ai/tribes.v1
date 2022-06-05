import { useMoralis } from 'react-moralis';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { Chain, Task, Token } from '../types';
import useMoralisFunction from './useMoralisFunction';
import { notify } from '../components/modules/settingsTab';
import { useRetro } from '../components/modules/retro';
import { useSingleRetro } from '../components/modules/retro/retroModal';

export default function usePeriod() {
  const { space, setSpace, handleTabChange } = useSpace();
  const { setIsLoading, periods, setPeriods, setIsCreateModalOpen } =
    useRetro();
  const { setPeriod, handlePeriodUpdate } = useSingleRetro();

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
    setIsLoading(true);
    runMoralisFunction('createPeriod', {
      teamId: space.teamId,
      spaceId: space.objectId,
      name,
      description,
      duration: duration * 86400000, // convert days to milliseconds
      strategy,
      value,
      startTime: Date.now(),
      token,
      chain,
      members,
      choices,
      isRecurring,
      recurringPeriod,
    })
      .then((res: any) => {
        handleTabChange({} as any, 1);
        setIsCreateModalOpen(false);
        console.log(res);
        setPeriods(res);
        notify('Created retro period!', 'success');
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        notify(err.message, 'error');
        setIsLoading(false);
      });
  };

  async function loadPeriods(spaceId: string) {
    const retroPeriods = await runMoralisFunction('getPeriods', { spaceId });
    return retroPeriods;
  }

  async function saveVotesAndFeedback(
    votes: object | null,
    feedback: object | null,
    epochId: string
  ) {
    runMoralisFunction('saveVotesAndFeedback', {
      votes,
      feedback,
      epochId,
    })
      .then((res: any) => {
        setPeriods(res.periods);
        setPeriod(res.currPeriod);
        setIsLoading(false);
        notify(`Saved!`);
      })
      .catch((err: any) => {
        notify(`There was an error while saving`, 'error');
        setIsLoading(false);
      });
  }

  async function archiveEpoch(epochId: string, spaceId: string) {
    runMoralisFunction('archiveEpoch', {
      epochId,
      spaceId,
    })
      .then((res: any) => {
        setPeriods(res);
        setIsLoading(false);
      })
      .catch((err: any) => {
        notify(`There was an error while archiving the epoch.`, 'error');
        setIsLoading(false);
      });
  }

  async function endRetroPeriod(epochId: string) {
    setIsLoading(true);

    runMoralisFunction('endRetroPeriod', {
      epochId,
    })
      .then((res: any) => {
        console.log(res);
        setPeriods(res.periods);
        setIsLoading(false);
        notify(`Ended the retro period!`);
      })
      .catch((err: any) => {
        notify(`There was an error while ending the retro period.`, 'error');
        console.log(err);
        setIsLoading(false);
      });
  }

  return {
    createPeriod,
    loadPeriods,
    saveVotesAndFeedback,
    archiveEpoch,
    endRetroPeriod,
  };
}