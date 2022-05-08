import { Avatar, Box, Button, Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import { approve } from '../../../adapters/contract';
import { useGlobal } from '../../../context/globalContext';
import { PrimaryButton } from '../../elements/styledComponents';
import { notify } from '../settingsTab';
import { ApprovalInfo } from '../../../types';
import { useWalletContext } from '../../../context/WalletContext';

interface Props {
  handleNextStep: Function;
  handleClose: Function;
  setActiveStep: Function;
  approvalInfo: ApprovalInfo;
}

function Approve({
  handleNextStep,
  handleClose,
  setActiveStep,
  approvalInfo,
}: Props) {
  const { networkVersion } = useWalletContext();
  const [isLoading, setIsLoading] = useState(
    Array(approvalInfo.uniqueTokenAddresses?.length).fill(false)
  );
  const [isApproved, setIsApproved] = useState(
    Array(approvalInfo.uniqueTokenAddresses?.length).fill(false)
  );

  const toggleIsLoading = (index: number) => {
    setIsLoading(isLoading.map((v, i) => (i === index ? !v : v)));
  };

  const hasApprovedAll = (approved: boolean[]) => {
    const pendingApprovals = approved.filter((a) => a === false);
    return !(pendingApprovals.length > 0);
  };

  const handleApproval = (index: number) => {
    const temp = isApproved.filter(() => true);
    temp[index] = true;
    setIsApproved(temp);

    return hasApprovedAll(temp);
  };

  const { state } = useGlobal();
  const { registry } = state;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        marginTop: '16px',
      }}
    >
      <Box>
        {approvalInfo.uniqueTokenAddresses.map(
          (address: string, index: number) => (
            <Grid
              container
              spacing={1}
              key={address}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              margin="8px"
            >
              <Grid item xs={6}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    sx={{
                      width: '2rem',
                      height: '2rem',
                      objectFit: 'cover',
                      my: 1,
                    }}
                    src={registry[networkVersion].tokens[address]?.pictureUrl}
                  >
                    {registry[networkVersion].tokens[address].symbol}
                  </Avatar>
                  <Typography color="text.primary" marginLeft="20px">
                    {registry[networkVersion].tokens[address].symbol}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={3}>
                {isApproved[index] ? (
                  <PrimaryButton
                    sx={{ borderRadius: '3px' }}
                    disabled
                    variant="outlined"
                    id="bApprove"
                  >
                    Approved
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    loading={isLoading[index]}
                    sx={{ borderRadius: '3px' }}
                    color="secondary"
                    onClick={() => {
                      toggleIsLoading(index);
                      approve(
                        networkVersion,
                        approvalInfo.uniqueTokenAddresses[index]
                      )
                        .then((res: any) => {
                          toggleIsLoading(index);
                          const hasApprvoedAll = handleApproval(index);
                          if (hasApprvoedAll) handleNextStep();
                        })
                        .catch((err: any) => {
                          toggleIsLoading(index);
                          notify(err.message, 'error');
                        });
                    }}
                    variant="outlined"
                    id="bApprove"
                  >
                    Approve
                  </PrimaryButton>
                )}
              </Grid>
            </Grid>
          )
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, marginTop: 8 }}>
        <Button
          color="inherit"
          variant="outlined"
          onClick={() => handleClose()}
          sx={{ mr: 1, color: '#f45151' }}
          id="bCancel"
        >
          Cancel
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
      </Box>
    </Box>
  );
}

export default Approve;
