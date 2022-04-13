import { Popover } from "@mui/material";
import React from "react";

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  type: string;
};

const MemberPopover = ({ open, anchorEl, handleClose, type }: Props) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    ></Popover>
  );
};

export default MemberPopover;
