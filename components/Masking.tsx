/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Layer, Stage } from "react-konva";
import Rectangle from "./Rectangle";

export default function Masking({ res, cbNewRect, cb, disable }: any) {
  const [selectedId, selectShape] = useState<any>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [rect, setRect] = useState<Array<any>>([]);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    if (cbNewRect !== 0) {
      addNewRectangles();
    }
  }, [cbNewRect]);

  useEffect(() => {
    // if (rect.length > 0) {
    cb(rect);
    // }
  }, [rect]);

  useEffect(() => {
    if (res.data.masking) {
      setRect(JSON.parse(res.data.masking));
    } else {
      setRect([]);
    }
  }, [res]);

  function addNewRectangles() {
    setRect([
      ...rect,
      {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        id: Date.now().toString(),
      },
    ]);
  }

  // useEffect(() => {
  //   console.log(rect);
  // }, [rect]);

  const checkDeselect = (e: any) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  return (
    <div
      style={{
        maxWidth: "560px",
        position: "relative",
      }}
    >
      <img
        src={`/api/img/snapshots/${res?.data?.Snapshot?.[0]?.filename}`}
        alt="snapshot"
        id="snapshot"
        onLoad={(e: any) => {
          setSize({
            width: e.target.offsetWidth,
            height: e.target.offsetHeight,
          });
          // setOriginalSize({
          //   width: e.target.naturalWidth,
          //   height: e.target.naturalHeight,
          // });
          setScale(
            +(e.target.naturalHeight / e.target.offsetHeight).toFixed(2)
          );
        }}
        // width="100px"
        // height="100px"
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {/* <button onClick={onAddCircle}>Add circle</button> */}
        {size.width > 0 && size.height > 0 && (
          <Stage
            width={size.width}
            height={size.height}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
          >
            <Layer>
              {rect?.map((r, i) => {
                return (
                  <Rectangle
                    key={i}
                    disable={disable}
                    shapeProps={r}
                    isSelected={r.id === selectedId}
                    onSelect={() => {
                      if (!disable) {
                        selectShape(r.id);
                      }
                    }}
                    onChange={(newAttrs: any) => {
                      const rects = rect.slice();
                      newAttrs.scale = scale;
                      rects[i] = newAttrs;
                      setRect(rects);
                    }}
                    onDblClick={() => {
                      // const rects = rect.slice(i);
                      if (!disable) {
                        const _rect = rect.filter((v) => v.id != r.id);
                        setRect(_rect);
                      }
                    }}
                  />
                );
              })}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
}
