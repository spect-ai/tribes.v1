import PaidIcon from '@mui/icons-material/Paid';
import {
  Avatar,
  Box,
  Grid,
  Modal,
  Step,
  StepLabel,
  Stepper,
  styled,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { useGlobal } from '../../../context/globalContext';
import { useMoralisFunction } from '../../../hooks/useMoralisFunction';
import { capitalizeFirstLetter } from '../../../utils/utils';
import { SidebarButton } from '../exploreSidebar';
import { notify } from '../settingsTab';
import Approve, { ApprovalInfo } from './approve';
import BatchPay, { DistributionInfo } from './batchPay';
import CardList from './cardList';

const modalSteps = [
  'Pick Cards',
  'Approve Tokens',
  'Batch Pay Tokens',
  'Batch Pay Currency',
];

export type PaymentInfo = {
  approval: ApprovalInfo;
  tokens: DistributionInfo;
  currency: DistributionInfo;
};

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

function PaymentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState(modalSteps);
  const { palette } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const {
    state: { registry },
  } = useGlobal();
  const [paymentInfo, setPaymentInfo] = useState({} as PaymentInfo);
  const { setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();

  const handleClose = () => {
    setIsOpen(false);
  };
  const handleNextStep = (newPaymentInfo: PaymentInfo) => {
    const info: PaymentInfo = newPaymentInfo || paymentInfo;

    if (activeStep === 0) {
      if (info.approval?.required) {
        setActiveStep(1);
      } else if (newPaymentInfo.tokens?.contributors?.length > 0) {
        setActiveStep(2);
      } else if (newPaymentInfo.currency?.contributors?.length) {
        setActiveStep(3);
      } else {
        handleClose();
      }
    } else if (activeStep === 1) setActiveStep(2);
    else if (activeStep === 2) {
      if (newPaymentInfo.tokens?.contributors?.length > 0) {
        setActiveStep(3);
      } else {
        handleClose();
      }
    } else if (activeStep === 3) handleClose();
  };

  const handleStatusUpdate = (taskIds: string[]) => {
    runMoralisFunction('completePayment', {
      taskIds,
    })
      .then((res: any) => {
        setSpace(res);
      })
      .catch((err: any) => {
        notify(
          `Sorry! There was an error while updating the task status to 'Paid'. However, your payment went through.`,
          'error'
        );
      });
  };

  return (
    <>
      <SidebarButton
        palette={palette}
        selected={isOpen}
        onClick={() => {
          setActiveStep(0);
          setIsOpen(true);
        }}
      >
        <Tooltip title="Batch Pay" placement="right" arrow sx={{ m: 0, p: 0 }}>
          <PaidIcon
            sx={{
              fontSize: 28,
              color: isOpen ? palette.secondary.main : palette.divider,
            }}
          />
        </Tooltip>
      </SidebarButton>
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
                  Currently showing cards with rewards on
                </Typography>
                <Avatar
                  src={registry[window.ethereum.networkVersion]?.pictureUrl}
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
                  {capitalizeFirstLetter(
                    registry[window.ethereum.networkVersion]?.name
                  )}{' '}
                  Network
                </Typography>
              </Box>
            </Grid>
          </Grid>
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
          {activeStep === 0 && isOpen && !isLoading && (
            <CardList
              setPaymentInfo={setPaymentInfo}
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              chainId={window.ethereum.networkVersion}
            />
          )}
          {activeStep === 1 && isOpen && !isLoading && (
            <Approve
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              setActiveStep={setActiveStep}
              approvalInfo={paymentInfo.approval}
              chainId={window.ethereum.networkVersion}
            />
          )}
          {activeStep === 2 && isOpen && !isLoading && (
            <BatchPay
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              chainId={window.ethereum.networkVersion}
              distributionInfo={paymentInfo.tokens}
              handleStatusUpdate={handleStatusUpdate}
            />
          )}
          {activeStep === 3 && isOpen && (
            <BatchPay
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              chainId={window.ethereum.networkVersion}
              distributionInfo={paymentInfo.currency}
              handleStatusUpdate={handleStatusUpdate}
            />
          )}
        </Box>
      </Modal>{' '}
    </>
  );
}

export default PaymentModal;
