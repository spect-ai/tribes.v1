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
  useTheme,
  Tooltip,
  Grid,
  Avatar,
} from "@mui/material";
import Approve, { ApprovalInfo } from "./approve";
import BatchPay, { DistributionInfo } from "./batchPay";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { useGlobal } from "../../../context/globalContext";
import { registryTemp } from "../../../constants";
import FmdBadIcon from "@mui/icons-material/FmdBad";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import CardList from "./cardList";
import PaidIcon from "@mui/icons-material/Paid";
import { ButtonText, SidebarButton } from "../exploreSidebar";
import { capitalizeFirstLetter } from "../../../utils/utils";
import { completePayment } from "../../../adapters/moralis";
import { notify } from "../settingsTab";

interface Props {}

export interface BatchPayInfo {
  taskIdsWithTokenPayment: Array<string>;
  taskIdsWithCurrencyPayment: Array<string>;
  epochId: string;
  type: string;
}

const modalSteps = [
  "Pick Cards",
  "Approve Tokens",
  "Batch Pay Tokens",
  "Batch Pay Currency",
];

export type PaymentInfo = {
  approval: ApprovalInfo;
  tokens: DistributionInfo;
  currency: DistributionInfo;
};

const PaymentModal = ({}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadPaymentInfo, setLoadPaymentInfo] = useState(false);
  const [steps, setSteps] = useState(modalSteps);
  const { palette } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const {
    state: { registry },
  } = useGlobal();
  const [paymentInfo, setPaymentInfo] = useState({} as PaymentInfo);
  const { Moralis, user } = useMoralis();
  const { space, setSpace } = useSpace();

  const handleClose = () => {
    setIsOpen(false);
  };
  const handleNextStep = (newPaymentInfo: PaymentInfo) => {
    var newPaymentInfo: PaymentInfo = newPaymentInfo || paymentInfo;

    console.log(newPaymentInfo);
    if (activeStep === 0) {
      newPaymentInfo.approval?.required
        ? setActiveStep(1)
        : newPaymentInfo.tokens?.contributors?.length > 0
        ? setActiveStep(2)
        : newPaymentInfo.currency?.contributors?.length > 0
        ? setActiveStep(3)
        : handleClose();
    } else if (activeStep === 1) setActiveStep(2);
    else if (activeStep === 2)
      newPaymentInfo.currency?.contributors?.length > 0
        ? setActiveStep(3)
        : handleClose();
    else if (activeStep === 3) handleClose();
  };

  const handleStatusUpdate = (paymentType: string, taskIds: string[]) => {
    if (paymentType === "currency") {
      completePayment(Moralis, taskIds)
        .then((res: any) => {
          setSpace(res);
        })
        .catch((err: any) => {
          notify(
            `Sorry! There was an error while updating the task status to 'Paid'. However, your payment went through.`,
            "error"
          );
        });
    } else if (paymentType === "token") {
      completePayment(Moralis, taskIds)
        .then((res: any) => {
          setSpace(res);
        })
        .catch((err: any) => {
          notify(
            `Sorry! There was an error while updating the task status to 'Paid'. However, your payment went through.`,
            "error"
          );
        });
    }
  };

  return (
    <>
      <SidebarButton
        palette={palette}
        selected={isOpen}
        onClick={() => {
          setActiveStep(0);
          setIsOpen(true);
        }}
      >
        <Tooltip title="Batch Pay" placement="right" arrow sx={{ m: 0, p: 0 }}>
          <PaidIcon
            sx={{
              fontSize: 28,
              color: isOpen ? palette.secondary.main : palette.divider,
            }}
          />
        </Tooltip>
      </SidebarButton>
      <Modal open={isOpen} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ minHeight: "10vh" }}
          >
            <Grid item xs={3}>
              <Box style={{ display: "flex" }}>
                <Avatar
                  src={registry[window.ethereum.networkVersion]?.pictureUrl}
                  sx={{
                    width: "2rem",
                    height: "2rem",
                    objectFit: "cover",
                    my: 1,
                  }}
                />
                <Typography
                  color="text.primary"
                  variant="h5"
                  marginBottom="10px"
                  marginLeft="10px"
                >
                  {capitalizeFirstLetter(
                    registry[window.ethereum.networkVersion]?.name
                  )}{" "}
                  Network
                </Typography>
              </Box>
            </Grid>
          </Grid>
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
          {activeStep === 0 && isOpen && !isLoading && (
            <CardList
              setPaymentInfo={setPaymentInfo}
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              chainId={window.ethereum.networkVersion}
            />
          )}
          {activeStep === 1 && isOpen && !isLoading && (
            <Approve
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              setActiveStep={setActiveStep}
              approvalInfo={paymentInfo.approval}
              chainId={window.ethereum.networkVersion}
            />
          )}
          {activeStep === 2 && isOpen && !isLoading && (
            <BatchPay
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              chainId={window.ethereum.networkVersion}
              distributionInfo={paymentInfo.tokens}
              handleStatusUpdate={handleStatusUpdate}
            />
          )}
          {activeStep === 3 && isOpen && (
            <BatchPay
              handleClose={handleClose}
              handleNextStep={handleNextStep}
              chainId={window.ethereum.networkVersion}
              distributionInfo={paymentInfo.currency}
              handleStatusUpdate={handleStatusUpdate}
            />
          )}
        </Box>
      </Modal>{" "}
    </>
  );
};

export const modalStyle = {
  position: "absolute" as "absolute",
  top: "40%",
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
