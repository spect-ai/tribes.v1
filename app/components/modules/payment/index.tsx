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

export interface Contributor {
  ethAddress: string;
  username: string;
  profilePicture: object;
  objectId: string;
}

export interface BatchPayInfo {
  contributors: Array<Contributor>;
  tokenAddresses: Array<string>;
  tokenValues: Array<number>;
}

export interface ApprovalInfo {
  uniqueTokenAddresses: Array<string>;
  aggregatedTokenValues: Array<number>;
  uniqueTokenNames: Array<string>;
}

export function getNetworkImage(network: string) {
  var img =
    network === "Ethereum" ? Ethereum : network === "Polygon" ? Polygon : null;
  return img;
}

function getAggregateTokenValues(tokenAddresses: string[], values: number[]) {
  var aggregateValues = {};
  for (var i = 0; i < tokenAddresses.length; i++) {
    if (tokenAddresses[i] in aggregateValues) {
      aggregateValues[tokenAddresses[i]] += values[i];
    } else {
      aggregateValues[tokenAddresses[i]] = values[i];
    }
  }

  return [
    Object.keys(aggregateValues) as string[],
    Object.values(aggregateValues) as number[],
  ];
}

async function prepareForApproval(
  amounts: any,
  registry: Registry,
  networkId: string
) {
  var [tokenAddresses, tokenValues] = getAggregateTokenValues(
    amounts["tokenAddresses"],
    amounts["tokenValues"]
  );
  const isPendingApproval = await getPendingApprovals(
    tokenAddresses as string[],
    tokenValues as number[]
  );

  // Filter already approved tokens
  var tokenNames = tokenAddresses.map(
    (a) => registry[networkId].tokens[a].symbol
  );
  for (let i = 0; i < isPendingApproval.length; i++) {
    if (isPendingApproval[i] === false) {
      tokenAddresses.splice(i, 1);
      tokenValues.splice(i, 1);
      tokenNames.splice(i, 1);
    }
  }
  return [tokenAddresses, tokenValues, tokenNames];
}

const validSteps = [
  "Approve on Mumbai",
  "Distribute on Mumbai",
  "Approve on Fuji",
  "Distribute on Fuji",
  "Approve on Rinkeby",
  "Distribute on Rinkeby",
  "Approve on Polygon",
  "Distribute on Polygon",
  "Approve on Avalanche",
  "Distribute on Avalanche",
  "Approve on Ethereum",
  "Distribute on Ethereum",
];

const Payment = ({}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [batchPayMetadata, setBatchPayMetadata] = useState({} as BatchPayInfo);
  const [approvalMetadata, setApprovalMetadata] = useState({} as ApprovalInfo);
  const [activeChain, setActiveChain] = useState("");
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
            ).then((res: any) => {
              var dynamicSteps: string[] = [];
              console.log(res);
              prepareForApproval(
                res,
                registryTemp as Registry,
                window.ethereum.networkVersion
              ).then((approvalInfo: Array<Array<any>>) => {
                // Return true if approval required, otherwise false
                console.log(approvalInfo);
                if (approvalInfo[0].length > 0) {
                  const approvalData = {
                    uniqueTokenAddresses: approvalInfo[0],
                    aggregatedTokenValues: approvalInfo[1],
                    uniqueTokenNames: approvalInfo[2],
                  };
                  setApprovalMetadata(approvalData);
                  dynamicSteps.push(
                    `Approve on ${
                      registryTemp[window.ethereum.networkVersion].name
                    }`
                  );
                } else {
                  setActiveStep(1);
                }
                setBatchPayMetadata(res as BatchPayInfo);
                dynamicSteps.push(
                  `Distribute on ${
                    registryTemp[window.ethereum.networkVersion].name
                  }`
                );
                setIsLoading(false);
                setIsOpen(true);
                setSteps(dynamicSteps);
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
              approvalInfo={approvalMetadata}
              chain={activeChain}
            />
          )}
          {activeStep === 1 && isOpen && !isLoading && (
            <BatchPay
              handleClose={handleClose}
              chain={activeChain}
              batchPayInfo={batchPayMetadata}
            />
          )}
          {activeStep === 2 && isOpen && !isLoading && (
            <BatchPay
              handleClose={handleClose}
              chain={activeChain}
              batchPayInfo={batchPayMetadata}
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
