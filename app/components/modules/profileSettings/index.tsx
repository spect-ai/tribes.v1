import styled from "@emotion/styled";
import {
  Avatar,
  Grow,
  IconButton,
  Input,
  Modal,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useState } from "react";
import { PrimaryButton } from "../../elements/styledComponents";
import CloseIcon from "@mui/icons-material/Close";
import { Box } from "@mui/system";
import { useMoralis } from "react-moralis";
import EditIcon from "@mui/icons-material/Edit";
import { getMD5String } from "../../../utils/utils";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

const ProfileSettings = ({ isOpen, handleClose }: Props) => {
  const { Moralis, user } = useMoralis();

  const [userName, setuserName] = useState(user?.get("username"));
  const [userEmail, setuserEmail] = useState(user?.get("email"));
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
      <Grow in={isOpen} timeout={500}>
        <Box sx={modalStyle}>
          <Heading>
            <div>Profile</div>
            <Box sx={{ flex: "1 1 auto" }} />
            <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Heading>
          <ModalContent>
            <FieldContainer>
              <Avatar
                src={
                  user?.get("profilePicture")?._url ||
                  `https://www.gravatar.com/avatar/${getMD5String(
                    user?.get("username")
                  )}?d=identicon&s=64`
                }
                sx={{ height: 60, width: 60 }}
              />
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
                    });
                  }
                }}
              />
              <label htmlFor="contained-button-file">
                {/*// @ts-ignore */}
                <PrimaryButton component="span">Edit</PrimaryButton>
              </label>
            </FieldContainer>
            <FieldContainer>
              <TextField
                value={userName}
                onChange={(e) => setuserName(e.target.value)}
                fullWidth
                label="Username"
                placeholder="Username"
              ></TextField>
            </FieldContainer>
            <FieldContainer>
              <TextField
                placeholder="Email"
                value={userEmail}
                onChange={(e) => setuserEmail(e.target.value)}
                fullWidth
                label="Email"
              ></TextField>
            </FieldContainer>
            <PrimaryButton
              variant="outlined"
              sx={{ width: "50%", mt: 2 }}
              loading={isLoading}
              onClick={() => {
                setIsLoading(true);
                if (user) {
                  user.set("username", userName);
                  user.set("email", userEmail);
                  user.save().then((res: any) => {
                    setIsLoading(false);
                    handleClose();
                  });
                }
              }}
            >
              Save
            </PrimaryButton>
          </ModalContent>
        </Box>
      </Grow>
    </Modal>
  );
};

const modalStyle = {
  position: "absolute" as "absolute",
  top: "35%",
  left: "35%",
  transform: "translate(-50%, -50%)",
  width: "25rem",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
};

const Heading = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #eaeaea;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid #5a6972;
  padding: 32px 16px 16px 16px;
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
