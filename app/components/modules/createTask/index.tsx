import { Autocomplete, Box, Collapse, Grid, Button, TextField, Paper, styled, Switch, Typography } from "@mui/material";
import React, { useState } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import { FieldContainer, LightTooltip } from "../epochForm";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { PrimaryButton } from "../epochModal";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTribe } from "../../../../pages/tribe/[id]";
import { createTasks, getTaskEpoch } from "../../../adapters/moralis";
import Moralis from "moralis/types";
import { useMoralis } from "react-moralis";
import { Epoch, Team } from "../../../types";
import { useRouter } from "next/router";
import DescriptionIcon from "@mui/icons-material/Description";

type Props = {
  setIsOpen: (isOpen: boolean) => void;
};

export interface ICreateTask {
  title: string;
  boardId: number;
  description: string;
  deadline: Date;
  source: string;
  value: number;
}

const CreateTasks = ({ setIsOpen }: Props) => {
  const router = useRouter();
  const { id } = router.query;
  const { tribe } = useTribe();
  const { Moralis, user } = useMoralis();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ICreateTask>();

  const onSubmit: SubmitHandler<ICreateTask> = async (values) => {};

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "0rem", width: "60rem" }}>
      <Grid container spacing={0}>
        <Grid item xs={8} mt={2} mb={1}>
          <TextField
            hiddenLabel
            id="outlined-multiline-flexible"
            size="medium"
            defaultValue={"Enter a task title"}
            inputProps={{ style: { fontSize: 30 } }}
            InputLabelProps={{ style: { fontSize: 30 } }}
            multiline
            fullWidth
          />
        </Grid>
        <Grid item xs={8} mt={2} mb={1}>
          <div>
            <Typography color="text.secondary" mb={1}>
              Description
            </Typography>
            <TextField hiddenLabel id="filled-hidden-label-normal" />
          </div>
          <div>
            <Typography color="text.secondary" mt={2} mb={1}>
              Submission
            </Typography>
            <TextField hiddenLabel id="filled-hidden-label-normal" />
          </div>
          <div>
            <Typography color="text.secondary" mt={2} mb={1}>
              Activity
            </Typography>
            <TextField hiddenLabel id="filled-hidden-label-normal" />
          </div>
        </Grid>
        <Grid item xs={3} mt={2} mb={1} ml={2} sx={{ borderLeft: "1px solid #5a6972" }}>
          <Box ml={2}>
            <div>
              <Typography color="text.secondary" mt={2} mb={1}>
                Due Date
              </Typography>
              <TextField hiddenLabel id="filled-hidden-label-normal" />
            </div>
            <div>
              <Typography color="text.secondary" mt={2} mb={1}>
                Tags
              </Typography>
              <TextField hiddenLabel id="filled-hidden-label-normal" />
            </div>
            <div>
              <Typography color="text.secondary" mt={2} mb={1}>
                Reviewer
              </Typography>
              <TextField hiddenLabel id="filled-hidden-label-normal" />
            </div>
            <div>
              <Typography color="text.secondary" mt={2} mb={1}>
                Assigned to
              </Typography>
              <TextField hiddenLabel id="filled-hidden-label-normal" />
            </div>
            <div>
              <Typography color="text.secondary" mt={2} mb={1}>
                Reward
              </Typography>
              <TextField hiddenLabel id="filled-hidden-label-normal" />
              <TextField hiddenLabel id="filled-hidden-label-normal" />
              <TextField hiddenLabel id="filled-hidden-label-normal" />
            </div>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default CreateTasks;
