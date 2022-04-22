import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import usePrevious from '../../../hooks/usePrevious';
import { Block } from '../../../types';
import { setCaretToEnd, uid } from '../../../utils/utils';
import EditableBlock from './editableBlock';

type Props = {
  syncBlocksToMoralis: Function;
  initialBlock: Block[];
  placeholderText: string;
  readonly?: boolean;
};

const Container = styled.div`
  margin-top: 1.5rem;
  min-height: 8rem;
`;

export default function Editor({
  syncBlocksToMoralis,
  initialBlock,
  placeholderText,
  readonly,
}: Props) {
  const [blocks, setBlocks] = useState(initialBlock);
  const [currentBlockId, setCurrentBlockId] = useState('');
  const prevBlocks = usePrevious(blocks);

  const updateBlockHandler = (updatedBlock: any, sync?: boolean) => {
    const index = blocks.map((b) => b.id).indexOf(updatedBlock.id);
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      tag: updatedBlock.tag,
      html: updatedBlock.html,
      imageUrl: updatedBlock.imageUrl,
      embedUrl: updatedBlock.embedUrl,
    };
    setBlocks(updatedBlocks);
    if (sync) {
      syncBlocksToMoralis(updatedBlocks);
    }
  };

  const addBlockHandler = (currentBlock: any) => {
    setCurrentBlockId(currentBlock.id);
    const newBlock = {
      id: uid(),
      html: '',
      tag: 'p',
      type: `${currentBlock.type}`,
      imageUrl: '',
      embedUrl: '',
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
    syncBlocksToMoralis(updatedBlocks);
  };

  const deleteBlockHandler = (currentBlock: any) => {
    if (blocks.length > 1) {
      setCurrentBlockId(currentBlock.id);
      const index = blocks.map((b) => b.id).indexOf(currentBlock.id);
      const deletedBlock = blocks[index];
      const updatedBlocks = [...blocks];
      updatedBlocks.splice(index, 1);
      setBlocks(updatedBlocks);
      syncBlocksToMoralis(updatedBlocks);

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
    syncBlocksToMoralis(updatedBlocks);
  };

  useEffect(() => {
    // If a new block was added, move the caret to it
    if (prevBlocks && prevBlocks.length + 1 === blocks?.length) {
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
    if (prevBlocks && prevBlocks.length - 1 === blocks?.length) {
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

  return (
    <Container>
      <DragDropContext onDragEnd={onDragEndHandler}>
        <Droppable droppableId="id">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {blocks?.map((block, index) => {
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
                    placeholderText={placeholderText}
                    readOnly={readonly || false}
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
}
