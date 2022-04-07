import { useState, useEffect } from "react";
import { matchSorter } from "match-sorter";

import styles from "./styles.module.scss";
import TagItem from "./tagItem";
import { Grow } from "@mui/material";

const MENU_HEIGHT = 150;
const allowedTags = [
  {
    id: "title",
    tag: "h1",
    label: "Title",
  },
  {
    id: "heading",
    tag: "h2",
    label: "Heading",
  },
  {
    id: "subheading",
    tag: "h3",
    label: "Subheading",
  },
  {
    id: "text",
    tag: "p",
    label: "Simple Text",
  },
  {
    id: "image",
    tag: "img",
    label: "Image",
  },
  {
    id: "bulletList",
    tag: "p",
    type: "ul",
    label: "List",
  },
  {
    id: "embed",
    tag: "embed",
    label: "Embed",
  },
];

type props = {
  position: any;
  closeMenu: () => void;
  handleSelection: (tag: string, parent?: string) => void;
  isOpen: boolean;
};

const TagSelectorMenu = ({
  position,
  closeMenu,
  handleSelection,
  isOpen,
}: props) => {
  const [tagList, setTagList] = useState(allowedTags);
  const [selectedTag, setSelectedTag] = useState(0);
  const [command, setCommand] = useState("");

  // If the tag selector menu is display outside the top viewport,
  // we display it below the block
  const isMenuOutsideOfTopViewport = position.y - MENU_HEIGHT < 0;
  const y = !isMenuOutsideOfTopViewport
    ? position.y - MENU_HEIGHT
    : position.y + MENU_HEIGHT / 3;
  const x = position.x;

  // Filter tagList based on given command
  useEffect(() => {
    if (command) {
      setTagList(matchSorter(allowedTags, command, { keys: ["id"] }));
    } else {
      setTagList(allowedTags);
    }
  }, [command, isOpen]);

  // Attach listener to allow tag selection via keyboard
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: any) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSelection(tagList[selectedTag].tag, tagList[selectedTag].type);
        } else if (e.key === "Tab" || e.key === "ArrowDown") {
          e.preventDefault();
          const newSelectedTag =
            selectedTag === tagList.length - 1 ? 0 : selectedTag + 1;
          setSelectedTag(newSelectedTag);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const newSelectedTag =
            selectedTag === 0 ? tagList.length - 1 : selectedTag - 1;
          setSelectedTag(newSelectedTag);
        } else if (e.key === "Backspace") {
          if (command) {
            setCommand(command.slice(0, -1));
          } else {
            closeMenu();
          }
        } else {
          setCommand(command + e.key);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [tagList, selectedTag, isOpen]);

  return (
    <Grow in={isOpen}>
      <div
        className={styles.menuWrapper}
        style={{
          top: y,
          left: x,
          justifyContent: !isMenuOutsideOfTopViewport
            ? "flex-end"
            : "flex-start",
        }}
        id="selectorMenu"
      >
        <div className={styles.menu}>
          {tagList.map((tag, key) => {
            return (
              <TagItem
                tag={tag}
                handleSelection={handleSelection}
                key={key}
                selected={tagList.indexOf(tag) === selectedTag}
              />
            );
          })}
        </div>
      </div>
    </Grow>
  );
};

export default TagSelectorMenu;
