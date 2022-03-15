import { Typography, Avatar, Grid, Button } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useEffect } from "react";
import { PrimaryButton } from "../../elements/styledComponents";
import {
  completeEpochPayment,
  completePayment,
} from "../../../adapters/moralis";
import { registryTemp } from "../../../constants";
import Image from "next/image";
import { batchPayTokens, distributeEther } from "../../../adapters/contract";
import { capitalizeFirstLetter } from "../../../utils/utils";
import { Member } from "../../../types";
import { useMoralis } from "react-moralis";
import { notify, notifyError } from "../settingsTab";
import { Toaster } from "react-hot-toast";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";

type Props = {
  handleNextStep: Function;
  handleClose: Function;
  chainId: string;
  currencyDistributionInfo: CurrencyDistributionInfo;
  handleStatusUpdate: Function;
};

export type CurrencyDistributionInfo = {
  contributors: Array<string>;
  values: Array<number>;
};

type MemberDetails = {
  [key: string]: Member;
};

function getEthAddresses(contributors: any, memberDetails: MemberDetails) {
  return contributors.map((a: string) => memberDetails[a].ethAddress);
}

const BatchPayCurrency = ({
  handleNextStep,
  handleClose,
  chainId,
  currencyDistributionInfo,
  handleStatusUpdate,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { Moralis, isInitialized } = useMoralis();
  console.log(`here`);
  return (
    <React.Fragment>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <>
          <Box>
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justifyContent="center"
              style={{ minHeight: "10vh" }}
            >
              <Grid item xs={3}>
                <Box style={{ display: "flex" }}>
                  <Avatar
                    src={registryTemp[chainId].pictureUrl}
                    sx={{
                      width: "2rem",
                      height: "2rem",
                      objectFit: "cover",
                      my: 1,
                    }}
                  />
                  <Typography
                    color="text.primary"
                    variant="h5"
                    marginBottom="10px"
                    marginLeft="10px"
                  >
                    {capitalizeFirstLetter(registryTemp[chainId].name)} Network
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            {currencyDistributionInfo.contributors.map(
              (contributor: string, index: number) => (
                <Grid
                  container
                  spacing={1}
                  key={index}
                  sx={{ display: "flex" }}
                  margin="8px"
                >
                  <Grid item xs={8}>
                    <Box sx={{ display: "flex" }}>
                      <Avatar
                        alt=""
                        src={
                          space.memberDetails[contributor]?.profilePicture
                            ? space.memberDetails[contributor].profilePicture
                                ._url
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
                      {currencyDistributionInfo.values[index]?.toFixed(2)}{" "}
                      {registryTemp[chainId].nativeCurrency}
                    </Typography>
                  </Grid>
                </Grid>
              )
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}></Box>
        </>
        {
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => handleClose()}
              sx={{ mr: 1, color: "#f45151" }}
              id="bCancel"
            >
              Cancel
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <PrimaryButton
              loading={isLoading}
              sx={{ borderRadius: "3px" }}
              onClick={() => {
                setIsLoading(true);
                distributeEther(
                  getEthAddresses(
                    currencyDistributionInfo.contributors,
                    space.memberDetails
                  ),
                  currencyDistributionInfo.values,
                  "123",
                  window.ethereum.networkVersion
                )
                  .then((res: any) => {
                    const promises: Array<any> = [];
                    promises.push(handleStatusUpdate("currency"));
                    Promise.all(promises).then(() => {
                      setIsLoading(false);
                      handleNextStep();
                    });
                  })
                  .catch((err: any) => {
                    notifyError(err.space.message);
                    setIsLoading(false);
                  });
              }}
              variant="outlined"
              id="bApprove"
            >
              Batch Pay
            </PrimaryButton>
          </Box>
        }
      </Box>
    </React.Fragment>
  );
};

export default BatchPayCurrency;
