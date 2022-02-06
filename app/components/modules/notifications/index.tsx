
import React, {useEffect,useState} from 'react';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import styled from '@emotion/styled';
import { useMoralis } from "react-moralis";
import {getInvitations, acceptInvitations} from "../../../adapters/moralis";
import { smartTrim } from "../../../utils/utils";
export default function Notification() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [notifs, setNotifs] = useState<any[]>([] as any[]);
  const [notifLeng, setNotifLeng] = useState<number>(0);
  const { isAuthenticated, Moralis, user } = useMoralis();
  const [ethAddress, setEthAddress] = useState('')
  
  useEffect(() => {
    if (isAuthenticated) {
        setEthAddress(user?.get("ethAddress"))
        getInvitations(Moralis, ethAddress).then((res: any[]) => {  
        setNotifs(res.reverse());
        console.log('rest',notifs[0])
        setNotifLeng(res.length);
      })
      .catch((ex:any)=>{
        console.log('error',ex)
      })
      ;
    }
  },[]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const acceptInviteHandler = (teamId: number) => {
    acceptInvitations(Moralis, ethAddress, teamId).then((res:any[]) => {
        console.log('ethAdd',ethAddress)
        console.log('ressssAccepted',res)     
    })
    handleClose() 
  }

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <Button variant="contained" onClick={handleClick} style={{width: '1px', height: '50px', borderRadius: '100%'}}>
        {
            notifLeng > 0
            ?
            <i className="fa fa-bell fa-lg"/>
            :
            <i className="fa fa-bell-o fa-lg"/>
        }
        
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <PopoverContent>
            {
             notifLeng > 0
             ?   
                notifs.map((noti)=>(
                    <Popnotification onClick={()=>acceptInviteHandler(noti.attributes.teamId)}>
                        <NotificationTitle>
                            {
                                noti.className
                            }
                        </NotificationTitle>
                        <NotificationObject>
                            You are invited to By TeamId {noti.attributes.teamId}
                        </NotificationObject>
                        <NotificationObject>
                            ethAddress -- {noti.attributes.invitedBy}
                        </NotificationObject>
                    </Popnotification>
                ))
            :
                <NoNotificationTitle>
                    No Invitation Till Now
                </NoNotificationTitle>
            }    
        </PopoverContent>
      </Popover>
    </div>
  );
}


const PopoverContent = styled.div`
    width: 300px;
    min-height: 350px;
    background: #031027;
    border: 1px solid #054BD7;
    border-radius: 5px;
`

const Popnotification = styled.div`
    margin: 4px 6px;
    width: 270px;
    min-height: 40px;
    border: 1px solid #2369F6;
    border-radius: 5px;
    padding: 2px 9px;
    overflow: auto;

    &:hover {
        cursor: pointer;
        border: 1px solid #054BD7;
    }
`

const NotificationTitle = styled.div`
    font-size: '8px'; 
    color:'#91909D'; 
    text-transform: 'uppercase';
    font-weight: 'bold';
`

const NotificationObject = styled.div`
    font-size: '18px'; 
    font-weight: 'bold';
    color:'#91909D'; 
    overflow: hidden;
`

const NoNotificationTitle = styled.div`
    font-size: '22px'; 
    color:'#91909D'; 
    text-transform: 'uppercase';
    font-weight: 'bold';
    margin: 20px 20px; 
`
