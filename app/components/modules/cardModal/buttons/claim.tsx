import LoyaltyIcon from '@mui/icons-material/Loyalty';
import { Box, Typography } from '@mui/material';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useCardContext } from '..';
import { useTribe } from '../../../../../pages/tribe/[id]';
import { useSpace } from '../../../../../pages/tribe/[id]/space/[bid]';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useSouls from '../../../../hooks/useSouls';
import ConfirmModal from '../../../elements/confirmModal';
import { CardButton } from '../../../elements/styledComponents';
import useCardUpdate from '../../../../hooks/useCardUpdate';

function Attest() {
  const { task, setTask, setProposalEditMode } = useCardContext();
  const { isClaimButtonViewable } = useCardDynamism();
  const { tribe } = useTribe();
  const { space } = useSpace();
  const { claim } = useSouls();
  const { user, Moralis } = useMoralis();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFeedback, setLoadingFeedack] = useState('');
  const { updateNftAddress } = useCardUpdate();

  const handleClose = () => {
    setIsOpen(false);
  };

  const getAddresses = (userIds: string[]) => {
    const ethAddresses = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const userId of userIds) {
      ethAddresses.push(space.memberDetails[userId].ethAddress);
    }

    return ethAddresses;
  };

  const handleConfirm = () => {
    setIsLoading(true);
    setLoadingFeedack('Claiming Attestation...');

    claim(task.onChainBountyId as number)
      // eslint-disable-next-line no-shadow
      .then((res: any) => {
        console.log(res);
        updateNftAddress(res.bountyNFT);
        setIsLoading(false);
        setLoadingFeedack('Attestation claimed');
        setIsOpen(false);
      })
      .catch((err: any) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  if (isClaimButtonViewable()) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mx: 1,
          minWidth: '7rem',
        }}
      >
        <CardButton
          variant="outlined"
          onClick={() => {
            setIsOpen(true);
          }}
          color="success"
          sx={{
            padding: '1px',
            minWidth: '2rem',
          }}
          startIcon={<LoyaltyIcon sx={{ my: 2, ml: 0.5 }} />}
          size="small"
        >
          <Typography
            sx={{
              fontSize: 14,
              mr: 0.5,
            }}
          >
            Claim
          </Typography>
        </CardButton>
        <ConfirmModal
          isOpen={isOpen}
          handleClose={handleClose}
          buttonText="Yes, claim attestation"
          runOnConfirm={handleConfirm}
          confirmButtonColor="success"
          modalContent={
            <Typography variant="subtitle1" sx={{ mb: 2 }} color="text.primary">
              You are about to claim an attestation of this card!
            </Typography>
          }
        />
      </Box>
    );
  }

  return <div />;
}

export default Attest;
