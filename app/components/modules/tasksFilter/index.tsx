import { IconButton, Popover, TextField, Tooltip } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../elements/styledComponents';
import { PopoverContainer } from '../cardModal/styles';
import { labelsMapping } from '../../../constants';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import CommonAutocomplete from '../../elements/autoComplete';
import { Task } from '../../../types';

function TasksFilter() {
  const { space, setSpace } = useSpace();
  const [allTasks, setAllTasks] = useState<{ [key: string]: Task }>({} as any);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [reviewerFilter, setReviewerFilter] = useState<any[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<any[]>([]);
  const [labelsFilter, setLabelsFilter] = useState<any[]>([]);
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
    const filteredTasks = Object.values(allTasks)?.filter((task) => {
      if (task === undefined) return false;
      let reviewerFiltSat = false;
      let assigneeFiltSat = false;
      let labelsFiltSat = false;
      let titleFiltSat = false;

      const { reviewer, assignee, tags, title } = task;

      if (reviewerFilter.length > 0) {
        for (let i = 0; i < reviewer.length; i += 1) {
          const filterRTruth = reviewerFilter.includes(reviewer[i]);
          if (filterRTruth) {
            reviewerFiltSat = true;
            break;
          }
        }
      } else {
        reviewerFiltSat = true;
      }

      if (assigneeFilter.length > 0) {
        for (let i = 0; i < assignee.length; i += 1) {
          const filterATruth = assigneeFilter.includes(assignee[i]);
          if (filterATruth) {
            assigneeFiltSat = true;
            break;
          }
        }
        // console.log("\n");
      } else {
        assigneeFiltSat = true;
      }

      if (labelsFilter.length > 0) {
        for (let i = 0; i < tags.length; i += 1) {
          const filterLTruth = labelsFilter.includes(tags[i]);
          if (filterLTruth) {
            labelsFiltSat = true;
            break;
          }
        }
      } else {
        labelsFiltSat = true;
      }

      if (titleFilter.length > 0) {
        const searchString = titleFilter.toLowerCase();
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
    setSpace({ ...space, tasks: spaceTasks });
  };

  useEffect(() => {
    setAllTasks(space.tasks);
  }, []);

  return (
    <>
      <IconButton sx={{ mt: 0.5 }} onClick={handleClick}>
        <Tooltip title="Filter tasks">
          <FilterAlt sx={{ fontSize: 22, px: 1 }} color="secondary" />
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
