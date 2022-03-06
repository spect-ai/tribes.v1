import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { PrimaryButton } from "../../elements/styledComponents";
import PaidIcon from "@mui/icons-material/Paid";
import { useRouter } from "next/router";
import { Epoch } from "../../../types";
import { registryTemp } from "../../../constants";
import PaymentModal, { BatchPayInfo } from "../payment";
import { getRequiredApprovals } from "../payment/batchPayIcon";
import DownloadIcon from "@mui/icons-material/Download";

type Props = {
  epoch: Epoch;
};

const PayoutButton = ({ epoch }: Props) => {
  const router = useRouter();
  const bid = router.query.bid as string;
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState([] as string[]);
  const [activeStep, setActiveStep] = useState(0);
  const [batchPayMetadata, setBatchPayMetadata] = useState({} as BatchPayInfo);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <PrimaryButton
        endIcon={<PaidIcon />}
        variant="outlined"
        loading={isLoading}
        sx={{
          mx: 4,
          borderRadius: 1,
        }}
        size="small"
        onClick={() => {
          var dynamicSteps: string[] = [];
          var batchPayInfo = {} as BatchPayInfo;
          setIsLoading(true);
          getRequiredApprovals(
            [epoch.token.address as string],
            [epoch.budget]
          ).then((pendingApprovals: any) => {
            console.log(pendingApprovals);
            if (pendingApprovals.tokenAddresses.length > 0) {
              batchPayInfo.aggregatedTokenValues = pendingApprovals.tokenValues;
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

            batchPayInfo.tokenValues = Object.values(epoch.values);
            batchPayInfo.contributors = Object.keys(epoch.values);
            batchPayInfo.tokenAddresses = Array(
              batchPayInfo.contributors.length
            ).fill(epoch.token.address);
            batchPayInfo.type = "epoch";
            batchPayInfo.epochId = epoch.objectId;

            setBatchPayMetadata(batchPayInfo);
            setSteps(dynamicSteps);
            setIsOpen(true);
            setIsLoading(false);
          });
        }}
      >
        Payout countributors
      </PrimaryButton>
      {!isLoading && (
        <PaymentModal
          isModalOpen={isOpen}
          batchPayMetadata={batchPayMetadata}
          modalSteps={steps}
          activeModalStep={activeStep}
        />
      )}
    </>
  );
};

export default PayoutButton;
