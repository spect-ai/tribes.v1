import styled from "@emotion/styled";
import { Autocomplete, Popover, TextField } from "@mui/material";
import { type } from "os";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { updateTaskMember } from "../../../adapters/moralis";
import { BoardData, Task } from "../../../types";
import { PrimaryButton } from "../../elements/styledComponents";
import { PopoverContainer } from "./datePopover";
import { notifyError } from "../settingsTab";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  type: string;
  handleClose: (field: string) => void;
  task: Task;
};

const MemberPopover = ({ open, anchorEl, handleClose, type, task }: Props) => {
  const [member, setMember] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { Moralis } = useMoralis();
  const { space, setSpace } = useSpace();

  useEffect(() => {
    if (type === "assignee") {
      setMember(task.assignee[0]);
    } else {
      setMember(task.reviewer[0]);
    }
    //console.log(
    //  task.members.filter((el) => el.username === "0xavp.eth")[0].username
    //);
  }, [task]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => handleClose(type)}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <PopoverContainer>
        <Autocomplete
          options={space.members} // Get options from members
          value={member as any}
          getOptionLabel={(option) => space.memberDetails[option].username}
          onChange={(event, newValue) => {
            setMember(newValue as string);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              id="filled-hidden-label-normal"
              size="small"
              fullWidth
              placeholder="Search member"
            />
          )}
        />
        <PrimaryButton
          variant="outlined"
          sx={{ mt: 4 }}
          loading={isLoading}
          onClick={() => {
            setIsLoading(true);
            // we store array of assignee and reviewer to be able to handle multiple assignees and reviewers later
            updateTaskMember(Moralis, member, type, task.taskId)
              .then((res: BoardData) => {
                setSpace(res);
                setIsLoading(false);
                handleClose(type);
              })
              .catch((err: any) => {
                notifyError(
                  `Sorry! There was an error while updating ${type}.`
                );
              });
          }}
        >
          Save
        </PrimaryButton>
      </PopoverContainer>
    </Popover>
  );
};

export default MemberPopover;
