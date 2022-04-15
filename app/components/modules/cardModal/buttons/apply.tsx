import HailIcon from "@mui/icons-material/Hail";
import { Box, Typography } from "@mui/material";
import React, { useState } from "react";
import { useCardDynamism } from "../../../../hooks/useCardDynamism";
import { Task } from "../../../../types";
import { CardButton } from "../../../elements/styledComponents";
import { useMoralis } from "react-moralis";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const Apply = ({ task, setTask }: Props) => {
  const { setProposalEditMode, viewableComponents, proposalEditMode } =
    useCardDynamism(task);
  const { user } = useMoralis();
  const [buttonText, setButtonText] = useState("Apply");
  console.log(proposalEditMode);
  const handleClick = () => {
    console.log(`aalal`);
    const temp = Object.assign({}, task);
    temp.proposals = [
      {
        id: "",
        content: "",
        userId: user?.id as string,
        createdAt: null,
        updatedAt: null,
        edited: false,
      },
    ];
    setTask(temp);
    setProposalEditMode(true);
  };

  return (
    <>
      {viewableComponents["applyButton"] && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            mx: 1,
            minWidth: "9rem",
          }}
        >
          <CardButton
            variant="outlined"
            onClick={() => handleClick()}
            color="secondary"
            sx={{
              padding: "2px",
              minWidth: "3rem",
            }}
            startIcon={<HailIcon sx={{ my: 2, ml: 2 }} />}
            size="small"
          >
            <Typography
              sx={{
                fontSize: 14,
                mr: 2,
              }}
            >
              {buttonText}
            </Typography>
          </CardButton>
        </Box>
      )}
    </>
  );
};

export default Apply;
