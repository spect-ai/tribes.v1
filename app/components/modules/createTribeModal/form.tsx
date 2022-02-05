import { Autocomplete, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMoralis } from "react-moralis";
import { getUserSafes } from "../../../adapters/gnosis";
import { createTribe } from "../../../adapters/moralis";
import { FieldContainer, LightTooltip } from "../epochForm";
import { PrimaryButton } from "../epochModal";

type Props = {
  setIsOpen: (isOpen: boolean) => void;
};

export interface ITribeFormInput {
  name: string;
  mission: string;
  safeAddress: string;
  organization: string;
}

const CreateTribeForm = ({ setIsOpen }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ITribeFormInput>();

  const [safes, setSafes] = useState([] as any[]);
  const { Moralis, user } = useMoralis();

  useEffect(() => {
    getUserSafes(user?.get("ethAddress")).then((res) => {
      setSafes(res.safes);
    });
  }, []);

  const onSubmit: SubmitHandler<ITribeFormInput> = async (values) => {
    console.log(values);
    createTribe(Moralis, {
      name: values.name,
      mission: values.mission,
      treasuryAddress: values.safeAddress,
      organization: values.organization,
      openApplications: false,
      applicationRequirements: "",
      ethAddress: user?.get("ethAddress"),
    }).then((res: any) => {
      console.log(res);
      setIsOpen(false);
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "2rem" }}>
      <FieldContainer>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip arrow placement="right" title={"Budget"}>
              <TextField
                {...field}
                label="Name"
                variant="standard"
                helperText={"Name of the tribe"}
                required
                fullWidth
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>
      <FieldContainer>
        <Controller
          name="mission"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip arrow placement="right" title={"Budget"}>
              <TextField
                {...field}
                label="Mission"
                variant="standard"
                helperText={"Mission of the Tribe"}
                required
                fullWidth
                multiline
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>
      <FieldContainer>
        <Controller
          name="safeAddress"
          control={control}
          render={({ field }) => (
            <LightTooltip arrow placement="right" title={"Valuation type"}>
              <Autocomplete
                options={safes}
                getOptionLabel={(option) => option}
                onChange={(e, data) => field.onChange(data)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    variant="standard"
                    label="Safe Address"
                    helperText={
                      "Gnosis Safe Address which will be used for the treasury"
                    }
                  />
                )}
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>
      <FieldContainer>
        <Controller
          name="organization"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip arrow placement="right" title={"Budget"}>
              <TextField
                {...field}
                label="Organization"
                variant="standard"
                helperText={"Name of the org/DAO that is organizing the tribe"}
                required
                fullWidth
                multiline
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>

      <PrimaryButton type="submit" variant="outlined" fullWidth>
        Create Tribe
      </PrimaryButton>
    </form>
  );
};

export default CreateTribeForm;
