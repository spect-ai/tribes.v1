import React, { useState } from "react";
import styled from "@emotion/styled";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  TextField,
  FormLabel,
  Autocomplete,
  Box,
  Modal,
  Fade,
} from "@mui/material";
import ContributorsDetails from "./contributorsDetails";
import InviteContributorModal from "./inviteContributorModal";
import { PrimaryButton } from "../../elements/styledComponents";
export interface SettingFormInput {
  name: string;
  tagline: string;
  description: string;
  tags: string;
  discord: string;
  twitter: string;
  site: string;
}

const data = [
  { address: "0x350ba81398f44Bf06cd176004a275c451F0A1d91", role: "admin" },
  { address: "0x350ba81398f44Bf06cd176004a275c4a120A124u", role: "contrbutor" },
  { address: "0x350ba81398f44Bf06cd176004a275c4a120A124u", role: "contrbutor" },
  { address: "0x350ba81398f44Bf06cd176004a275c4a120A124u", role: "contrbutor" },
  { address: "0x350ba81398f44Bf06cd176004a275c4a120A124u", role: "contrbutor" },
];

const Settings = () => {
  const [tabNo, setTabNo] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SettingFormInput>();

  const onSubmit: SubmitHandler<SettingFormInput> = async (values) => {
    console.log(values);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  return (
    <MainContainer>
      <SettingTabContainer>
        <TabHeader>
          <div>Settings</div>
        </TabHeader>
        <TabItems>
          <TabItem
            onClick={() => setTabNo(1)}
            style={
              tabNo == 1
                ? {
                    backgroundColor: "#313247",
                    borderRadius: "10px",
                    padding: "0px 12px",
                  }
                : {}
            }
          >
            Profile
          </TabItem>
          <TabItem
            onClick={() => setTabNo(2)}
            style={
              tabNo == 2
                ? {
                    backgroundColor: "#313247",
                    borderRadius: "10px",
                    padding: "0px 12px",
                  }
                : {}
            }
          >
            Contributors
          </TabItem>
        </TabItems>
      </SettingTabContainer>
      {tabNo == 1 ? (
        <SettingContainer>
          <Header>Organise Profile</Header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <SettingsBlock>
              <Setting>
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
                    Name
                  </FormLabel>
                  <Controller
                    name="name"
                    control={control}
                    defaultValue="Test Net"
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        variant="outlined"
                        type="text"
                        size="small"
                        fullWidth
                        style={{ width: "400px" }}
                        placeholder="Name"
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
                    Tagline
                  </FormLabel>
                  <Controller
                    name="tagline"
                    control={control}
                    defaultValue=""
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        variant="outlined"
                        type="text"
                        size="small"
                        fullWidth
                        style={{ width: "400px" }}
                        placeholder="Tagline"
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
                    Description
                  </FormLabel>
                  <Controller
                    name="description"
                    control={control}
                    defaultValue=""
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        variant="outlined"
                        type="text"
                        size="small"
                        multiline
                        minRows="3"
                        fullWidth
                        style={{ width: "400px" }}
                        placeholder="Description"
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
                    Tags
                  </FormLabel>
                  <Controller
                    name="tags"
                    control={control}
                    defaultValue=""
                    render={({ field, fieldState }) => (
                      <Autocomplete
                        freeSolo
                        options={[]}
                        multiple
                        onChange={(e, data) => field.onChange(data)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            size="small"
                            fullWidth
                            style={{ width: "400px" }}
                            placeholder="Tags"
                          />
                        )}
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
                    Socials
                  </FormLabel>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-end",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ color: "#5a6972", marginRight: "12px" }}>
                      <i className="fab fa-discord fa-xs" />
                    </div>
                    <Controller
                      name="discord"
                      control={control}
                      defaultValue=""
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          variant="outlined"
                          type="text"
                          size="small"
                          fullWidth
                          style={{ width: "368px" }}
                          placeholder="https://discord.gg/invitecode"
                        />
                      )}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-end",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ color: "#5a6972", marginRight: "16px" }}>
                      <i className="fab fa-twitter fa-xs" />
                    </div>
                    <Controller
                      name="twitter"
                      control={control}
                      defaultValue=""
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          variant="outlined"
                          type="text"
                          size="small"
                          fullWidth
                          style={{ width: "368px" }}
                          placeholder="https://twitter.com/profile"
                        />
                      )}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-end",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ color: "#5a6972", marginRight: "12px" }}>
                      <i className="fa fa-link fa-xs" />
                    </div>
                    <Controller
                      name="site"
                      control={control}
                      defaultValue=""
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          variant="outlined"
                          type="text"
                          size="small"
                          fullWidth
                          style={{ width: "368px" }}
                          placeholder="https://my-site.com"
                        />
                      )}
                    />
                  </Box>
                </FormItem>
                <ButtonWrapper>
                  <PrimaryButton
                    type="submit"
                    variant="outlined"
                    style={{ padding: "8px 30px" }}
                  >
                    Submit
                  </PrimaryButton>
                </ButtonWrapper>
              </Setting>
            </SettingsBlock>
          </form>
        </SettingContainer>
      ) : (
        <SettingContainer>
          <ContributorHeader>
            <div>Contributors Setting</div>
            <InviteButton onClick={handleOpenModal}>
              <div style={{ color: "#5a6972", marginRight: "5px" }}>
                <i className="fa fa-link fa-xs" />
              </div>
              Invite Contributor
            </InviteButton>
          </ContributorHeader>
          <SettingsBlock>
            {data.map((role, index) => (
              <ContributorsDetails
                address={role.address}
                role={role.role}
                key={index}
              />
            ))}
          </SettingsBlock>
          <Modal open={openModal} onClose={handleClose} closeAfterTransition>
            <Fade in={openModal} timeout={500}>
              <Box sx={modalStyle}>
                <InviteContributorModal setIsOpen={setOpenModal} />
              </Box>
            </Fade>
          </Modal>
        </SettingContainer>
      )}
    </MainContainer>
  );
};

