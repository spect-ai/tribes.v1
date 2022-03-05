import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Modal,
  Stepper,
  Step,
  StepLabel,
  Typography,
  IconButton,
  Tooltip,
  styled,
} from "@mui/material";
import Link from "next/link";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaidIcon from "@mui/icons-material/Paid";
import ApproveModal from "./approve";
import BatchPay from "./batchPay";
import { getBatchPayAmount } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import Ethereum from "../../../images/ethereum-eth-logo.png";
import Polygon from "../../../images/polygon-matic-logo.png";
import Avalanche from "../../../images/avalanche-avax-logo.png";
import { getPendingApprovals } from "../../../adapters/contract";
import { useGlobal } from "../../../context/globalContext";
import { Registry } from "../../../types";
import { registryTemp } from "../../../constants";

interface Props {}

export interface BatchPayInfo {
  contributors: Array<string>;
  tokenAddresses: Array<string>;
  tokenValues: Array<number>;
  aggregatedTokenValues: Array<number>;
  uniqueTokenAddresses: Array<string>;
  taskIds: Array<string>;
}

export function getNetworkImage(network: string) {
  var img =
    network in ["1", "4"]
      ? Ethereum
      : network in ["137", "80001"]
      ? Polygon
      : network in ["43113", "43114"]
      ? Avalanche
      : null;
  return img;
}

async function getRequiredApprovals(
  uniqueTokenAddresses: string[],
  aggregatedTokenValues: number[]
) {
  const isApprovalRequired = await getPendingApprovals(
    uniqueTokenAddresses as string[],
    aggregatedTokenValues as number[]
  );

  var tokenAddresses = [];
  var tokenValues = [];
  for (let i = 0; i < uniqueTokenAddresses.length; i++) {
    if (isApprovalRequired[i]) {
      tokenAddresses.push(uniqueTokenAddresses[i]);
      tokenValues.push(aggregatedTokenValues[i]);
    }
  }
  return { tokenAddresses: tokenAddresses, tokenValues: tokenValues };
}

const Payment = ({}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [batchPayMetadata, setBatchPayMetadata] = useState({} as BatchPayInfo);
  const [steps, setSteps] = useState([] as any);
  const [activeStep, setActiveStep] = useState(0);
  const [validStepNumbers, setValidStepNumbers] = useState([] as any);
  const {
    state: { registry },
  } = useGlobal();
  const router = useRouter();
  const { id, bid } = router.query;
  const { Moralis, isInitialized } = useMoralis();

  const handleClose = (event: any, reason: any) => {
    setIsOpen(false);
  };
  const handleNextStep = () => {
    if (activeStep === validStepNumbers.length) {
      setIsOpen(false);
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  return (
    <>
      <Tooltip title="Batch Pay">
        <IconButton
          sx={{ mb: 0.5, p: 2 }}
          size="small"
          onClick={() => {
            setIsLoading(true);
            console.log(registry);
            getBatchPayAmount(
              Moralis,
              bid as string,
              window.ethereum.networkVersion
            ).then((res: BatchPayInfo) => {
              var batchPayInfo = {} as BatchPayInfo;
              batchPayInfo.contributors = res.contributors;
              batchPayInfo.tokenAddresses = res.tokenAddresses;
              batchPayInfo.tokenValues = res.tokenValues;
              batchPayInfo.taskIds = res.taskIds;

              var dynamicSteps: string[] = [];
              console.log(res);
              getRequiredApprovals(
                res.uniqueTokenAddresses,
                res.aggregatedTokenValues
              ).then((pendingApprovals: any) => {
                console.log(`pendingApprovals`);

                console.log(pendingApprovals);
                if (pendingApprovals.tokenAddresses.length > 0) {
                  batchPayInfo.aggregatedTokenValues =
                    pendingApprovals.tokenValues;
                  batchPayInfo.uniqueTokenAddresses =
                    pendingApprovals.tokenAddresses;
                  dynamicSteps.push(
                    `Approve on ${
                      registryTemp[window.ethereum.networkVersion].name
                    }`
                  );
                  setActiveStep(0);
                } else {
                  setActiveStep(1);
                }
                dynamicSteps.push(
                  `Distribute on ${
                    registryTemp[window.ethereum.networkVersion].name
                  }`
                );
                setBatchPayMetadata(batchPayInfo);
                setSteps(dynamicSteps);
                setIsLoading(false);
                setIsOpen(true);
              });
            });
          }}
        >
          <PaidIcon fontSize="small" />
        </IconButton>
      </Tooltip>
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
          {activeStep === 0 && isOpen && !isLoading && (
            <ApproveModal
              handleClose={handleClose}
              setActiveStep={setActiveStep}
              approvalInfo={batchPayMetadata}
              chainId={window.ethereum.networkVersion}
              neworkImage={getNetworkImage(window.ethereum.networkVersion)}
            />
          )}
          {activeStep === 1 && isOpen && !isLoading && (
            <BatchPay
              handleClose={handleClose}
              chainId={window.ethereum.networkVersion}
              batchPayInfo={batchPayMetadata}
              neworkImage={getNetworkImage(window.ethereum.networkVersion)}
            />
          )}
        </Box>
      </Modal>
    </>
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

export default Payment;
