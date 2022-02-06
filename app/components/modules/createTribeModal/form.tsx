import { Autocomplete, TextField } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMoralis } from "react-moralis";
import { getUserSafes } from "../../../adapters/gnosis";
import { createTribe, updateMembers } from "../../../adapters/moralis";
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
  member1: string;
  member2: string;
  member3: string;
  member4: string;
}

const CreateTribeForm = ({ setIsOpen }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ITribeFormInput>();

  const [safes, setSafes] = useState([] as any[]);
  const { Moralis, user } = useMoralis();
  const router = useRouter();

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

      updateMembers(Moralis, {
        teamId: res.get("teamId"),
        members: [
          {
            ethAddress: values.member1,
            role: "admin",
            updateType: "invite",
          },
          {
            ethAddress: values.member2,
            role: "admin",
            updateType: "invite",
          },
          {
            ethAddress: values.member3,
            role: "admin",
            updateType: "invite",
          },
        ],
      }).then((res: any) => {
        console.log(res);
      });
      setIsOpen(false);
      router.push({
        pathname: `/tribe/${res.get("teamId")}`,
      });
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
      <FieldContainer>
        <Controller
          name="member1"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip arrow placement="right" title={"Budget"}>
              <TextField
                {...field}
                label="Member 1"
                variant="standard"
                helperText={""}
                required
                fullWidth
                multiline
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>{" "}
      <FieldContainer>
        <Controller
          name="member2"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip arrow placement="right" title={"Budget"}>
              <TextField
                {...field}
                label="Member 2"
                variant="standard"
                helperText={""}
                required
                fullWidth
                multiline
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>{" "}
      <FieldContainer>
        <Controller
          name="member3"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip arrow placement="right" title={"Budget"}>
              <TextField
                {...field}
                label="Member 3"
                variant="standard"
                helperText={""}
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
