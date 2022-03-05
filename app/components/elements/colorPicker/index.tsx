import React, { useState } from "react";
import { GithubPicker, TwitterPicker } from "react-color";
import reactCSS from "reactcss";

type Props = {
  defaultColor: string;
  columnData: any;
  setColumnData: (data: any) => void;
  columnId: string;
};
const ColorPicker = ({
  defaultColor,
  setColumnData,
  columnId,
  columnData,
}: Props) => {
  const [displayPicker, setDisplayPicker] = useState(false);
  const [color, setColor] = useState(defaultColor);
  const styles: any = reactCSS({
    default: {
      container: {
        display: "flex",
        flexDirection: "column",
        marginTop: "1rem",
        padding: "0 2rem",
      },
      color: {
        width: "100%",
        height: "14px",
        borderRadius: "2px",
        background: `${color}`,
      },
      swatch: {
        padding: "1px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      },
      popover: {
        position: "absolute",
        zIndex: "2",
        marginTop: "1.5rem",
      },
      cover: {
        position: "fixed",
        top: "10px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    },
  });
  const handleClick = () => {
    setDisplayPicker(!displayPicker);
  };

  const handleClose = () => {
    setDisplayPicker(false);
  };

  const handleChange = (color: any) => {
    setDisplayPicker(false);
    setColumnData({
      ...columnData,
      [columnId]: {
        ...columnData[columnId],
        color: color.hex,
      },
    });
    setColor(color.hex);
  };
  return (
    <div style={styles.container}>
      <div style={styles.swatch} onClick={handleClick}>
        <div style={styles.color} />
      </div>
      {displayPicker ? (
        <div style={styles.popover}>
          <div style={styles.cover} onClick={handleClose} />
          <TwitterPicker color={color} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  );
};

export default ColorPicker;
