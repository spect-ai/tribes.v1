import { Autocomplete, TextField } from "@mui/material";
import React from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import { FieldContainer, LightTooltip } from "../epochForm";
import { Box } from "@mui/system";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { PrimaryButton } from "../epochModal";
import { Octokit } from "@octokit/rest";

type Props = {};

export interface IImportTasksInput {
  name: string;
  repo: string;
  labels: string[];
}

const ImportTasks = (props: Props) => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_BOT_AUTH,
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IImportTasksInput>();

  const onSubmit: SubmitHandler<IImportTasksInput> = async (values) => {
    console.log(values);

    octokit.rest.issues
      .listForRepo({
        owner: values.name,
        repo: values.repo,
        labels: values.labels.toString(),
      })
      .then(({ data }) => {
        console.log(data);
      });

    // octokit.rest.issues
    //   .addAssignees({
    //     owner: values.name,
    //     repo: values.repo,
    //     issue_number: 10,
    //     assignees: ["avp1598"],
    //   })
    //   .then(({ data }) => {
    //     console.log(data);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "2rem" }}>
      <FieldContainer>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip
              arrow
              placement="right"
              title={"Duration of the epoch"}
            >
              <TextField
                {...field}
                label="Github Name"
                variant="standard"
                helperText={"Gig collateral should atleast be 1 WMatic"}
                required
                InputProps={{
                  endAdornment: <GitHubIcon />,
                }}
                fullWidth
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>
      <FieldContainer>
        <Controller
          name="repo"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip
              arrow
              placement="right"
              title={"Duration of the epoch"}
            >
              <TextField
                {...field}
                label="Github Repo"
                variant="standard"
                helperText={"Gig collateral should atleast be 1 WMatic"}
                required
                InputProps={{
                  endAdornment: <GitHubIcon />,
                }}
                fullWidth
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>
      <FieldContainer>
        <Controller
          name="labels"
          control={control}
          render={({ field }) => (
            <LightTooltip arrow placement="right" title={"Valuation type"}>
              <Autocomplete
                freeSolo
                options={[]}
                multiple
                onChange={(e, data) => field.onChange(data)}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Tags" />
                )}
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>

      <PrimaryButton type="submit" variant="outlined" fullWidth>
        Submit
      </PrimaryButton>
    </form>
  );
};

export default ImportTasks;
