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
import { chainTokenRegistry } from "../../../constants";
import { getPendingApprovals } from "../../../adapters/contract";

interface Props {}
export interface BatchPay {
  chain: {
    [key: string]: any;
  };
}

export function getNetworkImage(network: string) {
  var img =
    network === "Ethereum" ? Ethereum : network === "Polygon" ? Polygon : null;
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

function getTokenAddresses(tokens: string[], chain: string) {
  var tokenAddresses = [];
  console.log(tokens);
  for (var i = 0; i < tokens.length; i++) {
    tokenAddresses.push(chainTokenRegistry[chain][tokens[i]]);
  }
  return tokenAddresses;
}

function filterUnapprovedTokens(
  isUnapproved: boolean[],
  addresses: string[],
  values: number[],
  names: string[]
) {
  for (let i = 0; i < isUnapproved.length; i++) {
    if (isUnapproved[i] === false) {
      addresses.splice(i, 1);
      values.splice(i, 1);
      names.splice(i, 1);
    }
  }
  return [addresses, values, names];
}

async function prepareForApproval(
  chain: string,
  amounts: any,
  setTokenAddresses: any,
  setTokenValues: any,
  setTokenNames: any
) {
  var [tokenNames, tokenValues] = getAggregateTokenValues(
    amounts[chain][0],
    amounts[chain][2]
  );
  var tokenAddresses = getTokenAddresses(tokenNames as string[], chain);

  getPendingApprovals(tokenAddresses, tokenValues as number[]).then(
    (res: any) => {
      console.log(res);
      [tokenAddresses, tokenValues, tokenNames] = filterUnapprovedTokens(
        res,
        tokenAddresses,
        tokenValues as number[],
        tokenNames as string[]
      );
      console.log(tokenAddresses);

      if (tokenAddresses.length > 0) {
        setTokenAddresses(tokenAddresses);
        setTokenValues(tokenValues);
        setTokenNames(tokenNames);
        console.log(`its true`);

        return true;
      }
      console.log(`its false`);

      return false;
    }
  );
}

const Payment = ({}: Props) => {
  const [activeStep, setActiveStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [polygonAmounts, setPolygonAmounts] = useState([] as any);
  const [polygonTokenValues, setPolygonTokenValues] = useState([] as any);
  const [polygonTokenAddresses, setPolygonTokenAddresses] = useState([] as any);
  const [polygonTokenNames, setPolygonTokenNames] = useState([] as any);

  const [ethereumAmounts, setEthereumAmounts] = useState([] as any);
  const [ethereumTokens, setEthereumTokens] = useState({} as any);
  const [ethereumTokenAddresses, setEthereumTokenAddresses] = useState(
    {} as any
  );

  const [avalancheAmounts, setAvalancheAmounts] = useState([] as any);
  const [avalancheTokens, setAvalancheTokens] = useState({} as any);
  const [avalancheTokenAddresses, setAvalancheTokenAddresses] = useState(
    {} as any
  );

  const [steps, setSteps] = useState([] as any);
  const [validStepNumbers, setValidStepNumbers] = useState([] as any);

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
              console.log(res);
              var dynamicSteps: string[] = [];
              if ("Polygon" in res) {
                promises.push(
                  prepareForApproval(
                    "Polygon",
                    res,
                    setPolygonTokenAddresses,
                    setPolygonTokenValues,
                    setPolygonTokenNames
                  ).then((gottaApprove: any) => {
                    if (gottaApprove) {
                      dynamicSteps.push(`Approve on Polygon`);
                      setValidStepNumbers([...validStepNumbers, 0]);
                    }
                  })
                );
                setPolygonAmounts(res["Polygon"]);
                dynamicSteps.push("Distribute on Polygon");

                setSteps(dynamicSteps);
                setValidStepNumbers([...validStepNumbers, 1]);
                setIsLoading(false);
                setIsOpen(true);
              }
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
          {activeStep === 0 && isOpen && (
            <ApproveModal
              handleClose={handleClose}
              setActiveStep={setActiveStep}
              tokenNames={polygonTokenNames}
              tokenAddresses={polygonTokenAddresses}
              tokenValues={polygonTokenValues}
              chain={"Polygon"}
            />
          )}
          {activeStep === 1 && isOpen && !isLoading && (
            <BatchPay
              handleClose={handleClose}
              contributors={polygonAmounts[1]}
              tokenNames={polygonAmounts[0]}
              tokenAddresses={getTokenAddresses(polygonAmounts[0], "Polygon")}
              tokenValues={polygonAmounts[2]}
              chain={"Polygon"}
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
