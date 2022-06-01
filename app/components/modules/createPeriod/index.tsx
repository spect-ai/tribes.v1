import RedeemIcon from '@mui/icons-material/Redeem';
import {
  Box,
  Modal,
  styled,
  Step,
  StepLabel,
  Stepper,
  Button,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useMoralis } from 'react-moralis';
import { useGlobal } from '../../../context/globalContext';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import useAccess from '../../../hooks/useAccess';
import usePeriod from '../../../hooks/usePeriod';
import { PrimaryButton } from '../../elements/styledComponents';
import AdvancedFields from './advancedFields';
import BasicFields from './basicFields';
import MemberBudgetFields from './members';
import { Chain, Registry, Token } from '../../../types';
import { useRetro } from '../retro';

type Props = {};

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute' as 'absolute',
  transform: 'translate(-50%, -50%)',
  border: '2px solid #000',
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: 'auto',
  maxHeight: 'calc(100% - 128px)',
  [theme.breakpoints.down('md')]: {
    top: '50%',
    left: '50%',
    padding: '1rem 2rem',
    width: '18rem',
  },
  [theme.breakpoints.up('md')]: {
    top: '40%',
    left: '55%',
    width: '40rem',
    padding: '1.5rem 3rem',
  },
}));

const steps = ['Basic info', 'Members and budget', 'Advanced settings'];

function CreatePeriod(props: Props) {
  const { user } = useMoralis();
  const { isSpaceSteward } = useAccess();
  const { space } = useSpace();
  const { state } = useGlobal();
  const { createPeriod } = usePeriod();

  const { registry } = state;
  const { isCreateModalOpen, setIsCreateModalOpen } = useRetro();
  // const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [strategy, setStrategy] = useState('Normal Voting');
  const [duration, setDuration] = useState(1);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState(0);

  const [chain, setChain] = useState({
    chainId: space?.defaultPayment?.chain?.chainId,
    name: space?.defaultPayment?.chain?.name,
  } as Chain);
  const [token, setToken] = useState(
    registry[space?.defaultPayment?.chain?.chainId].tokens[
      space?.defaultPayment?.token?.address
    ] as Token
  );
  const [value, setValue] = useState(0);
  const [canReceive, setCanReceive] = useState(
    Array(space.members?.length).fill(true)
  );
  const [allocations, setAllocations] = useState(
    Array(space.members?.length).fill(100)
  );

  const handleClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleNextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const handlePrevStep = () => {
    setActiveStep(activeStep - 1);
  };
  const toggleCheckboxValue = (index: number) => {
    setCanReceive(canReceive.map((v, i) => (i === index ? !v : v)));
  };

  const handleAllocation = (index: number, newValue: number) => {
    setAllocations(
      allocations.map((v, i) => (i === index ? newValue : allocations[i]))
    );
  };

  const getMembers = () => {
    const members = [];
    for (let i = 0; i < space.members.length; i += 1) {
      const member = {
        objectId: space.members[i],
        votesAllocated: allocations[i],
      };
      members.push(member);
    }

    return members;
  };

  const getChoices = () => {
    const choices = [] as string[];
    for (let i = 0; i < space.members.length; i += 1) {
      if (canReceive[i]) {
        choices.push(space.members[i]);
      }
    }
    return choices;
  };

  useEffect(() => {
    if (activeStep === 0 && name.length === 0) {
      setIsNextDisabled(true);
    }
  });

  return (
    <>
      {user && isSpaceSteward() && (
        <PrimaryButton
          data-testid="bCreateEpoch"
          variant="outlined"
          size="large"
          color="secondary"
          endIcon={<RedeemIcon />}
          onClick={() => {
            setIsCreateModalOpen(true);
          }}
          sx={{ borderRadius: 1, my: 2 }}
        >
          Start a retro period
        </PrimaryButton>
      )}
      <Modal open={isCreateModalOpen} onClose={handleClose}>
        <ModalContainer>
          <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
            {steps.map((label: any, index: number) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
              } = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel sx={{ fontColor: '#ffffff' }}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {activeStep === 0 && isCreateModalOpen && !isLoading && (
            <BasicFields
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              setIsNextDisabled={setIsNextDisabled}
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
            />
          )}
          {activeStep === 1 && isCreateModalOpen && !isLoading && (
            <MemberBudgetFields
              chain={chain}
              setChain={setChain}
              token={token}
              setToken={setToken}
              value={value}
              setValue={setValue}
              allocations={allocations}
              handleAllocation={handleAllocation}
              isChecked={canReceive}
              setIsChecked={setCanReceive}
              toggleCheckboxValue={toggleCheckboxValue}
              setIsNextDisabled={setIsNextDisabled}
            />
          )}
          {activeStep === 2 && isCreateModalOpen && (
            <AdvancedFields
              strategy={strategy}
              setStrategy={setStrategy}
              duration={duration}
              setDuration={setDuration}
              isRecurring={isRecurring}
              setIsRecurring={setIsRecurring}
              recurringPeriod={recurringPeriod}
              setRecurringPeriod={setRecurringPeriod}
            />
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              mt: 4,
              mx: 2,
            }}
          >
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => {
                activeStep === 0 ? handleClose() : handlePrevStep();
              }}
              sx={{ mr: 1, color: '#f45151', height: '2.2rem' }}
              id="bCancelEpoch"
            >
              {activeStep === 0 ? `Cancel` : `Back`}
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'end',
              }}
            >
              <>
                {' '}
                <PrimaryButton
                  data-testid="bEpochNextButton"
                  loading={isLoading}
                  sx={{ borderRadius: '3px', maxWidth: '10rem' }}
                  onClick={() => {
                    activeStep === 0
                      ? handleNextStep()
                      : createPeriod(
                          name,
                          description,
                          getMembers(),
                          getChoices(),
                          value,
                          token,
                          chain,
                          strategy,
                          duration,
                          isRecurring,
                          recurringPeriod
                        );
                  }}
                  variant="outlined"
                  id="bEpochNextStep"
                  color="secondary"
                  disabled={isNextDisabled}
                >
                  {activeStep === 0 ? `Next` : `Create retro period`}
                </PrimaryButton>
                {activeStep === 1 && (
                  <PrimaryButton
                    data-testid="bEpochNextButton"
                    loading={isLoading}
                    sx={{ borderRadius: '3px', mt: 2 }}
                    onClick={() => {
                      handleNextStep();
                    }}
                    id="bEpochNextStep"
                    color="secondary"
                    disabled={isNextDisabled}
                  >
                    {`Advanced settings >`}
                  </PrimaryButton>
                )}
              </>
            </Box>
          </Box>
        </ModalContainer>
      </Modal>
    </>
  );
}

export default CreatePeriod;
