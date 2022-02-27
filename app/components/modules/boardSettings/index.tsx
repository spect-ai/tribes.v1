import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import { updateBoard } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import SettingsIcon from "@mui/icons-material/Settings";
import { useBoard } from "../taskBoard";
import { BoardData } from "../../../types";
import ConfirmModal from "./confirmModal";
import ColorPicker from "../../elements/colorPicker";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GitHubIcon from "@mui/icons-material/GitHub";

type Props = {};

const BoardSettings = (props: Props) => {
  const { data, setData } = useBoard();
  const { Moralis } = useMoralis();
  const [name, setName] = useState(data.name);
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => {
    setIsOpen(false);
  };
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };
  const [columnData, setColumnData] = useState(data.columns);
  useEffect(() => {
    setColumnData(data.columns);
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
              <Accordion>
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
                    label="Board Name"
                  ></TextField>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Column status mapping</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Box sx={{ mt: 4 }}>
                    {Object.entries(data.columns).map(
                      ([key, column], index) => (
                        <Grid container spacing={1} key={index} sx={{ my: 2 }}>
                          <Grid item xs={2}>
                            <ColorPicker
                              defaultColor={column.color}
                              setColumnData={setColumnData}
                              columnData={columnData}
                              columnId={key}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={5}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <TextField
                              value={columnData[key].title}
                              onChange={(e) => {
                                setColumnData({
                                  ...columnData,
                                  [key]: {
                                    ...columnData[key],
                                    title: e.target.value,
                                  },
                                });
                              }}
                              fullWidth
                              label="Column Name"
                            />
                          </Grid>
                          <Grid item xs={5}>
                            <TextField
                              value={columnData[key].status}
                              onChange={(e) => {
                                setColumnData({
                                  ...columnData,
                                  [key]: {
                                    ...columnData[key],
                                    status: e.target.value,
                                  },
                                });
                              }}
                              fullWidth
                              label="Status Linked"
                            />
                          </Grid>
                        </Grid>
                      )
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
              <Accordion>
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
                  sx={{ width: "50%", mt: 2, mr: 1 }}
                  loading={isLoading}
                  onClick={() => {
                    setIsLoading(true);
                    console.log(columnData);
                    updateBoard(
                      Moralis,
                      data.objectId,
                      name,
                      columnData,
                      Object.values(columnData).map((c) => c.status)
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
                  sx={{ width: "50%", mt: 2 }}
                  color="error"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  Delete Board
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
