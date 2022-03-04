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

interface Props {}

export interface Contributor {
  ethAddress: string;
  username: string;
  profilePicture: object;
  objectId: string;
}

export interface BatchPayInfo {
  contributors: Array<Contributor>;
  tokenNames: Array<string>;
  tokenAddresses: Array<string>;
  tokenValues: Array<number>;
}

export interface ApprovalInfo {
  uniqueTokenAddresses: Array<string>;
  aggregatedTokenValues: Array<number>;
  uniqueTokenNames: Array<string>;
}

export interface BatchPayMetadata {
  [key: string]: BatchPayInfo;
}
export interface ApprovalMetadata {
  [key: string]: ApprovalInfo;
}

export function getNetworkImage(network: string) {
  var img =
    network === "Ethereum"
      ? Ethereum
      : network === activeChain
      ? Polygon
      : null;
  return img;
}

function getAggregateTokenValues(tokens: string[], values: number[]) {
  var aggregateValues = {};
  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i] in aggregateValues) {
      aggregateValues[tokens[i]] += values[i];
    } else {
      aggregateValues[tokens[i]] = values[i];
    }
  }

  return [
    Object.keys(aggregateValues) as string[],
    Object.values(aggregateValues) as number[],
  ];
}

function getTokenAddresses(
  chain: string,
  tokenNames: string[],
  chainTokenMap: Registry
) {
  var tokenAddresses = [];
  for (var i = 0; i < tokenNames.length; i++) {
    tokenAddresses.push(chainTokenMap[chain][tokenNames[i]]);
  }
  return tokenAddresses;
}

async function prepareForApproval(
  chain: string,
  amounts: any,
  chainTokenMap: Registry
) {
  var [tokenNames, tokenValues] = getAggregateTokenValues(
    amounts[chain]["tokenNames"],
    amounts[chain]["tokenValues"]
  );
  var tokenAddresses = getTokenAddresses(
    chain,
    tokenNames as string[],
    chainTokenMap
  );
  const isPendingApproval = await getPendingApprovals(
    tokenAddresses,
    tokenValues as number[]
  );

  // Filter already approved tokens
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
  const [batchPayMetadata, setBatchPayMetadata] = useState(
    {} as BatchPayMetadata
  );
  const [approvalMetadata, setApprovalMetadata] = useState(
    {} as ApprovalMetadata
  );
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
            const promises: Array<any> = [];
            getBatchPayAmount(Moralis, bid as string).then((res: any) => {
              var dynamicSteps: string[] = [];
              for (var chain of Object.keys(res)) {
                if (activeChain === chain) {
                  prepareForApproval(chain, res, registry as Registry).then(
                    (tokenInfo: Array<Array<any>>) => {
                      // Return true if approval required, otherwise false
                      if (tokenInfo[0].length > 0) {
                        const approvalData = {
                          chain: {
                            uniqueTokenAddresses: tokenInfo[0],
                            aggregatedTokenValues: tokenInfo[1],
                            uniqueTokenNames: tokenInfo[2],
                          },
                        };
                        setApprovalMetadata(approvalData);
                        dynamicSteps.push(`Approve on ${chain}`);
                        setValidStepNumbers([...validStepNumbers, 0]);
                      }
                    }
                  );
                }
                setBatchPayMetadata(res as BatchPayMetadata);
                dynamicSteps.push(`Distribute on ${chain}`);
                setValidStepNumbers([...validStepNumbers, 1]);
              }
              setSteps(dynamicSteps);
              setIsLoading(false);
              setIsOpen(true);
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

          {validStepNumbers[activeStep] === 0 && isOpen && !isLoading && (
            <ApproveModal
              handleClose={handleClose}
              setActiveStep={setActiveStep}
              approvalInfo={approvalMetadata[activeChain]}
              chain={activeChain}
            />
          )}

          {validStepNumbers[activeStep] === 1 && isOpen && !isLoading && (
            <BatchPay
              handleClose={handleClose}
              batchPayInfo={Object.assign(batchPayMetadata[activeChain], {
                tokenAddresses: getTokenAddresses(
                  activeChain,
                  batchPayMetadata[activeChain].tokenNames,
                  registry as Registry
                ),
              })}
              chain={activeChain}
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
