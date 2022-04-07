/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import ContentEditable from "react-contenteditable";
import {
  getCaretCoordinates,
  isValidHttpUrl,
  setCaretToEnd,
} from "../../../utils/utils";
import styles from "./styles.module.scss";
import { Draggable } from "react-beautiful-dnd";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import TagSelectorMenu from "../tagSelectorMenu";
import { useMoralis } from "react-moralis";
// import { ReactTinyLink } from "react-tiny-link";
import { TextField } from "@mui/material";
import { PrimaryButton } from "../../elements/styledComponents";
import { ErrorBoundary } from "react-error-boundary";
import SimpleErrorBoundary from "../../elements/simpleErrorBoundary";
import dynamic from "next/dynamic";
import { Block } from "../../../types";

let ReactTinyLink: any = dynamic(
  () => import("react-tiny-link").then((mod) => mod.ReactTinyLink),
  {
    ssr: false,
  }
);

type Props = {
  updateBlock: (args: any) => void;
  addBlock: (args: any) => void;
  deleteBlock: (args: any) => void;
  position: number;
  id: string;
  blocks: Block[];
  block: Block;
};

const EditableBlock = ({
  id,
  position,
  block,
  blocks,
  updateBlock,
  addBlock,
  deleteBlock,
}: Props) => {
  const [html, setHtml] = useState("");
  const [htmlBackup, setHtmlBackup] = useState("");
  const [tag, setTag] = useState("p");
  const [imageUrl, setImageUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [type, setType] = useState<string | undefined>("");
  const [placeholder, setPlaceholder] = useState(false);
  const [previousKey, setPreviousKey] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState({} as any);
  const [tagSelectorMenuPosition, setTagSelectorMenuPosition] = useState(
    {} as any
  );
  const contentEditableRef = React.createRef<HTMLElement | any>();
  const fileInputRef = React.createRef<HTMLInputElement>();

  const { Moralis } = useMoralis();

  useEffect(() => {
    setHtml(block.html);
    setTag(block.tag);
    setImageUrl(block.imageUrl);
    setEmbedUrl(block.embedUrl);
    setType(block.type);
  }, []);

  useEffect(() => {
    updateBlock({
      html,
      tag,
      id,
      imageUrl,
      embedUrl,
    });
  }, [tag, embedUrl, imageUrl]);

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
      if (html === "" && (type === "ul" || type === "ol")) {
        setTag("p");
        setType("");
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
      updateBlock({
        html,
        tag,
        id,
        imageUrl,
        embedUrl,
      });
    }
  };

  const handleImageUpload = async () => {
    if (fileInputRef.current && fileInputRef.current?.files) {
      // const pageId = this.props.pageId;
      const imageFile = fileInputRef.current?.files[0];
      const file = new Moralis.File(imageFile.name, imageFile);
      await file.saveIPFS();
      console.log(file);
      setImageUrl((file as any).ipfs());
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
    setTagSelectorMenuPosition({ x, y });
    setIsSelectMenuOpen(true);
    document.addEventListener("click", closeTagSelectorMenu, false);
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

  const handleTagSelection = async (tag: string, type?: string) => {
    if (tag === "img") {
      await setTag(tag);
      closeTagSelectorMenu();
      addBlock({
        id,
        html: "",
        tag: "img",
        imageUrl: "",
        embedUrl: "",
        type: "",
        ref: contentEditableRef.current,
      });
    }
    if (tag === "embed") {
      await setTag(tag);
      closeTagSelectorMenu();
      addBlock({
        id,
        html: "",
        tag: "embed",
        imageUrl: "",
        embedUrl: "",
        type: "",
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
            <ErrorBoundary
              FallbackComponent={SimpleErrorBoundary}
              onReset={() => {
                // reset the state of your app so the error doesn't happen again
                console.log("hi");
              }}
            >
              <span
                role="button"
                tabIndex={0}
                className={styles.dragHandle}
                {...provided.dragHandleProps}
              >
                <DragIndicatorIcon />
              </span>
              {!["img", "embed"].includes(tag) && (
                <ContentEditable
                  data-position={position}
                  data-tag={tag}
                  className={[
                    styles.block,
                    placeholder ? styles.placeholder : null,
                    snapshot.isDragging ? styles.isDragging : null,
                    type === "ul" && styles.bulletList,
                    type === "ol" && styles.numberedList,
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
              )}
              {tag === "img" && (
                <div
                  data-position={position}
                  data-tag={tag}
                  ref={contentEditableRef}
                  className={[
                    styles.image,
                    isSelectMenuOpen ? styles.blockSelected : null,
                  ].join(" ")}
                >
                  <input
                    id={`${id}_fileInput`}
                    name={tag}
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
              {tag === "embed" && (
                <div
                  data-position={position}
                  data-tag={tag}
                  ref={contentEditableRef}
                  className={[styles.embed].join(" ")}
                >
                  {!embedUrl && (
                    <TextField
                      id="standard-name"
                      size="small"
                      fullWidth
                      placeholder="Add link"
                      sx={{ width: "50%" }}
                      color="secondary"
                      InputProps={{
                        endAdornment: (
                          <PrimaryButton
                            onClick={(event) => {
                              const value = (
                                event.currentTarget
                                  ?.previousElementSibling as any
                              )?.value;
                              if (isValidHttpUrl(value)) {
                                setEmbedUrl(value as string);
                              } else {
                                alert("wrong url");
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
                    // <LinkPreview
                    //   url={embedUrl}
                    //   width="40rem"
                    //   imageHeight={"4rem"}
                    //   borderColor="#5a6972"
                    // />
                  )}
                </div>
              )}
            </ErrorBoundary>
          </div>
        )}
      </Draggable>
    </>
  );
};
export default EditableBlock;
