import React from 'react';
import { Box } from '@mui/material';
import { ScrollableTabs, StyledTab } from '../../elements/styledComponents';
import ProposalsStewardView from './content/proposalsStewardView';
import ProposalApplicantdView from './content/proposalApplicantView';
import Apply from './buttons/apply';
import Submission from './content/submission';
import Activity from './content/activity';
import Comments from './content/comments';
import useCardDynamism from '../../../hooks/useCardDynamism';

function TabularDetails() {
  const { tabs, handleTabChange, tabIdx } = useCardDynamism();
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Apply />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          width: '100%',
        }}
      >
        <ScrollableTabs value={tabIdx} onChange={handleTabChange} sx={{}}>
          {tabs.map((tab) => {
            return <StyledTab key={tab.toString()} label={tab} />;
          })}
        </ScrollableTabs>
        {tabs[tabIdx] === 'Applicants' && <ProposalsStewardView />}
        {tabs[tabIdx] === 'Application' && <ProposalApplicantdView />}
        {tabs[tabIdx] === 'Submissions' && <Submission />}
        {tabs[tabIdx] === 'Activity' && <Activity />}
        {tabs[tabIdx] === 'Comments' && <Comments />}
      </Box>
    </>
  );
}

export default TabularDetails;
