import { TextField, Box } from '@mui/material';
import React, { useState } from 'react';
import { PrimaryButton } from '../../elements/styledComponents';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { BoardData } from '../../../types';

export interface CurrentFilter {
  titleFilter: string;
}

export const filterTasks = (space: BoardData, currentFilter: CurrentFilter) => {
  const filteredTasks = Object.values(space.tasks)?.filter((task) => {
    if (task === undefined) return false;
    let titleFiltSat = false;

    const { title } = task;

    if (currentFilter.titleFilter.length > 0) {
      const searchString = currentFilter.titleFilter.toLowerCase();
      const titleToSearch = title.toLowerCase();
      const titleSearch = titleToSearch.includes(searchString);
      if (titleSearch === true) {
        titleFiltSat = true;
      }
    } else {
      titleFiltSat = true;
    }

    if (titleFiltSat) {
      return task;
    }
    return false;
  });
  const spaceTasks = filteredTasks.reduce(
    (acc, task) => ({ ...acc, [task.taskId]: task }),
    {}
  );
  return spaceTasks;
};

function TasksFilter() {
  const { space, setFilteredTasks, setCurrentFilter } = useSpace();
  const [titleFilter, setTitleFilter] = useState<string>('');

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitleFilter(event.target.value);
  };

  const handleFilter = () => {
    setCurrentFilter({
      titleFilter,
      reviewerFilter: [],
      assigneeFilter: [],
      labelsFilter: [],
    });
    setFilteredTasks(
      filterTasks(space, {
        titleFilter,
      })
    );
  };

  return (
    <Box>
      <TextField
        id="filled-hidden-label-normal"
        size="small"
        fullWidth
        placeholder="Title"
        value={titleFilter}
        onChange={handleTitleChange}
        sx={{ mt: 2 }}
        color="secondary"
      />

      <PrimaryButton
        variant="outlined"
        sx={{ mt: 4, borderRadius: 1 }}
        color="secondary"
        onClick={handleFilter}
      >
        Filter
      </PrimaryButton>
    </Box>
  );
}

export default TasksFilter;
