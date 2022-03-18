import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { PrimaryButton } from "../../elements/styledComponents";
import PaidIcon from "@mui/icons-material/Paid";
import { useRouter } from "next/router";
import { Epoch } from "../../../types";
import { registryTemp } from "../../../constants";
import PaymentModal from "../payment";
import { getRequiredApprovals } from "../payment/batchPayIcon";
import { capitalizeFirstLetter } from "../../../utils/utils";
import { TokenDistributionInfo } from "../payment/batchPay";
import { ApprovalInfo } from "../payment/approve";
import { CurrencyDistributionInfo } from "../payment/batchPayCurrency";
import { notify } from "../settingsTab";
import { Toaster } from "react-hot-toast";
import { completeEpochPayment } from "../../../adapters/moralis";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";

type Props = {
  epoch: Epoch;
};

const PayoutButton = ({ epoch }: Props) => {
  const router = useRouter();
  const bid = router.query.bid as string;
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState([] as string[]);
  const [activeStep, setActiveStep] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [maxActiveStep, setMaxActiveStep] = useState(0);
  const [tokenDistributionInfo, setTokenDistributionInfo] = useState(
    {} as TokenDistributionInfo
  );
  const [approvalInfo, setApprovalInfo] = useState({} as ApprovalInfo);
  const [currencyDistributionInfo, setCurrencyDistributionInfo] = useState(
    {} as CurrencyDistributionInfo
  );
  const { space, setSpace } = useSpace();
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

  const handleStatusUpdate = (paymentType: string) => {
    completeEpochPayment(Moralis, epoch.objectId)
      .then((res: any) => {
        const temp = Object.assign(space, res);
        setSpace(temp);
      })
      .catch((err: any) => {
        notify(
          `Sorry! There was an error while updating the task status to 'Paid'. However, your payment went through.`,
          "error"
        );
      });
  };
  return (
    <>
      <PrimaryButton
        endIcon={<PaidIcon />}
        variant="outlined"
        disabled={epoch.paid}
        loading={isLoading}
        sx={{
          mx: 4,
          borderRadius: 1,
        }}
        size="small"
        color="secondary"
        onClick={() => {
          setIsLoading(true);
          var hasApproval = false;
          console.log(epoch);
          if (!epoch.nativeCurrencyPayment) {
            getRequiredApprovals(
              [epoch.token.address as string],
              [epoch.budget],
              window.ethereum.networkVersion
            )
              .then((pendingApprovals: any) => {
                console.log(pendingApprovals);
                if (pendingApprovals.tokenAddresses.length > 0) {
                  handleApprovalInfoUpdate(
                    pendingApprovals.tokenValues,
                    pendingApprovals.tokenAddresses
                  );
                  hasApproval = true;
                }

                const contributors = Object.keys(epoch.values);
                const tokenValues = Object.values(epoch.values);
                handleTokenDistributionInfoUpdate(
                  contributors,
                  Array(contributors.length).fill(epoch.token.address),
                  tokenValues as number[]
                );
                handleSteps(hasApproval, true, false);
                console.log(steps);
                console.log(activeStep);
                console.log(maxActiveStep);

                setIsOpen(true);
                setIsLoading(false);
              })
              .catch((err: any) => notify(err, "error"));
          } else {
            handleCurrencyDistributionInfoUpdate(
              Object.keys(epoch.values),
              Object.values(epoch.values)
            );
            handleSteps(false, false, true);
            console.log(steps);
            console.log(activeStep);
            console.log(maxActiveStep);

            setIsOpen(true);
            setIsLoading(false);
          }
        }}
      >
        Payout countributors
      </PrimaryButton>
      {!isLoading && (
        <PaymentModal
          isModalOpen={isOpen}
          approvalInfo={approvalInfo}
          tokenDistributionInfo={tokenDistributionInfo}
          currencyDistributionInfo={currencyDistributionInfo}
          modalSteps={steps}
          activeModalStep={activeStep}
          maxModalActiveStep={maxActiveStep}
          handleStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
};

export default PayoutButton;
