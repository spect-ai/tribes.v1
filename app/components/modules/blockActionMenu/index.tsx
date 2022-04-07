import React from "react";
import styles from "./styles.module.scss";
import DeleteIcon from "@mui/icons-material/Delete";
import { PrimaryButton } from "../../elements/styledComponents";

type Props = {
  position: {
    x: number;
    y: number;
  };
  actions: any;
};

const MENU_WIDTH = 150;
const MENU_HEIGHT = 40;

const BlockActionMenu = ({ position, actions }: Props) => {
  const x = position.x - MENU_WIDTH / 2;
  const y = position.y - MENU_HEIGHT - 10;

  return (
    <div
      className={styles.menuWrapper}
      style={{
        top: y,
        left: x,
      }}
    >
      <div className={styles.menu}>
        {/* <span
          id="turn-into"
          className={styles.menuItem}
          role="button"
          tabIndex={0}
          onClick={() => actions.turnInto()}
        >
          Turn into
        </span> */}
        <PrimaryButton
          variant="contained"
          size="small"
          sx={{ borderRadius: 1 }}
          color="primary"
          onClick={() => actions.deleteBlock()}
        >
          <DeleteIcon color="secondary" fontSize={"small"} />
        </PrimaryButton>
      </div>
    </div>
  );
};

export default BlockActionMenu;
