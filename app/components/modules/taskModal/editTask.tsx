import {
  Box,
  ListItem,
  Grid,
  Avatar,
  ListItemText,
  InputBase,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Divider from "@mui/material/Divider";
import { PrimaryButton, TaskButton } from "../../elements/styledComponents";
import CloseIcon from "@mui/icons-material/Close";
import { BoardData, Column, Task } from "../../../types";
import { formatTime, getMD5String } from "../../../utils/utils";
import {
  assignToMe,
  updateTaskDescription,
  updateTaskTitle,
  completePayment,
  archiveTask,
} from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import ReactMde from "react-mde";
import * as Showdown from "showdown";
import { labelsMapping, registryTemp } from "../../../constants";
import { actionMap, monthMap } from "../../../constants";
import { distributeEther, batchPayTokens } from "../../../adapters/contract";
import DatePopover from "./datePopover";
import LabelPopover from "./labelPopover";
import MemberPopover from "./memberPopover";
import RewardPopover from "./rewardPopover";
import SubmissionPopover from "./submissionPopover";
import MovePopover from "./movePopover";
import { LinkPreview } from "@dhaiwat10/react-link-preview";

import EventIcon from "@mui/icons-material/Event";
import LabelIcon from "@mui/icons-material/Label";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PaidIcon from "@mui/icons-material/Paid";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import HailIcon from "@mui/icons-material/Hail";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import { notify } from "../settingsTab";
import { Toaster } from "react-hot-toast";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
  handleClose: () => void;
  submissionPR: any;
  column: Column;
};
const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

