import { Box, ListItem, ListItemText, styled } from "@mui/material";
import React from "react";
import { useActivityMap } from "../../../hooks/useActivityMap";
import { Task } from "../../../types";
import { monthMap } from "../../../constants";
import { text } from "stream/consumers";
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
          <Box
            sx={{
              width: "80%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "5%",
                justifyContent: "start",
              }}
            >
              <Box>{activityIcons[activity.action]}</Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "75%",
                justifyContent: "start",
              }}
            >
              <ListItemText primary={generateActivityLine(activity)} />
            </Box>
            <Box sx={{ width: "20%" }}>
              <ListItemText
                sx={{
                  fontSize: "0.7rem",
                  color: "text.secondary",
                }}
                primaryTypographyProps={{ fontSize: "13px" }}
              >
                {`${
                  monthMap[
                    activity.timestamp?.getMonth() as keyof typeof monthMap
                  ]
                }  ${activity.timestamp?.getDate()}, ${activity.timestamp.toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}`}{" "}
              </ListItemText>
            </Box>
          </Box>
        </ListItem>
      ))}
    </>
  );
};

export default Activity;
