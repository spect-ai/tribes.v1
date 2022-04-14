import {
  Grow,
  IconButton,
  Modal,
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
import React, { useEffect, useState } from "react";
import { Box } from "@mui/system";
import {
  ModalHeading,
  PrimaryButton,
  StyledAccordian,
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
import { notify } from "../settingsTab";
import CreateEpochTaskList from "./createEpochTaskList";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useGlobal } from "../../../context/globalContext";

type Props = {};

interface EpochFormInput {
  name: string;
  type: string;
  duration: number;
  strategy: string;
  passThreshold?: number;
  column?: string;
  members?: string[];
  cards?: string[];
  budgetValue?: number;
  budgetToken: Token;
  budgetChain: Chain;
}

const CreateEpoch = (props: Props) => {
  const { space, setSpace, handleTabChange, setRefreshEpochs } = useSpace();
  const { state } = useGlobal();
  const { registry } = state;
  const { Moralis, user } = useMoralis();
  const [strategy, setStrategy] = useState("");
  const [type, setType] = useState("");
  const [passThreshold, setPassThreshold] = useState("");
  const [cardColumn, setCardColumn] = useState(space.columnOrder[0]);
  const [cards, setCards] = useState([]);
  const [isCardChecked, setIsCardChecked] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { palette } = useTheme();
  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<EpochFormInput>();

  const [chain, setChain] = useState({
    chainId: space?.defaultPayment?.chain?.chainId,
    name: space?.defaultPayment?.chain?.name,
  } as Chain);
  const [token, setToken] = useState(
    registry[space?.defaultPayment?.chain?.chainId].tokens[
      space?.defaultPayment?.token?.address
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

  useEffect(() => {
    const cards = space.columns[space.columnOrder[0]].taskIds.filter(
      (taskId) => {
        return space.tasks[taskId];
      }
    );
    setCards(cards);
    setIsCardChecked(Array(cards.length).fill(true));
  }, [isOpen]);

  const onSubmit: SubmitHandler<EpochFormInput> = async (values) => {
    const temp = Object.assign({}, space);
    temp.creatingEpoch = true;
    setSpace(temp);
    const members = getMembers();
    const choices =
      values.type === "Member" ? getMemberChoices() : getCardChoices();
    if (values.type === "Member" && members.length <= 1) {
      notify("At least 2 members required", "error");
      return;
    }
    startEpoch(
      Moralis,
      space.teamId,
      space.objectId,
      values.name,
      values.type,
      values.duration,
      values.strategy,
      members as Member[],
      choices,
      values.budgetValue as number,
      token,
      chain,
      parseInt(passThreshold)
    )
      .then((res: any) => {
        handleClose();
        setRefreshEpochs(true);
        handleTabChange({} as any, 1);
      })
      .catch((err: any) => alert(err));
  };

  const onError = (err: any) => {
    console.log(err);
    notify("Please fill all the fields", "error");
  };
  return (
    <>
      {user && space.roles[user?.id] === 3 && (
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
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <ModalContainer>
            <ModalHeading>
              <Typography sx={{ color: "#99ccff" }}>Start Epoch</Typography>
              <Box sx={{ flex: "1 1 auto" }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </ModalHeading>
            <ModalContent>
              <form onSubmit={handleSubmit(onSubmit, onError)}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      placeholder="Epoch Name"
                      fullWidth
                      sx={{ mb: 2 }}
                      size="small"
                      color="secondary"
                      error={fieldState.error ? true : false}
                    />
                  )}
                />
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      {...field}
                      options={["Card", "Member"]}
                      disableClearable
                      // value={type}
                      onChange={(event, newValue) => {
                        field.onChange(newValue);
                        setType(newValue);
                        if (newValue === "Member") {
                          setValue("strategy", "Quadratic voting");
                          setStrategy("Quadratic voting");
                        } else if (newValue === "Card") {
                          setValue("strategy", "Pass/No Pass");
                          setStrategy("Pass/No Pass");
                        }
                        // setType(newValue as string);
                        // if (newValue === "Member")
                        //   setStrategy("Quadratic voting");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          id="filled-hidden-label-normal"
                          fullWidth
                          sx={{ mb: 2 }}
                          placeholder="Epoch Type"
                          size="small"
                          color="secondary"
                          error={fieldState.error ? true : false}
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  name="duration"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      id="filled-hidden-label-normal"
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
                      color="secondary"
                      error={fieldState.error ? true : false}
                    />
                  )}
                />
                <Controller
                  name="strategy"
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      {...field}
                      options={
                        type === "Member"
                          ? ["Quadratic voting"]
                          : ["Pass/No Pass"]
                      }
                      onChange={(event, newValue) => {
                        field.onChange(newValue);
                      }}
                      disableClearable
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          id="filled-hidden-label-normal"
                          fullWidth
                          sx={{ mb: 2 }}
                          placeholder="Strategy"
                          size="small"
                          color="secondary"
                          error={fieldState.error ? true : false}
                        />
                      )}
                    />
                  )}
                />
                {strategy === "Pass/No Pass" && (
                  <Controller
                    name="passThreshold"
                    control={control}
                    render={({ field, fieldState }) => (
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
                        color="secondary"
                      />
                    )}
                  />
                )}
                {strategy === "Quadratic voting" && (
                  <Box sx={{ flex: "1 1 auto" }}>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Controller
                          name="budgetValue"
                          control={control}
                          rules={{ required: true, min: 0 }}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              id="filled-hidden-label-normal"
                              sx={{ mb: 2 }}
                              placeholder="Budget"
                              type={"number"}
                              size="small"
                              color="secondary"
                              error={fieldState.error ? true : false}
                            />
                          )}
                        />
                      </Grid>{" "}
                      <Grid item xs={4}>
                        <Controller
                          name="budgetToken"
                          control={control}
                          defaultValue={token}
                          render={({ field, fieldState }) => (
                            <Autocomplete
                              {...field}
                              options={getFlattenedCurrencies(
                                registry as Registry,
                                chain.chainId
                              )}
                              value={token}
                              onChange={(event, newValue) => {
                                setToken(newValue as Token);
                              }}
                              disableClearable
                              getOptionLabel={(option) => option.symbol}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  id="filled-hidden-label-normal"
                                  placeholder="Token"
                                  size="small"
                                  color="secondary"
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Controller
                          name="budgetChain"
                          control={control}
                          defaultValue={chain}
                          render={({ field, fieldState }) => (
                            <Autocomplete
                              {...field}
                              options={getFlattenedNetworks(
                                registry as Registry
                              )}
                              disableClearable
                              value={chain}
                              onChange={(event, newValue) => {
                                setChain(newValue as Chain);
                                let tokens = getFlattenedCurrencies(
                                  registry as Registry,
                                  newValue?.chainId as string
                                );
                                if (tokens.length > 0) setToken(tokens[0]);
                                else setToken({} as Token);
                              }}
                              getOptionLabel={(option) => option.name}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  id="filled-hidden-label-normal"
                                  placeholder="Network"
                                  size="small"
                                  color="secondary"
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                <StyledAccordian disableGutters>
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
                </StyledAccordian>

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
                  type="submit"
                  color="secondary"
                  sx={{ width: "50%", mt: 2, borderRadius: 1 }}
                >
                  Start Epoch
                </PrimaryButton>
              </form>
            </ModalContent>
          </ModalContainer>
        </Grow>
      </Modal>
    </>
  );
};

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
  position: "absolute" as "absolute",
  top: "10%",
  left: "35%",
  transform: "translate(-50%, -50%)",
  width: "40rem",
  border: "2px solid #000",
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
}));

const ModalContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 32,
}));

export default CreateEpoch;
