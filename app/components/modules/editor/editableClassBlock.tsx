/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-access-state-in-setstate */
import ContentEditable from 'react-contenteditable';
import { Draggable } from 'react-beautiful-dnd';
import React from 'react';
import { Alert, Divider, Snackbar, TextField, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { Moralis } from 'moralis';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import styles from './styles.module.scss';
import TagSelectorMenu from '../tagSelectorMenu';
import BlockActionMenu from '../blockActionMenu';
import { Block } from '../../../types';
import {
  getCaretCoordinates,
  getCaretCoordinatesForCommand,
  getSelectedNodes,
  getSelection,
  isValidHttpUrl,
  setCaretToEnd,
} from '../../../utils/utils';
import { PrimaryButton } from '../../elements/styledComponents';

const ReactTinyLink: any = dynamic(
  () => import('react-tiny-link').then((mod) => mod.ReactTinyLink),
  {
    ssr: false,
  }
);

const CMD_KEY = '/';

type Props = {
  updateBlock?: (block: Block, sync: boolean) => void;
  addBlock?: (args: any) => void;
  deleteBlock?: (args: any) => void;
  position: number;
  id: string;
  blocks: Block[];
  block: Block;
  readOnly: boolean;
  isDragging?: boolean;
  placeholderText?: string;
};

type State = {
  htmlBackup: string;
  html: string;
  tag: string;
  imageUrl: string;
  embedUrl: string;
  type: string;
  placeholder: boolean;
  previousKey: string;
  isTyping: boolean;
  tagSelectorMenuOpen: boolean;
  tagSelectorMenuPosition: {
    x: number;
    y: number;
  };
  actionMenuOpen: boolean;
  actionMenuPosition: {
    x: number;
    y: number;
  };
  isSnackbarOpen: boolean;
};

// library does not work with hooks
class EditableClassBlock extends React.Component<Props, State> {
  static calculateActionMenuPosition(parent: any, initiator: string) {
    const { x: endX, y: endY } = getCaretCoordinates(false); // fromEnd
    const { x: startX, y: startY } = getCaretCoordinates(true);
    const middleX =
      (startX as number) + ((endX as number) - (startX as number)) / 2;
    const x = parent.offsetLeft - parent.scrollLeft + parent.clientLeft - 90;
    const y = parent.offsetTop - parent.scrollTop + parent.clientTop + 35;
    switch (initiator) {
      case 'TEXT_SELECTION':
        return { x: startX + parent.offsetLeft, y: startY };
      case 'DRAG_HANDLE_CLICK':
        return { x, y };
      default:
        return { x: 0, y: 0 };
    }
  }

  fileInput: any;

  contentEditable: any;

  constructor(props: Props) {
    super(props);
    const {
      block: { type },
    } = props;
    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleDragHandleClick = this.handleDragHandleClick.bind(this);
    this.openActionMenu = this.openActionMenu.bind(this);
    this.closeActionMenu = this.closeActionMenu.bind(this);
    this.openTagSelectorMenu = this.openTagSelectorMenu.bind(this);
    this.closeTagSelectorMenu = this.closeTagSelectorMenu.bind(this);
    this.handleTagSelection = this.handleTagSelection.bind(this);
    this.handleImageUpload = this.handleImageUpload.bind(this);
    this.addPlaceholder = this.addPlaceholder.bind(this);
    this.calculateTagSelectorMenuPosition =
      this.calculateTagSelectorMenuPosition.bind(this);
    this.contentEditable = React.createRef<HTMLElement | any>();
    this.fileInput = React.createRef<HTMLInputElement>();
    this.state = {
      htmlBackup: '',
      html: '',
      tag: 'p',
      imageUrl: '',
      embedUrl: '',
      type,
      placeholder: false,
      previousKey: '',
      isTyping: false,
      tagSelectorMenuOpen: false,
      tagSelectorMenuPosition: {
        x: 0,
        y: 0,
      },
      actionMenuOpen: false,
      actionMenuPosition: {
        x: 0,
        y: 0,
      },
      isSnackbarOpen: false,
    };
  }

  // To avoid unnecessary API calls, the block component fully owns the draft state
  // i.e. while editing we only update the block component, only when the user
  // finished editing (e.g. switched to next block), we update the page as well
  // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

  componentDidMount() {
    // Add a placeholder if the first block has no sibling elements and no content
    const {
      position,
      block: { html, tag, imageUrl, type },
    } = this.props;
    const hasPlaceholder = this.addPlaceholder({
      block: this.contentEditable.current,
      position,
      content: html || imageUrl,
    });
    if (!hasPlaceholder) {
      this.setState({
        ...this.state,
        html,
        tag,
        imageUrl,
        type,
      });
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // update the page on the server if one of the following is true
    // 1. user stopped typing and the html content has changed & no placeholder set
    // 2. user changed the tag & no placeholder set
    // 3. user changed the image & no placeholder set
    const {
      block: {
        html: propHtml,
        tag: propTag,
        imageUrl: propImageUrl,
        embedUrl: propEmbedUrl,
      },
      id,
      isDragging,
      updateBlock,
    } = this.props;

    const {
      placeholder,
      isTyping,
      html: stateHtml,
      tag: stateTag,
      imageUrl: stateImageUrl,
      embedUrl: stateEmbedUrl,
      type: stateType,
    } = this.state;
    const stoppedTyping = prevState.isTyping && !isTyping;
    const hasNoPlaceholder = !placeholder;
    const htmlChanged = propHtml !== stateHtml;
    const tagChanged = propTag !== stateTag;
    const imageChanged = propImageUrl !== stateImageUrl;
    const embedChanged = propEmbedUrl !== stateEmbedUrl;
    if (
      ((stoppedTyping && htmlChanged) ||
        tagChanged ||
        imageChanged ||
        embedChanged) &&
      hasNoPlaceholder
    ) {
      updateBlock &&
        updateBlock(
          {
            id,
            html: stateHtml,
            tag: stateTag,
            imageUrl: stateImageUrl,
            embedUrl: stateEmbedUrl,
            type: stateType,
          },
          true
        );
    }
  }

  componentWillUnmount() {
    // In case, the user deleted the block, we need to cleanup all listeners
    document.removeEventListener('click', this.closeActionMenu, false);
  }

  handleChange(e: any) {
    this.setState({ ...this.state, html: e.target.value });
  }

  handleFocus() {
    // If a placeholder is set, we remove it when the block gets focused
    const { placeholder } = this.state;
    if (placeholder) {
      this.setState({
        ...this.state,
        html: '',
        placeholder: false,
        isTyping: true,
      });
    } else {
      this.setState({ ...this.state, isTyping: true });
    }
  }

  handleBlur(e: any) {
    // Show placeholder if block is still the only one and empty
    const { position } = this.props;
    const { html, imageUrl } = this.state;
    const hasPlaceholder = this.addPlaceholder({
      block: this.contentEditable.current,
      position,
      content: html || imageUrl,
    });
    if (!hasPlaceholder) {
      this.setState({ ...this.state, isTyping: false });
    }
  }

  handleKeyDown(e: any) {
    const { id, blocks, deleteBlock, addBlock } = this.props;
    const { html, previousKey, tagSelectorMenuOpen, tag, imageUrl, type } =
      this.state;
    if (e.key === CMD_KEY) {
      // If the user starts to enter a command, we store a backup copy of
      // the html. We need this to restore a clean version of the content
      // after the content type selection was finished.
      this.setState({ htmlBackup: html });
    } else if (e.key === 'Backspace' && !html) {
      if (type === 'nestedUl') {
        this.setState({
          ...this.state,
          type: 'ul',
        });
        return;
      }
      deleteBlock && deleteBlock({ id });
    } else if (
      e.key === 'Enter' &&
      previousKey !== 'Shift' &&
      !tagSelectorMenuOpen
    ) {
      // If the user presses Enter, we want to add a new block
      // Only the Shift-Enter-combination should add a new paragraph,
      // i.e. Shift-Enter acts as the default enter behaviour
      e.preventDefault();
      if (html === '' && type === 'nestedUl') {
        this.setState({
          ...this.state,
          tag: 'p',
          type: 'ul',
        });
        return;
      }
      if (html === '' && type === 'ul') {
        this.setState({
          ...this.state,
          tag: 'p',
          type: '',
        });
        return;
      }
      addBlock &&
        addBlock({
          id,
          html,
          tag,
          imageUrl,
          ref: this.contentEditable.current,
          type,
        });
    } else if (e.key === 'Tab') {
      if (type === 'ul') {
        e.preventDefault();
        this.setState({
          ...this.state,
          type: 'nestedUl',
        });
        return;
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!tagSelectorMenuOpen) {
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
    } else if (e.key === 'ArrowUp') {
      if (!tagSelectorMenuOpen) {
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
    // We need the previousKey to detect a Shift-Enter-combination
    this.setState({ previousKey: e.key });
  }

  // The openTagSelectorMenu function needs to be invoked on key up. Otherwise
  // the calculation of the caret coordinates does not work properly.
  handleKeyUp(e: any) {
    if (e.key === CMD_KEY) {
      this.openTagSelectorMenu('KEY_CMD');
    }
  }

  handleMouseUp() {
    const block = this.contentEditable.current;
    const { selectionStart, selectionEnd } = getSelection(block);
    if (selectionStart !== selectionEnd) {
      // this.openActionMenu(block, 'TEXT_SELECTION');
    }
  }

  handleDragHandleClick(e: any) {
    const dragHandle = e.target;
    this.openActionMenu(dragHandle, 'DRAG_HANDLE_CLICK');
  }

  // Convert editableBlock shape based on the chosen tag
  // i.e. img = display <div><input /><img /></div> (input picker is hidden)
  // i.e. every other tag = <ContentEditable /> with its tag and html content
  handleTagSelection(tag: string, type?: string) {
    const { id, addBlock } = this.props;
    const { isTyping, htmlBackup } = this.state;
    if (tag === 'notFound') {
      this.closeTagSelectorMenu();
      return;
    }
    if (['img', 'embed', 'divider'].includes(tag)) {
      this.setState({ ...this.state, tag }, () => {
        this.closeTagSelectorMenu();
        // if (this.fileInput) {
        //   // Open the native file picker
        //   this.fileInput.click();
        // }
        // Add new block so that the user can continue writing
        // after adding an image
        addBlock &&
          addBlock({
            id,
            html: '',
            tag: 'p',
            imageUrl: '',
            ref: this.contentEditable.current,
            type,
          });
      });
    } else if (isTyping) {
      // Update the tag and restore the html backup without the command
      this.setState({ tag, html: htmlBackup, type: type || '' }, () => {
        setCaretToEnd(this.contentEditable.current);
        this.closeTagSelectorMenu();
      });
    } else {
      this.setState({ ...this.state, tag }, () => {
        this.closeTagSelectorMenu();
      });
    }
  }

  async handleImageUpload() {
    if (this.fileInput.current && this.fileInput.current.files) {
      // const { pageId } = this.props;
      const imageFile = this.fileInput.current.files[0];
      const file = new Moralis.File(imageFile.name, imageFile);
      await file.saveIPFS();
      this.setState({
        ...this.state,
        imageUrl: (file as any).ipfs(),
      });
    }
  }

  closeTagSelectorMenu() {
    this.setState({
      ...this.state,
      htmlBackup: '',
      tagSelectorMenuPosition: { x: 0, y: 0 },
      tagSelectorMenuOpen: false,
    });
    document.removeEventListener('click', this.closeTagSelectorMenu, false);
  }

  openActionMenu(parent: any, trigger: string) {
    const { x, y } = EditableClassBlock.calculateActionMenuPosition(
      parent,
      trigger
    );
    this.setState({
      ...this.state,
      actionMenuPosition: { x, y },
      actionMenuOpen: true,
    });
    // Add listener asynchronously to avoid conflicts with
    // the double click of the text selection
    setTimeout(() => {
      document.addEventListener('click', this.closeActionMenu, false);
    }, 100);
  }

  closeActionMenu() {
    this.setState({
      ...this.state,
      actionMenuPosition: { x: 0, y: 0 },
      actionMenuOpen: false,
    });
    document.removeEventListener('click', this.closeActionMenu, false);
  }

  openTagSelectorMenu(trigger: string) {
    const { x, y } = this.calculateTagSelectorMenuPosition(trigger);
    this.setState({
      ...this.state,
      tagSelectorMenuPosition: { x, y } as { x: number; y: number },
      tagSelectorMenuOpen: true,
    });
    document.addEventListener('click', this.closeTagSelectorMenu, false);
  }

  // Show a placeholder for blank pages
  addPlaceholder({
    block,
    position,
    content,
  }: {
    block: any;
    position: number;
    content: string;
  }) {
    const { placeholderText } = this.props;
    const isFirstBlockWithoutHtml = position === 1 && !content;
    const isFirstBlockWithoutSibling = !block.parentElement.nextElementSibling;
    if (isFirstBlockWithoutHtml && isFirstBlockWithoutSibling) {
      this.setState({
        ...this.state,
        html: placeholderText as string,
        tag: 'h3',
        imageUrl: '',
        placeholder: true,
        isTyping: false,
      });
      return true;
    }
    return false;
  }

  // If we have a text selection, the action menu should be displayed above
  // If we have a drag handle click, the action menu should be displayed beside

  // If the user types the "/" command, the tag selector menu should be display above
  // If it is triggered by the action menu, it should be positioned relatively to its initiator
  calculateTagSelectorMenuPosition(initiator: string) {
    const { x: caretLeft, y: caretTop } = getCaretCoordinatesForCommand(true);
    const { actionMenuPosition } = this.state;
    switch (initiator) {
      case 'KEY_CMD':
        return { x: caretLeft, y: caretTop };
      case 'ACTION_MENU':
        // eslint-disable-next-line no-case-declarations
        const { x: actionX, y: actionY } = actionMenuPosition;
        return { x: actionX - 40, y: actionY };
      default:
        return { x: 0, y: 0 };
    }
  }

  render() {
    const {
      tagSelectorMenuOpen,
      tagSelectorMenuPosition,
      actionMenuOpen,
      actionMenuPosition,
      tag,
      html,
      type,
      placeholder,
      imageUrl,
      embedUrl,
      isSnackbarOpen,
    } = this.state;

    const { id, position, readOnly, deleteBlock } = this.props;
    return (
      <>
        <Snackbar
          open={isSnackbarOpen}
          autoHideDuration={4000}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          onClose={() => this.setState({ isSnackbarOpen: false })}
        >
          <Alert
            severity="error"
            sx={{ width: '100%' }}
            onClose={() => this.setState({ isSnackbarOpen: false })}
          >
            You cannot edit this block
          </Alert>
        </Snackbar>
        {actionMenuOpen && (
          <BlockActionMenu
            position={actionMenuPosition}
            actions={{
              deleteBlock: () => deleteBlock && deleteBlock({ id }),
              // turnInto: () => openTagSelectorMenu("ACTION_MENU"),
            }}
          />
        )}
        {tagSelectorMenuOpen && (
          <TagSelectorMenu
            position={tagSelectorMenuPosition}
            closeMenu={this.closeTagSelectorMenu}
            handleSelection={this.handleTagSelection}
            isOpen={tagSelectorMenuOpen}
          />
        )}
        <Draggable draggableId={id} index={position}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              className={styles.draggable}
              {...provided.draggableProps}
            >
              <span
                role="button"
                tabIndex={0}
                className={styles.dragHandle}
                onClick={(e) => {
                  if (readOnly) {
                    this.setState({
                      ...this.state,
                      isSnackbarOpen: true,
                    });
                    return;
                  }
                  this.openActionMenu(e.target, 'DRAG_HANDLE_CLICK');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (readOnly) {
                      this.setState({
                        ...this.state,
                        isSnackbarOpen: true,
                      });
                      return;
                    }
                    this.openActionMenu(e.target, 'DRAG_HANDLE_CLICK');
                  }
                }}
                {...provided.dragHandleProps}
              >
                <DragIndicatorIcon />
              </span>
              {!['img', 'embed', 'divider'].includes(tag) && (
                <ContentEditable
                  innerRef={this.contentEditable}
                  data-position={position}
                  data-tag={tag}
                  html={html}
                  onChange={this.handleChange}
                  onFocus={this.handleFocus}
                  onBlur={this.handleBlur}
                  onKeyDown={this.handleKeyDown}
                  onKeyUp={this.handleKeyUp}
                  onMouseUp={this.handleMouseUp}
                  tagName={tag}
                  disabled={readOnly}
                  className={[
                    styles.block,
                    placeholder ? styles.placeholder : null,
                    snapshot.isDragging ? styles.isDragging : null,
                    type === 'ul' && styles.bulletList,
                    type === 'nestedUl' && styles.nestedList,
                  ].join(' ')}
                />
              )}
              {tag === 'img' && (
                <div
                  data-position={position}
                  data-tag={tag}
                  ref={this.contentEditable}
                  className={[
                    styles.image,
                    tagSelectorMenuOpen ? styles.blockSelected : null,
                  ].join(' ')}
                >
                  <input
                    id={`${id}_fileInput`}
                    name={tag}
                    disabled={readOnly}
                    type="file"
                    onChange={this.handleImageUpload}
                    ref={this.fileInput}
                    accept="image/*"
                    hidden
                  />
                  {!imageUrl && (
                    // eslint-disable-next-line jsx-a11y/label-has-associated-control
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
                  ref={this.contentEditable}
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
                                this.setState({
                                  ...this.state,
                                  embedUrl: value,
                                });
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
                      showGraphic
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
            </div>
          )}
        </Draggable>
      </>
    );
  }
}

export default EditableClassBlock;
