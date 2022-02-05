import React from "react";
import { Box, Typography, AvatarGroup, Avatar, Tooltip } from "@mui/material";
import styled from "@emotion/styled";
import { muiTheme } from "../../../constants/muiTheme";
import { useTribe } from "../../../../pages/tribe/[id]";

const Overview = () => {
  const { tribe } = useTribe();

  return (
    <Wrapper>
      <MainContainer>
        <Box
          sx={{
            padding: 5,
            paddingRight: 0,
            paddingLeft: 0,
          }}
        >
          <Typography variant="h4">Mission</Typography>
          {tribe.mission}
        </Box>
      </MainContainer>
      <SideContainer>
        <DescriptionContainer>
          <Box
            sx={{
              margin: 1,

              padding: 1,
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            <Title>Admins</Title>
            <AvatarGroup max={4} sx={{ width: "fit-content" }}>
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
          <Box
            sx={{
              margin: 1,
            }}
          >
            <Title>Contributors</Title>
            <AvatarGroup max={4} sx={{ width: "fit-content" }}>
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
        </DescriptionContainer>
      </SideContainer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  & > div {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 1rem 2rem;
    font-size: 16px;
  }
`;

const MainContainer = styled.div`
  flex: 4;
  height: 400px;
`;

const SideContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-top: 10px;
  border-left: 1px solid #282b2f;
  align-content: flex-start;
  justify-content: flex-start;
  align-items: flex-start;
`;

const DescriptionContainer = styled.div`
  display: flex;
  align-self: flex-start;
  flex-direction: column;
  padding-bottom: 16px;
`;

const Title = styled.div`
  font-size: 20px;
  margin-bottom: 10;
  margin-top: 10;
  color: ${muiTheme.palette.text.secondary};
`;

const Value = styled.div`
  font-size: 16px;
  margin-bottom: 8;
  margin-top: 8;
  color: ${muiTheme.palette.text.primary};
`;

export default Overview;
