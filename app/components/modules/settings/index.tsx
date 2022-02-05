import React from 'react'
import styled from '@emotion/styled';
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
    TextField,
    Switch,
    TextareaAutosize,
    Avatar,
    FormControlLabel,
    FormLabel
  } from "@mui/material";
import { PrimaryButton } from "../epochModal";

export interface SettingFormInput {
    startTime: any;
    duration: number;
    type: string;
    budget: number;
  }

  
const Settings = () => {
    const {
        handleSubmit,
        control,
        formState: { errors },
      } = useForm<SettingFormInput>();

      const onSubmit: SubmitHandler<SettingFormInput> = async (values) => {
        console.log(values);
      };

    return (
        <Wrapper>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormBox>
                    <FormWrapper>
                        <FormLabel id="demo-row-radio-buttons-group-label">Email</FormLabel>
                        <FormItem>
                            <Controller
                            name="email"
                            control={control}
                            defaultValue='ateet@gmail.com'
                            render={({ field, fieldState }) => (
                                <TextField
                                {...field}
                                variant="standard"
                                type="email"
                                required
                                error={fieldState.error ? true : false}
                                fullWidth
                            />
                            )}
                            />
                        </FormItem>
                        <FormLabel id="demo-row-radio-buttons-group-label">Description</FormLabel>
                        <FormItem>
                            <Controller
                            name="description"
                            control={control}
                            defaultValue='I done this and that.... '
                            render={({ field, fieldState }) => (
                                <TextareaAutosize
                                    {...field}
                                    minRows={5}
                                    placeholder="Description"
                                    style={{width: '100%', backgroundColor: 'inherit', color: '#99ccff'}}
                                />

                            )}
                            />
                        </FormItem>
                    </FormWrapper>
                    <IconWrapper>
                        <ProfileIcon>
                            <Avatar
                                alt="Remy Sharp"
                                src="/static/images/avatar/1.jpg"
                                sx={{ width: 56, height: 56, bgcolor: '#99ccff' }}
                            >
                                B
                            </Avatar>
                        </ProfileIcon>
                        <ProfileJobStatus>
                            <Controller
                                name="job"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <FormControlLabel
                                        {...field}
                                        control={<Switch color="primary" />}
                                        label="Open For Job"
                                        labelPlacement="start"
                                        style={{color:'#99ccff'}}
                                    />
                                )}
                                />
                        </ProfileJobStatus>
                    </IconWrapper>
                </FormBox>
                <ButtonWrapper>
                    <PrimaryButton type="submit" variant="outlined" fullWidth>
                        Submit
                    </PrimaryButton>
                </ButtonWrapper>
            </form>
        </Wrapper>
    )
}

export default Settings

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    & > div {
        display: flex;
        justify-content: space-between;
        padding: 1rem 2rem;
    }
`

const FormWrapper = styled.div`
    display: flex;
    flex-direction: column;
`

const IconWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: -100px;
    padding-left: 11rem;
`

const FormBox = styled.div`
    display: flex;
    flex-direction: row;
    padding: 4rem;
    justify-content: space-between;
`

const FormItem = styled.div`
    padding: 2rem 0rem;
`

const ProfileIcon = styled.div`
    padding: 2rem 0rem;
    /* align-self: flex-start; */
`

const ProfileJobStatus = styled.div`
    padding: 2rem 2rem;
    margin-top: 30px;
`

const ButtonWrapper = styled.div`
    width: 80%;
    margin-left: 50px;
    margin-top: -40px;
`