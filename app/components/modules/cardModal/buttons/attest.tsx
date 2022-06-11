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
  const { isGiveSoulboundButtonViewable } = useCardDynamism();
  const { tribe } = useTribe();
  const { space } = useSpace();
  const { createBounty, getBounty } = useSouls();
  const { user, Moralis } = useMoralis();
  const { updateAttestationInfo } = useCardUpdate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFeedback, setLoadingFeedack] = useState('');
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
    setLoadingFeedack('Uploading to IPFS...');
    const attestation = {
      application: 'spect',
      type: task.type,
      assignees: task.assignee,
      reviewer: task.reviewer,
      description: task.description,
      title: task.title,
      reward: {
        value: task.value,
        token: task.token,
        network: task.chain,
      },
      deadline: task.deadline,
      tribe: space.team[0].name,
      space: space.name,
    };
    const file = new Moralis.File('file.json', {
      base64: btoa(JSON.stringify(attestation)),
    });
    file.saveIPFS().then((ipfsRes: any) => {
      const ethAddresses = getAddresses(task.assignee.concat(task.reviewer));
      createBounty(ethAddresses, ipfsRes._ipfs)
        // eslint-disable-next-line no-shadow
        .then((res: any) => {
          console.log(res);
          getBounty(res).then((bounty: any) => {
            // eslint-disable-next-line no-console
            console.log(parseInt(res._hex, 16));
            // eslint-disable-next-line no-shadow
            updateAttestationInfo(
              bounty.bountyNFT,
              parseInt(res._hex, 16),
              ipfsRes._ipfs,
              space.team[0].name
            );
            setIsLoading(false);
            setLoadingFeedack('Bounty created');
            setIsOpen(false);
          });
        })
        .catch((err: any) => {
          console.log(err);
          setIsLoading(false);
        });
    });
  };

  if (isGiveSoulboundButtonViewable()) {
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
            Attest
          </Typography>
        </CardButton>
        <ConfirmModal
          isOpen={isOpen}
          handleClose={handleClose}
          buttonText="Yes, send attestation"
          runOnConfirm={handleConfirm}
          confirmButtonColor="success"
          modalContent={
            <Typography variant="subtitle1" sx={{ mb: 2 }} color="text.primary">
              You are about to send an attestation of this card to assignees and
              reviewers!
            </Typography>
          }
        />
      </Box>
    );
  }

  return <div />;
}

export default Attest;
