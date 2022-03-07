import React, { useEffect, useState } from "react";
import { IconButton, Tooltip, styled } from "@mui/material";
import PaidIcon from "@mui/icons-material/Paid";
import { getBatchPayAmount } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import { getPendingApprovals } from "../../../adapters/contract";
import { useGlobal } from "../../../context/globalContext";
import { Registry } from "../../../types";
import { registryTemp } from "../../../constants";
import PaymentModal, { BatchPayInfo } from ".";
import { capitalizeFirstLetter } from "../../../utils/utils";

interface Props {}

export async function getRequiredApprovals(
  uniqueTokenAddresses: string[],
  aggregatedTokenValues: number[],
  chainId: string
) {
  const isApprovalRequired = await getPendingApprovals(
    uniqueTokenAddresses as string[],
    aggregatedTokenValues as number[],
    chainId
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
  const [maxActiveStep, setMaxActiveStep] = useState(0);

  const [validStepNumbers, setValidStepNumbers] = useState([] as any);
  const {
    state: { registry },
  } = useGlobal();
  const router = useRouter();
  const { id, bid } = router.query;
  const { Moralis, isInitialized } = useMoralis();

  return (
    <>
      <Tooltip title="Batch Pay">
        <IconButton
          sx={{ mb: 0.5, p: 2 }}
          size="small"
          onClick={() => {
            setIsLoading(true);
            console.log(registry);
            console.log(window.ethereum.networkVersion);
            getBatchPayAmount(
              Moralis,
              bid as string,
              window.ethereum.networkVersion
            ).then((res: BatchPayInfo) => {
              var batchPayInfo = {} as BatchPayInfo;
              batchPayInfo.currencyContributors = res.currencyContributors;
              batchPayInfo.currencyValues = res.currencyValues;
              batchPayInfo.contributors = res.contributors;
              batchPayInfo.tokenAddresses = res.tokenAddresses;
              batchPayInfo.tokenValues = res.tokenValues;
              batchPayInfo.taskIdsWithTokenPayment =
                res.taskIdsWithTokenPayment;
              batchPayInfo.taskIdsWithCurrencyPayment =
                res.taskIdsWithCurrencyPayment;

              batchPayInfo.type = "task";
              var dynamicSteps: string[] = [];
              var activeStep: number;
              console.log(res);
              getRequiredApprovals(
                res.uniqueTokenAddresses,
                res.aggregatedTokenValues,
                window.ethereum.networkVersion
              ).then((pendingApprovals: any) => {
                if (pendingApprovals.tokenAddresses.length > 0) {
                  batchPayInfo.aggregatedTokenValues =
                    pendingApprovals.tokenValues;
                  batchPayInfo.uniqueTokenAddresses =
                    pendingApprovals.tokenAddresses;
                  dynamicSteps.push(
                    `Approve tokens on ${capitalizeFirstLetter(
                      registryTemp[window.ethereum.networkVersion].name
                    )}`
                  );
                  activeStep = 0;
                  setMaxActiveStep(0);
                }

                if (batchPayInfo.tokenAddresses.length > 0) {
                  dynamicSteps.push(
                    `Distribute tokens on ${capitalizeFirstLetter(
                      registryTemp[window.ethereum.networkVersion].name
                    )}`
                  );
                  activeStep = activeStep === 0 ? activeStep : 1;
                  setMaxActiveStep(1);
                }
                if (batchPayInfo.currencyContributors.length > 0) {
                  dynamicSteps.push(
                    `Distribute ${
                      registryTemp[window.ethereum.networkVersion]
                        .nativeCurrency
                    } on ${capitalizeFirstLetter(
                      registryTemp[window.ethereum.networkVersion].name
                    )}`
                  );
                  activeStep =
                    activeStep === 0 || activeStep === 1 ? activeStep : 2;
                  setMaxActiveStep(2);
                }
                setActiveStep(activeStep);
                setBatchPayMetadata(batchPayInfo);
                setSteps(dynamicSteps);
                setIsOpen(true);
                setIsLoading(false);
              });
            });
          }}
        >
          <PaidIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {!isLoading && (
        <PaymentModal
          isModalOpen={isOpen}
          batchPayMetadata={batchPayMetadata}
          modalSteps={steps}
          activeModalStep={activeStep}
          maxModalActiveStep={maxActiveStep}
        />
      )}
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
