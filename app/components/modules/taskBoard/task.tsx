import styled from "@emotion/styled";
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DateRangeIcon from "@mui/icons-material/DateRange";
import TaskModal from "../taskModal";
import { labelsMapping, monthMap } from "../../../constants";
import { Column, Task } from "../../../types";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import { useMoralis } from "react-moralis";
import { smartTrim } from "../../../utils/utils";
import { Palette, useTheme } from "@mui/material";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";

type Props = {
  task: Task;
  index: number;
  column: Column;
};
const TaskContainer = ({ task, index, column }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const { space, setSpace } = useSpace();
  const { palette } = useTheme();
  return (
    <>
      {isOpen && (
        <TaskModal
          isOpen={isOpen}
          handleClose={handleClose}
          taskId={task.taskId}
          column={column}
        />
      )}
      <Draggable draggableId={task.taskId} index={index}>
        {(provided, snapshot) => (
          <TaskCard
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
            onClick={() => setIsOpen(true)}
            palette={palette}
          >
            <Container>
              <LabelsContainer>
                {task?.tags?.map((tag, index) => (
                  <LabelColor
                    color={labelsMapping[tag as keyof typeof labelsMapping]}
                    key={index}
                  />
                ))}
              </LabelsContainer>

              <Title palette={palette}>{task.title}</Title>

              <ChipContainer>
                {task.value && (
                  <Chip color="#99ccff">
                    <MonetizationOnIcon sx={{ fontSize: 12 }} />
                    {task.value} {task.token.symbol}
                  </Chip>
                )}
                {task.deadline && (
                  <Chip color="#5a6972">
                    <DateRangeIcon sx={{ fontSize: 12 }} />
                    {task.deadline.getDate()}{" "}
                    {
                      monthMap[
                        task.deadline.getMonth() as keyof typeof monthMap
                      ]
                    }
                  </Chip>
                )}
                {task.assignee.length > 0 && (
                  <Chip color="#ce93d8">
                    {smartTrim(
                      space.memberDetails[task.assignee[0]].username,
                      8
                    )}
                  </Chip>
                )}
                {task.status === 300 && (
                  <Chip color="#66bb6a">
                    <CreditScoreIcon sx={{ fontSize: 16 }} /> Paid
                  </Chip>
                )}
              </ChipContainer>
            </Container>
          </TaskCard>
        )}
      </Draggable>
    </>
  );
};

const LabelsContainer = styled.div`
  display: flex;
  flex-direction: row;
  word-wrap: break-word;
  margin-bottom: 1px;
`;

const LabelColor = styled.div<{ color: string }>`
  width: 40px;
  height: 6px;
  border-radius: 10px;
  margin-right: 5px;
  border: 1px solid ${(props) => props.color};
`;

const ChipContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const Chip = styled.div<{ color: string }>`
  padding: 0px 8px;
  height: 18px;
  font-size: 11px;
  border-radius: 25px;
  background-color: ${(props) => props.color};
  color: #000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin: 4px 4px 3px 0px;
  transition: color 2s ease-in-out;
`;

const TaskCard = styled.div<{ isDragging: boolean; palette: Palette }>`
  display: flex;
  flex-direction: column;
  height: fit-content;
  width: 16rem;
  margin: 5px;
  border: ${(props) =>
    props.isDragging
      ? `0.1px solid ${props.palette.text.secondary}`
      : "0.1px solid transparent"};
  padding: 0px 2px;
  border-radius: 5px;
  background-color: ${(props) => props.palette.primary.dark};
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  transition: border 0.3s ease-in-out;
  &:hover {
    border: 0.1px solid #eaeaea;
  }
`;

const Container = styled.div`
  padding: 7px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div<{ palette: Palette }>`
  font-size: 14px;
  word-wrap: break-word;
  color: ${(props) => props.palette.text.primary};
`;

export default TaskContainer;
