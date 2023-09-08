import React from "react";
import styles from "./PopupContextMenu.module.css";

const PopupContextMenu = ({ record, items, visible, x, y }: any) =>
  visible && (
    <ul className={styles.popup} style={{ left: `${x}px`, top: `${y}px` }}>
      {items.map((v: any) => {
        return (
          <li key={v.key} onClick={() => v?.onClick()}>
            {v.title}
          </li>
        );
      })}
    </ul>
  );

export default PopupContextMenu;
