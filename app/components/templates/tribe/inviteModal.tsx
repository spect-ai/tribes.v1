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
import { PrimaryButton } from "../../elements/styledComponents";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { getInvitations, acceptInvitations } from "../../../adapters/moralis";
interface inviteModalProps {
    openModal: boolean;
    setShowModal: any
}


const InviteModal = ({openModal, setShowModal}:inviteModalProps) => {
    const [isAuth, setIsAuth] = useState(false)
    const handleClose = () => setShowModal(false);
    const [ethAddress, setEthAddress] = useState("");
    const { isAuthenticated, Moralis, user, authenticate } = useMoralis();
    const router = useRouter();
    const { id } = router.query;
    useEffect(() => {
        if(isAuthenticated)
        {
            setIsAuth(true)
            setEthAddress(user?.get("ethAddress"));
        }
        else
        {
            setIsAuth(false)
        }
        
    })

    const handleClickInvite=()=>{
        acceptInvitations(Moralis, ethAddress, id)
        .then((res: any[]) => {
            console.log("ressssAccepted", res);
        })
        .catch((ex: any) => {
        });
        setShowModal(false)
    }

    return (
        <Modal open={openModal} onClose={handleClose} closeAfterTransition>
            <Fade in={openModal} timeout={500}>
              <Box sx={modalStyle}>
              <Wrapper>
                    {
                        isAuth
                        ?
                        (
                            <Container>
                                <Text>
                                    You Got Invited To Team 12
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
                                    You Got Invited To Team 12
                                </Text>
                                <PrimaryButton type="submit" variant="outlined" fullWidth onClick={()=>authenticate()}>
                                    Accept Invite
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
  