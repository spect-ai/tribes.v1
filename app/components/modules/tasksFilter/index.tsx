import styled from "@emotion/styled";
import {
  Autocomplete,
  Popover,
  TextField,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import LabelIcon from "@mui/icons-material/Label";
import React, { useEffect, useState } from "react";
import { CardButton, PrimaryButton } from "../../elements/styledComponents";
import { useRouter } from "next/router";
import { PopoverContainer } from "../cardModal/styles";
import { useCardDynamism } from "../../../hooks/useCardDynamism";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";

interface FilterProps {}

const TasksFilter = () => {
  const [space, setSpace] = useState([]);
  const [open, setOpen] = useState(false);
  const [memberIds, setMemberIds] = useState([]);
  const [memberDetails, setMemberDetails] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [reviewerFilter, setReviewerFilter] = useState([]);
  const [assigneeFilter, setassigneeFilter] = useState([]);
  const [labelsFilter, setLabelsFilter] = useState([]);
  const { runMoralisFunction } = useMoralisFunction();

  const router = useRouter();
  const { bid } = router.query;

  useEffect(() => {
    runMoralisFunction("getSpace", { boardId: bid }).then((res) => {
      console.log("TaskFilter: Tasks: ", res.tasks);
      console.log("TaskFilter: Members: ", res.members);
      setMemberIds(res.members);
      setMemberDetails(res.memberDetails);
      console.log("TaskFilter: Member Details: ", res.memberDetails, memberIds);
      setSpace(res);
    });
  }, []);

  const handleClick = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
    setFeedbackOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleFeedbackClose = () => setFeedbackOpen(false);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: 2,
          mx: 1,
        }}
      >
        <Typography
          sx={{ fontSize: 12, color: "text.secondary", width: "100%" }}
        >
          Filter Tasks
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <CardButton
            variant="outlined"
            onClick={handleClick()}
            color="secondary"
            sx={{
              padding: "6px",
              minWidth: "3rem",
            }}
          >
            <>
              <Avatar
                variant="rounded"
                sx={{
                  p: 0,
                  mr: 2,
                  width: 20,
                  height: 20,
                  backgroundColor: "transparent",
                }}
              >
                <LabelIcon
                  sx={{
                    color: "text.primary",
                  }}
                />
              </Avatar>
              <Typography
                sx={{
                  fontSize: 14,
                  maxWidth: "6rem",
                  minWidth: "3rem",
                  minHeight: "1.3rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: "100",
                }}
              >
                Filter Options
              </Typography>
            </>
          </CardButton>
        </Box>
      </Box>
      <Popover
        open={feedbackOpen}
        anchorEl={anchorEl}
        onClose={() => handleFeedbackClose()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <PopoverContainer>
          <Autocomplete
            options={memberIds}
            multiple
            getOptionLabel={(option) => memberDetails[option]["username"]}
            // value={reviewerFilter}
            // onChange={(event, newValue) => {
            //   setReviewerFilter(newValue as string[]);
            //   console.log(reviewerFilter);
            // }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="filled-hidden-label-normal"
                size="small"
                fullWidth
                placeholder="Reviewer"
              />
            )}
          />

          <Autocomplete
            options={memberIds}
            multiple
            getOptionLabel={(option) => memberDetails[option]["username"]}
            value={labelsFilter}
            // onChange={(event: any, newValue: string | null) => {
            //   setLabels(newValue);
            // }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="filled-hidden-label-normal"
                size="small"
                fullWidth
                placeholder="Assignee"
              />
            )}
          />

          <Autocomplete
            options={["Reviewer", "Assignee", "Title"]}
            multiple
            // value={labels}
            // onChange={(event, newValue) => {
            //   setLabels(newValue as string[]);
            // }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="filled-hidden-label-normal"
                size="small"
                fullWidth
                placeholder="Title"
              />
            )}
          />

          <Autocomplete
            options={[
              "Design",
              "Coding",
              "Testing",
              "Deployment",
              "Documentation",
              "POC",
            ]}
            multiple
            value={labelsFilter}
            // onChange={(event, newValue) => {
            //   setLabels(newValue as string[]);
            // }}
            renderInput={(params) => (
              <TextField
                {...params}
                id="filled-hidden-label-normal"
                size="small"
                fullWidth
                placeholder="Labels"
              />
            )}
          />

          <PrimaryButton
            variant="outlined"
            sx={{ mt: 4, borderRadius: 1 }}
            color="secondary"
            // onClick={handleSave}
          >
            Filter
          </PrimaryButton>
        </PopoverContainer>
      </Popover>
    </>
  );
};

export default TasksFilter;
