import styled from '@emotion/styled';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, InputBase } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useCardDynamism from '../../../hooks/useCardDynamism';
import useAccess from '../../../hooks/useAccess';
import { Task } from '../../../types';
import { uid } from '../../../utils/utils';
import Editor from '../editor';
import AssignToMe from './buttons/assignToMe';
import PayButton from './buttons/payButton';
import CloseButton from './buttons/close';
import CardMemberPopover from './popovers/cardMemberPopover';
import CardTypePopover from './popovers/cardTypePopover';
import ColumnPopover from './popovers/columnPopover';
import DatePopover from './popovers/datePopover';
import LabelPopover from './popovers/labelPopover';
import OptionsPopover from './popovers/optionsPopover';
import RewardPopover from './popovers/rewardPopover';
import TabularDetails from './tabularDetails';
import useCardUpdate from '../../../hooks/useCardUpdate';
import { useCardContext } from '.';

type Props = {
  handleClose: () => void;
};

const TaskModalTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const TaskModalBodyContainer = styled.div`
  margin-top: 2px;
  color: #eaeaea;
  font-size: 0.85rem;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

function TaskCard({ handleClose }: Props) {
  const { isCardStewardAndUnpaidCardStatus } = useCardDynamism();
  const { updateTitle, updateDescription } = useCardUpdate();
  const [readOnlyDescription, setReadOnlyDescription] = useState(false);
  const { title, setTitle, task } = useCardContext();
  const { isSpaceSteward, isCardStakeholder } = useAccess(task);
  useEffect(() => {
    setReadOnlyDescription(!isCardStewardAndUnpaidCardStatus());
  }, [isCardStewardAndUnpaidCardStatus()]);

  return (
    <Container>
      <TaskModalTitleContainer>
        <InputBase
          placeholder="Add Card Title..."
          sx={{
            fontSize: '20px',
            ml: 1,
          }}
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => updateTitle()}
          readOnly={!(task?.access?.creator || task?.access?.reviewer)}
        />
        <Box sx={{ flex: '1 1 auto' }} />
        <AssignToMe />
        <CloseButton />
        <PayButton handleClose={handleClose} />
        {(isSpaceSteward() || isCardStakeholder()) && <OptionsPopover />}
        <IconButton
          data-testid="bCloseButton"
          sx={{ m: 0, px: 2 }}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      </TaskModalTitleContainer>
      <Box sx={{ width: 'fit-content', display: 'flex', flexWrap: 'wrap' }}>
        <CardTypePopover />
        <ColumnPopover />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', marginBottom: '16px' }}>
        <CardMemberPopover type="reviewer" />
        <CardMemberPopover type="assignee" />
        <RewardPopover />
        <DatePopover />
        <LabelPopover />
      </Box>

      <TaskModalBodyContainer>
        <Editor
          syncBlocksToMoralis={updateDescription}
          initialBlock={
            task.description
              ? task.description
              : [
                  {
                    id: uid(),
                    html: '',
                    tag: 'p',
                    type: '',
                    imageUrl: '',
                    embedUrl: '',
                  },
                ]
          }
          placeholderText={
            isCardStewardAndUnpaidCardStatus()
              ? `Add details, press "/" for commands`
              : `No details provided yet`
          }
          readonly={readOnlyDescription}
        />

        <Box sx={{ marginBottom: '16px' }}>
          <TabularDetails />
        </Box>
      </TaskModalBodyContainer>
    </Container>
  );
}

export default TaskCard;
