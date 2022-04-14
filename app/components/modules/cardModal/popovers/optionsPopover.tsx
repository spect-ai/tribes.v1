import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import React, { useState, useEffect } from "react";
import { Task } from "../../../../types";
import {
  Box,
  IconButton,
  InputBase,
  Popover,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  ListSubheader,
} from "@mui/material";
import { PopoverContainer } from "../styles";
import PaidIcon from "@mui/icons-material/Paid";
import SwitchAccessShortcutIcon from "@mui/icons-material/SwitchAccessShortcut";
import ViewCompactAltIcon from "@mui/icons-material/ViewCompactAlt";
import VideoStableIcon from "@mui/icons-material/VideoStable";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArchiveIcon from "@mui/icons-material/Archive";
import { useSpace } from "../../../../../pages/tribe/[id]/space/[bid]";
import { approve } from "../../../../adapters/contract";
import { useMoralis } from "react-moralis";
import { useMoralisFunction } from "../../../../hooks/useMoralisFunction";
import { distributeEther, batchPayTokens } from "../../../../adapters/contract";
import { notify } from "../../settingsTab";
import { useGlobal } from "../../../../context/globalContext";
import PayButton from "../buttons/payButton";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

function doShowPayButton(user: any, task: Task) {
  console.log(task.token?.address);
  if (user?.get("distributorApproved")) {
    console.log(task.token?.address === "0x0");
    return (
      task.token?.address === "0x0" ||
      (task.chain?.chainId in user?.get("distributorApproved") &&
        user
          ?.get("distributorApproved")
          [task.chain?.chainId].includes(task.token?.address))
    );
  } else {
    console.log(task.token?.address === "0x0");
    return task.token?.address === "0x0";
  }
}

const OptionsPopover = ({ task, setTask }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const { space, setSpace } = useSpace();
  const { user } = useMoralis();
  const [showPayButton, setShowPayButton] = useState(
    doShowPayButton(user, task)
  );
  const { state } = useGlobal();
  const { registry } = state;
  const { runMoralisFunction } = useMoralisFunction();

  const handleTaskStatusUpdate = (taskIds: string[]) => {
    runMoralisFunction("updateCard", {
      updates: {
        status: 300,
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

  const handlePaymentError = (err: any) => {
    console.log(err);
    if (window.ethereum.networkVersion !== task.chain.chainId)
      notify(`Please switch to ${task.chain?.name} network`, "error");
    else {
      notify(err.message, "error");
    }
  };

  const handleClick = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  return (
    <>
      <IconButton sx={{ m: 0, px: 2 }} onClick={handleClick()}>
        <MoreHorizIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <List
          sx={{
            width: "100%",
            maxWidth: 360,
            maxHeight: 200,
            overflow: "auto",
            bgcolor: "background.paper",
          }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
          <PayButton task={task} setTask={setTask} handleClose={handleClose} />

          <ListItemButton>
            <VideoStableIcon sx={{ width: "2rem", mr: 2 }} />
            <ListItemText primary="Gate Proposals" />
          </ListItemButton>
          <ListItemButton onClick={handleClick}>
            <ViewCompactAltIcon sx={{ width: "2rem", mr: 2 }} />
            <ListItemText primary="Gate Submissions" />
          </ListItemButton>

          <ListItemButton>
            <ContentCopyIcon sx={{ width: "2rem", mr: 2 }} />
            <ListItemText primary="Duplicate" />
          </ListItemButton>
          <ListItemButton>
            <ArchiveIcon sx={{ width: "2rem", mr: 2 }} />
            <ListItemText primary="Archive" />
          </ListItemButton>
        </List>
      </Popover>
    </>
  );
};

export default OptionsPopover;