const EditTask = ({ task, handleClose, column }: Props) => {
  const { space, setSpace } = useSpace();
  const { Moralis, user } = useMoralis();
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState({} as any);
  const [description, setDescription] = useState(task.description);
  const handleClick =
    (field: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen({ [field]: true });
    };
  const handleClosePopover = (field: string) => {
    setOpen({ [field]: false });
  };
  const isSpaceMember = () => {
    return space.members.indexOf(user?.id as string) !== -1;
  };

  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const [title, setTitle] = useState(task.title);

  const handleTaskStatusUpdate = (taskIds: string[]) => {
    completePayment(Moralis, taskIds)
      .then((res: any) => {
        console.log(res);
        setSpace(res);
      })
      .catch((err: any) => {
        notify(
          "Sorry! There was an error while updating task status to paid. However, the payment has gone through.",
          "error"
        );
        setIsLoading(false);
      });
  };
  useEffect(() => {
    console.log(task.access);
    if (!(task.access.creator || task.access.reviewer)) {
      setSelectedTab("preview");
    }
  }, []);

  return (
    <Container>
      <Toaster />
      <TaskModalTitleContainer>
        <InputBase
          placeholder="Add Title"
          sx={{
            fontSize: "20px",
          }}
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (task.access.creator || task.access.reviewer) {
              updateTaskTitle(Moralis, title, task.taskId)
                .then((res: BoardData) => {
                  setSpace(res);
                })
                .catch((err: any) => {
                  notify(
                    "Sorry! There was an error while updating task title.",
                    "error"
                  );
                });
            }
          }}
          readOnly={!(task.access.creator || task.access.reviewer)}
        />
        <Box sx={{ flex: "1 1 auto" }} />
        <IconButton sx={{ m: 0, px: 2 }} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </TaskModalTitleContainer>
      <TaskModalInfoContainer>
        {task.deadline && (
          <Info>
            <Typography sx={{ color: "rgb(153, 204, 255)", fontSize: 12 }}>
              Due Date
            </Typography>
            <InnerInfo>
              <Typography sx={{ fontSize: 14 }} color="text.primary">
                {task.deadline?.getDate()}{" "}
                {monthMap[task.deadline?.getMonth() as keyof typeof monthMap]}{" "}
                {task.deadline && formatTime(task.deadline)}
              </Typography>
            </InnerInfo>
          </Info>
        )}
        {task.tags && (
          <Info>
            <Typography sx={{ color: "rgb(153, 204, 255)", fontSize: 12 }}>
              Labels
            </Typography>
            <InnerInfo>
              {task.tags?.map((tag, index) => (
                <LabelChip
                  color={labelsMapping[tag as keyof typeof labelsMapping]}
                  key={index}
                >
                  {tag}
                </LabelChip>
              ))}
            </InnerInfo>
          </Info>
        )}
        {task.reviewer.length && (
          <Info>
            <Typography sx={{ color: "rgb(153, 204, 255)", fontSize: 12 }}>
              Reviewer
            </Typography>
            <InnerInfo>
              <Tooltip title={space.memberDetails[task.reviewer[0]].username}>
                <Avatar
                  sx={{ height: 32, width: 32 }}
                  src={
                    space.memberDetails[task.reviewer[0]].profilePicture
                      ? space.memberDetails[task.reviewer[0]].profilePicture
                          ._url
                      : `https://www.gravatar.com/avatar/${getMD5String(
                          task.reviewer[0]
                        )}?d=identicon&s=32`
                  }
                />
              </Tooltip>
            </InnerInfo>
          </Info>
        )}

        {task.assignee.length > 0 && (
          <Info>
            <Typography sx={{ color: "rgb(153, 204, 255)", fontSize: 12 }}>
              Assignee
            </Typography>

            <InnerInfo>
              <Tooltip title={space.memberDetails[task.assignee[0]]?.username}>
                <Avatar
                  sx={{ height: 32, width: 32 }}
                  src={
                    space.memberDetails[task.assignee[0]].profilePicture
                      ? space.memberDetails[task.assignee[0]].profilePicture
                          ._url
                      : `https://www.gravatar.com/avatar/${getMD5String(
                          task.assignee[0]
                        )}?d=identicon&s=32`
                  }
                />
              </Tooltip>
            </InnerInfo>
          </Info>
        )}
        {task.value && (
          <Info>
            <Typography sx={{ color: "rgb(153, 204, 255)", fontSize: 12 }}>
              Reward
            </Typography>
            <InnerInfo>
              <Typography sx={{ fontSize: 14 }} color="text.primary">
                {task.value} {task.token.symbol}
              </Typography>
            </InnerInfo>
          </Info>
        )}
      </TaskModalInfoContainer>
      <Grid container spacing={0}>
        <Grid item xs={9}>
          <TaskModalBodyContainer>
            <Divider textAlign="left" color="text.secondary" sx={{ mr: 3 }}>
              Description
            </Divider>{" "}
            <Box sx={{ color: "#eaeaea", height: "auto", mr: 3 }}>
              <ReactMde
                value={description}
                onChange={(value) => setDescription(value)}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={(markdown) =>
                  Promise.resolve(converter.makeHtml(markdown))
                }
                childProps={{
                  writeButton: {
                    tabIndex: -1,
                  },
                }}
                readOnly={!(task.access.creator || task.access.reviewer)}
              />
              {(task.access.creator || task.access.reviewer) && (
                <PrimaryButton
                  variant="outlined"
                  sx={{ mt: 4, borderRadius: 2 }}
                  color="secondary"
                  loading={isLoading}
                  onClick={() => {
                    setIsLoading(true);
                    updateTaskDescription(
                      Moralis,
                      description,
                      task.taskId
                    ).then((res: BoardData) => {
                      setSpace(res);
                      setIsLoading(false);
                    });
                  }}
                >
                  Save
                </PrimaryButton>
              )}
            </Box>
          </TaskModalBodyContainer>
          {task.submission?.link && (
            <ActivityContainer>
              <Divider
                textAlign="left"
                color="text.secondary"
                sx={{ mr: 3, mb: 1 }}
              >
                Submissions
              </Divider>{" "}
              <LinkPreview
                url={task.submission.link}
                width="40rem"
                imageHeight={"0rem"}
                backgroundColor={"transparent"}
                primaryTextColor={"#eaeaea"}
                borderColor="#5a6972"
              />
            </ActivityContainer>
          )}

          <ActivityContainer>
            <Divider textAlign="left" color="text.secondary" sx={{ mr: 3 }}>
              Activity
            </Divider>{" "}
            {task.activity.map((activity: any) => (
              <ListItem key={`${activity.timestamp}`}>
                <Avatar
                  sx={{ width: 24, height: 24, mr: 2 }}
                  src={
                    space.memberDetails[activity.actor].profilePicture
                      ? space.memberDetails[activity.actor].profilePicture._url
                      : `https://www.gravatar.com/avatar/${getMD5String(
                          space.memberDetails[activity.actor].username
                        )}?d=identicon&s=32`
                  }
                />
                <ListItemText
                  primary={`${space.memberDetails[activity.actor].username} ${
                    actionMap[activity.action as keyof typeof actionMap]
                  } on ${activity.timestamp.getDate()}  ${
                    // @ts-ignore
                    monthMap[activity.timestamp.getMonth() as number]
                  }`}
                />
              </ListItem>
            ))}
          </ActivityContainer>
        </Grid>
        <Grid item xs={3} sx={{ borderLeft: "1px solid #5a6972" }}>
          <Box ml={2}>
            <TaskModalBodyContainer>
              <Divider textAlign="left" color="text.secondary">
                Add to Task
              </Divider>{" "}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  mt: 2,
                  mx: 1,
                }}
              >
                {(task.access.reviewer ||
                  task.access.creator ||
                  task.access.assignee) && (
                  <TaskButton
                    variant="outlined"
                    disabled={column.status === "Closed"}
                    onClick={handleClick("date")}
                    color="secondary"
                  >
                    <Typography sx={{ width: "50%", fontSize: 15 }}>
                      Due Date
                    </Typography>
                    <EventIcon />
                  </TaskButton>
                )}
                {open["date"] && (
                  <DatePopover
                    open={open["date"]}
                    anchorEl={anchorEl}
                    handleClose={handleClosePopover}
                    task={task}
                  />
                )}
                <TaskButton
                  variant="outlined"
                  color="secondary"
                  onClick={handleClick("label")}
                  disabled={!isSpaceMember() || column.status === "Closed"}
                >
                  <Typography sx={{ width: "50%", fontSize: 15 }}>
                    Labels
                  </Typography>
                  <LabelIcon />
                </TaskButton>
                {open["label"] && (
                  <LabelPopover
                    open={open["label"]}
                    anchorEl={anchorEl}
                    handleClose={handleClosePopover}
                    task={task}
                  />
                )}
                {(task.access.reviewer || task.access.creator) && (
                  <TaskButton
                    variant="outlined"
                    color="secondary"
                    onClick={handleClick("reviewer")}
                    disabled={column.status === "Closed"}
                  >
                    <Typography sx={{ width: "50%", fontSize: 15 }}>
                      Reviewer
                    </Typography>
                    <VisibilityIcon />
                  </TaskButton>
                )}
                {open["reviewer"] && (
                  <MemberPopover
                    open={open["reviewer"]}
                    anchorEl={anchorEl}
                    handleClose={handleClosePopover}
                    type="reviewer"
                    task={task}
                  />
                )}
                {(task.access.reviewer || task.access.creator) && (
                  <TaskButton
                    variant="outlined"
                    color="secondary"
                    onClick={handleClick("assignee")}
                    disabled={column.status === "Closed"}
                  >
                    <Typography sx={{ width: "50%", fontSize: 15 }}>
                      Assignee
                    </Typography>
                    <AssignmentIndIcon />
                  </TaskButton>
                )}
                {open["assignee"] && (
                  <MemberPopover
                    open={open["assignee"]}
                    anchorEl={anchorEl}
                    handleClose={handleClosePopover}
                    type="assignee"
                    task={task}
                  />
                )}
                {task.access.creator && (
                  <TaskButton
                    variant="outlined"
                    color="secondary"
                    onClick={handleClick("reward")}
                  >
                    <Typography sx={{ width: "50%", fontSize: 15 }}>
                      Reward
                    </Typography>
                    <PaidIcon />
                  </TaskButton>
                )}
                {open["reward"] && (
                  <RewardPopover
                    open={open["reward"]}
                    anchorEl={anchorEl}
                    handleClose={handleClosePopover}
                    task={task}
                  />
                )}
                {task.access.assignee && (
                  <TaskButton
                    variant="outlined"
                    color="secondary"
                    onClick={handleClick("submission")}
                  >
                    <Typography sx={{ width: "50%", fontSize: 15 }}>
                      Submission
                    </Typography>
                    <PublishIcon />
                  </TaskButton>
                )}
                {open["submission"] && (
                  <SubmissionPopover
                    open={open["submission"]}
                    anchorEl={anchorEl}
                    handleClose={handleClosePopover}
                    task={task}
                  />
                )}
              </Box>
              <Divider textAlign="left" color="text.secondary">
                Actions
              </Divider>{" "}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  mt: 2,
                  mx: 1,
                }}
              >
                {(task.access.creator ||
                  task.access.reviewer ||
                  task.access.assignee) && (
                  <TaskButton
                    variant="outlined"
                    color="secondary"
                    onClick={handleClick("move")}
                  >
                    <Typography sx={{ width: "50%", fontSize: 15 }}>
                      Move
                    </Typography>
                    <ArrowCircleRightIcon />
                  </TaskButton>
                )}
                {open["move"] && (
                  <MovePopover
                    open={open["move"]}
                    anchorEl={anchorEl}
                    handleClose={handleClosePopover}
                    column={column}
                    task={task}
                  />
                )}
                {space.roles[user?.id as string] === "admin" &&
                  task.status === 205 && (
                    <TaskButton
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        task.token.symbol ===
                        registryTemp[task.chain.chainId].nativeCurrency
                          ? distributeEther(
                              [
                                space.memberDetails[task.assignee[0]]
                                  .ethAddress,
                              ],
                              [task.value],
                              task.taskId,
                              window.ethereum.networkVersion
                            )
                              .then((res: any) => {
                                console.log(res);
                                handleTaskStatusUpdate([task.taskId]);
                                handleClose();
                              })
                              .catch((err: any) => alert(err))
                          : batchPayTokens(
                              [task.token.address as string],
                              [
                                space.memberDetails[task.assignee[0]]
                                  .ethAddress,
                              ],
                              [task.value],
                              task.taskId,
                              window.ethereum.networkVersion
                            )
                              .then((res: any) => {
                                handleTaskStatusUpdate([task.taskId]);
                                handleClose();
                              })
                              .catch((err: any) => alert(err));
                      }}
                    >
                      <Typography sx={{ width: "50%", fontSize: 15 }}>
                        Pay
                      </Typography>
                      <PaidIcon />
                    </TaskButton>
                  )}
                {/*!task.access.creator && (
                  <TaskButton variant="outlined" color="primary">
                    Vote
                  </TaskButton>
                )*/}
                {!task.assignee.length && (
                  <TaskButton
                    variant="outlined"
                    color="secondary"
                    disabled={!isSpaceMember()}
                    onClick={() => {
                      // Can we improve the experience here by the greedy approach?
                      assignToMe(Moralis, task.taskId)
                        .then((res: BoardData) => {
                          setSpace(res);
                        })
                        .catch((err: any) => {
                          notify(
                            "Sorry! There was an error while assigning task.",
                            "error"
                          );
                        });
                    }}
                  >
                    <Typography sx={{ width: "50%", fontSize: 15 }}>
                      Assign to Me
                    </Typography>
                    <HailIcon />
                  </TaskButton>
                )}
                {space.roles[user?.id as string] === "admin" && (
                  <TaskButton
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      archiveTask(Moralis, task.taskId)
                        .then((res: BoardData) => {
                          setSpace(res);
                          notify("Task archived successfully", "success");
                          handleClose();
                        })
                        .catch((err: any) => {
                          notify(
                            "Sorry! There was an error while archiving task.",
                            "error"
                          );
                        });
                    }}
                  >
                    <Typography sx={{ width: "50%", fontSize: 15 }}>
                      Archive
                    </Typography>
                    <DeleteIcon />
                  </TaskButton>
                )}
              </Box>
            </TaskModalBodyContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

const TaskModalTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const TaskModalBodyContainer = styled.div`
  margin-top: 2px;
  color: #99ccff;
  font-size: 0.85rem;
`;

const ActivityContainer = styled.div`
  margin-top: 2px;
  color: #99ccff;
  font-size: 0.85rem;
  max-height: 10rem;
  overflow-y: auto;
`;

const TaskModalInfoContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 1rem;
`;

const InnerInfo = styled.div`
  display: flex;
  align-items: center;
`;

const LabelChip = styled.div`
  background-color: ${(props: any) => props.color};
  font-size: 14px;
  font-weight: 600;
  color: #eaeaea;
  padding: 4px 6px;
  border-radius: 4px;
  margin-right: 4px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 70rem;
  height: 35rem;
`;

export default EditTask;
