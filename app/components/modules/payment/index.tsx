import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Modal,
  Stepper,
  Step,
  StepLabel,
  styled,
} from "@mui/material";
import ApproveModal from "./approve";
import BatchPay from "./batchPay";
import BatchPayCurrency from "./batchPayCurrency";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { useGlobal } from "../../../context/globalContext";
import { registryTemp } from "../../../constants";

interface Props {
  isModalOpen: boolean;
  batchPayMetadata: BatchPayInfo;
  modalSteps: string[];
  activeModalStep: number;
  maxModalActiveStep: number;
}

export interface BatchPayInfo {
  currencyContributors: Array<string>;
  currencyValues: Array<number>;
  contributors: Array<string>;
  tokenAddresses: Array<string>;
  tokenValues: Array<number>;
  aggregatedTokenValues: Array<number>;
  uniqueTokenAddresses: Array<string>;
  taskIdsWithTokenPayment: Array<string>;
  taskIdsWithCurrencyPayment: Array<string>;
  epochId: string;
  type: string;
}

const PaymentModal = ({
  isModalOpen,
  batchPayMetadata,
  modalSteps,
  activeModalStep,
  maxModalActiveStep,
}: Props) => {
  console.log(activeModalStep);
  console.log(maxModalActiveStep);
  console.log(isModalOpen);
  console.log(modalSteps);
  console.log(batchPayMetadata);

  const [isOpen, setIsOpen] = useState(isModalOpen);
  const [steps, setSteps] = useState(modalSteps);
  const [activeStep, setActiveStep] = useState(activeModalStep);
  const [maxActiveStep, setMaxActiveStep] = useState(maxModalActiveStep);
  const {
    state: { registry },
  } = useGlobal();
  const router = useRouter();
  const handleClose = (event: any, reason: any) => {
    setIsOpen(false);
  };
  const handleNextStep = () => {
    if (activeStep === maxActiveStep) {
      setIsOpen(false);
    } else {
      setActiveStep(activeStep + 1);
    }
  };
  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Stepper activeStep={activeStep}>
          {steps.map((label: any, index: number) => {
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
        {activeStep === 0 && isOpen && (
          <ApproveModal
            handleClose={handleClose}
            handleNextStep={handleNextStep}
            setActiveStep={setActiveStep}
            approvalInfo={batchPayMetadata}
            chainId={window.ethereum.networkVersion}
          />
        )}
        {activeStep === 1 && isOpen && (
          <BatchPay
            handleClose={handleClose}
            handleNextStep={handleNextStep}
            chainId={window.ethereum.networkVersion}
            batchPayInfo={batchPayMetadata}
          />
        )}
        {activeStep === 2 && isOpen && (
          <BatchPayCurrency
            handleClose={handleClose}
            handleNextStep={handleNextStep}
            chainId={window.ethereum.networkVersion}
            batchPayInfo={batchPayMetadata}
          />
        )}
      </Box>
    </Modal>
  );
};

export const modalStyle = {
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

export const Heading = styled("div")(({ theme }) => ({
  fontWeight: 500,
  fontSize: 16,
  color: theme.palette.text.secondary,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  borderBottom: "1px solid #99ccff",
  padding: 16,
  paddingLeft: 32,
}));

export default PaymentModal;
