import {
  Grow,
  IconButton,
  Modal,
  styled,
  Typography,
  Tooltip,
  Avatar,
  Grid,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { PrimaryButton } from "../../elements/styledComponents";
import { getBatchPayAmount } from "../../../adapters/moralis";
import { useRouter } from "next/router";
import SettingsIcon from "@mui/icons-material/Settings";
import { amountData } from "../../../constants";
import Image from "next/image";
import { Heading, modalStyle, getNetworkImage } from ".";

type Props = {
  handleClose: Function;
  amounts: any;
};

const BatchPay = ({ handleClose, amounts }: Props) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <Grow timeout={500}>
        <Box>
          <Heading>
            <div>Batch Pay</div>
            <Box sx={{ flex: "1 1 auto" }} />
            <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Heading>
          <>
            {Object.keys(amounts).map((chain, index) => (
              <Box key={index}>
                <Grid
                  container
                  spacing={1}
                  key={index}
                  sx={{ display: "flex" }}
                  margin="8px"
                >
                  <Grid item xs={9}>
                    <Box sx={{ display: "flex" }}>
                      <Image
                        src={getNetworkImage(chain) as any}
                        alt="eth"
                        height="26%"
                        width="35%"
                      />

                      <Typography
                        color="text.primary"
                        variant="h6"
                        key={index}
                        marginBottom="10px"
                        marginLeft="10px"
                      >
                        {chain} network
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <PrimaryButton
                      variant="outlined"
                      sx={{ width: "30px", ml: "5px", flex: 1 }}
                      onClick={() => setIsConfirmOpen(true)}
                    >
                      Pay
                    </PrimaryButton>
                  </Grid>
                </Grid>
                {amounts[chain as keyof typeof amounts][0].map(
                  (token: string, index: number) => (
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
                              amounts[chain as keyof typeof amounts][1][index]
                                .profilePicture
                                ? amounts[chain as keyof typeof amounts][1][
                                    index
                                  ].profilePicture._url
                                : `https://www.gravatar.com/avatar/${
                                    amounts[chain as keyof typeof amounts][1][
                                      index
                                    ].username
                                  }?d=identicon&s=32`
                            }
                            sx={{ height: 30, width: 30 }}
                          />
                          <Typography color="text.primary" marginLeft="20px">
                            {
                              amounts[chain as keyof typeof amounts][1][index]
                                .username
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography color="text.primary" marginLeft="20px">
                          {amounts[chain as keyof typeof amounts][2][index]}{" "}
                          {token}
                        </Typography>
                      </Grid>
                    </Grid>
                  )
                )}
              </Box>
            ))}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}></Box>
          </>
        </Box>
      </Grow>
    </>
  );
};

const ModalContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 32,
}));

export default BatchPay;
