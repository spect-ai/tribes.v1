import { Popover } from "@mui/material";
import { matchSorter } from "match-sorter";
import React, { useEffect, useState } from "react";
import { PrimaryButton } from "../../elements/styledComponents";
import { PopoverContainer } from "../cardModal/styles";

const MENU_HEIGHT = 150;
const allowedTags = [
  {
    id: "page-title",
    tag: "h1",
    label: "Page Title",
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
    id: "paragraph",
    tag: "p",
    label: "Paragraph",
  },
];

type Props = {
  position: any;
  open: boolean;
  anchorEl: any;
  onSelect: (tag: string) => void;
  close: () => void;
};

const SelectMenu = ({ position, open, anchorEl, onSelect, close }: Props) => {
  const x = position.x;
  const y = position.y - MENU_HEIGHT;
  const positionAttributes = { top: y, left: x };
  const [items, setItems] = useState(allowedTags);
  const [selectedItem, setSelectedItem] = useState(0);
  const [command, setCommand] = useState("");

  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  useEffect(() => {
    const items = matchSorter(allowedTags, command, { keys: ["tag"] });
    setItems(items);
  }, [command]);

  const keyDownHandler = (e: any) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        onSelect(items[selectedItem].tag);
        break;
      case "Backspace":
        if (!command) close();
        setCommand(command.substring(0, command.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        const prevSelected =
          selectedItem === 0 ? items.length - 1 : selectedItem - 1;
        setSelectedItem(prevSelected);
        break;
      case "ArrowDown":
      case "Tab":
        e.preventDefault();
        const nextSelected =
          selectedItem === items.length - 1 ? 0 : selectedItem + 1;
        setSelectedItem(nextSelected);
        break;
      default:
        setCommand(command + e.key);
        break;
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => close()}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <PopoverContainer>
        {console.log(selectedItem)}
        {items.map((item, index) => (
          <PrimaryButton
            key={index}
            onClick={() => onSelect(item.tag)}
            variant={selectedItem === index ? "outlined" : "text"}
          >
            {item.label} {selectedItem === index && "✓"}
          </PrimaryButton>
        ))}
      </PopoverContainer>
    </Popover>
    // <div className="SelectMenu" style={positionAttributes}>
    //   <div className="Items">
    //     {items.map((item: any, key: number) => {
    //       const isSelected = items.indexOf(item) === selectedItem;
    //       return (
    //         <div
    //           className={isSelected ? "Selected" : undefined}
    //           key={key}
    //           role="button"
    //           tabIndex={0}
    //           onClick={() => onSelect(item.tag)}
    //         >
    //           {item.label}
    //         </div>
    //       );
    //     })}
    //   </div>
    // </div>
  );
};

export default SelectMenu;
