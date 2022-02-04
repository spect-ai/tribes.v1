import React from "react";
import {
  Box,
  Divider,
  Typography,
  AvatarGroup,
  Avatar,
  Tooltip,
} from "@mui/material";

type Props = {};
const Overview = (props: Props) => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexBasis: "60%",
        fontSize: "1rem",
      }}
    >
      <Box
        sx={{
          padding: 5,     
        }}
      >
        <Typography variant="h4">Mission</Typography>
        As part of plans to enable a self-sustainable and competitive
        decentralized exchange, the development team of Uniswap launched its
        governance token, UNI, in September 2020. This singular act unlocked a
        new governance structure and officially gave the Uniswap community a say
        over the day-to-day running and development of the project. More
        specifically, anyone holding UNI tokens could either vote or delegate
        votes on development proposals that could alter the operation or
        infrastructure of the Uniswap Protocol.
      </Box>
      <Box
        sx={{
          padding: 5,
          width: "40%",
        }}
      >
        <Box sx={{
              margin:1, 
        }}>
          <Typography variant="h6" component="div">
            Admins
          </Typography>
          <AvatarGroup max={4} sx={{width:'fit-content'}}>
            <Tooltip title="Remy SHarp">
              <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
            </Tooltip>
            <Tooltip title="Travis Howard">
              <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
            </Tooltip>
            <Tooltip title="Cindy Baker">
              <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
            </Tooltip>
            <Tooltip title="Agnes Walker">
              <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
            </Tooltip>
            <Tooltip title="Trevor Henderson">
              <Avatar
                alt="Trevor Henderson"
                src="/static/images/avatar/5.jpg"
              />
            </Tooltip>
          </AvatarGroup>
        </Box>
        <Divider />
        <Box sx={{
              margin:1, 
        }}>
          <Typography variant="h6">
            Contributors
          </Typography>
          <AvatarGroup max={4} sx={{width:'fit-content'}}>
            <Tooltip title="Remy SHarp">
              <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
            </Tooltip>
            <Tooltip title="Travis Howard">
              <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
            </Tooltip>
            <Tooltip title="Cindy Baker">
              <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
            </Tooltip>
            <Tooltip title="Agnes Walker">
              <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
            </Tooltip>
            <Tooltip title="Trevor Henderson">
              <Avatar
                alt="Trevor Henderson"
                src="/static/images/avatar/5.jpg"
              />
            </Tooltip>
          </AvatarGroup>
        </Box>
      </Box>
    </Box>
  );
};

export default Overview;
