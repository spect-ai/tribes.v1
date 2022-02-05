import {
  Box,
  Collapse,
  Grid,
  Paper,
  styled,
  Switch,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTribe } from "../../../../pages/tribe/[id]";

import Task from "../../elements/task";
import EpochModal, { PrimaryButton } from "../epochModal";

type Props = {};

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  marginBottom: 8,
  marginTop: 8,
}));

const BoardHeading = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  marginTop: 8,
  //   backgroundColor: "#2e5da9",
  padding: "0.5rem",
  borderRadius: "0.5rem",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: "1rem",
  marginBottom: "1rem",
}));

const Board = (props: Props) => {
  const [checked, setChecked] = useState(true);
  const { toDoTasks, inProgressTasks, doneTasks } = useTribe();
  const handleChange = () => {
    setChecked((prev) => !prev);
  };
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <StyledPaper sx={{ borderBottom: "5px solid #0061ff" }}>
            <BoardHeading>To Do</BoardHeading>
          </StyledPaper>
        </Grid>
        <Grid item xs={3}>
          <StyledPaper sx={{ borderBottom: "5px solid #ffc107" }}>
            <BoardHeading>In progress</BoardHeading>
          </StyledPaper>
        </Grid>
        <Grid item xs={3}>
          <StyledPaper sx={{ borderBottom: "5px solid #5fe086" }}>
            <BoardHeading>Done</BoardHeading>
          </StyledPaper>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ my: 2, display: "flex", flexDirection: "column" }}></Box>
        </Grid>
      </Grid>

      <Box
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          display: "flex",
          width: "15rem",
          mt: 2,
        }}
      >
        <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
          Board 1
        </Typography>
        <Switch checked={checked} onChange={handleChange} />
      </Box>
      <Collapse in={checked}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            {toDoTasks.map((task, index) => (
              <Task
                type={0}
                title={task.title}
                key={index}
                idx={index}
                id={task.id}
              />
            ))}
          </Grid>
          <Grid item xs={3}>
            {inProgressTasks.map((task, index) => (
              <Task
                type={1}
                title={task.title}
                key={index}
                idx={index}
                id={task.id}
              />
            ))}
          </Grid>
          <Grid item xs={3}>
            {doneTasks.map((task, index) => (
              <Task
                type={2}
                title={task.title}
                key={index}
                idx={index}
                id={task.id}
              />
            ))}
          </Grid>
          <Grid item xs={3} sx={{ borderLeft: "1px solid #5a6972" }}>
            <StyledTypography color="text.secondary">
              Remaining Votes
            </StyledTypography>
            <StyledTypography color="text.primary">100</StyledTypography>
            <StyledTypography color="text.secondary">Budget</StyledTypography>
            <StyledTypography color="text.primary">50 WMatic</StyledTypography>
            <StyledTypography color="text.secondary">
              Total Votes Allocated
            </StyledTypography>
            <StyledTypography color="text.primary">500</StyledTypography>
            <StyledTypography color="text.secondary">
              Remaining Time
            </StyledTypography>
            <StyledTypography color="text.primary">
              2 hours left
            </StyledTypography>
          </Grid>
        </Grid>
      </Collapse>
    </div>
  );
};

export default Board;
