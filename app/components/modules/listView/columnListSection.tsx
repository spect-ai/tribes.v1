import { Add, ExpandMore } from '@mui/icons-material';
import {
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { Column, Task } from '../../../types';
import { ListAccordian } from '../../elements/styledComponents';
import CreateCard from '../cardModal/createCard';
import { notify } from '../settingsTab';
import { Chip } from '../task';
import TaskListItem from '../taskListItem';

type Props = {
  column: Column;
  tasks: Task[];
};

function ColumnListSection({ column, tasks }: Props) {
  const { space } = useSpace();
  const { user } = useMoralis();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const handleCreateCardClose = () => {
    setShowCreateTask(false);
  };
  return (
    <ListAccordian disableGutters defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        aria-controls="panel1a-content"
        id="panel1a-header"
        sx={{
          height: '2.5rem !important',
          minHeight: '2.5rem !important',
        }}
      >
        <Typography sx={{ width: '10%' }}>{column.title}</Typography>
        <Chip color="rgb(153, 204, 255, 0.2)">{tasks?.length}</Chip>
        <IconButton
          data-testid={`addTask-${column.id}`}
          sx={{ mb: 0.5, p: 1 }}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (
              !column.createCard[space.roles[user?.id as string]] &&
              !column.createCard[0]
            ) {
              notify(
                "Your role doesn't have permission to create cards in this column",
                'error'
              );
              return;
            }
            setShowCreateTask(true);
          }}
        >
          <Add fontSize="small" />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        {tasks?.map((task) => (
          <TaskListItem key={task.taskId} task={task} />
        ))}
      </AccordionDetails>
      <CreateCard
        isOpen={showCreateTask}
        handleClose={handleCreateCardClose}
        column={column}
      />
    </ListAccordian>
  );
}

export default ColumnListSection;
