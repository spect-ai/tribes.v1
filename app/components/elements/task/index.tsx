import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  styled,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useTribe } from "../../../../pages/tribe/[id]";
import { Octokit } from "@octokit/rest";
import { Epoch, Task } from "../../../types";
import { distributeTokensForTask } from "../../../adapters/contract";
import { getTaskEpoch, updateTask } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { getMD5String, getRemainingVotes, smartTrim } from "../../../utils/utils";
import { PrimaryButton } from "../../modules/epochModal";

type Props = {
  task: Task;
  epoch: Epoch;
  setRemainingVotes: any;
  remainingVotes: number;
  setVoteAllocation: any;
  voteAllocation: {
    [key: string]: number;
  };
};

const StyledCard = styled(Card)(({ theme, ...props }) => ({
  width: "19rem",
  marginTop: "0.5rem",
  marginBottom: "0.5rem",
  height: "10rem",
  display: "flex",
  flexDirection: "column",
}));

type colorMapping = {
  [key: number]: string;
};
const statusMapping: colorMapping = {
  100: "#0061ff",
  101: "#ffc107",
  102: "#5fe086",
};

const Task = ({ task, epoch, setRemainingVotes, remainingVotes, setVoteAllocation, voteAllocation }: Props) => {
  const { githubToken, setToDoTasks, setInProgressTasks, setDoneTasks, tribe } = useTribe();
  const { Moralis } = useMoralis();
  useEffect(() => {
    console.log(task);
  }, []);

  return (
    <StyledCard sx={{ borderLeft: `5px solid ${statusMapping[task.status]}` }}>
      <CardContent sx={{ pb: 0 }}>
        <Typography sx={{ fontSize: 14 }} component="div">
          {task.title}
        </Typography>
        {task.status === 100 && epoch.active && (
          <TextField
            label="Vote"
            type="number"
            inputProps={{ min: 0, step: 1 }}
            sx={{ mt: 1, width: "40%" }}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
            // fix
            error={remainingVotes < 0}
            onChange={(event) => {
              console.log(event.target.value);
              console.log(voteAllocation);
              const userRemainingVotes = getRemainingVotes(
                remainingVotes,
                parseInt(event.target.value),
                voteAllocation?.hasOwnProperty(task._id) ? voteAllocation[task._id] : 0
              );

              console.log(userRemainingVotes);
              setRemainingVotes(userRemainingVotes);
              voteAllocation[task._id] = parseInt(event.target.value);
              setVoteAllocation(voteAllocation);
              console.log(voteAllocation);
            }}
          />
        )}
        {!epoch.active && <Typography color="text.secondary">{task.value?.toFixed(2)} WMatic</Typography>}
        {task.status !== 100 && (
          <Tooltip title={task.assignee}>
            <Avatar
              alt=""
              src={`https://www.gravatar.com/avatar/${getMD5String(task.assignee)}?d=identicon&s=32`}
              sx={{ mt: 1 }}
            />
          </Tooltip>
        )}
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
          {task.status !== 100 && (
            <IconButton onClick={() => {}}>
              <ChevronLeftIcon />
            </IconButton>
          )}
          <Box sx={{ flex: "1 1 auto" }} />
          {task.status !== 102 && (
            <IconButton
              disabled={epoch.active}
              onClick={() => {
                if (task.status == 100) {
                  const splitValues = task.issueLink.split("/");
                  console.log(githubToken);
                  const octokit = new Octokit({
                    auth: githubToken,
                  });
                  octokit.rest.users.getAuthenticated().then(({ data }) => {
                    octokit.rest.issues
                      .addAssignees({
                        owner: splitValues[4],
                        repo: splitValues[5],
                        issue_number: task.issueNumber,
                        assignees: [data.login],
                      })
                      .then(({ data }) => {
                        updateTask(Moralis, task._id, 101).then((res: any) => {
                          console.log(res);
                          getTaskEpoch(Moralis, tribe.latestTaskEpoch).then((res: any) => {
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
                          });
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  });
                } else if (task.status == 101) {
                  const splitValues = task.issueLink.split("/");
                  const octokit = new Octokit({
                    auth: githubToken,
                  });
                  octokit.rest.issues
                    .update({
                      owner: splitValues[4],
                      repo: splitValues[5],
                      issue_number: task.issueNumber,
                      state: "closed",
                    })
                    .then(({ data }) => {
                      updateTask(Moralis, task._id, 102).then((res: any) => {
                        console.log(res);
                        getTaskEpoch(Moralis, tribe.latestTaskEpoch).then((res: any) => {
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
                        });
                      });
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}
          {task.status === 102 && !task.paid && (
            <PrimaryButton
              onClick={() => {
                // metamask confirm payment then =>
                distributeTokensForTask(task).then((res: any) => {
                  console.log(res);
                  updateTask(Moralis, task._id, 102, true).then((res: any) => {
                    getTaskEpoch(Moralis, tribe.latestTaskEpoch).then((res: any) => {
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
                    });
                  });
                });
              }}
            >
              Pay
            </PrimaryButton>
          )}
          {task.paid && (
            <Typography color="text.secondary" sx={{ m: 1 }}>
              Paid
            </Typography>
          )}
        </Box>
      </CardActions>
    </StyledCard>
  );
};

export default Task;
