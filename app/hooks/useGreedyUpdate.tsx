import { useState } from 'react';
import { useSpace } from '../../pages/tribe/[id]/space/[bid]';
import { BoardData, Task } from '../types';

export function useGreedyUpdate() {
  const { space, setSpace } = useSpace();
  const [temp, setTemp] = useState({} as BoardData);
  const [tempCard, setTempCard] = useState({} as Task);

  const update = (newSpace: BoardData) => {
    setTemp(space);
    setSpace(newSpace);
  };

  const updateCard = (prevTask: Task, newTask: Task, setTask: Function) => {
    setTempCard(Object.assign({}, prevTask));
    console.log({ ...prevTask, ...newTask });
    setTask({ ...prevTask, ...newTask });
  };

  const revertCard = (setTask: Function) => {
    setTask(tempCard);
  };

  return {
    update,
    updateCard,
    revertCard,
  };
}
