import styled from "@emotion/styled";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PrimaryButton } from "../../elements/styledComponents";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";

type Props = {
  expanded: boolean;
  handleChange: (
    panel: string
  ) => (event: React.SyntheticEvent, newExpanded: boolean) => void;
};

function createData(
  epochId: string,
  epochType: string,
  date: string,
  active: boolean,
  data: {
    name: string;
    value: number;
    votes: number;
  }[]
) {
  return {
    epochId,
    epochType,
    date,
    active,
    data,
  };
}

const rows = [
  createData("epoch-Y2GQUvnCwM61-1", "Contributions", "19-02-2022", true, [
    { name: "0xavp.eth", value: 6, votes: 8 },
    { name: "chaks.eth", value: 2, votes: 5 },
    { name: "ateet", value: 3, votes: 4 },
    { name: "rishabh", value: 2, votes: 9 },
  ]),
  createData("epoch-Y2GQUvnCwM61-2", "Task valuation", "15-02-2022", false, [
    { name: "Create board design", value: 4, votes: 6 },
    { name: "Fix bug related to edit task", value: 2, votes: 4 },
    { name: "Github Integration", value: 9, votes: 3 },
    { name: "Discord Integration", value: 7, votes: 8 },
    { name: "Fix issue#17", value: 1, votes: 1 },
    { name: "Fix submissions field", value: 3, votes: 3 },
  ]),
  createData("epoch-Y2GQUvnCwM61-3", "Task valuation", "11-02-2022", false, [
    { name: "Create board design", value: 4, votes: 6 },
    { name: "Fix bug related to edit task", value: 2, votes: 4 },
    { name: "Github Integration", value: 9, votes: 3 },
    { name: "Fix submissions field", value: 3, votes: 3 },
  ]),
];

const EpochList = ({ expanded, handleChange }: Props) => {
  return (
    <Container>
      <Accordion
        disableGutters
        expanded={expanded}
        onChange={handleChange("epoch")}
        sx={{ border: "2px solid #00194A" }}
      >
        <AccordionSummary
          aria-controls="panel1d-content"
          id="panel1d-header"
          expandIcon={<ExpandMoreIcon />}
          sx={{ backgroundColor: "#00194A" }}
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>Epochs</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: "#000f29" }}>
          <Accordion hidden>
            <AccordionSummary />
          </Accordion>
          {rows.map((epoch, index) => (
            <Accordion
              disableGutters
              key={index}
              sx={{ border: "2px solid #00194A" }}
            >
              <AccordionSummary
                aria-controls="panel1d-content"
                id="panel1d-header"
                expandIcon={<ExpandMoreIcon />}
                sx={{ backgroundColor: "#00194A" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Typography sx={{ width: "30%", flexShrink: 0 }}>
                    {epoch.epochId}
                  </Typography>
                  <Typography sx={{ width: "30%", flexShrink: 0 }}>
                    Started on {epoch.date}
                  </Typography>
                  <Typography sx={{ width: "30%", flexShrink: 0 }}>
                    {epoch.epochType}
                  </Typography>
                  {epoch.active && <Chip label="Ongoing" color="primary" />}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: "#000f29" }}>
                <Grid container>
                  <Grid item xs={8}>
                    <TableContainer>
                      <Table aria-label="simple table" size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: "#99ccff" }}>
                              {epoch.epochType === "Contributions"
                                ? "Contributor"
                                : "Task"}
                            </TableCell>
                            <TableCell align="right" sx={{ color: "#99ccff" }}>
                              Votes Given
                            </TableCell>
                            <TableCell align="right" sx={{ color: "#99ccff" }}>
                              Value
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {epoch.data.map((row, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {row.name}
                              </TableCell>
                              <TableCell align="right">{row.votes}</TableCell>
                              <TableCell align="right">{row.value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={4}>
                    <DetailContainer>
                      <InfoContainer>
                        <Typography
                          sx={{
                            color: "#99ccff",
                            textAlign: "right",
                            fontSize: 14,
                          }}
                        >
                          Votes left
                        </Typography>
                        <Typography sx={{ textAlign: "right" }}>12</Typography>
                      </InfoContainer>
                      <InfoContainer>
                        <Typography
                          sx={{
                            color: "#99ccff",
                            textAlign: "right",
                            fontSize: 14,
                          }}
                        >
                          Budget
                        </Typography>
                        <Typography sx={{ textAlign: "right" }}>
                          100 WMatic
                        </Typography>
                      </InfoContainer>
                      {epoch.active ? (
                        <ButtonContainer>
                          <PrimaryButton
                            endIcon={<SaveIcon />}
                            variant="outlined"
                            sx={{ mx: 4 }}
                            size="small"
                          >
                            Save
                          </PrimaryButton>
                          <PrimaryButton
                            endIcon={<CloseIcon />}
                            variant="outlined"
                            size="small"
                          >
                            End Epoch
                          </PrimaryButton>
                        </ButtonContainer>
                      ) : (
                        <ButtonContainer>
                          <PrimaryButton
                            endIcon={<DownloadIcon />}
                            variant="outlined"
                            size="small"
                          >
                            Export to csv
                          </PrimaryButton>
                        </ButtonContainer>
                      )}
                    </DetailContainer>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
`;

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

export default EpochList;