export default Settings;

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 50%;
  margin-top: 20px;
  margin-left: 250px;
`;

const SettingTabContainer = styled.div`
  display: flex;
  flex: 2;
  flex-direction: column;
  border: 1px solid #282b2f;
  border-radius: 10px;
  min-width: 180px;
  min-height: 400px;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 1rem;
  background-color: #1a1a29;
`;

const TabHeader = styled.div`
  border-bottom: 2px solid #282b2f;
  font-size: 16px;
`;

const TabItems = styled.div`
  font-size: 20px;
  padding: 10px 5px;
  width: 100%;
`;

const TabItem = styled.div`
  margin-bottom: 10px;
  &:hover {
    cursor: pointer;
    color: #99ccff;
  }
`;

const SettingContainer = styled.div`
  display: flex;
  flex: 5;
  flex-direction: column;
  margin-left: 30px;
  width: 100%;
`;

const Header = styled.div`
  font-size: 20px;
  margin-top: 10px;
  border-bottom: 2px solid #282b2f;
`;

const SettingsBlock = styled.div`
  display: flex;
  flex-direction: column !important;
`;

const Setting = styled.div``;

const FormItem = styled.div`
  margin-bottom: 5px;
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

const ContributorHeader = styled.div`
  font-size: 20px;
  margin-top: 10px;
  border-bottom: 2px solid #282b2f;
  display: flex;
  flex-direction: row;
  width: 600px;
  justify-content: space-between;
`;

const InviteButton = styled.div`
  color: "#ffffff" !important;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  font-size: 15px;
  border: 1px solid #282b2f;
  width: 28%;
  margin-bottom: 5px;
  margin-top: -5px;
  display: flex;
  flex-direction: row;

  &:hover {
    cursor: pointer;
    border: 1px solid #2164f6;
  }
`;

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "30rem",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 3,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
};
