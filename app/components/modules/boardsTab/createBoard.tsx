import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
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
  Typography,
  MenuItem,
  Select,
  Autocomplete,
  Grid,
  createFilterOptions,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useEffect } from "react";
import {
  ModalHeading,
  PrimaryButton,
  StyledAccordian,
} from "../../elements/styledComponents";
import { createSpaceFromTrello, initBoard } from "../../../adapters/moralis";
import { useTribe } from "../../../../pages/tribe/[id]";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Chain, Column, Member, Registry, Token } from "../../../types";
import { notify } from "../settingsTab";
import { useGlobal } from "../../../context/globalContext";
import TokenGateForm from "../../elements/tokenGateForm";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

interface SpaceMember {
  [key: string]: Member;
}

const CreateBoard = ({ isOpen, handleClose }: Props) => {
  const { tribe } = useTribe();
  const { Moralis } = useMoralis();
  const router = useRouter();
  const [name, setName] = useState("");
  const [token, setToken] = useState<Token>();
  const {
    state: { registry },
  } = useGlobal();
  const [chain, setChain] = useState({
    chainId: window.ethereum.networkVersion,
    name: registry[window.ethereum.networkVersion]?.name,
  } as Chain);
  const [tokenLimit, setTokenLimit] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(
    Array(tribe.members?.length).fill(true)
  );
  const [roles, setRoles] = useState(tribe.roles as { [key: string]: number });
  const [isPrivate, setIsPrivate] = useState(false);
  const [trelloBoardId, setTrelloBoardId] = useState("");
  const [columnMap, setColumnMap] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [trelloBoard, setTrelloBoard] = useState<any>({} as any);
  const [trelloTasks, setTrelloTasks] = useState([]);

  const [isFetching, setIsFetching] = useState(false);

  const toggleCheckboxValue = (index: number) => {
    setIsChecked(isChecked.map((v, i) => (i === index ? !v : v)));
  };

  const getMembers = () => {
    var members = [];
    for (let i = 0; i < tribe.members.length; i++) {
      if (isChecked.at(i)) {
        const memberId = tribe.members.at(i);
        members.push(memberId);
      }
    }
    return members;
  };

  return (
    <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
      <Grow in={isOpen} timeout={500}>
        <ModalContainer>
          <ModalHeading>
            <Typography sx={{ color: "#99ccff" }}>Create Space</Typography>
            <Box sx={{ flex: "1 1 auto" }} />
            <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </ModalHeading>
          <ModalContent>
            <TextField
              placeholder="Space Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              color="secondary"
            />
            {/* <TextField
              placeholder="Space Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            /> */}

            {/* <StyledAccordian disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                sx={{ fontWeight: "bold" }}
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
                              Array(tribe.members.length).fill(e.target.checked)
                            );
                          }}
                          color="default"
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

                        <TableCell align="right">
                          {tribe.memberDetails[member].username}
                        </TableCell>
                        <TableCell align="right">
                          <Select
                            value={roles[member] || 1}
                            fullWidth
                            sx={{ width: "80%", textAlign: "center" }}
                            size="small"
                            onChange={(e) => {
                              setRoles({
                                ...roles,
                                [member]: e.target.value as number,
                              });
                            }}
                          >
                            <MenuItem value={1}>Member</MenuItem>
                            <MenuItem value={2}>Contributor</MenuItem>
                            <MenuItem value={3}>Steward</MenuItem>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </StyledAccordian>
            <StyledAccordian disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ fontWeight: "bold" }}
              >
                Token Gating
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Enable token gating to allow addresses with the token limit to
                  automatically join space without any prior permission
                </Typography>
                <TokenGateForm
                  chain={chain}
                  setChain={setChain}
                  token={token as Token}
                  setToken={setToken}
                  tokenLimit={tokenLimit}
                  setTokenLimit={setTokenLimit}
                />
              </AccordionDetails>
            </StyledAccordian>
            <StyledAccordian disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ fontWeight: "bold" }}
              >
                Import Board
              </AccordionSummary>
              <AccordionDetails>
                <Typography>Import board from trello</Typography>
                <Box sx={{ display: "flex" }}>
                  <TextField
                    placeholder="Trello Board Id"
                    size="small"
                    value={trelloBoardId}
                    onChange={(event) => {
                      setTrelloBoardId(event.target.value);
                    }}
                  />
                  <PrimaryButton
                    variant="outlined"
                    size="small"
                    color="secondary"
                    fullWidth
                    loading={isFetching}
                    sx={{ borderRadius: 1, mx: 4, width: "25%" }}
                    onClick={async () => {
                      setIsFetching(true);
                      const board = await fetch(
                        `https://api.trello.com/1/boards/${trelloBoardId}`
                      );
                      const boardJson = await board.json();
                      const columns = await fetch(
                        `https://api.trello.com/1/boards/${trelloBoardId}/lists`
                      );

                      const columnsJson = await columns.json();
                      const cards = await fetch(
                        `https://api.trello.com/1/boards/${trelloBoardId}/cards`
                      );

                      const cardsJson = await cards.json();
                      const columnOrder = columnsJson.map(
                        (column: any) => column.id
                      );
                      let columnMap: {
                        [key: string]: Column;
                      } = {};
                      columnsJson.map((column: any) => {
                        columnMap[column.id] = {
                          id: column.id,
                          title: column.name,
                          taskIds: [],
                          cardType: 1,
                          createCard: { 0: false, 1: false, 2: true, 3: true },
                          moveCard: { 0: false, 1: false, 2: true, 3: true },
                        };
                      });
                      cardsJson.map((card: any) => {
                        columnMap[card.idList].taskIds.push(card.id);
                      });
                      const tasks = cardsJson.map((task: any) => {
                        return {
                          id: task.id,
                          title: task.name,
                          description: task.desc,
                          value: 0,
                        };
                      });
                      setColumnOrder(columnOrder);
                      setColumnMap(columnMap);
                      setTrelloBoard(boardJson);
                      setName(boardJson.name);
                      setTrelloTasks(tasks);
                      setIsFetching(false);
                    }}
                  >
                    Fetch
                  </PrimaryButton>
                </Box>
              </AccordionDetails>
            </StyledAccordian> */}
            <Grid container alignItems="center" marginTop={2}>
              <Grid item xs={3}>
                <PrimaryButton
                  loading={isLoading}
                  variant="outlined"
                  color="secondary"
                  sx={{ borderRadius: 1 }}
                  onClick={() => {
                    // const members = getMembers();
                    setIsLoading(true);
                    if (trelloBoard?.name) {
                      createSpaceFromTrello(
                        Moralis,
                        trelloBoard.name,
                        tribe.teamId,
                        columnMap,
                        columnOrder,
                        isPrivate,
                        members as Array<string>,
                        trelloTasks,
                        roles,
                        {
                          chain,
                          token: token as Token,
                          tokenLimit: parseFloat(tokenLimit),
                        }
                      )
                        .then((res: any) => {
                          if (res) {
                            router.push(
                              `/tribe/${tribe.teamId}/space/${res.id}`,
                              undefined
                            );
                          }
                          setIsLoading(false);
                        })
                        .catch((err: any) => {
                          console.log(err);
                          notify(
                            "Sorry! There was an error while creating space",
                            "error"
                          );
                          setIsLoading(false);
                        });
                      return;
                    }
                    initBoard(
                      Moralis,
                      name,
                      [],
                      {},
                      tribe.teamId,
                      {
                        chain,
                        token: token as Token,
                        tokenLimit: parseFloat(tokenLimit),
                      },
                      isPrivate
                    )
                      .then((res: any) => {
                        if (res) {
                          router.push(
                            `/tribe/${tribe.teamId}/space/${res.id}`,
                            undefined
                          );
                        }
                        setIsLoading(false);
                      })
                      .catch((err: any) => {
                        console.log(err);
                        notify(
                          "Sorry! There was an error while creating space",
                          "error"
                        );
                        setIsLoading(false);
                      });
                  }}
                >
                  Create Space
                </PrimaryButton>
              </Grid>
              <Grid item xs={1}>
                <Checkbox
                  inputProps={{
                    "aria-label": "select all desserts",
                  }}
                  checked={isPrivate}
                  onChange={(e) => {
                    setIsPrivate(e.target.checked);
                  }}
                  color="default"
                />
              </Grid>
              <Grid item xs={1}>
                <Typography color="common.white">{`Private`}</Typography>
              </Grid>
            </Grid>
          </ModalContent>
        </ModalContainer>
      </Grow>
    </Modal>
  );
};

// @ts-ignore
const ModalContainer = styled(Box)(({ theme }) => ({
  position: "absolute" as "absolute",
  top: "10%",
  left: "25%",
  transform: "translate(-50%, -50%)",
  width: "35rem",
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

export default CreateBoard;
