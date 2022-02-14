import React,{useState, useEffect} from 'react'
import {
    TextField,
    FormLabel,
    Autocomplete,
    Box,
    Modal,
    Fade,
  } from "@mui/material";
import styled from "@emotion/styled";
import { PrimaryButton } from "../../../app/components/elements/styledComponents";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { addMemberToTribe, checkMemberInTeam, getOrCreateUser, getTeam } from "../../../app/adapters/moralis";
import * as CryptoJS from "crypto-js";
// interface inviteModalProps {
//     openModal: boolean;
//     setShowModal: any
// }


const InviteModal = () => {
    const [isAuth, setIsAuth] = useState(false)
    const handleClose = () => {
        setShowModal(false)
        router.replace('/')
    };
    const [ethAddress, setEthAddress] = useState("");
    const [showModal, setShowModal] = useState(true)
    const [state, setState] = useState({
        teamId: '', 
        inviteType: '', 
        adminUserId: ''
    })
    const {teamId, inviteType, adminUserId} = state
    const { isAuthenticated, Moralis, user, authenticate, isAuthenticating } = useMoralis();
    const router = useRouter();
    const { id } = router.query;
    useEffect(() => {
        if(isAuthenticated)
        {
            setIsAuth(true)

            setEthAddress(user?.get("ethAddress"));
            // checkMemberInTeam(Moralis, Number(id), String(user?.id))
            //     .then((res: any[]) => {
            //         // decryptData(String(id))
            //         if(res)
            //         {
            //             router.replace(`/tribe/${id}`)
            //             setShowModal(false)
            //         }
            //         else
            //         {
            //             setShowModal(true)
            //         }
            //         // router.replace(`/tribe/${id}`)
            //     })
            //     .catch((error: any)=>{
            //         console.log('checkMemberInTeam',error)
            //         // handleClose()
            //         console.log('Error in fetching memeber')
            //     })
            //     getTeam(Moralis, Number(id))
            //         .then((res: any[]) => {
            //                 console.log('teams',res)
            //         })
            //         .catch((error: any)=>{
            //             console.log('getTeam',error)
            //         })
        }
        else
        {
            setIsAuth(false)
        }
        
    })

    useEffect(() => {
        if(id)
        {
            decryptData(String(id))
            checkMemberInTeam(Moralis, Number(teamId), String(user?.id))
                .then((res: any[]) => {
                    if(res)
                    {
                        router.replace(`/tribe/${teamId}`)
                        setShowModal(false)
                    }
                    else
                    {
                        setShowModal(true)
                    }
                })
                .catch((error: any)=>{
                    console.log('checkMemberInTeam',error)
                    handleClose()
                })
                // getTeam(Moralis, Number(teamId))
                //     .then((res: any[]) => {
                //             console.log('teams',res)
                //     })
                //     .catch((error: any)=>{
                //         console.log('getTeam',error)
                //     })
        }
        else
        {
            console.log('id not fetched', id)
        }
        
    },[id])

    const handleClickInvite=()=>{
        addMemberToTribe(Moralis, Number(teamId), String(user?.id), String(inviteType), adminUserId)
        .then((res: any[]) => {
            console.log("ressssAccepted", res);
            if(res)
            {
                router.replace(`/tribe/${teamId}`)
            }  
        })
        .catch((ex: any) => {
            console.log("acceptInvitations", ex);
            router.replace(`/`)
        });
        setShowModal(false)
    }

    const handleConnectWallet = () => {
        authenticate({}).then((res) => {
            getOrCreateUser(Moralis).then((res: any) => console.log(res));
        })
        .catch((err) => console.log(err))
    }

    const decryptData = (link: string) => {
        var bytes = CryptoJS.AES.decrypt(link, String(process.env.ENCRYPTION_SECRET_KEY));
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))[0];
        setState({
            teamId: decryptedData.id, 
            inviteType: decryptedData.type, 
            adminUserId: decryptedData.userId
        })

      }

    return (
        <Modal open={showModal} onClose={handleClose} closeAfterTransition>
            <Fade in={showModal} timeout={500}>
              <Box sx={modalStyle}>
              <Wrapper>
                    {
                        isAuth
                        ?
                        (
                            <Container>
                                <Text>
                                    You Got Invited To Team {teamId}
                                </Text>
                                <PrimaryButton variant="outlined" fullWidth onClick={()=>handleClickInvite()}>
                                    Accept Invite
                                </PrimaryButton>
                            </Container>
                        )
                        :
                        (
                            <Container>
                                <Text>
                                    Please connect your wallet
                                </Text>
                                <PrimaryButton loading={isAuthenticating} type="submit" variant="outlined" fullWidth onClick={()=>handleConnectWallet()}>
                                    Connect Wallet
                                </PrimaryButton>
                            </Container>
                        )
                    }
                </Wrapper>
              </Box>
            </Fade>
        </Modal>
    )
}

export default InviteModal

const Wrapper = styled.div`
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const Container = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
`

const Text = styled.div`
    margin-bottom: 25px;
`

const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "20rem",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 3,
    overflow: "auto",
    maxHeight: "calc(100% - 128px)",
  };
  