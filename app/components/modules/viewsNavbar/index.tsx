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
        icon={<DashboardOutlined sx={{ fontSize: 16 }} />}
        iconPosition="start"
        label="Board"
      />
      <StyledTab
        icon={<FormatListBulleted sx={{ fontSize: 16 }} />}
        iconPosition="start"
        label="List"
      />
      <StyledTab
        icon={<PollOutlined sx={{ fontSize: 16 }} />}
        iconPosition="start"
        label="Vote"
      />
      {/* <PrimaryButton color="secondary" startIcon={<Add />}>
        Create View
      </PrimaryButton> */}
    </StyledTabs>
  );
}

export default ViewsNavbar;
