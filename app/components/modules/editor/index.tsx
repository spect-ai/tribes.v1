import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import usePrevious from '../../../hooks/usePrevious';
import { Block } from '../../../types';
import { getSelectedNodes, setCaretToEnd, uid } from '../../../utils/utils';
import EditableClassBlock from './editableClassBlock';

type Props = {
  syncBlocksToMoralis: Function;
  initialBlock: Block[];
  placeholderText: string;
  readonly: boolean;
};

const Container = styled.div<{
  readonly: boolean;
}>`
  margin-top: 1.5rem;
  min-height: ${(props) => (props.readonly ? '1rem' : '8rem')};
`;
function Editor({
  syncBlocksToMoralis,
  initialBlock,
  placeholderText,
  readonly,
}: Props) {
  const [blocks, setBlocks] = useState(initialBlock);
  const [isDragging, setIsDragging] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentBlockId, setCurrentBlockId] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [previousKey, setPreviousKey] = useState('');
  const prevBlocks = usePrevious(blocks);

  const updateHistoryStack = (action: any) => {
    setHistory((his) => {
      const newHistory = [...his];
      newHistory.push(action);
      return newHistory;
    });
    if (history.length > 3) {
      setHistory(history.slice(1));
    }
  };

  const popHistoryStack = () => {
    if (history.length > 0) {
      setBlocks(history[history.length - 1]);
      setHistory(history.slice(0, history.length - 1));
    }
  };

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
    const newBlock = {
      id: uid(),
      html: '',
      tag: 'p',
      type: `${currentBlock.type}`,
      imageUrl: '',
      embedUrl: '',
      isSelected: false,
    };
    setCurrentBlockId(currentBlock.id);
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
    if (history.length > 0) {
      setHistory(history.slice(1));
    }
  };

  const deleteBlockHandler = (currentBlock: { id: string; html: string }) => {
    updateHistoryStack(blocks);
    if (blocks.length > 0) {
      const nodes = getSelectedNodes();
      const posBlocks: number[] = [];
      for (let i = 0; i < nodes.length; i += 1) {
        if (nodes[i].dataset?.position) {
          posBlocks.push(nodes[i].dataset.position);
        }
      }
      setCurrentBlockId(currentBlock.id);
      // const deletedBlock = blocks[index];
      const updatedBlocks = [...blocks];
      if (posBlocks.length > 0) {
        updatedBlocks.splice(posBlocks[0] - 1, posBlocks.length);
      } else {
        const index = blocks.map((b) => b.id).indexOf(currentBlock.id);
        updatedBlocks.splice(index, 1);
      }
      if (updatedBlocks.length === 0) {
        const newBlock = {
          id: uid(),
          html: '',
          tag: 'p',
          type: '',
          imageUrl: '',
          embedUrl: '',
          isSelected: false,
        };
        updatedBlocks.push(newBlock);
      }

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

  const handleMouseDown = (e: any) => {
    setMousePosition({ x: e.pageX, y: e.pageY });
    setIsClicked(true);
  };

  const handleMouseUp = (e: any) => {
    setIsClicked(false);
    setIsDragging(false);
  };

  const handleMouseMove = (e: any) => {
    const delta = 6;
    const diffX = Math.abs(e.pageX - mousePosition.x);
    const diffY = Math.abs(e.pageY - mousePosition.y);
    if (isClicked && diffX > delta && diffY > delta) {
      setIsDragging(true);
    }
  };

  const handleKeyDown = (e: any) => {
    if (previousKey === 'Control' && e.key === 'z' && history.length > 0) {
      e.preventDefault();
      popHistoryStack();
    }
    setPreviousKey(e.key);
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
    <Container readonly={readonly}>
      <DragDropContext onDragEnd={onDragEndHandler}>
        <Droppable droppableId="id">
          {(provided) => (
            <div
              role="presentation"
              ref={provided.innerRef}
              {...provided.droppableProps}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onKeyDown={handleKeyDown}
            >
              {blocks?.map((block) => {
                const position = blocks.map((b) => b.id).indexOf(block.id) + 1;
                return (
                  <EditableClassBlock
                    key={block.id}
                    position={position}
                    id={block.id}
                    block={block}
                    blocks={blocks}
                    addBlock={addBlockHandler}
                    deleteBlock={deleteBlockHandler}
                    updateBlock={updateBlockHandler}
                    placeholderText={placeholderText}
                    readOnly={isDragging || readonly || false}
                    isDragging={isDragging}
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

export default Editor;
