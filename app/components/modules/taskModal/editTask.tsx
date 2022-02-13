import MUIRichTextEditor from "mui-rte";
import { createTheme, ThemeProvider } from "@mui/material/styles";
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
import React, { useState } from "react";
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
import { updateTask } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { monthMap } from "../../../constants";
import ReactMde from "react-mde";
import * as Showdown from "showdown";
// import "react-mde/lib/styles/css/react-mde-all.css";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
  handleClose: () => void;
};

export interface IEditTask {
  taskId: string;
  title: string;
  boardId: number;
  description: string;
  deadline: any;
  source: string;
  tags: string[];
  assignee: string;
  reviewer: string;
  chain: string;
  token: string;
  value: number;
}

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

const EditTask = ({ task, setTask, handleClose }: Props) => {
  // const router = useRouter();
  const { Moralis } = useMoralis();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IEditTask>({});

  const onSubmit: SubmitHandler<IEditTask> = async (values) => {
    values.deadline = new Date(values.deadline).toUTCString();
    values.taskId = task.taskId;
    console.log(values);
    setLoading(true);
    updateTask(Moralis, values)
      .then((res: any) => {
        console.log(`resssslessss`);

        console.log(res);
        console.log(`resssslessss`);

        setTask(res[1]);
        setLoading(false);
      })
      .catch((e: any) => console.log(e));
  };

  const myTheme = createTheme({
    ...muiTheme,
    spacing: 1,
    typography: {
      fontSize: 14,
    },
  });

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

  if (loading) {
    return <div>Fetching</div>;
  }

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
                    paste={{
                      saveImage: save,
                    }}
                  />
                )}
              />
            </Box>
          </TaskModalBodyContainer>
          <TaskModalBodyContainer>
            <Divider textAlign="left" color="text.secondary" sx={{ mr: 3 }}>
              Activity
            </Divider>{" "}
            <ListItem>
              <Avatar
                sx={{ width: 24, height: 24, mr: 2 }}
                src={`https://www.gravatar.com/avatar/${getMD5String(task.activity[0].actor)}?d=identicon&s=32`}
              />
              <ListItemText
                primary={`Created by ${task.activity[0].actor} on ${task.activity[0].timestamp.getDate()}  ${
                  // @ts-ignore
                  monthMap[task.activity[0].timestamp.getMonth() as number]
                }`}
              />
            </ListItem>
          </TaskModalBodyContainer>
        </Grid>
        <Grid item xs={3} sx={{ borderLeft: "1px solid #5a6972" }}>
          <Box ml={2}>
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
                <Controller
                  name="assignee"
                  control={control}
                  defaultValue={task.assignee}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={["chaks.eth", "0xavp.eth", "USDC.eth"]} // Get options from members
                      getOptionLabel={(option) => option}
                      onChange={(e, data) => field.onChange(data)}
                      renderInput={(params) => <TextField {...params} id="filled-hidden-label-normal" size="small" />}
                    />
                  )}
                />
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
                  defaultValue={task.reviewer}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={["chaks.eth", "0xavp.eth", "USDC.eth"]} // Get options from members
                      getOptionLabel={(option) => option}
                      onChange={(e, data) => field.onChange(data)}
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
                      options={["Polygon", "Ethereum", "Binance Smart Chain"]} // Get options from members
                      getOptionLabel={(option) => option}
                      onChange={(e, data) => field.onChange(data)}
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
                          required
                          error={fieldState.error ? true : false}
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
                          options={["Matic", "Weth", "USDC"]} // Get options from members
                          getOptionLabel={(option) => option}
                          onChange={(e, data) => field.onChange(data)}
                          renderInput={(params) => (
                            <TextField {...params} id="filled-hidden-label-normal" size="small" sx={{ mr: 1, mt: 1 }} />
                          )}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </FieldContainer>
            </TaskModalBodyContainer>
          </Box>
        </Grid>
        <PrimaryButton variant="outlined" fullWidth sx={{ width: "30%" }} type="submit">
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

export default EditTask;
