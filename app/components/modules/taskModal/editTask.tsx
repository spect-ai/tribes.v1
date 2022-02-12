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

type Props = {
  task: Task;
  handleClose: () => void;
};

export interface IEditTask {
  taskId: string;
  title: string;
  boardId: number;
  description: string;
  deadline: Date;
  source: string;
  tags: string[];
  assignee: string;
  reviewer: string;
  chain: string;
  token: string;
  reward: number;
}

const EditTask = ({ task, handleClose }: Props) => {
  const router = useRouter();
  const { Moralis } = useMoralis();

  // const [taskTitle, setTaskTitle] = useState(title);
  const [taskDescription, setTaskDescription] = useState("");
  console.log(task);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IEditTask>({
    defaultValues: {
      taskId: task.taskId,
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      assignee: task.assignee,
      reviewer: task.reviewer,
      reward: task.reward.value,
      token: task.reward.token,
      chain: task.reward.chain,
    },
  });

  const onSubmit: SubmitHandler<IEditTask> = async (values) => {
    console.log("asasas");
    console.log(values);
    console.log("asasas");

    updateTask(Moralis, values)
      .then((res: any) => console.log(res))
      .catch((e: any) => alert(e));
  };

  const myTheme = createTheme({
    ...muiTheme,
    spacing: 1,
    typography: {
      fontSize: 14,
    },
  });

  const saveDescription = (data: any) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: "60rem" }}>
      <TaskModalTitleContainer>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <InputBase
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
            <Box sx={{ color: "#eaeaea", height: "10rem", overflow: "auto" }}>
              <ThemeProvider theme={myTheme}>
                <MUIRichTextEditor label="Describe the task ..." onSave={saveDescription} inheritFontSize />
              </ThemeProvider>
            </Box>
          </TaskModalBodyContainer>
          <TaskModalBodyContainer>
            <Divider textAlign="left" color="text.secondary" sx={{ mr: 3 }}>
              Submissions
            </Divider>{" "}
            <Box sx={{ color: "#eaeaea", height: "10rem", overflow: "auto" }}>
              <ThemeProvider theme={myTheme}>
                <MUIRichTextEditor
                  label="Make a submission ..."
                  onSave={saveDescription}
                  inheritFontSize
                  defaultValue={task.description}
                />
              </ThemeProvider>
            </Box>
          </TaskModalBodyContainer>
          <TaskModalBodyContainer>
            <Divider textAlign="left" color="text.secondary" sx={{ mr: 3 }}>
              Activity
            </Divider>{" "}
            {task.activity?.map((activity, index) => (
              <ListItem key={index}>
                <Avatar
                  sx={{ width: 24, height: 24, mr: 2 }}
                  src={`https://www.gravatar.com/avatar/${getMD5String(activity.userAddress)}?d=identicon&s=32`}
                />
                <ListItemText primary={activity.title} />
              </ListItem>
            ))}
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
                  render={({ field }) => (
                    <Autocomplete
                      freeSolo
                      options={[]}
                      multiple
                      onChange={(e, data) => field.onChange(data)}
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
                  render={({ field }) => (
                    <Autocomplete
                      options={["chaks.eth", "0xavp.eth", "USDC.eth"]} // Get options from members
                      getOptionLabel={(option) => option}
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
                  render={({ field }) => (
                    <Autocomplete
                      options={["chaks.eth", "0xavp.eth", "USDC.eth"]} // Get options from members
                      getOptionLabel={(option) => option}
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
                  render={({ field }) => (
                    <Autocomplete
                      options={["Polygon", "Ethereum", "Binance Smart Chain"]} // Get options from members
                      getOptionLabel={(option) => option}
                      renderInput={(params) => <TextField {...params} id="filled-hidden-label-normal" size="small" />}
                    />
                  )}
                />
                <Grid container spacing={0}>
                  <Grid item xs={6}>
                    <Controller
                      name="reward"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          id="filled-hidden-label-normal"
                          helperText={fieldState.error?.type === "min" && "Gig collateral should atleast be 1 Matic"}
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
                      render={({ field }) => (
                        <Autocomplete
                          options={["Matic", "Weth", "USDC"]} // Get options from members
                          getOptionLabel={(option) => option}
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
