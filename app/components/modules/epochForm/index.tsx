import { Autocomplete, InputAdornment, styled, TextField, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { DateTimePicker, LocalizationProvider } from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterDayjs";
import dayjs from "dayjs";
import { PrimaryButton } from "../epochModal";
import { useMoralis } from "react-moralis";
import { startEpoch } from "../../../adapters/moralis";

type Props = {
  handleNext: () => void;
};

export interface IEpochFormInput {
  startTime: any;
  duration: number;
  type: string;
  budget: number;
}

export const FieldContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  paddingBottom: "1rem",
}));

export const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#eaeaea",
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: "0.8rem",
    maxWidth: "22rem",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#eaeaea",
  },
}));

const EpochForm = ({ handleNext }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IEpochFormInput>();
  const { Moralis, user } = useMoralis();

  const onSubmit: SubmitHandler<IEpochFormInput> = async (values) => {
    console.log(values);
    // TODODO: Need to update tribe metadata (latestContributionEpoch or latestTaskEpoch) with the epoch id returned
    startEpoch(Moralis, {
      startTime: new Date(values.startTime).getTime(),
      duration: values.duration * 60000, //convert to milliseconds
      type: values.type,
      strategy: "quadratic",
      budget: values.budget,
      teamId: 7, // TODODO
    }).then((res: any) => {
      console.log(res);
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "2rem" }}>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <FieldContainer>
          <Controller
            name="startTime"
            control={control}
            defaultValue={dayjs()}
            render={({ field }) => (
              <DateTimePicker
                {...field}
                label="Start Time"
                minDateTime={dayjs()}
                onChange={field.onChange}
                renderInput={(params) => (
                  <LightTooltip arrow placement="right" title={"start time"}>
                    <TextField {...params} fullWidth helperText={params.error && "Enter a date later than now"} />
                  </LightTooltip>
                )}
              />
            )}
          />
        </FieldContainer>
      </LocalizationProvider>
      <FieldContainer>
        <Controller
          name="duration"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip arrow placement="right" title={"Duration of the epoch"}>
              <TextField
                {...field}
                label="Duration"
                variant="standard"
                helperText={fieldState.error?.type === "min" && "Gig collateral should atleast be 1 WMatic"}
                type="number"
                required
                error={fieldState.error ? true : false}
                inputProps={{ min: 1, step: 1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="start">Minutes</InputAdornment>,
                }}
                fullWidth
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>
      <FieldContainer>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <LightTooltip arrow placement="right" title={"Valuation type"}>
              <Autocomplete
                options={["Task", "Contribution"]}
                getOptionLabel={(option) => option}
                onChange={(e, data) => field.onChange(data)}
                renderInput={(params) => <TextField {...params} required variant="standard" label="Valuation Type" />}
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>
      <FieldContainer>
        <Controller
          name="budget"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip arrow placement="right" title={"Budget"}>
              <TextField
                {...field}
                label="Budget"
                variant="standard"
                helperText={fieldState.error?.type === "min" && "Gig collateral should atleast be 1 WMatic"}
                type="number"
                required
                error={fieldState.error ? true : false}
                inputProps={{ min: 1, step: 1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="start">WMatic</InputAdornment>,
                }}
                fullWidth
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>
      <PrimaryButton type="submit" variant="outlined" fullWidth>
        Create Epoch
      </PrimaryButton>
    </form>
  );
};

export default EpochForm;
