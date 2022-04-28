import PaidIcon from '@mui/icons-material/Paid';
import {
  Avatar,
  Box,
  Grid,
  Modal,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useMoralis } from 'react-moralis';
import { useCardContext } from '..';
import { useGlobal } from '../../../../context/globalContext';
import useCardDynamism from '../../../../hooks/useCardDynamism';
import useCardUpdate from '../../../../hooks/useCardUpdate';
import useERC20 from '../../../../hooks/useERC20';
import { capitalizeFirstLetter } from '../../../../utils/utils';
import Approve from '../../batchPay/approve';
import BatchPay from '../../batchPay/batchPay';
import { PaymentInfo, ApprovalInfo, DistributionInfo } from '../../../../types';
import { CardButton } from '../../../elements/styledComponents';

type Props = {
  handleClose: () => void;
};

// eslint-disable-next-line import/prefer-default-export
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

const modalSteps = ['Approve Tokens', 'Batch Pay Tokens', 'Batch Pay Currency'];

function PayButton({ handleClose }: Props) {
  const { user } = useMoralis();
  const { task, setTask } = useCardContext();
  const { payButtonView } = useCardDynamism();
  const { isCurrency, isApproved } = useERC20();
  const { updateStatusAndTransactionHashInMultipleCards } = useCardUpdate();
  const {
    state: { registry },
  } = useGlobal();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState(modalSteps);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState({} as PaymentInfo);

  const handleModalClose = () => {
    setIsOpen(false);
  };

  const handleModalOpen = () => {
    let info;
    if (isCurrency(task.token.address)) {
      info = {
        currency: {
          cardIds: [task.taskId],
          type: 'currency',
          contributors: task.assignee,
          tokenAddresses: [task.token.address],
          tokenValues: [task.value],
        } as DistributionInfo,
      };
      setActiveStep(2);
      setSteps(['Pay']);
    } else {
      const isApprovedToken = isApproved(
        task.token.address,
        registry[task.chain.chainId].distributorAddress as string,
        task.value
      );
      if (isApprovedToken) {
        setSteps(modalSteps.slice(1));
        setActiveStep(1);
        setSteps(['Pay']);
      } else {
        setActiveStep(0);
        setSteps(['Approve', 'Pay']);
      }
      info = {
        approval: {
          required: !isApprovedToken,
          uniqueTokenAddresses: [task.token.address],
          aggregatedTokenValues: [task.value],
        } as ApprovalInfo,
        tokens: {
          cardIds: [task.taskId],
          type: 'tokens',
          contributors: task.assignee,
          tokenAddresses: [task.token.address],
          tokenValues: [task.value],
        } as DistributionInfo,
      };
    }

    setPaymentInfo(info);
    setIsOpen(true);
  };

  const handleNextStep = () => {
    if (activeStep === 0) {
      setActiveStep(1);
    } else if (activeStep === 1 || activeStep === 2) {
      handleModalClose();
    }
  };

  if (payButtonView !== 'hide') {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mx: 1,
            minWidth: '9rem',
          }}
        >
          <CardButton
            variant="outlined"
            onClick={() => {
              handleModalOpen();
            }}
            color="secondary"
            sx={{
              padding: '2px',
              minWidth: '3rem',
            }}
            startIcon={<PaidIcon sx={{ my: 2, ml: 2 }} />}
            size="small"
          >
            <Typography
              sx={{
                fontSize: 14,
                mr: 2,
              }}
            >
              Pay
            </Typography>
          </CardButton>
        </Box>
        <Modal open={isOpen} onClose={handleModalClose}>
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
                    Currently showing rewards on
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
              <Approve
                handleClose={handleModalClose}
                handleNextStep={handleNextStep}
                setActiveStep={setActiveStep}
                approvalInfo={paymentInfo.approval}
                chainId={window.ethereum.networkVersion}
              />
            )}
            {activeStep === 1 && isOpen && !isLoading && (
              <BatchPay
                handleClose={handleModalClose}
                handleNextStep={handleNextStep}
                chainId={window.ethereum.networkVersion}
                distributionInfo={paymentInfo.tokens}
                handleStatusUpdate={
                  updateStatusAndTransactionHashInMultipleCards
                }
              />
            )}
            {activeStep === 2 && isOpen && (
              <BatchPay
                handleClose={handleModalClose}
                handleNextStep={handleNextStep}
                chainId={window.ethereum.networkVersion}
                distributionInfo={paymentInfo.currency}
                handleStatusUpdate={
                  updateStatusAndTransactionHashInMultipleCards
                }
              />
            )}
          </Box>
        </Modal>{' '}
      </>
    );
  }

  return <div />;
}

export default PayButton;
