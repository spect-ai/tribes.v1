import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Checkbox,
  Grid,
  Grow,
  IconButton,
  Modal,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
import { useRouter } from "next/router";
import SettingsIcon from "@mui/icons-material/Settings";
import { useBoard } from "../taskBoard";
import { BoardData, Chain, Registry, Team, Token } from "../../../types";
import ConfirmModal from "./confirmModal";
import ColorPicker from "../../elements/colorPicker";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GitHubIcon from "@mui/icons-material/GitHub";
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
  const [tribe, setTribe] = useState<Team>({} as Team);
  const [token, setToken] = useState("");
  const [chain, setChain] = useState("");
  const handleClose = () => {
    setIsOpen(false);
  };
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };
  const [columnData, setColumnData] = useState(data.columns);
  const [isChecked, setIsChecked] = useState(
    Array(tribe.members?.length).fill(true)
  );
  const toggleCheckboxValue = (index: number) => {
    setIsChecked(isChecked.map((v, i) => (i === index ? !v : v)));
  };

  useEffect(() => {
    setColumnData(data.columns);
    getTeam(Moralis, data.teamId).then((res: Team) => {
      setTribe(res);
    });
  }, [data]);

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
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Payment</Typography>
                </AccordionSummary>

                {/* <AccordionDetails>
                  <Autocomplete
                    options={getFlattenedNetworks(registryTemp as Registry)}
                    getOptionLabel={(option) => option.name}
                    value={chain}
                    onChange={(event, newValue) => {
                      setChain(newValue as Chain);
                      let tokens = getFlattenedCurrencies(
                        registryTemp as Registry,
                        newValue?.chainId as string
                      );
                      if (tokens.length > 0) setToken(tokens[0]);
                      else setToken({} as Token);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        id="filled-hidden-label-normal"
                        size="small"
                        fullWidth
                        sx={{ mb: 4 }}
                        placeholder="Network Chain"
                      />
                    )}
                  />
                  <Autocomplete
                    options={getFlattenedCurrencies(
                      registryTemp as Registry,
                      chain.chainId
                    )}
                    getOptionLabel={(option) => option.symbol}
                    value={token}
                    onChange={(event, newValue) => {
                      setToken(newValue as Token);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        id="filled-hidden-label-normal"
                        size="small"
                        fullWidth
                        sx={{ mb: 4 }}
                        placeholder="Network Chain"
                      />
                    )}
                  />
                </AccordionDetails> */}
              </Accordion>
              <Accordion disableGutters>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  Members
                </AccordionSummary>
                <AccordionDetails>
                  <Table aria-label="simple table" size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isChecked.every((elem) => elem === true)}
                            onChange={(e) => {
                              setIsChecked(
                                Array(tribe.members.length).fill(
                                  e.target.checked
                                )
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#99ccff" }}>
                          Username
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#99ccff" }}>
                          Role
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tribe.members?.map((member, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              border: 0,
                            },
                          }}
                        >
                          <TableCell
                            component="th"
                            scope="row"
                            padding="checkbox"
                          >
                            <Checkbox
                              color="primary"
                              inputProps={{
                                "aria-label": "select all desserts",
                              }}
                              checked={isChecked.at(index)}
                              onClick={() => {
                                toggleCheckboxValue(index);
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {tribe.memberDetails[member].username}
                          </TableCell>
                          <TableCell align="right">
                            {tribe.roles[member]}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                      columnData,
                      Object.values(columnData).map((c) => c.status)
                    ).then((res: any) => {
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
