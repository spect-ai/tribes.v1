import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import ReactMde from "react-mde";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";
import { BoardData, Task } from "../../../types";
import { PrimaryButton } from "../../elements/styledComponents";
import { notify } from "../settingsTab";
import * as Showdown from "showdown";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const Submission = ({ task, setTask }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const [description, setDescription] = useState(task.description);
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");

  const handleSave = () => {
    const prevTask = Object.assign({}, task);
    const temp = Object.assign({}, task);
    temp.description = description;
    setTask(temp);
    runMoralisFunction("updateCard", {
      updates: {
        proposal: description,
        taskId: task.taskId,
      },
    })
      .then((res: any) => {
        console.log(res);
        setSpace(res);
      })
      .catch((err: any) => {
        setTask(prevTask);
        notify(`${err.message}`, "error");
      });
  };

  useEffect(() => {
    setDescription(task.description);
  }, [task]);

  useEffect(() => {
    if (!(task.access.creator || task.access.reviewer)) {
      setSelectedTab("preview");
    }
  }, []);

  return (
    <Box sx={{ color: "#eaeaea", height: "auto", mr: 3 }}>
      <PrimaryButton
        variant="outlined"
        sx={{ mt: 4, borderRadius: 1 }}
        color="secondary"
        size="small"
        loading={isLoading}
        onClick={handleSave}
      >
        Submit Proposal
      </PrimaryButton>
    </Box>
  );
};

export default Submission;
