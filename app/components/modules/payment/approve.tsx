import {
  Box,
  Button,
  Typography,
  Grid,
  IconButton,
  Avatar,
} from "@mui/material";
import React, { useState } from "react";
import { Heading, modalStyle, getNetworkImage } from ".";
import { PrimaryButton } from "../../elements/styledComponents";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import { approve } from "../../../adapters/contract";
import { BatchPayInfo } from ".";
import { registryTemp } from "../../../constants";
import { capitalizeFirstLetter } from "../../../utils/utils";

interface Props {
  handleClose: Function;
  setActiveStep: Function;
  chainId: string;
  approvalInfo: BatchPayInfo;
  neworkImage: any;
}

const ApproveModal = ({
  handleClose,
  setActiveStep,
  chainId,
  approvalInfo,
  neworkImage,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
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
                  {neworkImage && (
                    <Image
                      src={neworkImage}
                      alt="eth"
                      height="26%"
                      width="35%"
                    />
                  )}

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
            {approvalInfo.uniqueTokenAddresses.map(
              (name: string, index: number) => (
                <Grid
                  container
                  spacing={1}
                  key={index}
                  sx={{ display: "flex" }}
                  margin="8px"
                >
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex" }}>
                      <Avatar
                        alt=""
                        src={`https://www.gravatar.com/avatar/${`eewe`}?d=identicon&s=32`}
                        sx={{ height: 30, width: 30 }}
                      />
                      <Typography color="text.primary" marginLeft="20px">
                        {registryTemp[chainId].tokens[name].symbol}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography color="text.primary" marginLeft="20px">
                      {approvalInfo.aggregatedTokenValues[index]}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      onClick={() => {
                        setIsLoading(true);
                        approve(approvalInfo.uniqueTokenAddresses[index])
                          .then((res: any) => {
                            setActiveStep(1);
                            setIsLoading(false);
                          })
                          .catch((err: any) => alert(err));
                      }}
                      variant="outlined"
                      id="bApprove"
                    >
                      Approve
                    </Button>
                  </Grid>
                </Grid>
              )
            )}
          </Box>
        </>
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
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default ApproveModal;
