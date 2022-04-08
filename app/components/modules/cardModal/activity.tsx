import { Box, ListItem, ListItemText, styled } from "@mui/material";
import React from "react";
import { useActivityMap } from "../../../hooks/useActivityMap";
import { Task } from "../../../types";
import MoreVertIcon from "@mui/icons-material/MoreVert";
type Props = {
  task: Task;
};

const Activity = ({ task }: Props) => {
  const { activityIcons, generateActivityLine } = useActivityMap();

  return (
    <>
      {task.activity.map((activity: any, index) => (
        <ListItem key={index}>
          <Box sx={{ width: "60%", display: "flex", flexDirection: "row" }}>
            {activityIcons[activity.action]}
            <ListItemText primary={generateActivityLine(activity)} />
          </Box>
        </ListItem>
      ))}
    </>
  );
};

export default Activity;
