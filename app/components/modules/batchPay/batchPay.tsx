/* eslint-disable @typescript-eslint/indent */
import { Avatar, Box, Button, Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';
import { batchPayTokens, distributeEther } from '../../../adapters/contract';
import { useGlobal } from '../../../context/globalContext';
import { Member } from '../../../types';
import { PrimaryButton } from '../../elements/styledComponents';
import { notify } from '../settingsTab';

export type DistributionInfo = {
  cardIds: string[];
  epochId: string;
  type: string;
  contributors: Array<string>;
  tokenAddresses: Array<string>;
  tokenValues: Array<number>;
};

type Props = {
  handleNextStep: Function;
  handleClose: Function;
  chainId: string;
  distributionInfo: DistributionInfo;
  handleStatusUpdate: Function;
};

type MemberDetails = {
  [key: string]: Member;
};

function getEthAddresses(contributors: any, memberDetails: MemberDetails) {
  return contributors.map((a: string) => memberDetails[a].ethAddress);
}

function BatchPay({
  handleNextStep,
  handleClose,
  chainId,
  distributionInfo,
  handleStatusUpdate,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { state } = useGlobal();
  const { registry } = state;
  console.log(distributionInfo);
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
          {distributionInfo.contributors.map(
            (contributor: string, index: number) => (
              <Grid
                container
                spacing={1}
                key={contributor}
                sx={{ display: 'flex' }}
                margin="8px"
              >
                <Grid item xs={8}>
                  <Box sx={{ display: 'flex' }}>
                    <Avatar
                      alt=""
                      src={
                        space.memberDetails[contributor]?.profilePicture
                          ? space.memberDetails[contributor].profilePicture._url
                          : `https://www.gravatar.com/avatar/${space.memberDetails[contributor]?.username}?d=identicon&s=32`
                      }
                      sx={{ height: 30, width: 30 }}
                    />
                    <Typography color="text.primary" marginLeft="20px">
                      {space.memberDetails[contributor]?.username}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="text.primary" marginLeft="20px">
                    {distributionInfo.tokenValues[index]?.toFixed(3)}{' '}
                    {distributionInfo.type === 'tokens'
                      ? registry[chainId].tokens[
                          distributionInfo.tokenAddresses[index]
                        ].symbol
                      : registry[chainId].nativeCurrency}
                  </Typography>
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
          onClick={() => handleClose()}
          sx={{ mr: 1, color: '#f45151' }}
          id="bCancel"
        >
          Cancel
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <PrimaryButton
          loading={isLoading}
          sx={{ borderRadius: '3px' }}
          onClick={() => {
            setIsLoading(true);
            if (distributionInfo.type === 'tokens')
              batchPayTokens(
                distributionInfo.tokenAddresses,
                getEthAddresses(
                  distributionInfo.contributors,
                  space.memberDetails
                ),
                distributionInfo.tokenValues,
                '123',
                window.ethereum.networkVersion
              )
                .then((res: any) => {
                  const promises: Array<any> = [];
                  promises.push(
                    handleStatusUpdate(
                      distributionInfo.epochId
                        ? distributionInfo.epochId
                        : distributionInfo.cardIds
                    )
                  );
                  Promise.all(promises).then(() => {
                    setIsLoading(false);
                    handleNextStep();
                    notify('Payment done succesfully!');
                  });
                })
                .catch((err: any) => {
                  notify(err.message, 'error');
                  setIsLoading(false);
                  console.log(err.message);
                });
            else if (distributionInfo.type === 'currency')
              distributeEther(
                getEthAddresses(
                  distributionInfo.contributors,
                  space.memberDetails
                ),
                distributionInfo.tokenValues,
                '123',
                window.ethereum.networkVersion
              )
                .then((res: any) => {
                  const promises: Array<any> = [];
                  promises.push(
                    handleStatusUpdate(
                      distributionInfo.epochId
                        ? distributionInfo.epochId
                        : distributionInfo.cardIds
                    )
                  );
                  Promise.all(promises).then(() => {
                    setIsLoading(false);
                    handleNextStep();
                    notify('Payment done succesfully!');
                  });
                })
                .catch((err: any) => {
                  notify(err.message, 'error');
                  setIsLoading(false);
                });
          }}
          variant="outlined"
          id="bApprove"
          color="secondary"
        >
          Batch Pay
        </PrimaryButton>
      </Box>
    </Box>
  );
}

export default BatchPay;
