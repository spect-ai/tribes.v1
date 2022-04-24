import { Box, Fade, Modal, styled } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Task } from '../../../types';
import { notify } from '../settingsTab';
import TaskCard from './taskCard';
import SkeletonLoader from './skeletonLoader';
import useMoralisFunction from '../../../hooks/useMoralisFunction';

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

function CardModal({ isOpen, handleClose, taskId, columnId }: Props) {
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<Task>({} as Task);
  const { isInitialized } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();

  useEffect(() => {
    if (isInitialized && isOpen && taskId) {
      setLoading(true);
      runMoralisFunction('getTask', { taskId, columnId })
        .then((taskRes: Task) => {
          console.log('taskRes', taskRes);
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
    <div>
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Fade in={isOpen} timeout={500}>
          <ModalContainer id="cardModal">
            {loading ? (
              <SkeletonLoader />
            ) : (
              <Fade timeout={1000} in={!loading}>
                <div>
                  <TaskCard
                    task={task}
                    setTask={setTask}
                    handleClose={handleClose}
                  />
                </div>
              </Fade>
            )}
          </ModalContainer>
        </Fade>
      </Modal>
    </div>
  );
}

export default CardModal;
