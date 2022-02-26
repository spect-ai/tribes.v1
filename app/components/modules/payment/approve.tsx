import {
  Box,
  Button,
  Typography,
  Grid,
  IconButton,
  Avatar,
} from "@mui/material";
import React, { useState } from "react";
import { Heading, modalStyle, getNetworkImage, BatchPay } from ".";
import { PrimaryButton } from "../../elements/styledComponents";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import { approve } from "../../../adapters/contract";

interface Props {
  handleClose: Function;
  setActiveStep: Function;
  tokenNames: string[];
  tokenAddresses: string[];
  tokenValues: number[];
  chain: string;
}

const ApproveModal = ({
  handleClose,
  setActiveStep,
  tokenNames,
  tokenAddresses,
  tokenValues,
  chain,
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
                  <Image
                    src={getNetworkImage(chain) as any}
                    alt="eth"
                    height="26%"
                    width="35%"
                  />

                  <Typography
                    color="text.primary"
                    variant="h5"
                    marginBottom="10px"
                    marginLeft="10px"
                  >
                    {chain} network
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            {tokenNames.map((name: string, index: number) => (
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
                      src={`https://www.gravatar.com/avatar/${`eewe`}?d=identicon&s=32`}
                      sx={{ height: 30, width: 30 }}
                    />
                    <Typography color="text.primary" marginLeft="20px">
                      {name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="text.primary" marginLeft="20px">
                    {tokenValues[index]}
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}></Box>
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
          <Button
            onClick={() => {
              setIsLoading(true);
              approve(tokenAddresses)
                .then((res: any) => setActiveStep(1))
                .catch((err: any) => alert(err));
              //setIsLoading(false);
              //setActiveStep(1);
            }}
            variant="outlined"
            id="bApprove"
          >
            Approve All
          </Button>
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default ApproveModal;
