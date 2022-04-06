import React, { useEffect, useState } from "react";
import ContentEditable from "react-contenteditable";
import { getCaretCoordinates, setCaretToEnd } from "../../../utils/utils";
import styles from "./styles.module.scss";
import { Draggable } from "react-beautiful-dnd";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import TagSelectorMenu from "../tagSelectorMenu";

type Props = {
  updatePage: (args: any) => void;
  addBlock: (args: any) => void;
  deleteBlock: (args: any) => void;
  html: string;
  tag: string;
  id: string;
  position: number;
  pageId: string;
  blocks: any;
};

const EditableBlock = ({
  id,
  position,
  pageId,
  blocks,
  updatePage,
  addBlock,
  deleteBlock,
}: Props) => {
  const [html, setHtml] = useState("");
  const [htmlBackup, setHtmlBackup] = useState("");
  const [tag, setTag] = useState("p");
  const [placeholder, setPlaceholder] = useState(false);
  const [previousKey, setPreviousKey] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState({} as any);
  const [tagSelectorMenuPosition, setTagSelectorMenuPosition] = useState(
    {} as any
  );
  const contentEditableRef = React.createRef<HTMLElement | any>();

  useEffect(() => {
    updatePage({
      html,
      tag,
      id,
    });
  }, [html, tag]);

  useEffect(() => {
    const hasPlaceholder = addPlaceholder({
      block: contentEditableRef.current,
      position: position,
      content: html,
    });
    // if (!hasPlaceholder) {
    //   this.setState({
    //     ...this.state,
    //     html: this.props.html,
    //     tag: this.props.tag,
    //     imageUrl: this.props.imageUrl,
    //   });
    // }
  }, []);

  const onKeyUpHandler = (e: any) => {
    if (e.key === "/") {
      openTagSelectorMenu();
    }
  };

  const onKeyDownHandler = (e: any) => {
    if (e.key === "/") {
      setHtmlBackup(html);
      setAnchorEl(e.currentTarget);
    }
    if (e.key === "Enter" && previousKey !== "Shift" && !isSelectMenuOpen) {
      e.preventDefault();
      addBlock({
        id,
        ref: contentEditableRef.current,
      });
    }
    if (e.key === "Backspace" && !html) {
      e.preventDefault();
      deleteBlock({
        id: id,
        ref: contentEditableRef.current,
      });
    }
    if (e.key === "ArrowDown") {
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
    if (e.key === "ArrowUp") {
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
    if (placeholder) {
      setHtml("");
      setPlaceholder(false);
      setIsTyping(true);
    } else {
      setIsTyping(true);
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
    }
  };

  // Show a placeholder for blank pages
  const addPlaceholder = ({ block, position, content }: any) => {
    const isFirstBlockWithoutHtml = position === 1 && !content;
    const isFirstBlockWithoutSibling = !block.parentElement.nextElementSibling;
    if (isFirstBlockWithoutHtml && isFirstBlockWithoutSibling) {
      setHtml(`Add some details, press "/" for commands.`);
      setTag("h3");
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
    console.log({ x, y });
    setTagSelectorMenuPosition({ x, y });
    setIsSelectMenuOpen(true);
    document.addEventListener("click", closeTagSelectorMenu, false);
    setTimeout(() => {
      const menu = document.getElementById("selectorMenu");
      console.log(menu);
      menu?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }, 100);
  };

  const closeTagSelectorMenu = () => {
    setHtmlBackup("");
    setTagSelectorMenuPosition({
      x: null as unknown as number,
      y: null as unknown as number,
    });
    setIsSelectMenuOpen(false);
    document.removeEventListener("click", closeTagSelectorMenu, false);
  };
  const handleTagSelection = (tag: string) => {
    setTag(tag);
    setHtml(htmlBackup);
    setCaretToEnd(contentEditableRef.current);
    const nextBlock = document.querySelector(`[data-position="${position}"]`);
    // @ts-ignore
    nextBlock.focus();
    closeTagSelectorMenu();
  };

  return (
    <>
      {isSelectMenuOpen && (
        <TagSelectorMenu
          position={tagSelectorMenuPosition}
          closeMenu={closeTagSelectorMenu}
          handleSelection={handleTagSelection}
          isOpen={isSelectMenuOpen}
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
              {...provided.dragHandleProps}
            >
              <DragIndicatorIcon />
            </span>
            <ContentEditable
              data-position={position}
              data-tag={tag}
              className={[
                styles.block,
                placeholder ? styles.placeholder : null,
                snapshot.isDragging ? styles.isDragging : null,
              ].join(" ")}
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
            />
          </div>
        )}
      </Draggable>
    </>
  );
};
export default EditableBlock;
