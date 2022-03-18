import {
  Grow,
  IconButton,
  Modal,
  Tooltip,
  Typography,
  TextField,
  Autocomplete,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { Box } from "@mui/system";
import {
  ModalHeading,
  PrimaryButton,
  SidebarButton,
} from "../../elements/styledComponents";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMoralis } from "react-moralis";
import { Member, Chain, Registry, Task, Token, Epoch } from "../../../types";
import { startEpoch } from "../../../adapters/moralis";
import {
  getFlattenedNetworks,
  getFlattenedCurrencies,
} from "../../../utils/utils";
import { registryTemp } from "../../../constants";
import { notify } from "../settingsTab";
import { Toaster } from "react-hot-toast";
import CreateEpochTaskList from "./createEpochTaskList";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import { ButtonText } from "../exploreSidebar";

type Props = {};

const CreateEpoch = (props: Props) => {
  const { space, setSpace, handleTabChange, setRefreshEpochs } = useSpace();
  const { Moralis, user } = useMoralis();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [type, setType] = useState("");
  const [strategy, setStrategy] = useState("");
  const [budget, setBudget] = useState("");
  const [passThreshold, setPassThreshold] = useState("");
  const [cardColumn, setCardColumn] = useState(space.columnOrder[0]);
  const [cards, setCards] = useState(
    space.columns[space.columnOrder[0]].taskIds as string[]
  );
  const [isCardChecked, setIsCardChecked] = useState(
    Array(space.columns[space.columnOrder[0]].taskIds.length).fill(true)
  );
  const [isOpen, setIsOpen] = useState(false);
  const { palette } = useTheme();

  const [chain, setChain] = useState({
    chainId: "80001",
    name: "mumbai",
  } as Chain);
  const [token, setToken] = useState(
    registryTemp["80001"].tokens[
      "0x9c3c9283d3e44854697cd22d3faa240cfb032889"
    ] as Token
  );

  const [isChecked, setIsChecked] = useState(
    Array(space.members?.length).fill(true)
  );
  const [allocations, setAllocations] = useState(
    Array(space.members?.length).fill(100)
  );
  const toggleCheckboxValue = (index: number) => {
    setIsChecked(isChecked.map((v, i) => (i === index ? !v : v)));
  };
  const handleAllocation = (index: number, value: number) => {
    setAllocations(
      allocations.map((v, i) => (i === index ? value : allocations[i]))
    );
  };

  const getMembers = () => {
    var members = [];
    for (let i = 0; i < space.members.length; i++) {
      if (isChecked.at(i)) {
        var member = {
          objectId: space.members[i],
          votesAllocated: allocations.at(i),
        };
        members.push(member);
      }
    }
    return members;
  };

  const getMemberChoices = () => {
    var choices = [] as string[];
    for (let i = 0; i < space.members.length; i++) {
      if (isChecked.at(i)) {
        choices.push(space.members[i]);
      }
    }
    return choices;
  };

  const getCardChoices = () => {
    var choices = [] as string[];
    for (let i = 0; i < cards.length; i++) {
      if (isCardChecked.at(i)) {
        choices.push(cards[i]);
      }
    }
    return choices;
  };
  const handleClose = () => {
    setIsOpen(false);
  };

  const validateFields = () => {
    return name !== "" && duration !== "" && type !== "" && strategy !== "";
  };
  return (
    <>
      {user && space.roles[user?.id] === "admin" && (
        <>
          <PrimaryButton
            variant="outlined"
            size="large"
            color="secondary"
            endIcon={<PlayCircleFilledWhiteIcon />}
            onClick={() => {
              setIsOpen(true);
            }}
            sx={{ borderRadius: 1, my: 2 }}
          >
            Start an epoch
          </PrimaryButton>
        </>
      )}
      {/* <Toaster /> */}
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <Box sx={modalStyle}>
            <ModalHeading>
              <Typography sx={{ color: "#99ccff" }}>Start Epoch</Typography>
              <Box sx={{ flex: "1 1 auto" }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </ModalHeading>
            <ModalContent>
              <TextField
                placeholder="Epoch Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                size="small"
              />
              <Autocomplete
                options={["Card", "Member"]}
                //getOptionLabel={(option) => option.symbol}
                value={type}
                onChange={(event, newValue) => {
                  setType(newValue as string);
                  if (newValue === "Member") setStrategy("Quadratic voting");
                  if (newValue === "Card") setStrategy("Pass/No Pass");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    id="filled-hidden-label-normal"
                    fullWidth
                    sx={{ mb: 2 }}
                    placeholder="Epoch Type"
                    size="small"
                  />
                )}
              />
              <TextField
                id="filled-hidden-label-normal"
                value={duration}
                onChange={(event) => {
                  setDuration(event.target.value);
                }}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="Duration (in days)"
                InputProps={{
                  inputProps: {
                    min: 1,
                  },
                }}
                type={"number"}
                size="small"
              />
              <Autocomplete
                options={
                  type === "Member"
                    ? ["Quadratic voting"]
                    : ["Quadratic voting", "Pass/No Pass"]
                }
                //getOptionLabel={(option) => option.symbol}
                disableClearable
                value={strategy}
                onChange={(event, newValue) => {
                  setStrategy(newValue as string);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    id="filled-hidden-label-normal"
                    fullWidth
                    sx={{ mb: 2 }}
                    placeholder="Strategy"
                    size="small"
                  />
                )}
              />
              {strategy === "Pass/No Pass" && (
                <TextField
                  id="filled-hidden-label-normal"
                  value={passThreshold}
                  onChange={(event) => {
                    setPassThreshold(event.target.value);
                  }}
                  sx={{ mb: 2 }}
                  placeholder="Pass Threshold (%)"
                  type={"number"}
                  size="small"
                />
              )}
              {strategy === "Quadratic voting" && (
                <Box sx={{ flex: "1 1 auto" }}>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <TextField
                        id="filled-hidden-label-normal"
                        value={budget}
                        onChange={(event) => {
                          setBudget(event.target.value);
                        }}
                        sx={{ mb: 2 }}
                        placeholder="Budget"
                        type={"number"}
                        size="small"
                      />
                    </Grid>{" "}
                    <Grid item xs={4}>
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
                            placeholder="Network Chain"
                            size="small"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={4}>
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
                            placeholder="Network Chain"
                            size="small"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

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
                            inputProps={{
                              "aria-label": "select all desserts",
                            }}
                            color="default"
                            checked={isChecked.every((elem) => elem === true)}
                            onChange={(e) => {
                              setIsChecked(
                                Array(space.members.length).fill(
                                  e.target.checked
                                )
                              );
                              isChecked;
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#99ccff" }}>
                          Username
                        </TableCell>
                        {strategy === "Quadratic voting" ? (
                          <TableCell align="right" sx={{ color: "#99ccff" }}>
                            Voting Allocation
                          </TableCell>
                        ) : (
                          <TableCell align="right" sx={{ color: "#99ccff" }}>
                            Voting Weight
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {space.members?.map((member, index) => (
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
                              color="secondary"
                              inputProps={{
                                "aria-label": "select all desserts",
                              }}
                              checked={isChecked.at(index)}
                              onClick={() => {
                                toggleCheckboxValue(index);
                              }}
                            />
                          </TableCell>
                          {isOpen && (
                            <TableCell align="right">
                              {space.memberDetails[member].username}
                            </TableCell>
                          )}
                          <TableCell align="right">
                            <TextField
                              id="filled-hidden-label-normal"
                              value={allocations[index]}
                              onChange={(event) => {
                                handleAllocation(
                                  index,
                                  parseInt(event.target.value)
                                );
                              }}
                              size="small"
                              type="number"
                              sx={{ width: "50%" }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>

              {type === "Card" && (
                <CreateEpochTaskList
                  setCards={setCards}
                  setCardColumn={setCardColumn}
                  cards={cards}
                  cardColumn={cardColumn}
                  isCardChecked={isCardChecked}
                  setIsCardChecked={setIsCardChecked}
                />
              )}

              <PrimaryButton
                variant="outlined"
                color="secondary"
                sx={{ width: "50%", mt: 2, borderRadius: 1 }}
                disabled={
                  type === "Member"
                    ? getMemberChoices()?.length < 3
                    : getCardChoices()?.length < 2
                }
                onClick={() => {
                  if (!validateFields()) {
                    notify("Please fill all the fields", "error");
                    return;
                  }
                  const temp = Object.assign({}, space);
                  temp.creatingEpoch = true;
                  setSpace(temp);
                  const members = getMembers();
                  const choices =
                    type === "Member" ? getMemberChoices() : getCardChoices();
                  startEpoch(
                    Moralis,
                    space.teamId,
                    space.objectId,
                    name,
                    type,
                    parseInt(duration),
                    strategy,
                    members as Member[],
                    choices,
                    parseInt(budget),
                    token,
                    chain,
                    parseInt(passThreshold)
                  )
                    .then((res: any) => {
                      handleClose();
                      console.log(res);
                      setRefreshEpochs(true);
                      handleTabChange({} as any, 1);
                    })
                    .catch((err: any) => alert(err));
                }}
              >
                Start Epoch
              </PrimaryButton>
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
  left: "30%",
  transform: "translate(-50%, -50%)",
  width: "35rem",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
};

const ModalContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 32,
}));

export default CreateEpoch;
