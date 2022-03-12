import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Grid,
  Grow,
  IconButton,
  Modal,
  styled,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { PrimaryButton } from "../../elements/styledComponents";
import { getTeam, updateBoard } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import SettingsIcon from "@mui/icons-material/Settings";
import { useBoard } from "../taskBoard";
import { BoardData, Chain, Registry, Team, Token } from "../../../types";
import ConfirmModal from "./confirmModal";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  getFlattenedCurrencies,
  getFlattenedNetworks,
} from "../../../utils/utils";
import { registryTemp } from "../../../constants";

type Props = {};

const BoardSettings = (props: Props) => {
  const { data, setData } = useBoard();
  const { Moralis } = useMoralis();
  const [name, setName] = useState(data.name);
  const [isOpen, setIsOpen] = useState(false);
  const [chain, setChain] = useState<Chain>(
    data.defaultPayment?.chain || { chainId: "137", name: "polygon" }
  );
  const [tokenAddress, setTokenAddress] = useState(
    data.defaultPayment?.token?.address || "0x0"
  );
  const [tokenName, setTokenName] = useState(
    data.defaultPayment?.token?.symbol ||
      data.defaultPayment?.chain.name ||
      "polygon"
  );
  const [tokenGatechain, setTokenGateChain] = useState(
    data.tokenGating.chain as Chain
  );
  const [tokenGateAddress, setTokenGateAddress] = useState(
    data.tokenGating.tokenAddress
  );
  const [tokenGateLimit, setTokenGateLLimit] = useState(
    data.tokenGating.tokenLimit
  );
  const handleClose = () => {
    setIsOpen(false);
  };
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };
  return (
    <>
      <Tooltip title="Settings">
        <IconButton
          sx={{ mb: 0.5, p: 2 }}
          size="small"
          onClick={() => setIsOpen(true)}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {isConfirmOpen && (
        <ConfirmModal isOpen={isConfirmOpen} handleClose={handleConfirmClose} />
      )}
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <Box sx={modalStyle}>
            <Heading>
              <div>Settings</div>
              <Box sx={{ flex: "1 1 auto" }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Heading>
            <ModalContent>
              <Accordion disableGutters>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Board Info</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <TextField
                    placeholder="Board Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                  ></TextField>
                </AccordionDetails>
              </Accordion>
              <Accordion disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Default Payment</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Autocomplete
                    options={getFlattenedNetworks(registryTemp as Registry)}
                    getOptionLabel={(option) => option.name}
                    value={chain}
                    disableClearable
                    onChange={(event, newValue) => {
                      setChain(newValue as Chain);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        fullWidth
                        sx={{ mb: 4 }}
                        label="Network Chain"
                      />
                    )}
                  />
                  <Box sx={{ display: "flex" }}>
                    <TextField
                      size="small"
                      fullWidth
                      sx={{ mr: 4 }}
                      label="Token Address"
                      value={tokenAddress}
                      onChange={async (e) => {
                        setTokenAddress(e.target.value);
                        if (e.target.value.length === 42) {
                          const options = {
                            chain: chain.name,
                            addresses: e.target.value,
                          };
                          const token =
                            await Moralis.Web3API.token.getTokenMetadata(
                              options as any
                            );
                          setTokenName(token[0].symbol);
                        }
                      }}
                    />
                    <TextField
                      size="small"
                      sx={{ mb: 4, width: "45%" }}
                      label="Name"
                      value={tokenName}
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
              <Accordion disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Token Gating
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Enable token gating to allow addresses with the token limit
                    to automatically join space without any prior permission
                  </Typography>
                  <Autocomplete
                    options={getFlattenedNetworks(registryTemp as Registry)}
                    getOptionLabel={(option) => option.name}
                    value={tokenGatechain}
                    disableClearable
                    onChange={(event, newValue) => {
                      setTokenGateChain(newValue as Chain);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        fullWidth
                        sx={{ my: 4 }}
                      />
                    )}
                  />
                  <Box sx={{ display: "flex" }}>
                    <TextField
                      fullWidth
                      placeholder="Token Address"
                      size="small"
                      value={tokenGateAddress}
                      onChange={(e) => setTokenGateAddress(e.target.value)}
                    />
                    <TextField
                      sx={{ width: "25%", ml: 2 }}
                      placeholder="Limit"
                      type={"number"}
                      size="small"
                      inputProps={{ min: 1 }}
                      value={tokenGateLimit}
                      onChange={(e) =>
                        setTokenGateLLimit(Number(e.target.value))
                      }
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
              <Accordion disableGutters>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Integrations (Coming Soon)</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <PrimaryButton
                        disabled
                        startIcon={<i className="fa-brands fa-github"></i>}
                      >
                        Connect with Github
                      </PrimaryButton>
                    </Grid>
                    <Grid item xs={12}>
                      <PrimaryButton
                        disabled
                        startIcon={
                          <i
                            className="fa-brands fa-discord"
                            style={{ fontSize: 17 }}
                          ></i>
                        }
                      >
                        Connect with Discord
                      </PrimaryButton>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <PrimaryButton
                  variant="outlined"
                  sx={{ width: "50%", mt: 2, mr: 4, borderRadius: 1 }}
                  loading={isLoading}
                  onClick={() => {
                    setIsLoading(true);
                    updateBoard(
                      Moralis,
                      data.objectId,
                      name,
                      chain,
                      {
                        address: tokenAddress,
                        symbol: tokenName,
                      },
                      {
                        chain: tokenGatechain,
                        tokenAddress: tokenGateAddress,
                        tokenLimit: tokenGateLimit,
                      }
                    ).then((res: any) => {
                      console.log(res);
                      setData(res as BoardData);
                      setIsLoading(false);
                      handleClose();
                    });
                  }}
                >
                  Save
                </PrimaryButton>
                <PrimaryButton
                  variant="outlined"
                  sx={{ width: "50%", mt: 2, borderRadius: 1 }}
                  color="error"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  Delete Space
                </PrimaryButton>
              </Box>
            </ModalContent>
          </Box>
        </Grow>
      </Modal>
    </>
  );
};

const modalStyle = {
  position: "absolute" as "absolute",
  top: "10%",
  left: "25%",
  transform: "translate(-50%, -50%)",
  width: "50rem",
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

export default BoardSettings;
