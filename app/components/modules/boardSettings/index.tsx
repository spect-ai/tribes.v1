import {
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
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
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { SidebarButton } from "../exploreSidebar";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import { notify } from "../settingsTab";
import { useGlobal } from "../../../context/globalContext";
import TokenGateForm from "../../elements/tokenGateForm";
import DefaultPaymentForm from "../../elements/defaultPaymentForm";

type Props = {};

const BoardSettings = (props: Props) => {
  const { space, setSpace, setThemeChanged, themeChanged, setRefreshEpochs } =
    useSpace();
  const {
    state: { registry },
  } = useGlobal();
  const { Moralis, user } = useMoralis();
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [defaultToken, setDefaultToken] = useState<Token>({} as Token);
  const [defaultChain, setDefaultChain] = useState<Chain>({} as Chain);
  const [tokenGatechain, setTokenGateChain] = useState<Chain>({} as Chain);
  const [tokenGateToken, setTokenGateToken] = useState<Token>({} as Token);
  const [tokenGateLimit, setTokenGateLimit] = useState<string>("");
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
    setTokenGateChain(space.tokenGating?.chain);
    setTokenGateToken(space.tokenGating?.token);
    setTokenGateLimit(space.tokenGating?.tokenLimit);
    setDefaultChain(space.defaultPayment?.chain);
    setDefaultToken(space.defaultPayment?.token);
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
                  <DefaultPaymentForm
                    chain={defaultChain}
                    setChain={setDefaultChain}
                    token={defaultToken}
                    setToken={setDefaultToken}
                  />
                </AccordionDetails>
              </StyledAccordian>
              <StyledAccordian disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Token Gating
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Enable token gating to allow addresses with the token limit
                    to automatically join space without any prior permissions
                  </Typography>
                  <TokenGateForm
                    chain={tokenGatechain || space?.tokenGating?.chain}
                    setChain={setTokenGateChain}
                    token={tokenGateToken || space?.tokenGating?.token}
                    setToken={setTokenGateToken}
                    tokenLimit={tokenGateLimit}
                    setTokenLimit={setTokenGateLimit}
                  />
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
                    if (
                      space.roles[user?.id as string] &&
                      space.roles[user?.id as string] !== "admin"
                    ) {
                      notify("Only stewards can update settings", "error");
                      return;
                    }
                    setIsLoading(true);
                    updateBoard(
                      Moralis,
                      space.objectId,
                      name,
                      {
                        chain: defaultChain,
                        token: defaultToken,
                      },
                      {
                        chain: tokenGatechain,
                        token: tokenGateToken,
                        tokenLimit: tokenGateLimit,
                      }
                    ).then((res: any) => {
                      console.log(res);
                      setSpace(res as BoardData);
                      setIsLoading(false);
                      setRefreshEpochs(true);
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
                  onClick={() => {
                    if (
                      space.roles[user?.id as string] &&
                      space.roles[user?.id as string] !== "admin"
                    ) {
                      notify("Only stewards can update settings", "error");
                      return;
                    }
                    setIsConfirmOpen(true);
                  }}
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
