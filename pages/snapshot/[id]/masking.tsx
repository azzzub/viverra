/* eslint-disable @next/next/no-img-element */
import axios from "axios";
import NavHeader from "components/NavHeader";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import dynamic from "next/dynamic";

const Masking = dynamic(() => import("components/Masking"), {
  ssr: false,
});

export default function SnapshotDetail({ res, error }: any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [masking, setMasking] = useState([]);
  const [newMasking, setNewMasking] = useState(0);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  async function updateMasking() {
    try {
      setIsLoading(true);

      const res = await axios.post("/api/masking", {
        pageID: router.query?.id,
        masking: JSON.stringify(masking),
      });
      if (res) {
        toast.success("success update masking");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container">
      <NavHeader
        props={
          res &&
          res?.data?.Snapshot?.length > 0 && (
            <>
              <li>
                <button
                  className="contrast"
                  aria-busy={isLoading}
                  onClick={() => setNewMasking(newMasking + 1)}
                >
                  +1 mask
                </button>
              </li>
              <li>
                <button aria-busy={isLoading} onClick={updateMasking}>
                  save
                </button>
              </li>
              <li>
                <button
                  className="secondary"
                  aria-busy={isLoading}
                  onClick={() => router.back()}
                >
                  back
                </button>
              </li>
            </>
          )
        }
      />

      {res && res?.data?.Snapshot?.length > 0 && (
        <div className="grid">
          <Masking
            res={res}
            cbNewRect={newMasking}
            cb={(val: any) => setMasking(val)}
          />
          <pre>to remove the mask, double click on it</pre>
        </div>
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
