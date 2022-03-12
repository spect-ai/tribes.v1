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
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useEffect } from "react";
import { ModalHeading, PrimaryButton } from "../../elements/styledComponents";
import { initBoard } from "../../../adapters/moralis";
import { useTribe } from "../../../../pages/tribe/[id]";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Member } from "../../../types";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

function createData(username: string, role: string) {
  return {
    username,
    role,
  };
}
interface SpaceMember {
  [key: string]: Member;
}

const CreateBoard = ({ isOpen, handleClose }: Props) => {
  const { tribe } = useTribe();
  const { Moralis } = useMoralis();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(
    Array(tribe.members?.length).fill(true)
  );
  const [roles, setRoles] = useState(tribe.roles as { [key: string]: string });

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
        <Box sx={modalStyle}>
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
            />
            <TextField
              placeholder="Space Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
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
                              Array(tribe.members.length).fill(e.target.checked)
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
                          <Select
                            value={roles[member] || "member"}
                            fullWidth
                            sx={{ width: "50%" }}
                            onChange={(e) => {
                              setRoles({ ...roles, [member]: e.target.value });
                            }}
                          >
                            <MenuItem value={"member"}>Member</MenuItem>
                            <MenuItem value={"admin"}>Admin</MenuItem>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
            {/*<Accordion disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Plugins</Typography>
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
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#99ccff" }}>
                        Name
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#99ccff" }}>
                        Description
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plugins.map((row, index) => (
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
                          />
                        </TableCell>
                        <TableCell align="right">{row.username}</TableCell>
                        <TableCell align="right">{row.role}</TableCell>
                      </TableRow>
                    ))}
                          </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>*/}
            <PrimaryButton
              loading={isLoading}
              variant="outlined"
              sx={{ width: "50%", mt: 2, borderRadius: 1 }}
              onClick={() => {
                const members = getMembers();
                setIsLoading(true);
                initBoard(
                  Moralis,
                  name,
                  members as Array<string>,
                  roles,
                  tribe.teamId
                )
                  .then((res: any) => {
                    if (res) {
                      router.push(
                        `/tribe/${tribe.teamId}/board/${res.id}`,
                        undefined
                      );
                    }
                    setIsLoading(false);
                  })
                  .catch((err: any) => alert(err));
              }}
            >
              Create Space
            </PrimaryButton>
          </ModalContent>
        </Box>
      </Grow>
    </Modal>
  );
};

const modalStyle = {
  position: "absolute" as "absolute",
  top: "25%",
  left: "30%",
  transform: "translate(-50%, -50%)",
  width: "40rem",
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

export default CreateBoard;
