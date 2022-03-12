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
import PaymentModal from ".";
import { TokenDistributionInfo } from "./batchPay";
import { ApprovalInfo } from "./approve";
import { CurrencyDistributionInfo } from "./batchPayCurrency";
import { completePayment } from "../../../adapters/moralis";
import { capitalizeFirstLetter } from "../../../utils/utils";
import { notifyError } from "../settingsTab";
import { useBoard } from "../taskBoard";
import { Toaster } from "react-hot-toast";

interface Props {}

interface BatchPayResponse {
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
  const [tokenDistributionInfo, setTokenDistributionInfo] = useState(
    {} as TokenDistributionInfo
  );
  const [approvalInfo, setApprovalInfo] = useState({} as ApprovalInfo);
  const [currencyDistributionInfo, setCurrencyDistributionInfo] = useState(
    {} as CurrencyDistributionInfo
  );
  const [taskIdsWithTokenPayment, setTaskIdsWithTokenPayment] = useState(
    [] as string[]
  );
  const [taskIdsWithCurencyPayment, setTaskIdsWithCurencyPayment] = useState(
    [] as string[]
  );
  const { data, setData } = useBoard();

  const [steps, setSteps] = useState([] as string[]);
  const [activeStep, setActiveStep] = useState(-1);
  const [maxActiveStep, setMaxActiveStep] = useState(-1);
  const {
    state: { registry },
  } = useGlobal();
  const router = useRouter();
  const { id, bid } = router.query;
  const { Moralis, isInitialized } = useMoralis();

  const handleApprovalInfoUpdate = (
    uniqueTokenAddresses: string[],
    aggregatedTokenValues: number[]
  ) => {
    if (uniqueTokenAddresses.length > 0) {
      setApprovalInfo({
        uniqueTokenAddresses: uniqueTokenAddresses,
        aggregatedTokenValues: aggregatedTokenValues,
      });
    }
  };
  const handleTokenDistributionInfoUpdate = (
    contributors: string[],
    tokenAddresses: string[],
    tokenValues: number[]
  ) => {
    if (contributors.length > 0) {
      setTokenDistributionInfo({
        contributors: contributors,
        tokenAddresses: tokenAddresses,
        tokenValues: tokenValues,
      });
    }
  };

  const handleCurrencyDistributionInfoUpdate = (
    contributors: string[],
    values: number[]
  ) => {
    if (contributors.length > 0) {
      setCurrencyDistributionInfo({
        contributors: contributors,
        values: values,
      });
    }
  };
  const handleStatusUpdate = (paymentType: string) => {
    if (paymentType === "currency") {
      completePayment(Moralis, taskIdsWithCurencyPayment)
        .then((res: any) => {
          setData(res);
        })
        .catch((err: any) => {
          notifyError(err);
        });
    } else if (paymentType === "token") {
      completePayment(Moralis, taskIdsWithTokenPayment)
        .then((res: any) => {
          setData(res);
        })
        .catch((err: any) => {
          notifyError(err);
        });
    }
  };

  const handleSteps = (
    hasApproval: boolean,
    hasTokenDistribution: boolean,
    hasCurrencyDistribution: boolean
  ) => {
    var dynamicSteps: string[] = [];
    var newActiveStep = -1;
    if (hasApproval) {
      dynamicSteps.push(
        `Approve tokens on ${capitalizeFirstLetter(
          registryTemp[window.ethereum.networkVersion].name
        )}`
      );
      newActiveStep = 0;
      setMaxActiveStep(0);
    }
    if (hasTokenDistribution) {
      dynamicSteps.push(
        `Distribute tokens on ${capitalizeFirstLetter(
          registryTemp[window.ethereum.networkVersion].name
        )}`
      );
      newActiveStep = newActiveStep === 0 ? newActiveStep : 1;
      setMaxActiveStep(1);
    }
    if (hasCurrencyDistribution) {
      dynamicSteps.push(
        `Distribute currency on ${capitalizeFirstLetter(
          registryTemp[window.ethereum.networkVersion].name
        )}`
      );
      newActiveStep =
        newActiveStep === 0 || newActiveStep === 1 ? newActiveStep : 2;
      setMaxActiveStep(2);
    }
    setSteps(dynamicSteps);
    setActiveStep(newActiveStep);
  };

  return (
    <>
      <Toaster />
      <Tooltip title="Batch Pay">
        <IconButton
          sx={{ mb: 0.5, p: 2 }}
          size="small"
          onClick={() => {
            setIsLoading(true);
            getBatchPayAmount(
              Moralis,
              bid as string,
              window.ethereum.networkVersion
            )
              .then((res: BatchPayResponse) => {
                setTaskIdsWithCurencyPayment(res.taskIdsWithCurrencyPayment);
                setTaskIdsWithTokenPayment(res.taskIdsWithTokenPayment);
                var hasApproval = false;
                getRequiredApprovals(
                  res.uniqueTokenAddresses,
                  res.aggregatedTokenValues,
                  window.ethereum.networkVersion
                )
                  .then((pendingApprovals: any) => {
                    if (pendingApprovals.tokenAddresses.length > 0) {
                      handleApprovalInfoUpdate(
                        pendingApprovals.tokenValues,
                        pendingApprovals.tokenAddresses
                      );
                      hasApproval = true;
                    }
                    handleTokenDistributionInfoUpdate(
                      res.contributors,
                      res.tokenAddresses,
                      res.tokenValues
                    );

                    handleCurrencyDistributionInfoUpdate(
                      res.currencyContributors,
                      res.currencyValues
                    );
                    handleSteps(
                      hasApproval,
                      res.contributors.length > 0,
                      res.currencyContributors.length > 0
                    );
                    setIsOpen(true);
                    setIsLoading(false);
                  })
                  .catch((err: any) => notifyError(err));
              })
              .catch((err: any) => notifyError(err));
          }}
        >
          <PaidIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {!isLoading && (
        <PaymentModal
          isModalOpen={isOpen}
          tokenDistributionInfo={tokenDistributionInfo}
          currencyDistributionInfo={currencyDistributionInfo}
          approvalInfo={approvalInfo}
          modalSteps={steps}
          activeModalStep={activeStep}
          maxModalActiveStep={maxActiveStep}
          handleStatusUpdate={handleStatusUpdate}
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
