import { Badge, IconButton, Popover, TextField, Tooltip } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import React, { useState } from 'react';
import { PrimaryButton } from '../../elements/styledComponents';
import { PopoverContainer } from '../cardModal/styles';
import { labelsMapping } from '../../../constants';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import CommonAutocomplete from '../../elements/autoComplete';
import { BoardData } from '../../../types';

export interface CurrentFilter {
  reviewerFilter: string[];
  assigneeFilter: string[];
  labelsFilter: string[];
  titleFilter: string;
}

export const filterTasks = (space: BoardData, currentFilter: CurrentFilter) => {
  if (!currentFilter || !currentFilter.reviewerFilter) return space.tasks;
  const filteredTasks = Object.values(space.tasks)?.filter((task) => {
    if (task === undefined) return false;
    let reviewerFiltSat = false;
    let assigneeFiltSat = false;
    let labelsFiltSat = false;
    let titleFiltSat = false;

    const { reviewer, assignee, tags, title } = task;

    if (currentFilter.reviewerFilter.length > 0) {
      for (let i = 0; i < reviewer.length; i += 1) {
        const filterRTruth = currentFilter.reviewerFilter.includes(reviewer[i]);
        if (filterRTruth) {
          reviewerFiltSat = true;
          break;
        }
      }
    } else {
      reviewerFiltSat = true;
    }

    if (currentFilter.assigneeFilter.length > 0) {
      for (let i = 0; i < assignee.length; i += 1) {
        const filterATruth = currentFilter.assigneeFilter.includes(assignee[i]);
        if (filterATruth) {
          assigneeFiltSat = true;
          break;
        }
      }
      // console.log("\n");
    } else {
      assigneeFiltSat = true;
    }

    if (currentFilter.labelsFilter.length > 0) {
      for (let i = 0; i < tags.length; i += 1) {
        const filterLTruth = currentFilter.labelsFilter.includes(tags[i]);
        if (filterLTruth) {
          labelsFiltSat = true;
          break;
        }
      }
    } else {
      labelsFiltSat = true;
    }

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

    if (reviewerFiltSat && assigneeFiltSat && labelsFiltSat && titleFiltSat) {
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
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [reviewerFilter, setReviewerFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [labelsFilter, setLabelsFilter] = useState<string[]>([]);
  const [titleFilter, setTitleFilter] = useState<string>('');

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitleFilter(event.target.value);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // setOpen(true);
    setFilterOpen(true);
  };
  const handleFilterClose = () => setFilterOpen(false);

  const handleFilter = () => {
    handleFilterClose();
    setCurrentFilter({
      reviewerFilter,
      assigneeFilter,
      labelsFilter,
      titleFilter,
    });
    setFilteredTasks(
      filterTasks(space, {
        reviewerFilter,
        assigneeFilter,
        labelsFilter,
        titleFilter,
      })
    );
  };

  const getFilterBadge = () => {
    let badge = 0;
    if (reviewerFilter.length > 0) {
      badge += 1;
    }
    if (assigneeFilter.length > 0) {
      badge += 1;
    }
    if (labelsFilter.length > 0) {
      badge += 1;
    }
    if (titleFilter.length > 0) {
      badge += 1;
    }
    return badge;
  };

  return (
    <>
      <IconButton sx={{ mt: 0.5 }} onClick={handleClick}>
        <Tooltip title="Filter tasks">
          <Badge
            badgeContent={getFilterBadge()}
            color="primary"
            invisible={getFilterBadge() === 0}
          >
            <FilterAlt sx={{ fontSize: 22, px: 1 }} color="secondary" />
          </Badge>
        </Tooltip>
      </IconButton>
      <Popover
        open={filterOpen}
        anchorEl={anchorEl}
        onClose={() => handleFilterClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <PopoverContainer>
          <CommonAutocomplete
            options={space.members}
            optionLabels={(option) => space.memberDetails[option].username}
            currOption={reviewerFilter}
            setCurrOption={setReviewerFilter}
            setOpen={setFilterOpen}
            closeOnSelect={false}
            sx={{ mt: 2 }}
            multiple
            placeholder="Reviewer"
          />
          <CommonAutocomplete
            options={space.members}
            optionLabels={(option) => space.memberDetails[option].username}
            currOption={assigneeFilter}
            setCurrOption={setAssigneeFilter}
            setOpen={setFilterOpen}
            closeOnSelect={false}
            sx={{ mt: 2 }}
            multiple
            placeholder="Assignee"
          />
          <CommonAutocomplete
            options={Object.keys(labelsMapping)}
            optionLabels={(option) => option}
            currOption={labelsFilter}
            setCurrOption={setLabelsFilter}
            setOpen={setFilterOpen}
            closeOnSelect={false}
            sx={{ mt: 2 }}
            multiple
            placeholder="Labels"
          />
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
        </PopoverContainer>
      </Popover>
    </>
  );
}

export default TasksFilter;
