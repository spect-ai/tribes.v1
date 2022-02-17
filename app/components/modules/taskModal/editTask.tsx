import {
  Autocomplete,
  Box,
  ListItem,
  Grid,
  TextField,
  Avatar,
  ListItemText,
  InputBase,
  IconButton,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import Divider from "@mui/material/Divider";
import { DateTimePicker, LocalizationProvider } from "@mui/lab";
import dayjs from "dayjs";
import DateAdapter from "@mui/lab/AdapterDayjs";
import { FieldContainer, PrimaryButton } from "../../elements/styledComponents";
import { muiTheme } from "../../../constants/muiTheme";
import CloseIcon from "@mui/icons-material/Close";
import { Task } from "../../../types";
import { getMD5String } from "../../../utils/utils";
import { updateTask, assignToMe, closeTask } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useBoard } from "../taskBoard";
import ReactMde from "react-mde";
import GitHubIcon from "@mui/icons-material/GitHub";
import * as Showdown from "showdown";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DoneIcon from "@mui/icons-material/Done";
import { statusMapping, currentStatusToFutureValidStatus } from "../../../constants";
// import "react-mde/lib/styles/css/react-mde-all.css";
import { chainTokenRegistry, actionMap, monthMap } from "../../../constants";
import { getTokenOptions } from "../../../utils/utils";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Octokit } from "@octokit/rest";
import { distributeEther } from "../../../adapters/contract";
import { useGlobal } from "../../../context/globalContext";
type Props = {
  task: Task;
  setTask: (task: Task) => void;
  handleClose: () => void;
  submissionPR: any;
};

export interface IEditTask {
  taskId: string;
  title: string;
  boardId: number;
  description: string;
  deadline: any;
  source: string;
  tags: string[];
  assignee: {
    userId: string;
    username: string;
  };
  reviewer: {
    userId: string;
    username: string;
  };
  chain: string;
  token: string;
  value: number;
  status: string;
  submission: string;
}

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

