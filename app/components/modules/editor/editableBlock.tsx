/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import {
  getCaretCoordinates,
  isValidHttpUrl,
  setCaretToEnd,
} from '../../../utils/utils';
import styles from './styles.module.scss';
import { Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import TagSelectorMenu from '../tagSelectorMenu';
import { useMoralis } from 'react-moralis';
// import { ReactTinyLink } from "react-tiny-link";
import {
  Backdrop,
  Box,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { PrimaryButton } from '../../elements/styledComponents';
import { ErrorBoundary } from 'react-error-boundary';
import SimpleErrorBoundary from '../../elements/simpleErrorBoundary';
import dynamic from 'next/dynamic';
import { Block } from '../../../types';
import BlockActionMenu from '../blockActionMenu';
import { notify } from '../settingsTab';

let ReactTinyLink: any = dynamic(
  () => import('react-tiny-link').then((mod) => mod.ReactTinyLink),
  {
    ssr: false,
  }
);

type Props = {
  updateBlock: (block: Block, sync: boolean) => void;
  addBlock: (args: any) => void;
  deleteBlock: (args: any) => void;
  position: number;
  id: string;
  blocks: Block[];
  block: Block;
  readOnly: boolean;
  placeholderText: string;
};

const EditableBlock = ({
  id,
  position,
  block,
  blocks,
  readOnly,
  updateBlock,
  addBlock,
  deleteBlock,
  placeholderText,
}: Props) => {
  const [html, setHtml] = useState(block.html || '');
  const [htmlBackup, setHtmlBackup] = useState('');
  const [tag, setTag] = useState(block.tag || 'p');
  const [imageUrl, setImageUrl] = useState(block.imageUrl || '');
  const [embedUrl, setEmbedUrl] = useState(block.embedUrl || '');
  const [type, setType] = useState<string | undefined>(block.type || '');
  const [placeholder, setPlaceholder] = useState(false);
  const [previousKey, setPreviousKey] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);
  const [tagSelectorMenuPosition, setTagSelectorMenuPosition] = useState(
    {} as any
  );
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({} as any);

  const contentEditableRef = React.createRef<HTMLElement | any>();
  const fileInputRef = React.createRef<HTMLInputElement>();

  const { Moralis } = useMoralis();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [click, setClick] = useState(false);

  useEffect(() => {
    const hasPlaceholder = addPlaceholder({
      block: contentEditableRef.current,
      position: position,
      content: block.html,
    });
  }, []);

  useEffect(() => {
    updateBlock(
      {
        html,
        tag,
        id,
        type: type as string,
        imageUrl,
        embedUrl,
      },
      false
    );
  }, [tag]);

  useEffect(() => {
    updateBlock(
      {
        html,
        tag,
        id,
        type: type as string,
        imageUrl,
        embedUrl,
      },
      true
    );
  }, [embedUrl, imageUrl]);

  // const onMouseDownHandler = (e: any) => setClick(true);

  // const onMouseMoveHandler = (e: any) => {
  //   if (click) {
  //     console.log("....... click");
  //     setDisabled(true);
  //   }
  // };

  // const onMouseUpHandler = (e: any) => {
  //   setDisabled(false);
  //   setClick(false);
  // };

  const onKeyUpHandler = (e: any) => {
    if (e.key === '/') {
      openTagSelectorMenu();
    }
  };

  const onKeyDownHandler = (e: any) => {
    if (e.key === '/') {
      setHtmlBackup(html);
    }
    if (e.key === 'Enter' && previousKey !== 'Shift' && !isSelectMenuOpen) {
      e.preventDefault();
      if (html === '' && (type === 'ul' || type === 'ol')) {
        setTag('p');
        setType('');
        return;
      }
      addBlock({
        id,
        tag,
        type,
        html,
        ref: contentEditableRef.current,
      });
    }
    if (e.key === 'Backspace' && !html) {
      e.preventDefault();
      deleteBlock({
        id: id,
        ref: contentEditableRef.current,
      });
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isSelectMenuOpen) {
        const nextBlockPosition = blocks.map((b: any) => b.id).indexOf(id) + 2;
        const nextBlock = document.querySelector(
          `[data-position="${nextBlockPosition}"]`
        );
        if (nextBlock) {
          // @ts-ignore
          nextBlock.focus();
          setCaretToEnd(nextBlock);
        }
      }
    }
    if (e.key === 'ArrowUp') {
      if (!isSelectMenuOpen) {
        e.preventDefault();
        const nextBlockPosition = blocks.map((b: any) => b.id).indexOf(id);
        const nextBlock = document.querySelector(
          `[data-position="${nextBlockPosition}"]`
        );
        if (nextBlock) {
          // @ts-ignore
          nextBlock.focus();
          setCaretToEnd(nextBlock);
        }
      }
    }
    setPreviousKey(e.key);
  };

  const handleFocus = () => {
    // If a placeholder is set, we remove it when the block gets focused
    setIsTyping(true);
    console.log('focus');
    if (placeholder) {
      setHtml('');
      setPlaceholder(false);
    }
  };

  const handleBlur = (e: any) => {
    // Show placeholder if block is still the only one and empty
    const hasPlaceholder = addPlaceholder({
      block: contentEditableRef.current,
      position: position,
      content: html,
    });
    if (!hasPlaceholder) {
      setIsTyping(false);
      updateBlock(
        {
          html,
          tag,
          id,
          type: type as string,
          imageUrl,
          embedUrl,
        },
        true
      );
    }
  };

  const handleImageUpload = async () => {
    if (fileInputRef.current && fileInputRef.current?.files) {
      setIsUploadingImage(true);
      // const pageId = this.props.pageId;
      const imageFile = fileInputRef.current?.files[0];
      const file = new Moralis.File(imageFile.name, imageFile);
      await file.saveIPFS();
      setImageUrl((file as any).ipfs());
      setIsUploadingImage(false);
    }
  };

  // Show a placeholder for blank pages
  const addPlaceholder = ({ block, position, content }: any) => {
    const isFirstBlockWithoutHtml = position === 1 && !content;
    const isFirstBlockWithoutSibling = !block?.parentElement.nextElementSibling;
    if (isFirstBlockWithoutHtml && isFirstBlockWithoutSibling) {
      setHtml(placeholderText);
      setTag('h3');
      setPlaceholder(true);
      return true;
    } else {
      return false;
    }
  };

  const calculateTagSelectorMenuPosition = () => {
    const { x: caretLeft, y: caretTop } = getCaretCoordinates(true);
    return { x: caretLeft, y: caretTop };
  };

  const openTagSelectorMenu = () => {
    const { x, y } = calculateTagSelectorMenuPosition();
    setTagSelectorMenuPosition({ x, y });
    setIsSelectMenuOpen(true);
    document.addEventListener('click', closeTagSelectorMenu, false);
  };

  const closeTagSelectorMenu = () => {
    setHtmlBackup('');
    setTagSelectorMenuPosition({
      x: null as unknown as number,
      y: null as unknown as number,
    });
    setIsSelectMenuOpen(false);
    document.removeEventListener('click', closeTagSelectorMenu, false);
  };

  const handleTagSelection = async (tag: string, type?: string) => {
    if (['img', 'embed', 'divider'].includes(tag)) {
      await setTag(tag);
      closeTagSelectorMenu();
      addBlock({
        id,
        html: '',
        tag,
        imageUrl: '',
        embedUrl: '',
        type: '',
        ref: contentEditableRef.current,
      });
    } else {
      setTag(tag);
      setHtml(htmlBackup);
      setCaretToEnd(contentEditableRef.current);
      setType(type);
      const nextBlock = document.querySelector(`[data-position="${position}"]`);
      // @ts-ignore
      nextBlock.focus();
      closeTagSelectorMenu();
    }
  };

  const calculateActionMenuPosition = (parent: any, initiator: string) => {
    switch (initiator) {
      case 'TEXT_SELECTION':
        const { x: endX, y: endY } = getCaretCoordinates(false); // fromEnd
        const { x: startX, y: startY } = getCaretCoordinates(true); // fromStart
        const middleX =
          (startX as number) + ((endX as number) - (startX as number)) / 2;
        return { x: middleX, y: startY };
      case 'DRAG_HANDLE_CLICK':
        const x =
          parent.offsetLeft - parent.scrollLeft + parent.clientLeft - 90;
        const y = parent.offsetTop - parent.scrollTop + parent.clientTop + 35;
        return { x: x, y: y };
      default:
        return { x: null, y: null };
    }
  };

  const openActionMenu = (parent: any, trigger: string) => {
    const { x, y } = calculateActionMenuPosition(parent, trigger);
    setActionMenuPosition({ x, y });
    setIsActionMenuOpen(true);
    // Add listener asynchronously to avoid conflicts with
    // the double click of the text selection
    setTimeout(() => {
      document.addEventListener('click', closeActionMenu, false);
    }, 100);
  };

  const closeActionMenu = () => {
    setActionMenuPosition({
      x: null as unknown as number,
      y: null as unknown as number,
    });
    setIsActionMenuOpen(false);
    document.removeEventListener('click', closeActionMenu, false);
  };

  return (
    <>
      <Backdrop
        sx={{
          color: '#eaeaea',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isUploadingImage}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2, mb: 1, color: '#eaeaea' }}>
            {'Uploading image please wait....'}
          </Typography>
        </Box>
      </Backdrop>
      {isActionMenuOpen && (
        <BlockActionMenu
          position={actionMenuPosition}
          actions={{
            deleteBlock: () => deleteBlock({ id }),
            // turnInto: () => openTagSelectorMenu("ACTION_MENU"),
          }}
        />
      )}
      {isSelectMenuOpen && (
        <TagSelectorMenu
          position={tagSelectorMenuPosition}
          closeMenu={closeTagSelectorMenu}
          handleSelection={handleTagSelection}
          isOpen={isSelectMenuOpen}
        />
      )}
      <Draggable draggableId={id} index={position} isDragDisabled={readOnly}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            className={styles.draggable}
            {...provided.draggableProps}
          >
            <ErrorBoundary
              FallbackComponent={SimpleErrorBoundary}
              onReset={() => {
                // reset the state of your app so the error doesn't happen again
              }}
            >
              <span
                role="button"
                tabIndex={0}
                className={styles.dragHandle}
                onClick={(e) => {
                  if (readOnly) {
                    notify("You can't edit this block", 'error');
                    return;
                  }
                  openActionMenu(e.target, 'DRAG_HANDLE_CLICK');
                }}
                {...provided.dragHandleProps}
              >
                <DragIndicatorIcon />
              </span>
              {!['img', 'embed', 'divider'].includes(tag) && (
                <ContentEditable
                  data-position={position}
                  data-tag={tag}
                  disabled={readOnly}
                  className={[
                    styles.block,
                    placeholder ? styles.placeholder : null,
                    snapshot.isDragging ? styles.isDragging : null,
                    type === 'ul' && styles.bulletList,
                    type === 'ol' && styles.numberedList,
                  ].join(' ')}
                  innerRef={contentEditableRef}
                  html={html}
                  tagName={tag}
                  onChange={(e) => {
                    setHtml(e.target.value);
                  }}
                  onKeyDown={onKeyDownHandler}
                  onKeyUp={onKeyUpHandler}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  // onMouseDown={onMouseDownHandler}
                  // onMouseUp={onMouseUpHandler}
                  // onMouseMove={onMouseMoveHandler}
                />
              )}
              {tag === 'img' && (
                <div
                  data-position={position}
                  data-tag={tag}
                  ref={contentEditableRef}
                  className={[
                    styles.image,
                    isSelectMenuOpen ? styles.blockSelected : null,
                  ].join(' ')}
                >
                  <input
                    id={`${id}_fileInput`}
                    name={tag}
                    disabled={readOnly}
                    type="file"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    accept="image/*"
                    hidden
                  />
                  {!imageUrl && (
                    <label
                      htmlFor={`${id}_fileInput`}
                      className={styles.fileInputLabel}
                    >
                      No Image Selected. Click To Select.
                    </label>
                  )}
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="any"
                      className={styles.imageBlock}
                    />
                  )}
                </div>
              )}
              {tag === 'embed' && (
                <div
                  data-position={position}
                  data-tag={tag}
                  ref={contentEditableRef}
                  className={[styles.embed].join(' ')}
                >
                  {!embedUrl && (
                    <TextField
                      id="standard-name"
                      size="small"
                      fullWidth
                      placeholder="Add link"
                      sx={{ width: '50%' }}
                      color="secondary"
                      disabled={readOnly}
                      InputProps={{
                        endAdornment: (
                          <PrimaryButton
                            disabled={readOnly}
                            onClick={(event) => {
                              const value = (
                                event.currentTarget
                                  ?.previousElementSibling as any
                              )?.value;
                              if (isValidHttpUrl(value)) {
                                setEmbedUrl(value as string);
                              } else {
                                alert('wrong url');
                              }
                            }}
                          >
                            Embed
                          </PrimaryButton>
                        ),
                      }}
                    />
                  )}
                  {embedUrl && (
                    <ReactTinyLink
                      cardSize="small"
                      showGraphic={true}
                      maxLine={2}
                      minLine={1}
                      url={embedUrl}
                    />
                  )}
                </div>
              )}
              {tag === 'divider' && (
                <Divider
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h5">* * *</Typography>
                </Divider>
              )}
            </ErrorBoundary>
          </div>
        )}
      </Draggable>
    </>
  );
};
export default EditableBlock;
