import { Autocomplete, TextField } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMoralis } from "react-moralis";
import { createTribe, updateMembers } from "../../../adapters/moralis";
import {
  FieldContainer,
  LightTooltip,
  PrimaryButton,
} from "../../elements/styledComponents";
import { chainTokenRegistry } from "../../../constants";
import { getTokenOptions } from "../../../utils/utils";

type Props = {
  setIsOpen: (isOpen: boolean) => void;
};

export interface ITribeFormInput {
  name: string;
  description: string;
  safeAddress: string;
  organization: string;
  member1: string;
  member2: string;
  member3: string;
  preferredToken: string;
  preferredChain: string;
}

const CreateTribeForm = ({ setIsOpen }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ITribeFormInput>();

  const [safes, setSafes] = useState([] as any[]);
  const [chain, setChain] = useState<string | null>("");

  const { Moralis, user } = useMoralis();
  const router = useRouter();

  const onSubmit: SubmitHandler<ITribeFormInput> = async (values) => {
    console.log(values);
    createTribe(Moralis, {
      name: values.name,
      description: values.description,
      treasuryAddress: values.safeAddress,
      preferredToken: values.preferredToken,
      preferredChain: values.preferredChain,
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
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "0rem 1rem" }}>
      <FieldContainer>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip arrow placement="right" title={"Budget"}>
              <TextField
                {...field}
                label="What's your tribe's name?"
                variant="standard"
                required
                fullWidth
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>
      <FieldContainer>
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <LightTooltip arrow placement="right" title={"Budget"}>
              <TextField
                {...field}
                label="What's your tribe about?"
                variant="standard"
                fullWidth
                multiline
              />
            </LightTooltip>
          )}
        />
      </FieldContainer>
      {/*<FieldContainer>
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
          </FieldContainer>*/}
      <FieldContainer>
        <Controller
          name="member1"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Member 1"
              variant="standard"
              helperText={""}
              fullWidth
              multiline
            />
          )}
        />
      </FieldContainer>{" "}
      <FieldContainer>
        <Controller
          name="member2"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Member 2"
              variant="standard"
              helperText={""}
              fullWidth
              multiline
            />
          )}
        />
      </FieldContainer>{" "}
      <FieldContainer>
        <Controller
          name="preferredChain"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={Object.keys(chainTokenRegistry)}
              getOptionLabel={(option) => option}
              onChange={(event: any, newValue: string | null) => {
                setChain(newValue);
                field.onChange(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Chain preference for rewards"
                />
              )}
            />
          )}
        />
      </FieldContainer>
      <FieldContainer>
        <Controller
          name="preferredToken"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={getTokenOptions(chain)}
              getOptionLabel={(option) => option}
              onChange={(event: any, newValue: string | null) => {
                field.onChange(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Token preference for rewards"
                />
              )}
            />
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
