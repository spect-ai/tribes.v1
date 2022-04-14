import PaidIcon from "@mui/icons-material/Paid";
import { ListItemButton, ListItemText } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../../pages/tribe/[id]/space/[bid]";
import {
  approve,
  batchPayTokens,
  distributeEther,
} from "../../../../adapters/contract";
import { useGlobal } from "../../../../context/globalContext";
import { useMoralisFunction } from "../../../../hooks/useMoralisFunction";
import { Task } from "../../../../types";
import { notify } from "../../settingsTab";
import { useCardDynamism } from "../../../../hooks/useCardDynamism";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
  handleClose: () => void;
};

const PayButton = ({ task, setTask, handleClose }: Props) => {
  const { space, setSpace } = useSpace();
  const { user } = useMoralis();
  const { state } = useGlobal();
  const { registry } = state;
  const { runMoralisFunction } = useMoralisFunction();
  const { viewableComponents } = useCardDynamism(task);
  const [payButtonText, setPayButtonText] = useState(
    viewableComponents["pay"] === "showPay" ? "Pay" : "Approve"
  );

  const handleTaskStatusUpdate = (transactionHash: string) => {
    runMoralisFunction("updateCard", {
      updates: {
        status: 300,
        transactionHash: transactionHash,
        taskId: task.taskId,
      },
    })
      .then((res) => {
        console.log(res);
        setSpace(res.space);
        setTask(res.task);
      })
      .catch((res) => {
        console.log(res);
      });
  };

  const handlePaymentError = (err: any) => {
    console.log(err);
    if (window.ethereum.networkVersion !== task.chain.chainId)
      notify(`Please switch to ${task.chain?.name} network`, "error");
    else {
      notify(err.message, "error");
    }
  };

  const handleClick = () => {
    if (viewableComponents["pay"] === "showPay") {
      setPayButtonText("Paying...");
      task.token.symbol === registry[task.chain.chainId].nativeCurrency
        ? distributeEther(
            [space.memberDetails[task.assignee[0]].ethAddress],
            [task.value],
            task.taskId,
            window.ethereum.networkVersion
          )
            .then((res: any) => {
              console.log(res);
              setPayButtonText("Paid");
              handleTaskStatusUpdate(res.transactionHash);
              handleClose();
            })
            .catch((err: any) => {
              setPayButtonText("Pay");
              handlePaymentError(err);
            })
        : batchPayTokens(
            [task.token.address as string],
            [space.memberDetails[task.assignee[0]].ethAddress],
            [task.value],
            task.taskId,
            window.ethereum.networkVersion
          )
            .then((res: any) => {
              console.log(res);

              setPayButtonText("Paid");
              handleTaskStatusUpdate(res.transactionHash);
              handleClose();
            })
            .catch((err: any) => {
              setPayButtonText("Pay");
              handlePaymentError(err);
            });
    } else if (viewableComponents["pay"] === "showApprove") {
      if (task.chain?.chainId !== window.ethereum.networkVersion) {
        handlePaymentError({});
      } else {
        setPayButtonText("Approving...");
        approve(task.chain.chainId, task.token.address as string)
          .then((res: any) => {
            setPayButtonText("Approved");
            if (user) {
              if (
                user?.get("distributorApproved") &&
                task.chain.chainId in user?.get("distributorApproved")
              ) {
                user
                  ?.get("distributorApproved")
                  [task.chain.chainId].push(task.token.address as string);
              } else if (user?.get("distributorApproved")) {
                user?.set("distributorApproved", {
                  ...user?.get("distributorApproved"),
                  [task.chain.chainId]: [task.token.address as string],
                });
              } else {
                user?.set("distributorApproved", {
                  [task.chain.chainId]: [task.token.address as string],
                });
              }
              user.save();
            }
            setPayButtonText("Pay");
          })
          .catch((err: any) => {
            handlePaymentError(err);
            setPayButtonText("Approve");
          });
      }
    }
  };

  useEffect(() => {
    setPayButtonText(
      viewableComponents["pay"] === "showPay" ? "Pay" : "Approve"
    );
  }, [viewableComponents?.pay]);

  return (
    <>
      {!(viewableComponents["pay"] === "hide") && (
        <ListItemButton
          onClick={() => {
            handleClick();
          }}
        >
          <PaidIcon sx={{ width: "2rem", mr: 2 }} />
          <ListItemText primary={payButtonText} />
        </ListItemButton>
      )}
    </>
  );
};

export default PayButton;
