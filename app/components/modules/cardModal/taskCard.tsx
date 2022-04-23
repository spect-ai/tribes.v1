import styled from '@emotion/styled';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, InputBase } from '@mui/material';
import React from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useCard from '../../../hooks/useCard';
import useCardDynamism from '../../../hooks/useCardDynamism';
import { Task } from '../../../types';
import { uid } from '../../../utils/utils';
import Editor from '../editor';
import AssignToMe from './buttons/assignToMe';
import CardMemberPopover from './popovers/cardMemberPopover';
import CardTypePopover from './popovers/cardTypePopover';
import ColumnPopover from './popovers/columnPopover';
import DatePopover from './popovers/datePopover';
import LabelPopover from './popovers/labelPopover';
import OptionsPopover from './popovers/optionsPopover';
import RewardPopover from './popovers/rewardPopover';
import TabularDetails from './tabularDetails';

type Props = {
  task: Task;
  setTask: (task: Task) => void;
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

function TaskCard({ task, setTask, handleClose }: Props) {
  const { space, setSpace } = useSpace();
  const { editAbleComponents, viewableComponents } = useCardDynamism(task);
  const { title, setTitle, updateTitle, updateDescription } = useCard(
    setTask,
    task
  );

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
        <AssignToMe task={task} setTask={setTask} />

        {viewableComponents.optionPopover && (
          <OptionsPopover task={task} setTask={setTask} />
        )}
        <IconButton sx={{ m: 0, px: 2 }} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </TaskModalTitleContainer>
      <Box sx={{ width: 'fit-content', display: 'flex', flexWrap: 'wrap' }}>
        <CardTypePopover task={task} setTask={setTask} />
        <ColumnPopover
          task={task}
          setTask={setTask}
          column={space.columns[task.columnId]}
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', marginBottom: '16px' }}>
        <CardMemberPopover type="reviewer" task={task} setTask={setTask} />
        <CardMemberPopover type="assignee" task={task} setTask={setTask} />
        <RewardPopover task={task} setTask={setTask} />
        <DatePopover task={task} setTask={setTask} />
        <LabelPopover task={task} setTask={setTask} />
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
            editAbleComponents.description
              ? `Add details, press "/" for commands`
              : `No details provided yet`
          }
          readonly={!editAbleComponents.description}
        />

        <Box sx={{ marginBottom: '16px' }}>
          <TabularDetails task={task} setTask={setTask} />
        </Box>
      </TaskModalBodyContainer>
    </Container>
  );
}

export default TaskCard;
