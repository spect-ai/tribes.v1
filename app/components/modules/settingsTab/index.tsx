/* eslint-disable jsx-a11y/label-has-associated-control */
import styled from '@emotion/styled';
import { Avatar, Box, FormLabel, Switch, TextField } from '@mui/material';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { useMoralis } from 'react-moralis';
import { useTribe } from '../../../../pages/tribe/[id]';
import useMoralisFunction from '../../../hooks/useMoralisFunction';
import { PrimaryButton } from '../../elements/styledComponents';

export interface SettingFormInput {
  name: string;
  description: string;
  isPublic: boolean;
  discord: string;
  twitter: string;
  github: string;
  logo: string;
}

export const notify = (text: string, type?: string) => {
  if (type === 'error') {
    toast.error(text, {
      duration: 4000,
      position: 'top-center',
      style: { fontSize: '1rem' },
    });
  } else {
    toast.success(text, {
      duration: 4000,
      position: 'top-center',
      style: { fontSize: '1rem' },
    });
  }
};

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 2rem;
`;

const SettingContainer = styled.div`
  display: flex;
  flex: 5;
  flex-direction: column;
  margin-left: 30px;
  width: 100%;
`;

const FormItem = styled.div`
  margin-bottom: 1rem;
  width: 50%;
`;

const ButtonWrapper = styled.div`
  width: 100%;
`;

function Settings() {
  const { tribe, setTribe } = useTribe();
  const { Moralis } = useMoralis();
  const [logo, setLogo] = useState(tribe.logo);
  const { runMoralisFunction } = useMoralisFunction();
  const { handleSubmit, control, setValue } = useForm<SettingFormInput>({
    defaultValues: {
      logo: tribe.logo,
      isPublic: tribe.isPublic,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<SettingFormInput> = async (values) => {
    setIsLoading(true);
    runMoralisFunction('updateTeam', {
      name: values.name,
      description: values.description,
      isPublic: values.isPublic,
      discord: values.discord,
      twitter: values.twitter,
      github: values.github,
      logo,
      teamId: tribe.teamId,
    })
      .then((res: any) => {
        setTribe(res);
        setIsLoading(false);
        notify('Updated Tribe!');
      })
      .catch((err: any) => {
        notify(err.message, 'error');
        setIsLoading(false);
      });
  };

  return (
    <MainContainer>
      <Toaster />
      <SettingContainer>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormItem>
            <Controller
              name="name"
              control={control}
              defaultValue={tribe.name}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  variant="outlined"
                  type="text"
                  size="small"
                  fullWidth
                  placeholder="Name"
                  label="Tribe name"
                  color="secondary"
                />
              )}
            />
          </FormItem>
          <FormItem>
            <Controller
              name="description"
              control={control}
              defaultValue={tribe.description}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  variant="outlined"
                  type="text"
                  size="small"
                  minRows="3"
                  fullWidth
                  placeholder="Description"
                  multiline
                  label={tribe.description ? 'Description' : ''}
                  color="secondary"
                />
              )}
            />
          </FormItem>
          <FormItem>
            <FormLabel
              id="demo-row-radio-buttons-group-label"
              sx={{ fontSize: 14, mr: 2 }}
            >
              Make public
            </FormLabel>
            <Controller
              name="isPublic"
              control={control}
              render={({ field }) => (
                <Switch
                  {...field}
                  color="info"
                  defaultChecked={tribe.isPublic}
                />
              )}
            />
          </FormItem>
          <FormItem>
            <FormLabel
              id="demo-row-radio-buttons-group-label"
              sx={{ fontSize: 14 }}
            >
              Socials
            </FormLabel>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                marginBottom: '10px',
                mt: 2,
              }}
            >
              <div style={{ color: '#5a6972', marginRight: '12px' }}>
                <i className="fab fa-discord fa-xs" />
              </div>
              <Controller
                name="discord"
                control={control}
                defaultValue={tribe.discord}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    type="text"
                    size="small"
                    fullWidth
                    placeholder="https://discord.gg/invitecode"
                    color="secondary"
                  />
                )}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                marginBottom: '10px',
              }}
            >
              <div style={{ color: '#5a6972', marginRight: '16px' }}>
                <i className="fab fa-twitter fa-xs" />
              </div>
              <Controller
                name="twitter"
                control={control}
                defaultValue={tribe.twitter}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    type="text"
                    size="small"
                    fullWidth
                    placeholder="https://twitter.com/profile"
                    color="secondary"
                  />
                )}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                marginBottom: '10px',
              }}
            >
              <div style={{ color: '#5a6972', marginRight: '12px' }}>
                <i className="fab fa-github" />
              </div>
              <Controller
                name="github"
                control={control}
                defaultValue={tribe.github}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    type="text"
                    size="small"
                    fullWidth
                    placeholder="https://my-site.com"
                    color="secondary"
                  />
                )}
              />
            </Box>
          </FormItem>
          <FormItem>
            <FormLabel
              id="demo-row-radio-buttons-group-label"
              sx={{ fontSize: 14 }}
            >
              Tribe Logo
            </FormLabel>
            <Avatar src={logo} sx={{ height: 60, width: 60 }} />
            <input
              accept="image/*"
              hidden
              id="contained-button-file"
              multiple
              type="file"
              onChange={async (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  const moralisFile = new Moralis.File(file.name, file);
                  const res = (await moralisFile.saveIPFS()) as any;
                  setValue('logo', res._ipfs);
                  setLogo(res._ipfs);
                }
              }}
            />
            <label htmlFor="contained-button-file">
              <PrimaryButton
                // @ts-ignore
                component="span"
              >
                Edit
              </PrimaryButton>
            </label>
          </FormItem>
          <ButtonWrapper>
            <PrimaryButton
              type="submit"
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ width: '20%', borderRadius: 2 }}
              loading={isLoading}
            >
              Save
            </PrimaryButton>
          </ButtonWrapper>
        </form>
      </SettingContainer>
    </MainContainer>
  );
}

export default Settings;
