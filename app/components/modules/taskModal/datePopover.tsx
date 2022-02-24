import { DateTimePicker, LocalizationProvider } from "@mui/lab";
import { Popover, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import DateAdapter from "@mui/lab/AdapterDayjs";
import styled from "@emotion/styled";
import { PrimaryButton } from "../../elements/styledComponents";
import { BoardData, Task } from "../../../types";
import { useBoard } from "../taskBoard";
import { updateTaskDeadline } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: (field: string) => void;
  task: Task;
};

const DatePopover = ({ open, anchorEl, handleClose, task }: Props) => {
  const [date, setDate] = useState("");
  const { data, setData } = useBoard();
  const { Moralis } = useMoralis();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (task.deadline) {
      const offset = task.deadline.getTimezoneOffset();
      task.deadline = new Date(task.deadline.getTime() - offset * 60 * 1000);
      setDate(task.deadline.toISOString().slice(0, -8));
    }
  }, []);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => {
        handleClose("date");
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <PopoverContainer>
        <TextField
          id="datetime-local"
          label="Due Date"
          type="datetime-local"
          InputLabelProps={{
            shrink: true,
          }}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
          }}
          fullWidth
        />
        <PrimaryButton
          variant="outlined"
          sx={{ mt: 4 }}
          loading={isLoading}
          onClick={() => {
            setIsLoading(true);
            updateTaskDeadline(
              Moralis,
              new Date(date).toUTCString(),
              task.taskId
            ).then((res: BoardData) => {
              console.log(res);
              setData(res);
              setIsLoading(false);
              handleClose("date");
            });
          }}
        >
          Save
        </PrimaryButton>
      </PopoverContainer>
    </Popover>
  );
};

export const PopoverContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 8px;
  width: 18rem;
`;

export default DatePopover;
