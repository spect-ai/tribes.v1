import { Box, Fade, Modal, styled } from '@mui/material';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Task, Chain, Token } from '../../../types';
import { notify } from '../settingsTab';
import TaskCard from './taskCard';
import SkeletonLoader from './skeletonLoader';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import useCardDynamism from '../../../hooks/useCardDynamism';

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  taskId: string;
  columnId?: string;
};

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '55rem',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflowY: 'auto',
  overflowX: 'hidden',
  height: '35rem',
  padding: '1.5rem 3rem',
}));

interface CardContextType {
  task: Task;
  setTask: (data: Task) => void;
  title: string;
  setTitle: (data: string) => void;
  chain: Chain;
  setChain: (data: Chain) => void;
  token: Token;
  setToken: (data: Token) => void;
  value: string;
  setValue: (data: string) => void;
  col: string;
  setCol: (data: string) => void;
  labels: string[];
  setLabels: (data: string[]) => void;
  proposalOnEdit: string;
  setProposalOnEdit: (data: string) => void;
  type: string;
  setType: (data: string) => void;
  date: any;
  setDate: (data: any) => void;
  loading: boolean;
  setLoading: (data: boolean) => void;
  proposalEditMode: boolean;
  setProposalEditMode: (data: boolean) => void;
  anchorEl: HTMLButtonElement | null;
  setAnchorEl: (data: HTMLButtonElement | null) => void;
  openPopover: (
    setOpen: Function
  ) => (event: React.MouseEvent<HTMLButtonElement>) => void;
  closePopover: (setOpen: Function) => void;
}

function useProviderCard() {
  const [task, setTask] = useState<Task>({} as Task);
  const [title, setTitle] = useState(task.title);
  const [type, setType] = useState(task?.type || 'Task');
  const [date, setDate] = useState('');
  const [proposalOnEdit, setProposalOnEdit] = useState('');
  const [labels, setLabels] = useState(task.tags);
  const [chain, setChain] = useState(task.chain);
  const [token, setToken] = useState(task.token);
  const [value, setValue] = useState(task.value?.toString());
  const [col, setCol] = useState('');
  const [loading, setLoading] = useState(false);
  const [proposalEditMode, setProposalEditMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const openPopover =
    (setOpen: Function) => (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen(true);
    };
  const closePopover = (setOpen: Function) => {
    setOpen(false);
  };

  useEffect(() => {
    setTitle(task.title);
    setLabels(task.tags);
    setCol(task.columnId);
    setChain(task.chain);
    setToken(task.token);
    setValue(task.value?.toString());
    if (task?.type) setType(task.type);
    else setType('Task');
    if (task.deadline) {
      const offset = task.deadline.getTimezoneOffset();
      const deadline = new Date(task.deadline.getTime() - offset * 60 * 1000);
      setDate(deadline.toISOString().slice(0, -8));
    }
    if (task.proposals?.length > 0) {
      setProposalOnEdit(task.proposals[0].content);
      if (task.proposals[0]?.content === '') setProposalEditMode(true);
      else setProposalEditMode(false);
    }
  }, [task]);
  return {
    task,
    setTask,
    title,
    setTitle,
    chain,
    setChain,
    token,
    setToken,
    value,
    setValue,
    col,
    setCol,
    labels,
    setLabels,
    proposalOnEdit,
    setProposalOnEdit,
    type,
    setType,
    date,
    setDate,
    loading,
    setLoading,
    proposalEditMode,
    setProposalEditMode,
    anchorEl,
    setAnchorEl,
    openPopover,
    closePopover,
  };
}

const CardContext = createContext<CardContextType>({} as CardContextType);

export const useCardContext = () => useContext(CardContext);

function CardModal({ isOpen, handleClose, taskId, columnId }: Props) {
  const { isInitialized } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();
  const context = useProviderCard();
  const { task, setTask, loading, setLoading } = context;

  useEffect(() => {
    if (isInitialized && isOpen && taskId) {
      setLoading(true);
      runMoralisFunction('getTask', { taskId, columnId })
        .then((taskRes: Task) => {
          console.log(taskRes);
          setTask(taskRes);
          setLoading(false);
        })
        .catch((err: any) => {
          console.log(err);
          notify(`Sorry! There was an error while getting task`, 'error');
        });
    }
  }, [taskId, isInitialized, isOpen]);
  return (
    <CardContext.Provider value={context}>
      <Modal open={isOpen} onClose={handleClose}>
        <Fade in={isOpen}>
          <ModalContainer id="cardModal">
            {loading ? (
              <SkeletonLoader />
            ) : (
              <Fade in={!loading}>
                <div>
                  <TaskCard handleClose={handleClose} />
                </div>
              </Fade>
            )}
          </ModalContainer>
        </Fade>
      </Modal>
    </CardContext.Provider>
  );
}

export default CardModal;
