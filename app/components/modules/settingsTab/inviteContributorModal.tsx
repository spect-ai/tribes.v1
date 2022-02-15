import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styled from "@emotion/styled";
import { TextField, FormLabel, Divider, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/router";
import { useMoralis } from "react-moralis";
import { useTribe } from "../../../../pages/tribe/[id]";
import { PrimaryButton } from "../../elements/styledComponents";
import * as CryptoJS from "crypto-js";
export interface ModalFormInput {
  address: string;
  inviteLinkAdmin: string;
  inviteLinkMember: string;
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
    setState({ ...state, text: 'Invite Accepted', open: true });
    setIsOpen(false);
  };

  const onCopyTextAdmin: SubmitHandler<ModalFormInput> = async (value) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText)
    {
      setState({ ...state, text: 'Copied To Clipboard', open: true });
      const link = value.inviteLinkAdmin
      return navigator.clipboard.writeText(link);
    }
    else
    {
      setState({ severity: 'error', text: "The Clipboard API is not available, Can't copy text", open: true });
      return Promise.reject('The Clipboard API is not available.');
    }
    
  }

  const onCopyTextMember: SubmitHandler<ModalFormInput> = async (value) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText)
    {
      setState({ ...state, text: 'Copied To Clipboard', open: true });
      const link = value.inviteLinkMember
      return navigator.clipboard.writeText(link);
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

  const encryptData = (type: string) => {
    const unencrypted = [{
      id: id,
      type: type,
      userId: user?.id
    }]
    let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(unencrypted), String(process.env.ENCRYPTION_SECRET_KEY)).toString();
    console.log('oldciper',ciphertext)
    ciphertext = ciphertext.toString().replaceAll('+','_mumbai_').replace('/','_tribes_').replace('=','_spect_');
    console.log('newciper',ciphertext)
    const link =`localhost:3000/tribe/invite/${ciphertext}`
    return link;
  }
  
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
    <form onSubmit={handleSubmit(onCopyTextAdmin)}>
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
              Invite as Admin
            </FormLabel>
            <Controller
              name="inviteLinkAdmin"
              control={control}
              defaultValue={encryptData('admin')}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  variant="outlined"
                  type="text"
                  size="medium"
                  fullWidth
                  disabled
                  // defaultValue={`localhost:3000/tribe/invite/${id}`}
                  // value={`localhost:3000/tribe/invite/${id}`}
                />
              )}
            />
          </FormItem>
          <PrimaryButton type="submit" variant="outlined" fullWidth style={{marginTop: '10px'}}>
            Invite Link As Admin
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
      <Divider variant="middle" style={{marginTop: '1rem', marginBottom: '1rem', color: '#fff'}}> OR </Divider>
      <form onSubmit={handleSubmit(onCopyTextMember)}>
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
                Invite as Member
              </FormLabel>
              <Controller
                name="inviteLinkMember"
                control={control}
                defaultValue={encryptData('member')}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    type="text"
                    size="medium"
                    fullWidth
                    disabled
                    // defaultValue={`localhost:3000/tribe/invite/${id}`}
                    // value={`localhost:3000/tribe/invite/${id}`}
                  />
                )}
              />
            </FormItem>
            <PrimaryButton type="submit" variant="outlined" fullWidth style={{marginTop: '10px'}}>
              Invite Link As Member
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