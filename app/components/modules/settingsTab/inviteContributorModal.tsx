import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styled from "@emotion/styled";
import { TextField, FormLabel, Divider, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/router";
import { useMoralis } from "react-moralis";
import { useTribe } from "../../../../pages/tribe/[id]";
import { PrimaryButton } from "../../elements/styledComponents";
export interface ModalFormInput {
  address: string;
  inviteLink: string
}

const InviteContributorModal = ({ setIsOpen }: any) => {
  const router = useRouter();
  const { id } = router.query;
  const { Moralis, user } = useMoralis();
  const { getTeam, setTribe } = useTribe();
  const [state, setState] = useState({
    open: false,
    text: '',
    severity: 'success'
  })
  const { open, text, severity } = state;
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ModalFormInput>();

  const onSubmit: SubmitHandler<ModalFormInput> = async (value) => {
    console.log(value.address);
    setState({ ...state, text: 'Invite Accepted', open: true });
    setIsOpen(false);
  };

  const onCopyText: SubmitHandler<ModalFormInput> = async (value) => {
    console.log('copy',value.inviteLink);
    if (navigator && navigator.clipboard && navigator.clipboard.writeText)
    {
      setState({ ...state, text: 'Copied To Clipboard', open: true });
      return navigator.clipboard.writeText(value.inviteLink);
    }
    else
    {
      setState({ severity: 'error', text: "The Clipboard API is not available, Can't copy text", open: true });
      return Promise.reject('The Clipboard API is not available.');
    }
    
  }

  const handleClose = () => {
    setState({ ...state, open: false });
  };
  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)}>
      <Wrapper>
        <FormItem>
          <FormLabel
            id="demo-row-radio-buttons-group-label"
            style={{
              fontSize: "11px",
              color: "#91909D",
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            Address
          </FormLabel>
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
        <PrimaryButton type="submit" variant="outlined" fullWidth style={{marginTop: '10px'}}>
          Invite Contributor
        </PrimaryButton>
      </Wrapper>
    </form>
    <Divider variant="middle" style={{marginTop: '1rem', marginBottom: '1rem', color: '#fff'}}> OR </Divider>
    <form onSubmit={handleSubmit(onCopyText)}>
      <Wrapper>
          <FormItem>
            <FormLabel
              id="demo-row-radio-buttons-group-label"
              style={{
                fontSize: "11px",
                color: "#91909D",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              Invite Link
            </FormLabel>
            <Controller
              name="inviteLink"
              control={control}
              defaultValue={`localhost:3000/tribe/invite/${id}`}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  variant="outlined"
                  type="text"
                  size="medium"
                  fullWidth
                  disabled
                  defaultValue={`localhost:3000/tribe/invite/${id}`}
                  value={`localhost:3000/tribe/invite/${id}`}
                />
              )}
            />
          </FormItem>
          <PrimaryButton type="submit" variant="outlined" fullWidth style={{marginTop: '10px'}}>
            Copy Invite Link
          </PrimaryButton>
        </Wrapper>
        <Snackbar
          autoHideDuration={2000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={open}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity={String(severity)} sx={{ width: '100%' }}>
            {text}
          </Alert>
        </Snackbar>
      </form>
    </>
  );
};

export default InviteContributorModal;

const Wrapper = styled.div`
  color: #fff;
`;

const FormItem = styled.div`
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`