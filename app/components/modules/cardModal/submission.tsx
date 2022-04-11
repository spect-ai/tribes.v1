import CircleIcon from "@mui/icons-material/Circle";
import { Box } from "@mui/material";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";
import { Block, Task } from "../../../types";
import { uid } from "../../../utils/utils";
import { PrimaryButton } from "../../elements/styledComponents";
import Editor from "../editor";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DoneIcon from "@mui/icons-material/Done";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { notify } from "../settingsTab";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const Submission = ({ task, setTask }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const { user } = useMoralis();

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

  const handleDone = () => {
    runMoralisFunction("updateCard", {
      updates: {
        status: 205,
        taskId: task.taskId,
      },
    })
      .then((res) => {
        console.log(res);
        setSpace(res.space);
        setTask(res.task);
        notify("Closed card", "success");
      })
      .catch((res) => {
        console.log(res);
        notify("Failed while closing card", "error");
      });
  };

  const handleRevision = () => {
    runMoralisFunction("updateCard", {
      updates: {
        status: 201,
        taskId: task.taskId,
      },
    })
      .then((res) => {
        setSpace(res.space);
        setTask(res.task);
        notify("Asked for revision", "success");
      })
      .catch((res) => {
        console.log(res);
        notify("Failed while asking for revision", "error");
      });
  };

  return (
    <Box sx={{ color: "#eaeaea", height: "auto", mr: 3, ml: 3 }}>
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
      {
        //Assignee view
        task.assignee?.includes(user?.id as string) && (
          <Box sx={{ display: "flex", flexDirection: "row", mt: 4 }}>
            <PrimaryButton
              variant="outlined"
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                mr: 4,
              }}
              color="secondary"
              size="small"
              loading={isLoading}
              onClick={handleAsk}
              disabled={[200, 300].includes(task.status)}
              startIcon={<VisibilityIcon />}
            >
              Ask for review
            </PrimaryButton>
          </Box>
        )
      }
      {
        //Reviewer view
        task.reviewer?.includes(user?.id as string) && (
          <Box sx={{ display: "flex", flexDirection: "row", mt: 4 }}>
            <PrimaryButton
              variant="outlined"
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                mr: 4,
              }}
              color="secondary"
              size="small"
              loading={isLoading}
              onClick={handleDone}
              disabled={task.status !== 200}
              startIcon={<DoneIcon />}
            >
              Looks good!
            </PrimaryButton>
            <PrimaryButton
              variant="outlined"
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                mr: 4,
              }}
              color="secondary"
              size="small"
              loading={isLoading}
              onClick={handleRevision}
              disabled={task.status !== 200}
              startIcon={<StarHalfIcon />}
            >
              Needs some work
            </PrimaryButton>
          </Box>
        )
      }
    </Box>
  );
};
export default Submission;
