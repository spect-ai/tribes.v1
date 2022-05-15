/* eslint-disable @typescript-eslint/indent */
import GradeIcon from '@mui/icons-material/Grade';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {
  Divider,
  Box,
  Button,
  Grid,
  Typography,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { useGlobal } from '../../../context/globalContext';
import { DistributionInfo } from '../../../types';
import { PrimaryButton } from '../../elements/styledComponents';
import usePaymentGateway from '../../../hooks/usePaymentGateway';
import { useWalletContext } from '../../../context/WalletContext';
import MemberInfoDisplay from '../../elements/memberInfoDisplay';
import { isEthAddress, getEthAddresses } from '../../../utils/utils';
import EthAddressInput from '../../elements/ethAddressInput';

type Props = {
  handleNextStep: Function;
  handleClose: Function;
  distributionInfo: DistributionInfo;
  handleStatusUpdate: Function;
};

interface RewardInput {
  contributor: string;
  value: number;
  tokenAddress: string;
}

function BatchPay({
  handleNextStep,
  handleClose,
  distributionInfo,
  handleStatusUpdate,
}: Props) {
  const { space } = useSpace();
  const { state } = useGlobal();
  const { registry } = state;
  const { batchPay, isLoading } = usePaymentGateway(
    handleStatusUpdate,
    handleNextStep
  );
  const { networkVersion } = useWalletContext();
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [manualUpdateView, setManualUpdateView] = useState(false);
  const [rewardValues, setRewardValues] = useState([] as Array<number>);
  const [tokenAddresses, setTokenAddresses] = useState([] as Array<string>);
  const [ethAddresses, setEthAddresses] = useState([] as Array<string>);
  const [isValidAddress, setIsValidAddress] = useState([] as Array<boolean>);
  const [openCardDetails, setOpenCardDetails] = useState([] as Array<boolean>);

  const { control } = useForm<RewardInput>();

  const toggleVisibleOptions = () => {
    setOptionsVisible(!optionsVisible);
  };

  const initialize = () => {
    setRewardValues(distributionInfo.tokenValues);
    setTokenAddresses(distributionInfo.tokenAddresses);
    setEthAddresses(
      getEthAddresses(distributionInfo.contributors, space.memberDetails)
    );
    setIsValidAddress(Array(distributionInfo.contributors?.length).fill(true));
    setOpenCardDetails(
      Array(distributionInfo.contributors?.length).fill(false)
    );
    setOptionsVisible(false);
  };

  const handleRewardUpdate = (newVal: number, index: number) => {
    const temp = rewardValues.filter(() => true);
    temp[index] = newVal;
    setRewardValues(temp);
  };

  const handleContributorAddressUpdate = (newVal: string, index: number) => {
    const temp = ethAddresses.filter(() => true);
    temp[index] = newVal;
    setEthAddresses(temp);

    const validityTemp = isValidAddress.filter(() => true);
    validityTemp[index] = isEthAddress(newVal);
    setIsValidAddress(validityTemp);
  };

  const handleEqualSplit = () => {
    const sum = rewardValues.reduce((partialSum, a) => partialSum + a, 0);
    const newRewardValue = sum / ethAddresses.length;
    setRewardValues(Array(ethAddresses.length).fill(newRewardValue));
  };

  const handleToggleCardDetails = (index: number) => {
    const temp = openCardDetails.filter(() => true);
    temp[index] = !temp[index];
    setOpenCardDetails(temp);
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        marginTop: '16px',
      }}
    >
      <>
        <Box>
          {distributionInfo.contributors?.map(
            (contributor: string, index: number) => (
              <Grid
                container
                spacing={1}
                key={contributor}
                sx={{ display: 'flex' }}
                margin="8px"
              >
                <Grid item xs={8}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                      <PrimaryButton
                        id="bCardDetails"
                        sx={{ color: 'text.primary', fontSize: '14px' }}
                        onClick={() =>
                          distributionInfo.cardIds?.length > 1
                            ? handleToggleCardDetails(index)
                            : null
                        }
                      >
                        <MemberInfoDisplay
                          member={space.memberDetails[contributor]}
                          textsx={{
                            color: 'text.primary',
                            ml: '10px',
                            fontSize: '18px',
                          }}
                          avatarsx={{ height: 30, width: 30 }}
                        />
                        {!openCardDetails[index] &&
                          distributionInfo.cardIds?.length > 1 && (
                            <ArrowDropDownIcon sx={{ color: 'text.primary' }} />
                          )}
                        {openCardDetails[index] &&
                          distributionInfo.cardIds?.length > 1 && (
                            <ArrowDropUpIcon sx={{ color: 'text.primary' }} />
                          )}
                      </PrimaryButton>{' '}
                    </Box>

                    {openCardDetails[index] &&
                      distributionInfo.contributorToCardIds[contributor]?.map(
                        (cardId: string, idx: number) => (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              mt: 1,
                              ml: 8,
                            }}
                          >
                            <GradeIcon sx={{ color: 'text.secondary' }} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                display: 'flex',
                                flexDirection: 'column',
                                width: '10rem',
                                justifyContent: 'start',
                                ml: 2,
                              }}
                              align="left"
                            >
                              {space.tasks[cardId].title}
                            </Typography>
                          </Box>
                        )
                      )}
                    {manualUpdateView && (
                      <EthAddressInput
                        ethAddress={ethAddresses[index]}
                        // eslint-disable-next-line react/jsx-no-bind
                        handleAddressUpdate={handleContributorAddressUpdate}
                        index={index}
                        boxsx={{
                          display: 'flex',
                          flexDirection: 'column',
                          mt: 1,
                          ml: 8,
                          width: '20rem',
                        }}
                      />
                    )}
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  {!manualUpdateView && (
                    <Typography color="text.primary" marginLeft="20px">
                      {rewardValues[index] > 0
                        ? rewardValues[index]?.toFixed(3)
                        : '0.000'}{' '}
                      {distributionInfo.type === 'tokens'
                        ? registry[networkVersion]?.tokens[
                            tokenAddresses[index]
                          ]?.symbol
                        : registry[networkVersion]?.nativeCurrency}
                    </Typography>
                  )}
                  {manualUpdateView && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Controller
                        name="value"
                        control={control}
                        rules={{ required: true, min: 0 }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            data-testid="iRewardValue"
                            id="filled-hidden-label-normal"
                            sx={{ width: '7rem' }}
                            placeholder="Amount"
                            type="number"
                            size="small"
                            color="secondary"
                            error={!!fieldState.error}
                            defaultValue={
                              rewardValues[index] > 0
                                ? rewardValues[index]
                                : 0.0
                            }
                            onChange={(e) =>
                              handleRewardUpdate(
                                parseFloat(e.target.value),
                                index
                              )
                            }
                          />
                        )}
                      />
                      <Typography color="text.primary" marginLeft="10px">
                        {distributionInfo.type === 'tokens'
                          ? registry[networkVersion]?.tokens[
                              tokenAddresses[index]
                            ]?.symbol
                          : registry[networkVersion]?.nativeCurrency}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            )
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }} />
      </>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, marginTop: 8 }}>
        <Button
          color="inherit"
          variant="outlined"
          onClick={() => {
            manualUpdateView ? initialize() : handleClose();
          }}
          sx={{ mr: 1, color: '#f45151' }}
          id="bCancel"
        >
          {manualUpdateView ? `Reset` : `Cancel`}
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <PrimaryButton
          data-testid="bBatchPayModalButton"
          loading={isLoading}
          sx={{ borderRadius: '3px' }}
          onClick={() => {
            manualUpdateView
              ? setManualUpdateView(false)
              : batchPay(
                  networkVersion,
                  distributionInfo.type,
                  ethAddresses,
                  rewardValues,
                  tokenAddresses,
                  distributionInfo.cardIds,
                  distributionInfo.epochId
                );
          }}
          variant="outlined"
          id="bApprove"
          color="secondary"
        >
          {manualUpdateView ? `Confirm` : `Pay`}
        </PrimaryButton>
      </Box>
      {ethAddresses?.length > 1 && (
        <Divider sx={{ mt: 12 }}>
          <PrimaryButton
            id="bOtherOptions"
            sx={{ color: 'text.primary', fontSize: '14px' }}
            onClick={() => toggleVisibleOptions()}
          >
            Other options
            {!optionsVisible && (
              <ArrowDropDownIcon sx={{ color: 'text.primary' }} />
            )}
            {optionsVisible && (
              <ArrowDropUpIcon sx={{ color: 'text.primary' }} />
            )}
          </PrimaryButton>{' '}
        </Divider>
      )}
      {optionsVisible && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            mt: 2,
          }}
        >
          <PrimaryButton
            id="bUpdateManually"
            sx={{
              color: 'text.primary',
              fontSize: '14px',
              borderRadius: '3px',
            }}
            variant="outlined"
            color="secondary"
            onClick={() => {
              setManualUpdateView(true);
              toggleVisibleOptions();
            }}
          >
            Update rewards manually
          </PrimaryButton>{' '}
          <PrimaryButton
            id="bSplitEqually"
            sx={{ color: 'text.primary', fontSize: '14px' }}
            variant="outlined"
            color="secondary"
            onClick={() => {
              handleEqualSplit();
              setManualUpdateView(true);
              toggleVisibleOptions();
            }}
          >
            Split rewards equally
          </PrimaryButton>{' '}
        </Box>
      )}
    </Box>
  );
}

export default BatchPay;
