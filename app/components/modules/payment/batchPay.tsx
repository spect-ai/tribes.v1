import { Typography, Avatar, Grid, Button } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useEffect } from "react";
import { PrimaryButton } from "../../elements/styledComponents";
import {
  completeEpochPayment,
  completePayment,
} from "../../../adapters/moralis";
import Image from "next/image";
import { batchPayTokens, distributeEther } from "../../../adapters/contract";
import { capitalizeFirstLetter } from "../../../utils/utils";
import { Member } from "../../../types";
import { useMoralis } from "react-moralis";
import { notify } from "../settingsTab";
import { Toaster } from "react-hot-toast";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { useGlobal } from "../../../context/globalContext";

type Props = {
  handleNextStep: Function;
  handleClose: Function;
  chainId: string;
  tokenDistributionInfo: TokenDistributionInfo;
  handleStatusUpdate: Function;
};

export type TokenDistributionInfo = {
  contributors: Array<string>;
  tokenAddresses: Array<string>;
  tokenValues: Array<number>;
};

type MemberDetails = {
  [key: string]: Member;
};

function getEthAddresses(contributors: any, memberDetails: MemberDetails) {
  return contributors.map((a: string) => memberDetails[a].ethAddress);
}

const BatchPay = ({
  handleNextStep,
  handleClose,
  chainId,
  tokenDistributionInfo,
  handleStatusUpdate,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { state } = useGlobal();
  const { registry } = state;
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
                    src={registry[chainId].pictureUrl}
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
                    {capitalizeFirstLetter(registry[chainId].name)} Network
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            {tokenDistributionInfo.contributors.map(
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
                      {tokenDistributionInfo.tokenValues[index]?.toFixed(2)}{" "}
                      {
                        registry[chainId].tokens[
                          tokenDistributionInfo.tokenAddresses[index]
                        ].symbol
                      }
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
                batchPayTokens(
                  tokenDistributionInfo.tokenAddresses,
                  getEthAddresses(
                    tokenDistributionInfo.contributors,
                    space.memberDetails
                  ),
                  tokenDistributionInfo.tokenValues,
                  "123",
                  window.ethereum.networkVersion
                )
                  .then((res: any) => {
                    const promises: Array<any> = [];
                    promises.push(handleStatusUpdate("token"));
                    Promise.all(promises).then(() => {
                      setIsLoading(false);
                      handleNextStep();
                    });
                  })
                  .catch((err: any) => {
                    alert(err.message);
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
        }
      </Box>
    </React.Fragment>
  );
};

export default BatchPay;
