import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  styled,
  Typography,
} from "@mui/material";
import React from "react";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useTribe } from "../../../../pages/tribe/[id]";
import { Octokit } from "@octokit/rest";

type Props = {
  title: string;
  type: number;
  idx: number;
  id: number;
};

const StyledCard = styled(Card)(({ theme, ...props }) => ({
  width: "19rem",
  marginTop: "0.5rem",
  marginBottom: "0.5rem",
  height: "8rem",
  display: "flex",
  flexDirection: "column",
}));

type colorMapping = {
  [key: number]: string;
};
const typeMapping: colorMapping = {
  0: "#0061ff",
  1: "#ffc107",
  2: "#5fe086",
};

const Task = ({ title, type, idx, id }: Props) => {
  const {
    setToDoTasks,
    toDoTasks,
    setInProgressTasks,
    inProgressTasks,
    setDoneTasks,
    doneTasks,
    githubToken,
    repo,
  } = useTribe();
  return (
    <StyledCard sx={{ borderLeft: `5px solid ${typeMapping[type]}` }}>
      <CardContent>
        {/* <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Word of the Day
        </Typography> */}
        <Typography sx={{ fontSize: 14 }} component="div">
          {title}
        </Typography>
        {/* <Typography sx={{ mb: 1.5 }} color="text.secondary">
          adjective
        </Typography> */}
      </CardContent>
      <Box sx={{ flex: "1" }} />
      <CardActions>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
          }}
        >
          {type !== 0 && (
            <IconButton
              onClick={() => {
                if (type == 1) {
                  setInProgressTasks(
                    inProgressTasks.filter((task, index) => index !== idx)
                  );
                  setToDoTasks([...toDoTasks, inProgressTasks[idx]]);
                } else if (type == 2) {
                  setDoneTasks(
                    doneTasks.filter((task, index) => index !== idx)
                  );
                  setInProgressTasks([...inProgressTasks, doneTasks[idx]]);
                }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
          <Box sx={{ flex: "1 1 auto" }} />
          {type !== 2 && (
            <IconButton
              onClick={() => {
                if (type == 0) {
                  setToDoTasks(
                    toDoTasks.filter((task, index) => index !== idx)
                  );
                  setInProgressTasks([...inProgressTasks, toDoTasks[idx]]);
                } else if (type == 1) {
                  setInProgressTasks(
                    inProgressTasks.filter((task, index) => index !== idx)
                  );
                  setDoneTasks([...doneTasks, inProgressTasks[idx]]);
                }

                const octokit = new Octokit({
                  auth: githubToken,
                });
                const splitValues = repo.split("/");
                console.log(id);
                octokit.rest.users.getAuthenticated().then(({ data }) => {
                  octokit.rest.issues
                    .addAssignees({
                      owner: splitValues[3],
                      repo: splitValues[4],
                      issue_number: id,
                      assignees: [data.login],
                    })
                    .then(({ data }) => {
                      console.log(data);
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                });
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}
        </Box>
      </CardActions>
    </StyledCard>
  );
};

export default Task;
