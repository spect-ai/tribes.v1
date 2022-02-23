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

function getTokens(amounts: any, chain: string) {
  var tokens = amounts[0];
  var values = amounts[2];
  var tokenValues = {};
  var tokenAddresses = {};
  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i] in tokenValues) {
      tokenValues[tokens[i]] += values[i];
    } else {
      tokenValues[tokens[i]] = values[i];
      tokenAddresses[tokens[i]] = chainTokenRegistry[chain][tokens[i]];
    }
  }

  return [tokenAddresses, tokenValues];
}

const Payment = ({}: Props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [polygonAmounts, setPolygonAmounts] = useState([] as any);
  const [polygonTokens, setPolygonTokens] = useState({} as any);
  const [polygonTokenAddresses, setPolygonTokenAddresses] = useState({} as any);

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

  const router = useRouter();
  const { id, bid } = router.query;
  const { Moralis, isInitialized } = useMoralis();

  const handleClose = (event: any, reason: any) => {
    setIsOpen(false);
  };
  const handleNextStep = () => setActiveStep(activeStep + 1);

  useEffect(() => {
    setIsLoading(true);
    if (isInitialized && bid) {
      getBatchPayAmount(Moralis, bid as string)
        .then((res: any) => {
          console.log(res);
          var dynamicSteps = [];
          if ("Polygon" in res) {
            const [polygonTokenAddresses, polygonTokenValues] = getTokens(
              res["Polygon"],
              "Polygon"
            );
            console.log("adad");

            setPolygonTokens(polygonTokenValues);
            setPolygonTokenAddresses(polygonTokenAddresses);
            dynamicSteps.push("Approve on Polygon");

            setPolygonAmounts(res["Polygon"]);
            dynamicSteps.push("Distribute on Polygon");
            console.log("sdsdsd");
          }

          if ("Ethereum" in res) {
            const [ethereumTokenAddresses, ethereumTokenValues] = getTokens(
              res["Ethereum"],
              "Ethereum"
            );

            setEthereumTokens(ethereumTokenValues);
            setEthereumTokenAddresses(ethereumTokenAddresses);
            dynamicSteps.push("Approve on Ethereum");

            setEthereumAmounts(res["Ethereum"]);
            dynamicSteps.push("Distribute on Ethereum");
          }

          if ("Avalanche" in res) {
            const [avalancheTokenAddresses, avalancheTokenValues] = getTokens(
              res["Avalanche"],
              "Avalanche"
            );

            setAvalancheTokens(avalancheTokenValues);
            setAvalancheTokenAddresses(avalancheTokenAddresses);
            dynamicSteps.push("Approve on Avalanche");

            setAvalancheAmounts(res["Avalanche"]);
            dynamicSteps.push("Distribute on Avalanche");
          }
          setSteps(dynamicSteps);
          setIsLoading(false);
          setIsOpen(true);
        })
        .catch((err: any) => alert(err));
    }
  }, [isInitialized, bid]);

  return (
    <>
      <Tooltip title="Batch Pay">
        <IconButton
          sx={{ mb: 0.5, p: 2 }}
          size="small"
          onClick={() => setIsOpen(true)}
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
          {activeStep === 0 && (
            <ApproveModal
              handleClose={handleClose}
              setActiveStep={setActiveStep}
              tokens={polygonTokens}
              tokenAddresses={polygonTokenAddresses}
              chain={"Polygon"}
            />
          )}
          {activeStep === 1 && (
            <BatchPay handleClose={handleClose} amounts={polygonAmounts} />
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
