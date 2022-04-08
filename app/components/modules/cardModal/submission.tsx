import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import ReactMde from "react-mde";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";
import { BoardData, Task } from "../../../types";
import { PrimaryButton } from "../../elements/styledComponents";
import { notify } from "../settingsTab";
import Editor from "../editor";
import { Block } from "../../../types";
import { uid } from "../../../utils/utils";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const Submission = ({ task, setTask }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const taskId = task.taskId;
  const syncBlocksToMoralis = (blocks: Block[]) => {
    // console.log({ blocks });
    runMoralisFunction("updateCard", {
      updates: {
        submission: blocks,
        taskId: task.taskId,
      },
    })
      .then((res) => {
        console.log(res);
        setSpace(res.space);
        setTask(res.task);
      })
      .catch((res) => {
        console.log(res);
      });
  };

  const handleAsk = () => {
    runMoralisFunction("updateCard", {
      updates: {
        status: 200,
        taskId: task.taskId,
      },
    })
      .then((res) => {
        setSpace(res.space);
        setTask(res.task);
      })
      .catch((res) => {
        console.log(res);
      });
  };

  return (
    <Box sx={{ color: "#eaeaea", height: "auto", mr: 3 }}>
      {
        <Editor
          syncBlocksToMoralis={syncBlocksToMoralis}
          initialBlock={
            task.submissions?.length > 0
              ? task.submissions[0]
              : [
                  {
                    id: uid(),
                    html: "",
                    tag: "p",
                    type: "",
                    imageUrl: "",
                    embedUrl: "",
                  },
                ]
          }
        />
      }
      <PrimaryButton
        variant="outlined"
        sx={{ mt: 4, borderRadius: 1 }}
        color="secondary"
        size="small"
        loading={isLoading}
        onClick={handleAsk}
      >
        Ask for Review
      </PrimaryButton>
    </Box>
  );
};

export default Submission;
