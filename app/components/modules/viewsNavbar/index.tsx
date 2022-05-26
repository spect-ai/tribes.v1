import {
  DashboardOutlined,
  FormatListBulleted,
  PollOutlined,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import React, { useState } from 'react';
import { StyledTab, ScrollableTabs } from '../../elements/styledComponents';
import { useProject } from '../project';
import TasksFilter from '../tasksFilter';

type Props = {};

function ViewsNavbar(props: Props) {
  const { tab, handleTabChange } = useProject();
  return (
    <Box
      sx={{
        width: {
          xs: '19rem',
          md: '30rem',
        },
      }}
    >
      <ScrollableTabs
        value={tab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
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
      </ScrollableTabs>
    </Box>
  );
}

export default ViewsNavbar;
