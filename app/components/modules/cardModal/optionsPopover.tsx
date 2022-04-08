import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import React from "react";
import { Task } from "../../../types";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

const OptionsPopover = ({ task, setTask }: Props) => {
  return (
    <>
      <MoreHorizIcon />
    </>
  );
};

export default OptionsPopover;
