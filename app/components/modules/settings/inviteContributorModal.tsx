import React, {useEffect, useState} from 'react'
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styled from '@emotion/styled';
import {
    TextField,
    FormLabel,
  } from "@mui/material";
  import { PrimaryButton } from "../epochModal";
  import { useRouter } from "next/router";
  import { useMoralis } from "react-moralis";
  import { useTribe } from "../../../../pages/tribe/[id]";
export interface ModalFormInput {
    address: string;
  }

const InviteContributorModal = ({setIsOpen}:any) => {
    const router = useRouter();
    const { id } = router.query;
    const { Moralis, user } = useMoralis();
    const { getTeam, setTribe } = useTribe();
    const {
        handleSubmit,
        control,
        formState: { errors },
      } = useForm<ModalFormInput>();

      const onSubmit: SubmitHandler<ModalFormInput> = async (value) => {
          console.log(value)
          setIsOpen(false);
      }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Wrapper>
                <FormItem>
                    <FormLabel id="demo-row-radio-buttons-group-label" style={{fontSize: '11px', color:'#91909D', textTransform: 'uppercase', fontWeight: 'bold'}}>Address</FormLabel>
                    <Controller
                        name="address"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                            {...field}
                            variant="outlined"
                            type="text"
                            size="medium"
                            fullWidth
                            
                            placeholder="Wallet Address"
                        />
                        )}
                        />
                </FormItem>
                <PrimaryButton type="submit" variant="outlined" fullWidth>
                    Invite Contributor
                </PrimaryButton>
            </Wrapper>
        </form>
    )
}

export default InviteContributorModal

const Wrapper = styled.div`
    color: #fff;
`

const FormItem = styled.div`
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
`
