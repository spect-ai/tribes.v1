import React, { useEffect, useState } from "react";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import styled from "@emotion/styled";
import { Backdrop, Typography, CircularProgress, Box } from "@mui/material";
import { useMoralis } from "react-moralis";
import { getInvitations, acceptInvitations } from "../../../adapters/moralis";
import { smartTrim } from "../../../utils/utils";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

export default function Notification() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [notifs, setNotifs] = useState<any[]>([] as any[]);
  const [notifLeng, setNotifLeng] = useState<number>(0);
  const { isAuthenticated, Moralis, user } = useMoralis();
  const [ethAddress, setEthAddress] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loaderText, setLoaderText] = useState<string>("Accepting Team Invite");
  useEffect(() => {
    getAllInvites();
  }, []);

  const getAllInvites = () => {
    if (isAuthenticated) {
      setEthAddress(user?.get("ethAddress"));
      getInvitations(Moralis, ethAddress)
        .then((res: any[]) => {
          setNotifs(res.reverse());
          setNotifLeng(res.length);
        })
        .catch((ex: any) => {
          console.log("error", ex);
        });
    }
  };
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    getAllInvites();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const acceptInviteHandler = (teamId: number) => {
    setLoading(true);
    acceptInvitations(Moralis, ethAddress, teamId)
      .then((res: any[]) => {
        console.log("ressssAccepted", res);
        setTimeout(function () {
          setLoading(false);
        }, 2000);
      })
      .catch((ex: any) => {
        setLoaderText("Error While Accepting Team Invite");
        setTimeout(function () {
          setLoading(false);
        }, 2000);
      });
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <Button
        onClick={handleClick}
        style={{ width: "1px", height: "30px", borderRadius: "10%" }}
      >
        {notifLeng > 0 ? (
          <i className="fa fa-bell fa-lg" />
        ) : (
          <i className="fa fa-bell-o fa-lg" />
        )}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <PopoverContent>
          {notifLeng > 0 ? (
            notifs.map((noti, index) => (
              <Popnotification
                onClick={() => acceptInviteHandler(noti.attributes.teamId)}
                key={index}
              >
                <NotificationTitle>{noti.className}</NotificationTitle>
                <NotificationObject>
                  You are invited to By TeamId {noti.attributes.teamId}
                </NotificationObject>
                <NotificationObject>
                  ethAddress -- {smartTrim(noti.attributes.invitedBy, 10)}
                </NotificationObject>
              </Popnotification>
            ))
          ) : (
            <NoNotificationTitle>No Invitation Till Now</NoNotificationTitle>
          )}
        </PopoverContent>
      </Popover>
      <Backdrop
        sx={{
          color: "#eaeaea",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={loading}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2, mb: 1, color: "#eaeaea" }}>
            {loaderText}
          </Typography>
        </Box>
      </Backdrop>
    </div>
  );
}

const PopoverContent = styled.div`
  width: 300px;
  min-height: 350px;
  background: #031027;
  border: 1px solid #054bd7;
  border-radius: 5px;
`;

const Popnotification = styled.div`
  margin: 4px 6px;
  width: 270px;
  min-height: 40px;
  border: 1px solid #2369f6;
  border-radius: 5px;
  padding: 2px 9px;
  overflow: auto;
  &:hover {
    cursor: pointer;
    border: 1px solid #054bd7;
  }
`;

const NotificationTitle = styled.div`
  font-size: "8px";
  color: "#91909D";
  text-transform: "uppercase";
  font-weight: "bold";
`;

const NotificationObject = styled.div`
  font-size: "18px";
  font-weight: "bold";
  color: "#91909D";
  overflow: hidden;
`;

const NoNotificationTitle = styled.div`
  font-size: "22px";
  color: "#91909D";
  text-transform: "uppercase";
  font-weight: "bold";
  margin: 20px 20px;
`;
