/* eslint-disable @next/next/no-img-element */
import axios from "axios";
import NavHeader from "components/NavHeader";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

import dynamic from "next/dynamic";
import Head from "next/head";
import { useSession } from "next-auth/react";

const Masking = dynamic(() => import("components/Masking"), {
  ssr: false,
});

export default function SnapshotDetail({ res, error }: any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [masking, setMasking] = useState([]);
  const [newMasking, setNewMasking] = useState(0);
  const { data, status } = useSession();

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

  if (status === "loading") {
    return <div>loading...</div>;
  }

  if (!res?.data) {
    return <pre>no data</pre>;
  }

  return (
    <>
      <Head>
        <title>masking snapshot - viverra</title>
      </Head>
      <main className="container">
        <NavHeader
          props={
            res &&
            res?.data?.Snapshot?.length > 0 && (
              <>
                {data?.user?.role === 1 && (
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
                  </>
                )}
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

        <nav aria-label="breadcrumb">
          <ul>
            <li>
              <Link href="/">collections</Link>
            </li>
            <li>
              <Link href={`/collection/${res?.data?.Collection?.id}`}>
                {res?.data?.Collection?.name}
              </Link>
            </li>
            <li>
              <Link href="#">{res?.data?.name}</Link>
            </li>
          </ul>
        </nav>

        {res && res?.data?.Snapshot?.length > 0 && (
          <div className="grid">
            <Masking
              res={res}
              cbNewRect={newMasking}
              cb={(val: any) => setMasking(val)}
              disable={data?.user.role !== 1}
            />
            <pre>
              {data?.user.role === 1
                ? "to remove the mask, double click on it"
                : "view only"}
            </pre>
          </div>
        )}
        <br />
      </main>
    </>
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
