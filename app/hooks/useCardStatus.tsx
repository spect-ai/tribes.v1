import { useState, useEffect } from "react";
import { useSpace } from "../../pages/tribe/[id]/space/[bid]";
import { useMoralis } from "react-moralis";
import { Task } from "../types";

export function useCardStatus(task: Task) {
  const isCreated = () => {
    return task.status === 100;
  };

  const isAssigned = () => {
    return task.status === 105;
  };

  const isInReview = () => {
    return task.status === 200;
  };

  const isInRevision = () => {
    return task.status === 201;
  };

  const isClosed = () => {
    return task.status === 205;
  };

  const isPaid = () => {
    return task.status === 300;
  };

  const isArchived = () => {
    return task.status === 500;
  };
  return {
    isCreated,
    isInReview,
    isInRevision,
    isAssigned,
    isClosed,
    isArchived,
    isPaid,
  };
}