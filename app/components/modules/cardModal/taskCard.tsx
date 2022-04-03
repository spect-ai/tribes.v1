import {
  Box,
  ListItem,
  Grid,
  Avatar,
  ListItemText,
  InputBase,
  IconButton,
  Typography,
  Tooltip,
  Chip,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Divider from "@mui/material/Divider";
import {
  FieldContainer,
  PrimaryButton,
  CardButton,
} from "../../elements/styledComponents";
import CloseIcon from "@mui/icons-material/Close";
import { BoardData, Column, Task } from "../../../types";
import { formatTime, getMD5String } from "../../../utils/utils";
import {
  assignToMe,
  updateTaskDescription,
  updateTaskTitle,
  completePayment,
  archiveTask,
} from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import ReactMde from "react-mde";
import * as Showdown from "showdown";
import { labelsMapping, registryTemp } from "../../../constants";
import { actionMap, monthMap } from "../../../constants";
import { distributeEther, batchPayTokens } from "../../../adapters/contract";
import { LinkPreview } from "@dhaiwat10/react-link-preview";
import { notify } from "../settingsTab";
import { Toaster } from "react-hot-toast";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import { approve } from "../../../adapters/contract";
import MemberPopover from "./memberPopover";
import RewardPopover from "./rewardPopover";
import DatePopover from "./datePopover";
import CardTypePopover from "./cardTypePopover";
import LabelPopover from "./labelPopover";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import dynamic from "next/dynamic";
let BlockEditor = dynamic(() => import("../blockEditor"), {
  ssr: false,
});
type Props = {
  task: Task;
  setTask: (task: Task) => void;
  handleClose: () => void;
  submissionPR: any;
  column: Column;
};
const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

function doShowPayButton(user: any, task: Task) {
  if (user?.get("distributorApproved")) {
    return (
      task.token?.address === "0x0" ||
      (task.chain?.chainId in user?.get("distributorApproved") &&
        user
          ?.get("distributorApproved")
          [task.chain?.chainId].includes(task.token?.address))
    );
  } else {
    return false;
  }
}

const TaskCard = ({ task, handleClose, column }: Props) => {
  const { space, setSpace } = useSpace();
  const { Moralis, user } = useMoralis();
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState({} as any);
  const [description, setDescription] = useState(task.description);
  const [showPayButton, setShowPayButton] = useState(
    doShowPayButton(user, task)
  );

  const handleClick =
    (field: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen({ [field]: true });
    };
  const handleClosePopover = (field: string) => {
    setOpen({ [field]: false });
  };
  const isSpaceMember = () => {
    return space.members.indexOf(user?.id as string) !== -1;
  };

  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const [title, setTitle] = useState(task.title);
  const [isLoadingTask, setIsLoadingTask] = useState(false);

  useEffect(() => {
    if (!(task.access.creator || task.access.reviewer)) {
      setSelectedTab("preview");
    }
  }, []);

  return (
    <Container>
      <TaskModalTitleContainer>
        <InputBase
          placeholder="Add Title"
          sx={{
            fontSize: "20px",
          }}
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (task.access.creator || task.access.reviewer) {
              updateTaskTitle(Moralis, title, task.taskId)
                .then((res: BoardData) => {
                  setSpace(res);
                })
                .catch((err: any) => {
                  notify(
                    "Sorry! There was an error while updating task title.",
                    "error"
                  );
                });
            }
          }}
          readOnly={!(task.access.creator || task.access.reviewer)}
        />
        <Box sx={{ flex: "1 1 auto" }} />
        {/* <IconButton sx={{ m: 0, px: 2 }} onClick={handleClose}>
          <ExpandMoreIcon />
        </IconButton>
        <IconButton sx={{ m: 0, px: 2 }} onClick={handleClose}>
          <OpenInFullIcon />
        </IconButton> */}
        <IconButton sx={{ m: 0, px: 2 }} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </TaskModalTitleContainer>
      <Box sx={{ width: "fit-content" }}>
        <CardTypePopover task={task} />
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <MemberPopover type={"reviewer"} task={task} />
        <MemberPopover type={"assignee"} task={task} />
        <RewardPopover task={task} />
        <DatePopover task={task} />
        <LabelPopover task={task} />
      </Box>
      <TaskModalBodyContainer>
        <Divider textAlign="left" sx={{ mr: 3, color: "#99ccff" }}>
          Description
        </Divider>{" "}
        <BlockEditor />
      </TaskModalBodyContainer>

      <ActivityContainer>
        <Divider textAlign="left" color="text.secondary" sx={{ mr: 3 }}>
          Activity
        </Divider>{" "}
        {task.activity.map((activity: any) => (
          <ListItem key={`${activity.timestamp}`}>
            <Avatar
              sx={{ width: 24, height: 24, mr: 2 }}
              src={
                space.memberDetails[activity.actor].profilePicture
                  ? space.memberDetails[activity.actor].profilePicture._url
                  : `https://www.gravatar.com/avatar/${getMD5String(
                      space.memberDetails[activity.actor].username
                    )}?d=identicon&s=32`
              }
            />
            <ListItemText
              primary={`${space.memberDetails[activity.actor].username} ${
                actionMap[activity.action as keyof typeof actionMap]
              } on ${activity.timestamp.getDate()}  ${
                // @ts-ignore
                monthMap[activity.timestamp.getMonth() as number]
              }`}
            />
          </ListItem>
        ))}
      </ActivityContainer>
    </Container>
  );
};

const TaskModalTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const TaskModalBodyContainer = styled.div`
  margin-top: 2px;
  color: #eaeaea;
  font-size: 0.85rem;
`;

const ActivityContainer = styled.div`
  margin-top: 2px;
  color: #99ccff;
  font-size: 0.85rem;
  max-height: 10rem;
  overflow-y: auto;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default TaskCard;
