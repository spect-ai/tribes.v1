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
import { getInvitations, acceptInvitations, checkMemberInTeam, getOrCreateUser } from "../../../app/adapters/moralis";
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
    const { isAuthenticated, Moralis, user, authenticate, isAuthenticating } = useMoralis();
    const router = useRouter();
    const { id } = router.query;
    useEffect(() => {
        if(isAuthenticated)
        {
            setIsAuth(true)
            setEthAddress(user?.get("ethAddress"));
            checkMemberInTeam(Moralis, Number(id), String(user?.id))
                .then((res: any[]) => {
                    if(res)
                    {
                        router.replace(`/tribe/${id}`)
                        setShowModal(false)
                    }
                    else
                    {
                        setShowModal(true)
                    }
                    console.log('Memeber exist')
                })
                .catch((error: any)=>{
                    console.log(error)
                    // handleClose()
                    console.log('Error in fetching memeber')
                })
        }
        else
        {
            setIsAuth(false)
        }
        
    })
    const handleClickInvite=()=>{
        acceptInvitations(Moralis, ethAddress, Number(id))
        .then((res: any[]) => {
            console.log("ressssAccepted", res);
            router.replace(`/tribe/${id}`)
        })
        .catch((ex: any) => {
            console.log("ressssAccepted", ex);
            router.replace(`/`)
        });
        setShowModal(false)
    }

    const handleConnectWallet = () => {
        authenticate({}).then((res) => {
            console.log(res);
            getOrCreateUser(Moralis).then((res: any) => console.log(res));
        })
        .catch((err) => console.log(err))
        // router.reload()
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
                                    You Got Invited To Team {id}
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
  