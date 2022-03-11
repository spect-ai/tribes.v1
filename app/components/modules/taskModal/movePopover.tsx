import styled from "@emotion/styled";
import { Autocomplete, Popover, TextField } from "@mui/material";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { updateTaskColumn, updateTaskStatus } from "../../../adapters/moralis";
import { BoardData, Column, Task } from "../../../types";
import {
  LabelChipButton,
  PrimaryButton,
} from "../../elements/styledComponents";
import { useBoard } from "../taskBoard";
import { PopoverContainer } from "./datePopover";
import { notify } from "../settingsTab";

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  column: Column;
  task: Task;
};

const MovePopover = ({ open, anchorEl, handleClose, column, task }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis } = useMoralis();
  const { data, setData } = useBoard();
  const [status, setStatus] = useState(column.title);
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => handleClose("move")}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <PopoverContainer>
        <Autocomplete
          options={Object.values(data.columns).map((column) => column.title)}
          value={status}
          onChange={(event, newValue) => {
            setStatus(newValue as any);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              id="filled-hidden-label-normal"
              size="small"
              fullWidth
              placeholder="List"
            />
          )}
        />
        <PrimaryButton
          variant="outlined"
          sx={{ mt: 4 }}
          onClick={() => {
            setIsLoading(true);
            updateTaskColumn(
              Moralis,
              task.boardId,
              task.taskId,
              column.id,
              Object.values(data.columns).filter(
                (col: Column) => col.title === status
              )[0]?.id
            )
              .then((res: BoardData) => {
                setData(res);
                if (status === "Done") {
                  updateTaskStatus(Moralis, task.taskId, 205).then(
                    (res: any) => {
                      console.log("updateTaskStatus", res);
                      setData(res as BoardData);
                    }
                  );
                }
                setIsLoading(false);
                handleClose("move");
              })
              .catch((err: any) => {
                notify(err); // Lets use toastify to show this
              });
          }}
        >
          Save
        </PrimaryButton>
      </PopoverContainer>
    </Popover>
  );
};

export default MovePopover;
