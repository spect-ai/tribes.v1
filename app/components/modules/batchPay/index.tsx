import { Grow, IconButton, Modal, styled, Typography, Tooltip, Avatar, Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { PrimaryButton } from "../../elements/styledComponents";
import { getBatchPayAmount } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import SettingsIcon from "@mui/icons-material/Settings";
import { BoardData, useBoard } from "../taskBoard";
//import ConfirmModal from "./confirmModal";
import PaidIcon from "@mui/icons-material/Paid";
import { amountData } from "../../../constants";
import Ethereum from "../../../images/ethereum-eth-logo.png";
import Polygon from "../../../images/polygon-matic-logo.png";
import Avalanche from "../../../images/avalanche-avax-logo.png";
import Image from "next/image";

type Props = {};

export interface BatchPay {
  chain: {
    [key: string]: any;
  };
}

function getNetworkImage(network: string) {
  var img = network === "Ethereum" ? Ethereum : network === "Polygon" ? Polygon : null;
  return img;
}

const BatchPay = (props: Props) => {
  const { Moralis, isInitialized } = useMoralis();
  const router = useRouter();
  const { id, bid } = router.query;
  const [isOpen, setIsOpen] = useState(false);
  const [amounts, setAmounts] = useState({} as BatchPay);
  const handleClose = () => {
    setIsOpen(false);
  };
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };

  useEffect(() => {
    setIsLoading(true);
    if (isInitialized && bid && isOpen) {
      getBatchPayAmount(Moralis, bid as string)
        .then((res: any) => {
          console.log(res);
          setAmounts(res);
          setIsLoading(false);
        })
        .catch((err: any) => alert(err));
    }
  }, [isInitialized, bid, isOpen]);

  return (
    <>
      <Tooltip title="Batch Pay">
        <IconButton sx={{ mb: 0.5, p: 2 }} size="small" onClick={() => setIsOpen(true)}>
          <PaidIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {/*isConfirmOpen && (
          <ConfirmModal isOpen={isConfirmOpen} handleClose={handleConfirmClose} />
        )*/}
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <Box sx={modalStyle}>
            <Heading>
              <div>Batch Pay</div>
              <Box sx={{ flex: "1 1 auto" }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Heading>
            <ModalContent>
              {Object.keys(amounts).map((chain, index) => (
                <Box key={index}>
                  <Grid container spacing={1} key={index} sx={{ display: "flex" }} margin="8px">
                    <Grid item xs={9}>
                      <Box sx={{ display: "flex" }}>
                        <Image src={getNetworkImage(chain)} alt="eth" height="30%" width="30%" />

                        <Typography color="text.primary" variant="h6" key={index} marginBottom="10px" marginLeft="10px">
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
                  {amounts[chain][0].map((token, index) => (
                    <Grid container spacing={1} key={index} sx={{ display: "flex" }} margin="8px">
                      <Grid item xs={8}>
                        <Box sx={{ display: "flex" }}>
                          <Avatar
                            alt=""
                            src={
                              amounts[chain][1][index].profilePicture
                                ? amounts[chain][1][index].profilePicture._url
                                : `https://www.gravatar.com/avatar/${amounts[chain][1][index].username}?d=identicon&s=32`
                            }
                            sx={{ height: 30, width: 30 }}
                          />
                          <Typography color="text.primary" marginLeft="20px">
                            {amounts[chain][1][index].username}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography color="text.primary" marginLeft="20px">
                          {amounts[chain][2][index]} {token}
                        </Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              ))}

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}></Box>
            </ModalContent>
          </Box>
        </Grow>
      </Modal>
    </>
  );
};

const modalStyle = {
  position: "absolute" as "absolute",
  top: "35%",
  left: "35%",
  transform: "translate(-50%, -50%)",
  width: "25rem",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
};

const Heading = styled("div")(({ theme }) => ({
  fontWeight: 500,
  fontSize: 16,
  color: theme.palette.text.secondary,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  borderBottom: "1px solid #99ccff",
  padding: 16,
  paddingLeft: 32,
}));

const ModalContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 32,
}));

export default BatchPay;
