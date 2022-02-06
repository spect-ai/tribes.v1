import React, { useState } from "react";
import styled from "@emotion/styled";
import { Avatar, Fade, Modal, Box, FormLabel, TextField } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

export interface ModalFormInput {
  walletAddress: string;
  flowRate: number;
}

const ContributorsDetails = ({ address, role }: any) => {
  const [openModal, setOpenModal] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ModalFormInput>();
  const handleClose = () => setOpenModal(false);
  const onSubmit: SubmitHandler<ModalFormInput> = async (values) => {
    console.log(values);
    setOpenModal(false);
  };
  return (
    <Wrapper
      onClick={() => {
        setOpenModal(true);
      }}
    >
      <Details>
        <Avatar
          sx={{
            bgcolor: "#790D9F",
            color: "#fff",
            marginRight: "10px",
            width: 30,
            height: 30,
            fontSize: "15px",
          }}
        >
          OP
        </Avatar>
        <div style={{ marginTop: "2px" }}>
          {`${address.slice(0, 10)}...${address.slice(35)}`}
        </div>
      </Details>
      <Role>{role}</Role>
      <Modal open={openModal} onClose={handleClose} closeAfterTransition>
        <Fade in={openModal} timeout={100}>
          <Box sx={modalStyle}>
            <ModalWrapper>
              <form onSubmit={handleSubmit(onSubmit)}>
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
                    Wallet Address
                  </FormLabel>
                  <Controller
                    name="walletAddress"
                    control={control}
                    defaultValue={address}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        variant="outlined"
                        type="text"
                        size="small"
                        fullWidth
                        placeholder="Wallet Address"
                      />
                    )}
                  />
                </FormItem>
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
                    Flow Rate
                  </FormLabel>
                  <Controller
                    name="flowRate"
                    control={control}
                    defaultValue={0}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        variant="outlined"
                        type="text"
                        size="small"
                        fullWidth
                        placeholder="Flow Rate"
                      />
                    )}
                  />
                </FormItem>
                <ButtonWrapper>
                  <SubmitButton type="submit">Start Stream</SubmitButton>
                </ButtonWrapper>
              </form>
            </ModalWrapper>
          </Box>
        </Fade>
      </Modal>
    </Wrapper>
  );
};

export default ContributorsDetails;

const Wrapper = styled.div`
  width: 100%;
  border-radius: 4px;
  padding: 7px 10px;
  display: flex;
  background: #2a2c38;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 3px solid #313345;
  margin: 5px 0px;

  &:hover {
    padding: 9px 10px;
    background: #313345;
  }
`;

const Details = styled.div`
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  flex-direction: row;
`;
const Role = styled.div`
  color: #91909d;
  font-size: 13px;
  font-weight: 800;
`;

const ModalWrapper = styled.div``;

const FormItem = styled.div`
  margin-bottom: 15px;
`;

const ButtonWrapper = styled.div`
  width: 100%;
`;

const SubmitButton = styled.button`
  color: "#ffffff" !important;
  border-radius: 11px;
  padding: 0.5rem 2rem;
  font-weight: bold;
  background: #2164f6;
  font-size: 15px;
`;
