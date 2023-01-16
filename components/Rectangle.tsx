// @ts-nocheck

import React from "react";
import { Rect, Transformer } from "react-konva";

const Rectangle = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  onDblClick,
  disable,
}) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        fill="#ff00ffc0"
        draggable={!disable}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: +e.target.x().toFixed(2),
            y: +e.target.y().toFixed(2),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: +node.x().toFixed(2),
            y: +node.y().toFixed(2),
            // set minimal value
            width: +Math.max(5, node.width() * scaleX).toFixed(2),
            height: +Math.max(node.height() * scaleY).toFixed(2),
          });
        }}
        onDblClick={() => onDblClick()}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default Rectangle;
