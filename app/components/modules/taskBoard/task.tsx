import styled from "@emotion/styled";
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { Avatar } from "@mui/material";
import { getMD5String } from "../../../utils/utils";
import TaskModal from "../taskModal";
import { Task } from "../../../types";
import { TaskPreview } from ".";

type Props = {
  task: TaskPreview;
  index: number;
};

const TaskContainer = ({ task, index }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <>
      {isOpen && <TaskModal isOpen={isOpen} handleClose={handleClose} taskId={task.taskId} />}
      <Draggable draggableId={task.taskId} index={index}>
        {(provided, snapshot) => (
          <TaskCard
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
            onClick={() => setIsOpen(true)}
          >
            <Container>
              <Title>{task.title}</Title>

              <ChipContainer>
                <Chip color="#99ccff">
                  <MonetizationOnIcon sx={{ fontSize: 12 }} />
                  {task.value} Matic
                </Chip>
                {task.deadline && (
                  <Chip color="#5a6972">
                    <DateRangeIcon sx={{ fontSize: 12 }} />
                    {task.deadline}
                  </Chip>
                )}
              </ChipContainer>

              <Text>
                <Avatar
                  alt=""
                  src={`https://www.gravatar.com/avatar/${getMD5String("test")}?d=identicon&s=32`}
                  sx={{
                    width: "1.3rem",
                    height: "1.3rem",
                    objectFit: "cover",
                    mr: 1,
                  }}
                />
                0xavp created this task on 29th feb
              </Text>
            </Container>
          </TaskCard>
        )}
      </Draggable>
    </>
  );
};

const ChipContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const Chip = styled.div<{ color: string }>`
  padding: 0px 8px;
  height: 20px;
  font-size: 11px;
  border-radius: 25px;
  background-color: ${(props) => props.color};
  color: #000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin: 4px 4px 6px 0px;
`;

const TaskCard = styled.div<{ isDragging: boolean }>`
  display: flex;
  flex-direction: column;
  height: fit-content;
  width: 16rem;
  margin: 5px;
  border: ${(props) => (props.isDragging ? "0.1px solid #0061ff" : "0.1px solid transparent")};
  padding: 5px;
  border-radius: 5px;
  background-color: #0a2354;
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

const Title = styled.div`
  font-size: 14px;
  word-wrap: break-word;
`;

const Text = styled.div`
  font-size: 12px;
  color: #99ccff;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export default TaskContainer;
