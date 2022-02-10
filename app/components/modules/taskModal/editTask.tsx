import MUIRichTextEditor from "mui-rte";
import {
  Autocomplete,
  Box,
  ListItem,
  Grid,
  ListItemAvatar,
  TextField,
  List,
  Avatar,
  ListItemText,
  InputBase,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import { FieldContainer, LightTooltip } from "../epochForm";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import Divider from "@mui/material/Divider";
import { DateTimePicker, LocalizationProvider } from "@mui/lab";
import dayjs from "dayjs";
import DateAdapter from "@mui/lab/AdapterDayjs";

type Props = {
  setIsOpen: (isOpen: boolean) => void;
  title: string;
};

export interface IEditTask {
  title: string;
  boardId: number;
  description: string;
  deadline: Date;
  source: string;
  tags: any;
  assignee: string;
  reviewer: string;
  chain: string;
  currency: string;
  reward: number;
}

const EditTask = ({ setIsOpen, title }: Props) => {
  const router = useRouter();
  const [task, setTask] = useState<IEditTask>({ title: title } as IEditTask);
  const [taskTitle, setTaskTitle] = useState(title);
  const [taskDescription, setTaskDescription] = useState("");

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IEditTask>();

  const onSubmit: SubmitHandler<IEditTask> = async (values) => {};

  const saveDescription = (data: any) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "0rem", width: "60rem" }}>
      <Grid container spacing={0}>
        <Grid item xs={8} mt={2} mb={1}>
          <TaskModalTitleContainer>
            <InputBase
              placeholder="Add Title"
              sx={{
                fontSize: "36px",
                marginLeft: "6px",
              }}
              value={taskTitle}
              onChange={(e) => {
                setTaskTitle(e.target.value);
              }}
            />
          </TaskModalTitleContainer>
        </Grid>
      </Grid>
      <Grid container spacing={0}>
        <Grid item xs={8} mt={2} mb={1}>
          <TaskModalBodyContainer>
            <Divider textAlign="left" color="text.secondary" sx={{ marginBottom: "12px", marginTop: "24px" }}>
              Description
            </Divider>{" "}
            <MUIRichTextEditor label="Describe the task ..." onSave={saveDescription} />
          </TaskModalBodyContainer>
          <TaskModalBodyContainer>
            <Divider textAlign="left" color="text.secondary" sx={{ marginBottom: "12px", marginTop: "154px" }}>
              Submissions
            </Divider>{" "}
            <MUIRichTextEditor label="Make a submission ..." onSave={saveDescription} />
          </TaskModalBodyContainer>
          <TaskModalBodyContainer>
            <Divider textAlign="left" color="text.secondary" sx={{ marginBottom: "12px", marginTop: "108px" }}>
              Activity
            </Divider>{" "}
            <ListItem>
              <ListItemAvatar>
                <Avatar></Avatar>
              </ListItemAvatar>
              <ListItemText primary={`Created by chaks.eth on 9th Jan`} />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar></Avatar>
              </ListItemAvatar>
              <ListItemText primary={`Submitted by chaks.eth on 9th Jan`} />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar></Avatar>
              </ListItemAvatar>
              <ListItemText primary={`Paid by chaks.eth on 9th Jan`} />
            </ListItem>
          </TaskModalBodyContainer>
        </Grid>
        <Grid item xs={3} mt={2} mb={1} ml={2} sx={{ borderLeft: "1px solid #5a6972" }}>
          <Box ml={2}>
            <TaskModalBodyContainer>
              <Divider textAlign="left" color="text.secondary" sx={{ marginBottom: "12px", marginTop: "24px" }}>
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
                          <TextField {...params} fullWidth helperText={params.error && "Enter a date later than now"} />
                        )}
                      />
                    )}
                  />
                </FieldContainer>
              </LocalizationProvider>
            </TaskModalBodyContainer>
            <TaskModalBodyContainer>
              <Divider textAlign="left" color="text.secondary" sx={{ marginBottom: "12px" }}>
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
                      renderInput={(params) => <TextField {...params} id="filled-hidden-label-normal" />}
                    />
                  )}
                />
              </FieldContainer>
            </TaskModalBodyContainer>
            <TaskModalBodyContainer>
              <FieldContainer>
                <Divider textAlign="left" color="text.secondary" sx={{ marginBottom: "12px" }}>
                  Assignee
                </Divider>{" "}
                <Controller
                  name="assignee"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={["chaks.eth", "0xavp.eth", "USDC.eth"]} // Get options from members
                      getOptionLabel={(option) => option}
                      renderInput={(params) => <TextField {...params} id="filled-hidden-label-normal" />}
                    />
                  )}
                />
              </FieldContainer>
            </TaskModalBodyContainer>

            <TaskModalBodyContainer>
              <FieldContainer>
                <Divider textAlign="left" color="text.secondary" sx={{ marginBottom: "12px" }}>
                  Reviewer
                </Divider>{" "}
                <Controller
                  name="reviewer"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={["chaks.eth", "0xavp.eth", "USDC.eth"]} // Get options from members
                      getOptionLabel={(option) => option}
                      renderInput={(params) => <TextField {...params} id="filled-hidden-label-normal" />}
                    />
                  )}
                />
              </FieldContainer>
            </TaskModalBodyContainer>

            <TaskModalBodyContainer>
              <FieldContainer>
                <Divider textAlign="left" color="text.secondary" sx={{ marginBottom: "12px" }}>
                  Reward
                </Divider>{" "}
                <Controller
                  name="chain"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={["Polygon", "Ethereum", "Binance Smart Chain"]} // Get options from members
                      getOptionLabel={(option) => option}
                      renderInput={(params) => <TextField {...params} id="filled-hidden-label-normal" />}
                    />
                  )}
                />
                <Grid container spacing={0}>
                  <Grid item xs={6}>
                    <FieldContainer>
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
                          />
                        )}
                      />
                    </FieldContainer>
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          options={["Matic", "Weth", "USDC"]} // Get options from members
                          getOptionLabel={(option) => option}
                          renderInput={(params) => <TextField {...params} id="filled-hidden-label-normal" />}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </FieldContainer>
            </TaskModalBodyContainer>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

const TaskModalTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const TaskModalImportContainer = styled.div`
  display: flex;
  flex-direction: row;
  color: #99ccff;
`;

const TaskModalBodyContainer = styled.div`
  margin-top: 12px;
  color: #99ccff;
  font-size: 0.85rem;
`;

export default EditTask;
