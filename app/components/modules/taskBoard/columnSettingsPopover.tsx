import styled from "@emotion/styled";
import { Button, Popover } from "@mui/material";
import React from "react";

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: () => void;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 6rem;
`;

const ColumnSettingsPopover = ({ open, anchorEl, handleClose }: Props) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <Container>
        <Button
          color="inherit"
          fullWidth
          sx={{ textTransform: "none" }}
          size="small"
        >
          Delete
        </Button>
        <Button
          color="inherit"
          fullWidth
          sx={{ textTransform: "none" }}
          size="small"
        >
          Import Repo
        </Button>
        <Button
          color="inherit"
          fullWidth
          sx={{ textTransform: "none" }}
          size="small"
          disabled
        >
          Start Epoch
        </Button>
      </Container>
    </Popover>
  );
};

export default ColumnSettingsPopover;
