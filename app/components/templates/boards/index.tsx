import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { useMoralisFunction } from '../../../hooks/useMoralisFunction';
import CardModal from '../../modules/cardModal';
import { notify } from '../../modules/settingsTab';
import TaskBoard from '../../modules/taskBoard';

type Props = {};

const OuterDiv = styled.div`
  margin-left: 1.5rem;
  margin-right: 1.5rem;
  width: 100%;
`;

function BoardsTemplate(props: Props) {
  const router = useRouter();
  const { inviteCode, taskId, id, bid } = router.query;
  const { isAuthenticated, authenticate } = useMoralis();
  const { setSpace, isLoading } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => {
    setIsOpen(false);
    router.push(`/tribe/${id}/space/${bid}`);
  };
  useEffect(() => {
    if (inviteCode && !isLoading) {
      if (!isAuthenticated) {
        authenticate();
        return;
      }
      runMoralisFunction('joinSpaceFromInvite', {
        inviteCode,
        boardId: router.query.bid as string,
      })
        .then((res) => {
          setSpace(res);
          notify('You have joined the space successfully');
          router.push(`/tribe/${router.query.id}/space/${router.query.bid}`);
        })
        .catch((err) => {
          console.error(err);
          router.push(`/tribe/${router.query.id}/space/${router.query.bid}`);
          notify(err.message, 'error');
        });
    }
  }, [inviteCode, isAuthenticated, isLoading]);

  useEffect(() => {
    if (taskId && !isLoading) {
      setIsOpen(true);
    }
  }, [taskId, isLoading]);

  return (
    <OuterDiv>
      <CardModal
        isOpen={isOpen}
        handleClose={handleClose}
        taskId={taskId as string}
      />
      <TaskBoard />
    </OuterDiv>
  );
}

export default BoardsTemplate;
