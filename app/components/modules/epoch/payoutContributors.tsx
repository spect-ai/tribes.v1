import React, { useEffect, useState } from 'react';
import {
  Box,
  Modal,
  Stepper,
  Step,
  StepLabel,
  styled,
  Typography,
  Chip,
  Grid,
  Avatar,
} from '@mui/material';
import { useMoralis } from 'react-moralis';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import PaidIcon from '@mui/icons-material/Paid';
import { useGlobal } from '../../../context/globalContext';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import Approve from '../batchPay/approve';
import BatchPay from '../batchPay/batchPay';
import { Epoch, ApprovalInfo, DistributionInfo } from '../../../types';
import { capitalizeFirstLetter } from '../../../utils/utils';
import { notify } from '../settingsTab';
import { PrimaryButton } from '../../elements/styledComponents';
import { isApprovalRequired } from '../../../adapters/contract';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { useWalletContext } from '../../../context/WalletContext';

interface Props {
  epoch: Epoch;
}

export const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40rem',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export const Heading = styled('div')(({ theme }) => ({
  fontWeight: 500,
  fontSize: 16,
  color: theme.palette.text.secondary,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderBottom: '1px solid #99ccff',
  padding: 16,
  paddingLeft: 32,
}));

function PayoutContributors({ epoch }: Props) {
  const { networkVersion } = useWalletContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState([] as string[]);
  const [showStepper, setShowStepper] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const {
    state: { registry },
  } = useGlobal();
  const { user } = useMoralis();
  const { runMoralisFunction } = useMoralisFunction();
  const { setRefreshEpochs } = useSpace();
  const [distributionInfo, setDistributionInfo] = useState({
    contributors: Object.keys(epoch.values),
    tokenValues: Object.values(epoch.values),
    epochId: epoch.objectId,
    type: epoch.token.address === '0x0' ? 'currency' : 'tokens',
    tokenAddresses:
      epoch.token.address === '0x0'
        ? null
        : Array(Object.keys(epoch.values).length).fill(epoch.token.address),
  } as DistributionInfo);
  const [approvalInfo, setApprovalInfo] = useState({
    required: false,
    uniqueTokenAddresses: [epoch.token.address],
    aggregatedTokenValues: [epoch.budget],
  } as ApprovalInfo);

  const handleClose = () => {
    setIsOpen(false);
  };
  const handleNextStep = () => {
    if (steps.length > 0) {
      if (steps.length === activeStep) {
        handleClose();
      } else setActiveStep(activeStep + 1);
    } else {
      handleClose();
    }
  };

  const handleStatusUpdate = (epochId: string, transactionHash: string) => {
    runMoralisFunction('completeEpochPayment', { epochId, transactionHash })
      .then((res: any) => {
        setRefreshEpochs(true);
      })
      .catch((err: any) => {
        notify(
          `Sorry! There was an error while updating the task status to 'Paid'. However, your payment went through.`,
          'error'
        );
      });
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (epoch.chain.chainId !== networkVersion) {
      setActiveStep(-1);
      setIsLoading(false);
    } else if (epoch.token.address === '0x0') {
      setActiveStep(2);
      setIsLoading(false);
    } else {
      isApprovalRequired(
        user?.get('ethAddress'),
        epoch.token.address,
        epoch.budget,
        networkVersion
      ).then((reqd: boolean) => {
        if (reqd) {
          const temp = { ...approvalInfo };
          temp.required = true;
          setApprovalInfo(temp);
          setActiveStep(0);
          setSteps(['Approve Tokens', 'Batch Pay Tokens']);
          setShowStepper(true);
        } else {
          setActiveStep(1);
        }
        setIsLoading(false);
      });
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    handleRefresh();
  }, [networkVersion, isOpen]);

  return (
    <>
      {!epoch.paid && (
        <PrimaryButton
          data-testid="bEpochPay"
          endIcon={<PaidIcon />}
          variant="outlined"
          loading={isLoading}
          sx={{
            mx: 4,
            borderRadius: 1,
          }}
          size="small"
          color="secondary"
          onClick={() => {
            handleOpen();
          }}
        >
          Payout countributors
        </PrimaryButton>
      )}
      <Modal open={isOpen} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ minHeight: '10vh' }}
          >
            <Grid item xs={3}>
              <Box style={{ display: 'flex' }}>
                <Typography
                  color="text.primary"
                  variant="body2"
                  marginTop="10px"
                  marginRight="10px"
                >
                  Currently on
                </Typography>
                <Avatar
                  src={registry[networkVersion]?.pictureUrl}
                  sx={{
                    width: '1.5rem',
                    height: '1.5rem',
                    objectFit: 'cover',
                    my: 1,
                  }}
                />
                <Typography
                  color="text.primary"
                  variant="h5"
                  marginBottom="10px"
                  marginLeft="10px"
                >
                  {capitalizeFirstLetter(registry[networkVersion]?.name)}{' '}
                  Network
                </Typography>
              </Box>
            </Grid>
          </Grid>
          {showStepper && (
            <Stepper activeStep={activeStep}>
              {steps.map((label: any, index: number) => {
                const stepProps: { completed?: boolean } = {};
                const labelProps: {
                  optional?: React.ReactNode;
                } = {};
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          )}
          {activeStep === -1 && isOpen && !isLoading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 16,
              }}
            >
              <Typography color="text.primary" sx={{ my: 2 }}>
                Please change your network to pay for this epoch
              </Typography>
              <Chip
                icon={<ChangeCircleIcon />}
                label={`Connect to ${
                  registry[epoch.chain.chainId]?.name
                } network`}
              />
            </Box>
          )}
          {activeStep === 0 && isOpen && !isLoading && (
            <Approve
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              setActiveStep={setActiveStep}
              approvalInfo={approvalInfo}
            />
          )}
          {activeStep === 1 && isOpen && !isLoading && (
            <BatchPay
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              distributionInfo={distributionInfo}
              handleStatusUpdate={handleStatusUpdate}
            />
          )}
          {activeStep === 2 && isOpen && (
            <BatchPay
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              distributionInfo={distributionInfo}
              handleStatusUpdate={handleStatusUpdate}
            />
          )}
        </Box>
      </Modal>{' '}
    </>
  );
}

export default PayoutContributors;
