import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useMoralisFunction } from "../../../hooks/useMoralisFunction";
import usePrevious from "../../../hooks/usePrevious";
import { setCaretToEnd, uid } from "../../../utils/utils";
import EditableBlock from "./editableBlock";

type Props = {
  taskId: string;
};

const Editor = ({ taskId }: Props) => {
  const initialBlock = {
    id: uid(),
    html: "",
    tag: "p",
    type: "",
    imageUrl: "",
    embedUrl: "",
  };
  const [blocks, setBlocks] = useState([initialBlock]);
  const [currentBlockId, setCurrentBlockId] = useState("");
  const { runMoralisFunction } = useMoralisFunction();
  const prevBlocks = usePrevious(blocks);

  const updateBlockHandler = (updatedBlock: any) => {
    const index = blocks.map((b) => b.id).indexOf(updatedBlock.id);
    console.log({ updatedBlock });
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      tag: updatedBlock.tag,
      html: updatedBlock.html,
      imageUrl: updatedBlock.imageUrl,
      embedUrl: updatedBlock.embedUrl,
    };
    setBlocks(updatedBlocks);
  };

  const addBlockHandler = (currentBlock: any) => {
    setCurrentBlockId(currentBlock.id);
    console.log({ blocks });
    const newBlock = {
      id: uid(),
      html: "",
      tag: "p",
      type: `${currentBlock.type}`,
      imageUrl: "",
      embedUrl: "",
    };
    const index = blocks.map((b) => b.id).indexOf(currentBlock.id);
    const updatedBlocks = [...blocks];
    updatedBlocks.splice(index + 1, 0, newBlock);
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      tag: currentBlock.tag,
      html: currentBlock.html,
      type: currentBlock.type,
      imageUrl: currentBlock.imageUrl,
    };
    setBlocks(updatedBlocks);
    console.log("update sent");
    console.log({ updatedBlocks });
    runMoralisFunction("addBlockTaskDescription", {
      taskId,
      blocks: updatedBlocks,
    })
      .then((res) => {
        console.log(res);
      })
      .catch((res) => {
        console.log(res);
      });
  };

  const deleteBlockHandler = (currentBlock: any) => {
    if (blocks.length > 1) {
      setCurrentBlockId(currentBlock.id);
      const index = blocks.map((b) => b.id).indexOf(currentBlock.id);
      const deletedBlock = blocks[index];
      const updatedBlocks = [...blocks];
      updatedBlocks.splice(index, 1);
      setBlocks(updatedBlocks);
      // // If the deleted block was an image block, we have to delete
      // // the image file on the server
      // if (deletedBlock.tag === "img" && deletedBlock.imageUrl) {
      //   deleteImageOnServer(deletedBlock.imageUrl);
      // }
    }
  };

  const onDragEndHandler = (result: DropResult) => {
    const { destination, source } = result;

    // If we don't have a destination (due to dropping outside the droppable)
    // or the destination hasn't changed, we change nothing
    if (!destination || destination.index === source.index) {
      return;
    }

    const updatedBlocks = [...blocks];
    const removedBlocks = updatedBlocks.splice(source.index - 1, 1);
    updatedBlocks.splice(destination.index - 1, 0, removedBlocks[0]);
    setBlocks(updatedBlocks);
  };

  useEffect(() => {
    // If a new block was added, move the caret to it
    if (prevBlocks && prevBlocks.length + 1 === blocks.length) {
      const nextBlockPosition =
        blocks.map((b) => b.id).indexOf(currentBlockId) + 2;
      const nextBlock = document.querySelector(
        `[data-position="${nextBlockPosition}"]`
      );
      if (nextBlock) {
        // @ts-ignore
        nextBlock.focus();
      }
    }
    // If a block was deleted, move the caret to the end of the last block
    if (prevBlocks && prevBlocks.length - 1 === blocks.length) {
      const lastBlockPosition = prevBlocks
        .map((b: any) => b.id)
        .indexOf(currentBlockId);
      const lastBlock = document.querySelector(
        `[data-position="${lastBlockPosition}"]`
      );
      if (lastBlock) {
        setCaretToEnd(lastBlock);
      }
    }
  }, [blocks, prevBlocks, currentBlockId]);

  useEffect(() => {
    runMoralisFunction("getTaskDescription", { taskId })
      .then((res) => {
        setBlocks(res.blocks);
        console.log({ res });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <Container>
      <DragDropContext onDragEnd={onDragEndHandler}>
        <Droppable droppableId={"id"}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {blocks.map((block) => {
                const position = blocks.map((b) => b.id).indexOf(block.id) + 1;
                return (
                  <EditableBlock
                    key={block.id}
                    position={position}
                    id={block.id}
                    block={block}
                    blocks={blocks}
                    addBlock={addBlockHandler}
                    deleteBlock={deleteBlockHandler}
                    updateBlock={updateBlockHandler}
                  />
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  );
};

const Container = styled.div`
  margin-top: 1.5rem;
  margin-bottom: 2.5rem;
`;

export default Editor;
