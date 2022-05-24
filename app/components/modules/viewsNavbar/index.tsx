import {
  DashboardOutlined,
  FormatListBulleted,
  PollOutlined,
} from '@mui/icons-material';
import React, { useState } from 'react';
import { StyledTab, StyledTabs } from '../../elements/styledComponents';
import { useProject } from '../project';
import TasksFilter from '../tasksFilter';

type Props = {};

function ViewsNavbar(props: Props) {
  const { tab, handleTabChange } = useProject();
  const [reviewerFilter, setReviewerFilter] = useState<any[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<any[]>([]);
  const [labelsFilter, setLabelsFilter] = useState<any[]>([]);
  const [titleFilter, setTitleFilter] = useState<string>('');
  return (
    <StyledTabs value={tab} onChange={handleTabChange}>
      <StyledTab
        data-testid="tBoardViewTab"
        icon={<DashboardOutlined sx={{ fontSize: 16 }} />}
        iconPosition="start"
        label="Board"
      />
      <StyledTab
        data-testid="tListViewTab"
        icon={<FormatListBulleted sx={{ fontSize: 16 }} />}
        iconPosition="start"
        label="List"
      />
      <StyledTab
        data-testid="tForumViewTab"
        icon={<PollOutlined sx={{ fontSize: 16 }} />}
        iconPosition="start"
        label="Forum"
      />
      {/* <PrimaryButton color="secondary" startIcon={<Add />}>
        Create View
      </PrimaryButton> */}
      <TasksFilter />
    </StyledTabs>
  );
}

export default ViewsNavbar;
