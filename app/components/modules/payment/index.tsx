import React, { useEffect, useState } from "react";
import { Box, Button, Modal, Stepper, Step, StepLabel, Typography, IconButton, Tooltip } from "@mui/material";
import Link from "next/link";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaidIcon from "@mui/icons-material/Paid";
import ApproveModal from "./approve";
import BatchPay from "./batchPay";
import { getBatchPayAmount } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";

interface Props {}
export interface BatchPay {
  chain: {
    [key: string]: any;
  };
}

const steps = ["Approve", "Batch Pay"];

const Payment = ({}: Props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amounts, setAmounts] = useState({} as BatchPay);
  const router = useRouter();
  const { id, bid } = router.query;
  const { Moralis, isInitialized } = useMoralis();

  const handleClose = (event: any, reason: any) => {
    console.log("adad");
    setIsOpen(false);
  };
  const handleNextStep = () => setActiveStep(activeStep + 1);

  const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "40rem",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  useEffect(() => {
    setIsLoading(true);
    if (isInitialized && bid && isOpen) {
      getBatchPayAmount(Moralis, bid as string)
        .then((res: any) => {
          console.log(res);
          setAmounts(res);
          setIsLoading(false);
        })
        .catch((err: any) => alert(err));
    }
  }, [isInitialized, bid, isOpen]);

  return (
    <>
      <Tooltip title="Batch Pay">
        <IconButton sx={{ mb: 0.5, p: 2 }} size="small" onClick={() => setIsOpen(true)}>
          <PaidIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Modal open={isOpen} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
              } = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {activeStep === 0 && <ApproveModal handleClose={handleClose} setActiveStep={setActiveStep} />}
          {activeStep === 1 && <BatchPay handleClose={handleClose} amounts={amounts} />}
        </Box>
      </Modal>
    </>
  );
};

export default Payment;
