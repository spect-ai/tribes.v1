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
import { PopoverContainer } from "./datePopover";
import { notify } from "../settingsTab";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";

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
  const { space, setSpace } = useSpace();
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
          options={Object.values(space.columns).map((column) => column.title)}
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
          sx={{ mt: 4, borderRadius: 1 }}
          color="secondary"
          onClick={() => {
            setIsLoading(true);
            updateTaskColumn(
              Moralis,
              task.boardId,
              task.taskId,
              column.id,
              Object.values(space.columns).filter(
                (col: Column) => col.title === status
              )[0]?.id
            )
              .then((res: BoardData) => {
                setSpace(res);
                if (status === "Done") {
                  updateTaskStatus(Moralis, task.taskId, 205)
                    .then((res: any) => {
                      console.log("updateTaskStatus", res);
                      setSpace(res as BoardData);
                    })
                    .catch((err: any) => {
                      notify(
                        "Sorry! There was an error while moving task.",
                        "error"
                      );
                    });
                }
                setIsLoading(false);
                handleClose("move");
              })
              .catch((err: any) => {
                console.log(err);
                notify(`Task move failed with error ${err.message}`, "error");
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
