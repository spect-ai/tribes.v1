import styled from "@emotion/styled";
import {
  Avatar,
  Grow,
  IconButton,
  Modal,
  TextField,
  Typography,
  styled as MUIStyled,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { PrimaryButton, SidebarButton } from "../../elements/styledComponents";
import CloseIcon from "@mui/icons-material/Close";
import { Box } from "@mui/system";
import { useMoralis } from "react-moralis";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import { OptionsButton } from "../themePopover";
import { ButtonText } from "../exploreSidebar";
import { useGlobal } from "../../../context/globalContext";
import { useProfileInfo } from "../../../hooks/useProfileInfo";

type Props = {};

const ProfileSettings = (props: Props) => {
  const { Moralis, user } = useMoralis();
  const { avatar } = useProfileInfo();

  const [username, setUsername] = useState(user?.get("username"));
  const [picture, setPicture] = useState("");
  // const [userEmail, setuserEmail] = useState(user?.get("email"));
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const {
    state: { currentUser },
  } = useGlobal();
  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    setPicture(avatar);
  }, [avatar]);

  return (
    <>
      <OptionsButton color="inherit" onClick={() => setIsOpen(true)}>
        <SettingsIcon />
        <ButtonText>Profile Settings</ButtonText>
      </OptionsButton>
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <ModalContainer>
            <Heading>
              <Typography sx={{ color: "#99ccff" }}>Profile</Typography>
              <Box sx={{ flex: "1 1 auto" }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Heading>
            <ModalContent>
              <Backdrop
                sx={{
                  color: "#eaeaea",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={isLoading}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CircularProgress color="inherit" />
                  <Typography sx={{ mt: 2, mb: 1, color: "#eaeaea" }}>
                    {"Updating profile..."}
                  </Typography>
                </Box>
              </Backdrop>
              <FieldContainer>
                <Avatar src={picture} sx={{ height: 60, width: 60 }} />
                <input
                  accept="image/*"
                  hidden
                  id="contained-button-file"
                  multiple
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      setIsLoading(true);
                      const moralisFile = new Moralis.File(file.name, file);
                      user?.set("profilePicture", moralisFile);
                      user?.save().then((res: any) => {
                        setIsLoading(false);
                        setPicture(res.get("profilePicture")._url);
                      });
                    }
                  }}
                />
                <label htmlFor="contained-button-file">
                  {/* @ts-ignore */}
                  <PrimaryButton sx={{ borderRadius: 1 }} component="span">
                    Edit
                  </PrimaryButton>
                </label>
              </FieldContainer>
              <FieldContainer>
                <TextField
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  placeholder="Username"
                  size="small"
                  color="secondary"
                  onBlur={() => {
                    user?.set("username", username);
                    user?.save();
                  }}
                />
              </FieldContainer>
              {/* <FieldContainer>
                <TextField
                  placeholder="Email"
                  value={currentUser?.email}
                  fullWidth
                  size="small"
                  inputProps={{ readOnly: true }}
                  color="secondary"
                />
              </FieldContainer> */}
            </ModalContent>
          </ModalContainer>
        </Grow>
      </Modal>
    </>
  );
};
// @ts-ignore
const ModalContainer = MUIStyled(Box)(({ theme }) => ({
  position: "absolute" as "absolute",
  top: "10%",
  left: "35%",
  transform: "translate(-50%, -50%)",
  width: "30rem",
  border: "2px solid #000",
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
}));

const Heading = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #eaeaea;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid #5a6972;
  padding: 16px;
`;
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const FieldContainer = styled.div`
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default ProfileSettings;
