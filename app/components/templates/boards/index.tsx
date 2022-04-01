import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useGlobal } from "../../../context/globalContext";
import DiscordIntegrationModal from "../../modules/discordIntegrationModal";
import TaskBoard from "../../modules/taskBoard";

type Props = {};

const OuterDiv = styled.div`
  margin-left: 1.5rem;
  margin-right: 1.5rem;
  width: 100%;
`;

const BoardsTemplate = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useMoralis();
  const {
    state: { currentUser, loading },
  } = useGlobal();
  const handleClose = () => {
    setIsOpen(false);
  };
  useEffect(() => {
    if (!loading && isAuthenticated && !currentUser?.is_discord_linked) {
      setIsOpen(true);
    }
    if (currentUser?.is_discord_linked) {
      setIsOpen(false);
    }
  }, [isAuthenticated, loading, currentUser]);

  return (
    <OuterDiv>
      <DiscordIntegrationModal
        isOpen={isOpen}
        handleClose={handleClose}
        user={true}
      />
      <TaskBoard />
    </OuterDiv>
  );
};

export default BoardsTemplate;
