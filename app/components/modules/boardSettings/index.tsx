import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Grid,
  Grow,
  IconButton,
  Modal,
  styled as MUIStyled,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  PrimaryButton,
  StyledAccordian,
} from "../../elements/styledComponents";
import { updateBoard } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import SettingsIcon from "@mui/icons-material/Settings";
import { BoardData, Chain, Registry, Team, Token } from "../../../types";
import ConfirmModal from "./confirmModal";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getFlattenedNetworks } from "../../../utils/utils";
import { registryTemp } from "../../../constants";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { SidebarButton } from "../exploreSidebar";
import { useRouter } from "next/router";
import styled from "@emotion/styled";

type Props = {};

const BoardSettings = (props: Props) => {
  const { space, setSpace, setThemeChanged, themeChanged } = useSpace();
  const { Moralis } = useMoralis();
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [chain, setChain] = useState<Chain>(
    space?.defaultPayment?.chain || { chainId: "137", name: "polygon" }
  );
  const [tokenAddress, setTokenAddress] = useState(
    space?.defaultPayment?.token?.address || "0x0"
  );
  const [tokenName, setTokenName] = useState(
    space?.defaultPayment?.token?.symbol ||
      space?.defaultPayment?.chain.name ||
      "polygon"
  );
  const [tokenGatechain, setTokenGateChain] = useState(
    space?.tokenGating?.chain as Chain
  );
  const [tokenGateAddress, setTokenGateAddress] = useState(
    space?.tokenGating?.tokenAddress
  );
  const [tokenGateLimit, setTokenGateLLimit] = useState(
    space?.tokenGating?.tokenLimit
  );
  const handleClose = () => {
    setIsOpen(false);
  };
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };

  const router = useRouter();
  const id = router.query.id as string;
  const bid = router.query.bid as string;
  const { palette } = useTheme();

  useEffect(() => {
    setName(space.name);
  }, [space]);

  return (
    <>
      <SidebarButton
        palette={palette}
        selected={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <Tooltip
          title="Space Settings"
          placement="right"
          arrow
          sx={{ m: 0, p: 0 }}
        >
          <SettingsIcon
            sx={{
              fontSize: 28,
              color: isOpen ? palette.secondary.main : palette.divider,
            }}
          />
        </Tooltip>
      </SidebarButton>
      {isConfirmOpen && (
        <ConfirmModal isOpen={isConfirmOpen} handleClose={handleConfirmClose} />
      )}
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <ModalContainer>
            <Heading>
              <Typography>Settings</Typography>
              <Box sx={{ flex: "1 1 auto" }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Heading>
            <ModalContent>
              <StyledAccordian disableGutters>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Space Info</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <TextField
                    placeholder="Space Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                  ></TextField>
                </AccordionDetails>
              </StyledAccordian>
              <StyledAccordian disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Default Payment</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Typography>
                    Default payment for all the new tasks created
                  </Typography>
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
                        sx={{ my: 4 }}
                      />
                    )}
                  />
                  <Box sx={{ display: "flex" }}>
                    <TextField
                      size="small"
                      fullWidth
                      sx={{ mr: 4 }}
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
                      value={tokenName}
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                </AccordionDetails>
              </StyledAccordian>
              <StyledAccordian disableGutters>
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
              </StyledAccordian>
              {/* <StyledAccordian disableGutters>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Theme</Typography>
                </AccordionSummary>
                <OptionsButton color="inherit">
                  <ThemeColor color="#000f29" />
                  <Typography
                    fontSize={14}
                    sx={{ width: "70%" }}
                    onClick={() => {
                      updateThemeFromSpace(Moralis, bid, id, 0).then(
                        (res: BoardData) => {
                          setSpace(res);
                          localStorage.setItem("theme", "0");
                          setThemeChanged(!themeChanged);
                        }
                      );
                    }}
                  >
                    Classic Dark
                  </Typography>
                </OptionsButton>
                <OptionsButton color="inherit">
                  <ThemeColor color="#38006b" />
                  <Typography
                    fontSize={14}
                    sx={{ width: "70%" }}
                    onClick={() => {
                      updateThemeFromSpace(Moralis, bid, id, 1).then(
                        (res: BoardData) => {
                          setSpace(res);
                          localStorage.setItem("theme", "1");
                          setThemeChanged(!themeChanged);
                        }
                      );
                    }}
                  >
                    Warm Purple
                  </Typography>
                </OptionsButton>
                <OptionsButton color="inherit">
                  <ThemeColor color="#0288d1" />
                  <Typography
                    fontSize={14}
                    sx={{ width: "70%" }}
                    onClick={() => {
                      updateThemeFromSpace(Moralis, bid, id, 2).then(
                        (res: BoardData) => {
                          setSpace(res);
                          console.log(res);
                          localStorage.setItem("theme", "2");
                          setThemeChanged(!themeChanged);
                        }
                      );
                    }}
                  >
                    Ocean Blue
                  </Typography>
                </OptionsButton>
                <AccordionDetails></AccordionDetails>
              </StyledAccordian> */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <PrimaryButton
                  variant="outlined"
                  color="secondary"
                  sx={{ width: "50%", mt: 2, mr: 4, borderRadius: 1 }}
                  loading={isLoading}
                  onClick={() => {
                    setIsLoading(true);
                    updateBoard(
                      Moralis,
                      space.objectId,
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
                      setSpace(res as BoardData);
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
          </ModalContainer>
        </Grow>
      </Modal>
    </>
  );
};
// @ts-ignore
const ModalContainer = MUIStyled(Box)(({ theme }) => ({
  position: "absolute" as "absolute",
  top: "10%",
  left: "25%",
  transform: "translate(-50%, -50%)",
  width: "50rem",
  border: "2px solid #000",
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
}));

const Heading = MUIStyled("div")(({ theme }) => ({
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

const ModalContent = MUIStyled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 32,
}));

const ThemeColor = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 2px;
  height: 18px;
  width: 18px;
  margin-right: 8px;
  border: 1px solid #5a6972;
`;

export default BoardSettings;
