import {
  Grow,
  IconButton,
  Modal,
  styled,
  Typography,
  Tooltip,
  Avatar,
  Grid,
  Button,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { PrimaryButton } from "../../elements/styledComponents";
import { getBatchPayAmount } from "../../../adapters/moralis";
import { useRouter } from "next/router";
import SettingsIcon from "@mui/icons-material/Settings";
import { amountData, registryTemp } from "../../../constants";
import Image from "next/image";
import { Heading, modalStyle, getNetworkImage } from ".";
import { batchPayTokens } from "../../../adapters/contract";
import { BatchPayInfo } from ".";
import { useBoard } from "../taskBoard";

type Props = {
  handleClose: Function;
  chain: string;
  batchPayInfo: BatchPayInfo;
};

function getEthAddresses(contributors: any, memberDetails: object) {
  return contributors.map((a: any) => memberDetails[a].ethAddress);
}

const BatchPay = ({ handleClose, chain, batchPayInfo }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useBoard();
  console.log(batchPayInfo);
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
            /*
            {batchPayInfo.tokenAddresses.map(
              (address: string, index: number) => (
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
                        {batchPayInfo.contributors[index].username}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography color="text.primary" marginLeft="20px">
                      {batchPayInfo.tokenValues[index]}{" "}
                      {
                        registryTemp[window.ethereum.networkVersion].tokens[
                          address
                        ]
                      }
                    </Typography>
                  </Grid>
                </Grid>
              )
            )}
            */
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
              batchPayTokens(
                batchPayInfo.tokenAddresses,
                getEthAddresses(batchPayInfo.contributors, data.memberDetails),
                batchPayInfo.tokenValues,
                "123"
              )
                .then((res: any) => console.log(res))
                .catch((err: any) => alert(err));
            }}
            variant="outlined"
            id="bApprove"
          >
            Batch Pay
          </Button>
        </Box>
      </Box>
    </React.Fragment>
  );
};

const ModalContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 32,
}));

export default BatchPay;