const EditTask = ({ task, setTask, handleClose, submissionPR }: Props) => {
  // const router = useRouter();
  const { setData } = useBoard();
  const { Moralis, user } = useMoralis();
  const [loading, setLoading] = useState(false);
  const [chain, setChain] = useState<string | null>(task.chain);
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const [assigned, setAssigned] = useState(false);
  const { state, dispatch } = useGlobal();
  const {
    handleSubmit,
    control,
    formState: { isDirty },
    setValue,
  } = useForm<IEditTask>({});
  const onSubmit: SubmitHandler<IEditTask> = async (values) => {
    setLoading(true);
    values.deadline = new Date(values.deadline).toUTCString();
    values.taskId = task.taskId;
    console.log(values);
    updateTask(Moralis, values)
      .then((res: any) => {
        setData(res);
        //setTask(res.tasks[task.taskId]);
        setLoading(false);
        handleClose();
      })
      .catch((e: any) => {
        alert(e);
        console.log(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!(task.access.creator || task.access.reviewer)) {
      setSelectedTab("preview");
    }
    console.log(state);
  }, []);

  const save = async function* (data: any) {
    // Promise that waits for "time" milliseconds
    // Upload "data" to your server
    // Use XMLHttpRequest.send to send a FormData object containing
    // "data"
    // Check this question: https://stackoverflow.com/questions/18055422/how-to-receive-php-image-data-over-copy-n-paste-javascript-with-xmlhttprequest

    // yields the URL that should be inserted in the markdown
    yield "https://picsum.photos/300";
    // returns true meaning that the save was successful
    return true;
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: "70rem" }}>
      <TaskModalTitleContainer>
        <Controller
          name="title"
          control={control}
          defaultValue={task.title}
          render={({ field }) => (
            <InputBase
              {...field}
              placeholder="Add Title"
              sx={{
                fontSize: "20px",
              }}
              {...field}
              fullWidth
              readOnly={!(task.access.creator || task.access.reviewer)}
            />
          )}
        />
        <Box sx={{ flex: "1 1 auto" }} />
        <IconButton sx={{ m: 0, px: 2 }} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </TaskModalTitleContainer>
      <Grid container spacing={0}>
        <Grid item xs={9}>
          <TaskModalBodyContainer>
            <Divider textAlign="left" color="text.secondary" sx={{ mr: 3 }}>
              Description
            </Divider>{" "}
            <Box sx={{ color: "#eaeaea", height: "auto", mr: 3 }}>
              <Controller
                name="description"
                control={control}
                defaultValue={task.description}
                render={({ field }) => (
                  <ReactMde
                    {...field}
                    selectedTab={selectedTab}
                    onTabChange={setSelectedTab}
                    generateMarkdownPreview={(markdown) => Promise.resolve(converter.makeHtml(markdown))}
                    childProps={{
                      writeButton: {
                        tabIndex: -1,
                      },
                    }}
                    readOnly={!(task.access.creator || task.access.reviewer)}
                  />
                )}
              />
            </Box>
          </TaskModalBodyContainer>
          {task.status !== 100 && (
            <TaskModalBodyContainer>
              <Divider textAlign="left" color="text.secondary" sx={{ mr: 3 }}>
                Submissions
              </Divider>{" "}
              <Box sx={{ color: "#eaeaea", height: "auto", mr: 3 }}>
                <Controller
                  name="submission"
                  control={control}
                  defaultValue={task.submission}
                  render={({ field }) => (
                    <ReactMde
                      {...field}
                      selectedTab={selectedTab}
                      onTabChange={setSelectedTab}
                      generateMarkdownPreview={(markdown) => Promise.resolve(converter.makeHtml(markdown))}
                      childProps={{
                        writeButton: {
                          tabIndex: -1,
                        },
                      }}
                      readOnly={!task.access.assignee}
                    />
                  )}
                />
              </Box>
              {/* submissionPR ? (
              <a href={submissionPR.html_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <PrimaryButton
                  startIcon={<GitHubIcon />}
                  sx={{
                    my: 1,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ mx: 1 }}>#{submissionPR.number}</Box>
                  <Box sx={{ mx: 1 }}>{submissionPR.title}</Box>
                  <Box sx={{ mx: 1 }}>
                    <Chip
                      color={
                        submissionPR.state === "open" ? "#5fe086" : "#5a6972"
                      }
                    >
                      {submissionPR.state}
                    </Chip>
                  </Box>
                </PrimaryButton>
              </a>
            ) : (
              <TextField
                id="filled-hidden-label-normal"
                helperText={
                  "Automatically link this task with a Github Pull Request using the branch name above"
                }
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `git checkout -b ${task.taskId}`
                        );
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  ),
                }}
                value={`git checkout -b ${task.taskId}`}
                sx={{ my: 4, width: "50%" }}
                fullWidth
              />
              )*/}
            </TaskModalBodyContainer>
          )}
          <ActivityContainer>
            <Divider textAlign="left" color="text.secondary" sx={{ mr: 3 }}>
              Activity
            </Divider>{" "}
            {task.activity?.map((act: any) => (
              <ListItem key={`${act.timestamp}`}>
                <Avatar
                  sx={{ width: 24, height: 24, mr: 2 }}
                  src={
                    act.profilePicture
                      ? act.profilePicture._url
                      : `https://www.gravatar.com/avatar/${getMD5String(act.username)}?d=identicon&s=32`
                  }
                />
                <ListItemText
                  primary={`${act.username} set status to "${
                    statusMapping[act.action as keyof typeof statusMapping]
                  }" on ${act.timestamp.getDate()}  ${
                    // @ts-ignore
                    monthMap[act.timestamp.getMonth() as number]
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
                Status
              </Divider>{" "}
              <FieldContainer>
                <Controller
                  name="status"
                  control={control}
                  defaultValue={statusMapping[task.status as keyof typeof statusMapping]}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={
                        currentStatusToFutureValidStatus[task.status as keyof typeof currentStatusToFutureValidStatus]
                      }
                      getOptionLabel={(option) => option}
                      onChange={(e, data) => field.onChange(data)}
                      readOnly={!(task.access.creator || task.access.reviewer || task.access.assignee)}
                      renderInput={(params) => <TextField {...params} id="filled-hidden-label-normal" size="small" />}
                    />
                  )}
                />
              </FieldContainer>
            </TaskModalBodyContainer>
            <TaskModalBodyContainer>
              <Divider textAlign="left" color="text.secondary">
                Due Date
              </Divider>{" "}
              <LocalizationProvider dateAdapter={DateAdapter}>
                <FieldContainer>
                  <Controller
                    name="deadline"
                    control={control}
                    defaultValue={dayjs(task.deadline)}
                    render={({ field }) => (
                      <DateTimePicker
                        {...field}
                        minDateTime={dayjs()}
                        onChange={field.onChange}
                        readOnly={!(task.access.creator || task.access.reviewer)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            helperText={params.error && "Enter a date later than now"}
                            size="small"
                          />
                        )}
                      />
                    )}
                  />
                </FieldContainer>
              </LocalizationProvider>
            </TaskModalBodyContainer>
            <TaskModalBodyContainer>
              <Divider textAlign="left" color="text.secondary">
                Tags
              </Divider>{" "}
              <FieldContainer>
                <Controller
                  name="tags"
                  control={control}
                  defaultValue={task.tags || []}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      freeSolo
                      options={[]}
                      multiple
                      onChange={(e, data) => field.onChange(data)}
                      size="small"
                      readOnly={!(task.access.creator || task.access.reviewer)}
                      renderInput={(params) => <TextField {...params} id="filled-hidden-label-normal" size="small" />}
                    />
                  )}
                />
              </FieldContainer>
            </TaskModalBodyContainer>
            <TaskModalBodyContainer>
              <Divider textAlign="left" color="text.secondary">
                Assignee
              </Divider>{" "}
              <FieldContainer>
                {task.access.creator || task.access.reviewer || task.assignee.length ? (
                  <Controller
                    name="assignee"
                    control={control}
                    defaultValue={task.assignee?.length > 0 ? task.assignee[0] : null}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        options={task.members} // Get options from members
                        getOptionLabel={(option) => option.username}
                        onChange={(e, data) => field.onChange(data)}
                        readOnly={task.status !== 100}
                        renderInput={(params) => <TextField {...params} id="filled-hidden-label-normal" size="small" />}
                      />
                    )}
                  />
                ) : (
                  <PrimaryButton
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      assignToMe(Moralis, task.taskId)
                        .then((res: any) => {
                          console.log(res);
                          setValue(
                            "assignee",
                            {
                              userId: user?.id || "",
                              username: user?.get("username"),
                            },
                            { shouldDirty: true }
                          );
                          setAssigned(true);
                          setData(res);
                        })
                        .catch((err: any) => alert(err));
                    }}
                  >
                    {assigned ? `Assigned to ${user?.get("username")}` : `Assign to me!`}
                  </PrimaryButton>
                )}
              </FieldContainer>
            </TaskModalBodyContainer>

            <TaskModalBodyContainer>
              <Divider textAlign="left" color="text.secondary">
                Reviewer
              </Divider>{" "}
              <FieldContainer>
                <Controller
                  name="reviewer"
                  control={control}
                  defaultValue={task.reviewer?.length > 0 ? task.reviewer[0] : null}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={task.members} // Get options from members
                      getOptionLabel={(option) => option.username}
                      onChange={(e, data) => field.onChange(data)}
                      readOnly={!(task.access.creator || task.access.reviewer)}
                      renderInput={(params) => <TextField {...params} id="filled-hidden-label-normal" size="small" />}
                    />
                  )}
                />
              </FieldContainer>
            </TaskModalBodyContainer>

            <TaskModalBodyContainer>
              <Divider textAlign="left" color="text.secondary">
                Reward
              </Divider>{" "}
              <FieldContainer>
                <Controller
                  name="chain"
                  control={control}
                  defaultValue={task.chain}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={Object.keys(chainTokenRegistry)} // Get options from members
                      getOptionLabel={(option) => option}
                      readOnly={!task.access.creator}
                      onChange={(e, data) => {
                        field.onChange(data);
                        setChain(data);
                      }}
                      renderInput={(params) => <TextField {...params} size="small" />}
                    />
                  )}
                />
                <Grid container spacing={0}>
                  <Grid item xs={6}>
                    <Controller
                      name="value"
                      control={control}
                      defaultValue={task.value}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          id="filled-hidden-label-normal"
                          helperText={fieldState.error?.type === "min" && "Validation error"}
                          type="number"
                          error={fieldState.error ? true : false}
                          InputProps={{
                            readOnly: !task.access.creator,
                          }}
                          inputProps={{ min: 0, step: 1 }}
                          size="small"
                          sx={{ mr: 1, mt: 1 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="token"
                      control={control}
                      defaultValue={task.token}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          options={getTokenOptions(chain)} // Get options from members
                          getOptionLabel={(option) => option}
                          onChange={(e, data) => field.onChange(data)}
                          readOnly={!task.access.creator}
                          renderInput={(params) => (
                            <TextField {...params} id="filled-hidden-label-normal" size="small" sx={{ mr: 1, mt: 1 }} />
                          )}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </FieldContainer>
              {task.status === 200 && (
                <FieldContainer>
                  <PrimaryButton
                    variant="contained"
                    color="primary"
                    endIcon={<DoneIcon />}
                    onClick={() =>
                      closeTask(Moralis, task.taskId).then((res: any) => {
                        setData(res);
                      })
                    }
                    hidden={!task.access.creator}
                  >
                    Close
                  </PrimaryButton>
                </FieldContainer>
              )}
              {task.status === 205 && (
                <FieldContainer>
                  <PrimaryButton
                    variant="contained"
                    color="primary"
                    endIcon={<MonetizationOnIcon />}
                    onClick={() => distributeEther([task.assignee[0].ethAddress], [task.value], task.taskId)}
                    hidden={!task.access.creator}
                  >
                    Pay
                  </PrimaryButton>
                </FieldContainer>
              )}
            </TaskModalBodyContainer>
          </Box>
        </Grid>
        <PrimaryButton
          variant="outlined"
          fullWidth
          sx={{ width: "30%" }}
          type="submit"
          loading={loading}
          disabled={!isDirty}
        >
          Save
        </PrimaryButton>
      </Grid>
    </form>
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

const Chip = styled.div<{ color: string }>`
  padding: 0px 8px;
  height: 20px;
  font-size: 11px;
  border-radius: 25px;
  background-color: ${(props) => props.color};
  color: #000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin: 4px 4px 6px 0px;
`;

export default EditTask;
