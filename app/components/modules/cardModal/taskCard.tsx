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
import ColumnPopover from "./columnPopover";
import TabularDetails from "./tabularDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import dynamic from "next/dynamic";
import Editor from "../editor";
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

const TaskCard = ({ task, setTask, handleClose, column }: Props) => {
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
      <Box sx={{ width: "fit-content", display: "flex", flexWrap: "wrap" }}>
        <CardTypePopover task={task} />
        <ColumnPopover task={task} column={column} />
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <MemberPopover type={"reviewer"} task={task} setTask={setTask} />
        <MemberPopover type={"assignee"} task={task} setTask={setTask} />
        <RewardPopover task={task} setTask={setTask} />
        <DatePopover task={task} setTask={setTask} />
        <LabelPopover task={task} setTask={setTask} />
      </Box>

      <TaskModalBodyContainer>
        {/*<BlockEditor />*/}
        <Box sx={{ color: "#eaeaea", height: "auto", mr: 3 }}>
          {/* <ReactMde
            value={description}
            onChange={(value) => setDescription(value)}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            generateMarkdownPreview={(markdown) =>
              Promise.resolve(converter.makeHtml(markdown))
            }
            childProps={{
              writeButton: {
                tabIndex: -1,
              },
            }}
            readOnly={!(task.access.creator || task.access.reviewer)}
          /> */}
          <Editor />
          {/* {(task.access.creator || task.access.reviewer) && (
            <PrimaryButton
              variant="outlined"
              sx={{ mt: 4, borderRadius: 1 }}
              color="secondary"
              size="small"
              loading={isLoading}
              onClick={() => {
                setIsLoading(true);
                updateTaskDescription(Moralis, description, task.taskId).then(
                  (res: BoardData) => {
                    setSpace(res);
                    setIsLoading(false);
                  }
                );
              }}
            >
              Save
            </PrimaryButton>
          )} */}
        </Box>
        <TabularDetails task={task} showTabs={[0, 1, 2]} />
      </TaskModalBodyContainer>
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default TaskCard;
