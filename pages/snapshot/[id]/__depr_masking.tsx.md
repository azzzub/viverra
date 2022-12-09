/* eslint-disable @next/next/no-img-element */
import axios from "axios";
import NavHeader from "components/NavHeader";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

export default function SnapshotDetail({ res, error }: any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // async function approval(status: boolean) {
  //   try {
  //     setIsLoading(true);
  //     const approvalRes = await axios.post("/api/approval", {
  //       snapshotID: res?.data?.Snapshot?.[1]?.id,
  //       status,
  //     });

  //     if (approvalRes) {
  //       if (status) {
  //         toast.success("snapshot approved!");
  //       } else {
  //         toast.success("snapshot rejected!");
  //       }
  //       router.replace(router.asPath);
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }
  const { editor, onReady } = useFabricJSEditor();

  const onAddRectangle = () => {
    const canvas = editor?.canvas;

    // editor?.addRectangle();

    const rect = new fabric.Rect({
      fill: "#00ff00f7",
      width: 80,
      height: 80,
      strokeWidth: 0,
      lockRotation: true,
    });
    canvas?.add(rect);
  };
  const check = () => {
    const canvas = editor?.canvas;
    console.log(canvas?._objects);
  };

  return (
    <main className="container">
      <NavHeader
        props={
          res &&
          res?.data?.Snapshot?.length > 0 && (
            <>
              <li>
                <button aria-busy={isLoading}>save</button>
              </li>
              <li>
                <button
                  className="secondary"
                  aria-busy={isLoading}
                  onClick={() => router.back()}
                >
                  cancel
                </button>
              </li>
              <li>
                <button
                  className="contrast"
                  aria-busy={isLoading}
                  onClick={onAddRectangle}
                >
                  add more mask
                </button>
              </li>
              <li>
                <button
                  className="contrast"
                  aria-busy={isLoading}
                  onClick={check}
                >
                  check
                </button>
              </li>
            </>
          )
        }
      />

      {res && res?.data?.Snapshot?.length > 0 && (
        // <div className="grid">
        <div
          style={{
            maxWidth: "560px",
            position: "relative",
          }}
        >
          <img
            src={`/snapshots/${res?.data?.Snapshot?.[0]?.filename}`}
            alt="snapshot"
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

            <FabricJSCanvas onReady={onReady} className="canvas" />
          </div>
        </div>
        // </div>
      )}
      <br />
    </main>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  try {
    const res = await axios.get("/api/page", {
      params: {
        id: ctx.query["id"],
      },
    });

    return {
      props: { res: res.data, error: null },
    };
  } catch (error: any) {
    return { props: { res: null, error: error.message } };
  }
}
