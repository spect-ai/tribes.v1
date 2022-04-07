import { Close } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Modal,
  Typography,
  styled as MUIStyled,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";
import { BoardData } from "../../../types";
import SpaceRoleMapping from "../../elements/spaceRoleMapping";
import { ModalHeading, PrimaryButton } from "../../elements/styledComponents";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  user: boolean;
};

const DiscordIntegrationModal = ({ isOpen, handleClose, user }: Props) => {
  const router = useRouter();
  const id = router.query.id as string;
  const bid = router.query.bid as string;
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();

  const waitForDiscordLink = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 6000));
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      runMoralisFunction("getSpace", { boardId: bid }).then(
        (res: BoardData) => {
          console.log(res);
          setSpace(res);
          console.log(res.guildId);
          if (res.guildId && res.guildId !== "undefined") {
            console.log("hi");
            setIsLoading(false);
          }
        }
      );
      if (!isLoading) {
        break;
      }
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <ModalContainer>
        <ModalHeading>
          <Typography>Discord Integration</Typography>
        </ModalHeading>
        <ModalContent>
          <Typography color="secondary" sx={{ textAlign: "center" }}>
            {user
              ? "You need to link your discord account before you proceed"
              : "You need to connect discord before you proceed"}
          </Typography>
          {user ? (
            <a
              href={`https://discord.com/api/oauth2/authorize?client_id=942494607239958609&redirect_uri=${
                process.env.ENV === "local"
                  ? "http%3A%2F%2Flocalhost%3A3000%2F"
                  : "https%3A%2F%2Ftribes.spect.network%2F"
              }&response_type=code&scope=identify`}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
              }}
            >
              <PrimaryButton
                variant="outlined"
                color="secondary"
                loading={isLoading}
                sx={{ borderRadius: 1, my: 4 }}
              >
                Link Discord
              </PrimaryButton>
            </a>
          ) : (
            <a
              href={`https://discord.com/oauth2/authorize?client_id=942494607239958609&permissions=17448306704&redirect_uri=https://spect-discord-bot.herokuapp.com/api/linkDiscordBot&response_type=code&scope=bot&state=%7B%22objectId%22%3A%22${bid}%22%2C%22redirect%22%3A%22%2Ftribe%2F${id}%2Fspace%2F${bid}%22%7D`}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
              }}
              onClick={waitForDiscordLink}
            >
              <PrimaryButton
                variant="outlined"
                color="secondary"
                loading={isLoading}
                sx={{ borderRadius: 1, my: 4 }}
                disabled={space.guildId ? true : false}
              >
                {space.guildId ? "Discord Connected" : " Connect Discord"}
              </PrimaryButton>
            </a>
          )}
          {!user && (
            <>
              <Typography color="secondary" sx={{ textAlign: "center" }}>
                Setup Member roles from Discord so they can join automatically
              </Typography>
              <SpaceRoleMapping handleModalClose={handleClose} />
            </>
          )}
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

// @ts-ignore
const ModalContainer = MUIStyled(Box)(({ theme }) => ({
  position: "absolute" as "absolute",
  top: "40%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "30rem",
  border: "2px solid #000",
  backgroundColor: theme.palette.background.default,
  boxShadow: 24,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
}));

const ModalContent = MUIStyled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 12,
}));

export default DiscordIntegrationModal;
