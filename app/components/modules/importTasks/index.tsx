import {
  Autocomplete,
  Button,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import { FieldContainer, LightTooltip } from "../epochForm";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { PrimaryButton } from "../epochModal";
import { Octokit } from "@octokit/rest";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTribe } from "../../../../pages/tribe/[id]";
import { createTasks } from "../../../adapters/moralis";
import Moralis from "moralis/types";
import { useMoralis } from "react-moralis";

type Props = {
  setIsOpen: (isOpen: boolean) => void;
};

export interface IImportTasksInput {
  repo: string;
  labels: string[];
  issues: { url: string }[];
}

const LinkContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  paddingBottom: "1rem",
}));

const ImportTasks = ({ setIsOpen }: Props) => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_BOT_AUTH,
  });
  const { setToDoTasks, setRepo, tribe } = useTribe();
  const { Moralis, user } = useMoralis();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IImportTasksInput>();

  const { fields, append, remove } = useFieldArray({
    name: "issues",
    control,
  });

  const onSubmit: SubmitHandler<IImportTasksInput> = async (values) => {
    console.log(values);
    const splitValues = values.repo.split("/");
    setRepo(values.repo);
    octokit.rest.issues
      .listForRepo({
        owner: splitValues[3],
        repo: splitValues[4],
        labels: values.labels.toString(),
      })
      .then(({ data }) => {
        console.log(data);
        const issues = data.map((issue) => {
          return {
            title: issue.title,
            issueNumber: issue.number,
            issueLink: issue.url,
          };
        });
        createTasks(Moralis, tribe.latestTaskEpoch, issues, "github").then(
          (res: any) => {
            console.log(res);
          }
        );

        setIsOpen(false);
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
                label="Github Repo Link"
                variant="standard"
                helperText={
                  "Provide the repo link from where you want to import the tasks"
                }
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
                  <TextField
                    {...params}
                    variant="standard"
                    label="Tags"
                    helperText="Add the labels of the issues you want to import"
                  />
                )}
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>

      <Typography
        fontSize={18}
        color="text.secondary"
        gutterBottom
        sx={{ textAlign: "center", width: "100%" }}
      >
        Or
      </Typography>
      <Button
        sx={{ color: "#99ccff", my: 2 }}
        color="inherit"
        endIcon={<AddCircleOutlineIcon />}
        id="bAddLink"
        onClick={() => append({ url: "" })}
      >
        Add Issue link
      </Button>
      {fields.map((field, index) => (
        <LinkContainer key={index}>
          <Controller
            name={`issues.${index}.url`}
            control={control}
            rules={{ minLength: 3 }}
            render={({ field, fieldState }) => (
              <LightTooltip arrow placement="bottom" title={"Issue url"}>
                <TextField
                  {...field}
                  label="Issue"
                  id={`tLinkName${index}`}
                  variant="standard"
                  helperText={"The issue URL"}
                  fullWidth
                  required
                  error={fieldState.error ? true : false}
                />
              </LightTooltip>
            )}
          />
          <Button
            color="inherit"
            variant="outlined"
            sx={{
              m: 2,
              color: "#f45151",
              textTransform: "none",
            }}
            endIcon={<DeleteOutlineIcon />}
            onClick={() => remove(index)}
          >
            Remove
          </Button>
        </LinkContainer>
      ))}

      <PrimaryButton type="submit" variant="outlined" fullWidth>
        Submit
      </PrimaryButton>
    </form>
  );
};

export default ImportTasks;
