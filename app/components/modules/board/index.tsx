import {
  Box,
  Collapse,
  Grid,
  Paper,
  styled,
  Switch,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useTribe } from "../../../../pages/tribe/[id]";
import {
  endEpoch,
  getEpoch,
  getTaskEpoch,
  voteOnTasks,
} from "../../../adapters/moralis";
import { Epoch } from "../../../types";
import { formatTimeLeft } from "../../../utils/utils";

import Task from "../../elements/task";
import EpochModal, { PrimaryButton } from "../epochModal";
import TimelapseIcon from "@mui/icons-material/Timelapse";

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
  const { Moralis, user } = useMoralis();
  const { tribe, setToDoTasks, setInProgressTasks, setDoneTasks } = useTribe();
  const [remainingVotes, setRemainingVotes] = useState(0);
  const [voteAllocation, setVoteAllocation] = useState({});
  const [epoch, setEpoch] = useState<Epoch>({} as Epoch);
  useEffect(() => {
    if (Object.keys(epoch).length === 0) {
      let memberStats;
      getEpoch(Moralis, tribe.latestTaskEpoch).then((res: Epoch) => {
        if (res) {
          setEpoch(res);
          memberStats = res.memberStats.filter(
            (m: any) => m.ethAddress.toLowerCase() === user?.get("ethAddress")
          );
          memberStats.length > 0
            ? setRemainingVotes(memberStats[0]?.votesRemaining)
            : setRemainingVotes(0);
          memberStats.length > 0
            ? setVoteAllocation(memberStats[0]?.votesAllocated)
            : null;
        }
      }, []);
    }
  });
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
                task={task}
                key={index}
                epoch={epoch}
                setRemainingVotes={setRemainingVotes}
                remainingVotes={remainingVotes}
                setVoteAllocation={setVoteAllocation}
                voteAllocation={voteAllocation}
              />
            ))}
          </Grid>
          <Grid item xs={3}>
            {inProgressTasks.map((task, index) => (
              <Task
                task={task}
                key={index}
                epoch={epoch}
                setRemainingVotes={setRemainingVotes}
                remainingVotes={remainingVotes}
                setVoteAllocation={setVoteAllocation}
                voteAllocation={voteAllocation}
              />
            ))}
          </Grid>
          <Grid item xs={3}>
            {doneTasks.map((task, index) => (
              <Task
                task={task}
                key={index}
                epoch={epoch}
                setRemainingVotes={setRemainingVotes}
                remainingVotes={remainingVotes}
                setVoteAllocation={setVoteAllocation}
                voteAllocation={voteAllocation}
              />
            ))}
          </Grid>
          {epoch.active && (
            <Grid item xs={3} sx={{ borderLeft: "1px solid #5a6972" }}>
              <StyledTypography color="text.secondary">
                Remaining Votes
              </StyledTypography>
              <StyledTypography color="text.primary">
                {remainingVotes}
              </StyledTypography>
              <StyledTypography color="text.secondary">Budget</StyledTypography>
              <StyledTypography color="text.primary">
                {epoch.budget} WMatic
              </StyledTypography>

              <StyledTypography color="text.secondary">
                Remaining Time
              </StyledTypography>
              <StyledTypography color="text.primary">
                {formatTimeLeft(epoch.endTime)}
              </StyledTypography>
              <PrimaryButton
                variant="outlined"
                size="large"
                type="submit"
                onClick={() => {
                  voteOnTasks(
                    Moralis,
                    tribe.latestTaskEpoch,
                    voteAllocation
                  ).then((res: any) => {
                    console.log(res);
                  });
                }}
                sx={{ ml: 3 }}
              >
                Save Allocations
              </PrimaryButton>
              <PrimaryButton
                variant="outlined"
                size="large"
                type="submit"
                endIcon={<TimelapseIcon />}
                onClick={() => {
                  endEpoch(Moralis, tribe.latestTaskEpoch).then((res: any) => {
                    console.log(res);
                    getEpoch(Moralis, tribe.latestTaskEpoch).then(
                      (res: Epoch) => {
                        if (res) {
                          setEpoch(res);
                        }
                      }
                    );
                    getTaskEpoch(Moralis, tribe.latestTaskEpoch).then(
                      (res: any) => {
                        if (res.length > 0) {
                          const tasks = (res as Epoch[])[0].tasks;
                          setToDoTasks(
                            tasks.filter((task) => {
                              return task.status === 100;
                            })
                          );
                          setInProgressTasks(
                            tasks.filter((task) => {
                              return task.status === 101;
                            })
                          );
                          setDoneTasks(
                            tasks.filter((task) => {
                              return task.status === 102;
                            })
                          );
                        }
                      }
                    );
                  });
                }}
                sx={{ ml: 3, mt: 2 }}
              >
                End Epoch
              </PrimaryButton>
            </Grid>
          )}
        </Grid>
      </Collapse>
    </div>
  );
};

export default Board;
