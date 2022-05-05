import useMoralisFunction from './useMoralisFunction';
import { notify } from '../components/modules/settingsTab';
import { Block } from '../types';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';

export default function useCardCreate() {
  const { runMoralisFunction } = useMoralisFunction();
  const { setSpace } = useSpace();

  const createCard = (
    boardId: string,
    title: string,
    description: Block[],
    type: string,
    labels: string[],
    deadline: string,
    chain: object,
    token: object,
    value: string,
    assignee: string | null,
    reviewer: string | null,
    columnId: string,
    handleClose: Function
  ) => {
    if (!title || title === '') {
      notify('Please enter a title', 'error');
      return;
    }
    runMoralisFunction('addTask', {
      boardId,
      title,
      description,
      type,
      tags: labels,
      deadline,
      chain,
      token,
      value,
      assignee,
      reviewer,
      columnId,
    })
      .then((res: any) => {
        notify('Card created', 'success');
        console.log(res);
        setSpace(res.space);
        handleClose();
      })
      .catch((err: any) => {
        notify(err.message, 'error');
      });
  };

  return { createCard };
}
