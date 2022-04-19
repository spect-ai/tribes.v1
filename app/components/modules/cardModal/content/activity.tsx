import { Box, ListItem, ListItemText, styled } from "@mui/material";
import React from "react";
import { useActivityMap } from "../../../../hooks/useActivityMap";
import { Task } from "../../../../types";
import { monthMap } from "../../../../constants";
import { text } from "stream/consumers";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineConnector from "@mui/lab/TimelineConnector";

type Props = {
  task: Task;
};

const Activity = ({ task }: Props) => {
  const { activityIcons, resolveActivityComponent } = useActivityMap(task);

  return (
    <Timeline position="right" sx={{ width: "100%" }}>
      {task.activity.map((activity: any, index) => (
        <TimelineItem key={index}>
          <TimelineSeparator>
            {activityIcons[activity.action]}
            {index !== task.activity?.length - 1 && (
              <TimelineConnector sx={{ my: 2 }} />
            )}
          </TimelineSeparator>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "start",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                width: "75%",
                justifyContent: "center",
                alignItems: "start",
              }}
            >
              {
                /*<ListItemText primary={generateActivityLine(activity)} />*/
                resolveActivityComponent(activity)
              }
            </Box>
            <Box
              sx={{
                width: "20%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "start",
                alignItems: "start",
              }}
            >
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
                }  ${activity?.timestamp?.getDate()}, ${activity?.timestamp?.toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}`}{" "}
              </ListItemText>
            </Box>
          </Box>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default Activity;
