import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Modal,
  Stepper,
  Step,
  StepLabel,
  styled,
  Typography,
  Chip,
} from "@mui/material";
import ApproveModal, { ApprovalInfo } from "./approve";
import BatchPay, { TokenDistributionInfo } from "./batchPay";
import BatchPayCurrency, { CurrencyDistributionInfo } from "./batchPayCurrency";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { useGlobal } from "../../../context/globalContext";
import { registryTemp } from "../../../constants";
import FmdBadIcon from "@mui/icons-material/FmdBad";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  tokenDistributionInfo: TokenDistributionInfo;
  currencyDistributionInfo: CurrencyDistributionInfo;
  approvalInfo: ApprovalInfo;
  modalSteps: string[];
  activeModalStep: number;
  maxModalActiveStep: number;
  handleStatusUpdate: Function;
}

export interface BatchPayInfo {
  taskIdsWithTokenPayment: Array<string>;
  taskIdsWithCurrencyPayment: Array<string>;
  epochId: string;
  type: string;
}

const PaymentModal = ({
  isModalOpen,
  setIsModalOpen,
  tokenDistributionInfo,
  currencyDistributionInfo,
  approvalInfo,
  modalSteps,
  activeModalStep,
  maxModalActiveStep,
  handleStatusUpdate,
}: Props) => {
  const [steps, setSteps] = useState(modalSteps);
  const [activeStep, setActiveStep] = useState(activeModalStep);
  const [maxActiveStep, setMaxActiveStep] = useState(maxModalActiveStep);
  const {
    state: { registry },
  } = useGlobal();
  const { space } = useSpace();
  const handleClose = (event: any, reason: any) => {
    setIsModalOpen(false);
  };
  const handleNextStep = () => {
    if (activeStep === maxActiveStep) {
      setIsModalOpen(false);
    } else {
      setActiveStep(activeStep + 1);
    }
  };
  return (
    <Modal open={isModalOpen} onClose={handleClose}>
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
        {activeStep === -1 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 16,
            }}
          >
            <Typography color="text.primary" sx={{ my: 2 }}>
              No pending tasks found on the current chain
            </Typography>
            <Chip
              icon={<FmdBadIcon />}
              label={`Your default chain is ${space.defaultPayment.chain.name}`}
            />
          </Box>
        )}
        {activeStep === 0 && isModalOpen && (
          <ApproveModal
            handleClose={handleClose}
            handleNextStep={handleNextStep}
            setActiveStep={setActiveStep}
            approvalInfo={approvalInfo}
            chainId={window.ethereum.networkVersion}
          />
        )}
        {activeStep === 1 && isModalOpen && (
          <BatchPay
            handleClose={handleClose}
            handleNextStep={handleNextStep}
            chainId={window.ethereum.networkVersion}
            tokenDistributionInfo={tokenDistributionInfo}
            handleStatusUpdate={handleStatusUpdate}
          />
        )}
        {activeStep === 2 && isModalOpen && (
          <BatchPayCurrency
            handleClose={handleClose}
            handleNextStep={handleNextStep}
            chainId={window.ethereum.networkVersion}
            currencyDistributionInfo={currencyDistributionInfo}
            handleStatusUpdate={handleStatusUpdate}
          />
        )}
      </Box>
    </Modal>
  );
};

export const modalStyle = {
  position: "absolute" as "absolute",
  top: "35%",
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
