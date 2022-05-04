import {
  Add,
  DashboardOutlined,
  FormatListBulleted,
  PollOutlined,
} from '@mui/icons-material';
import React from 'react';
import {
  PrimaryButton,
  StyledTab,
  StyledTabs,
} from '../../elements/styledComponents';
import { useProject } from '../project';

type Props = {};

function ViewsNavbar(props: Props) {
  const { tab, handleTabChange } = useProject();
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
    </StyledTabs>
  );
}

export default ViewsNavbar;
