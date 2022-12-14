/* eslint-disable @next/next/no-img-element */
import axios from "axios";
import NavHeader from "components/NavHeader";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactCompareImage from "react-compare-image";
import toast from "react-hot-toast";

export default function SnapshotDetail({ res, error }: any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  async function approval(status: boolean) {
    try {
      setIsLoading(true);
      const approvalRes = await axios.post("/api/approval", {
        snapshotID: res?.data?.Snapshot?.[1]?.id,
        status,
      });

      if (approvalRes) {
        if (status) {
          toast.success("snapshot approved!");
        } else {
          toast.success("snapshot rejected!");
        }
        router.replace(router.asPath);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>snapshot - vrex</title>
      </Head>
      <main className="container">
        <NavHeader
          props={
            res?.data?.Snapshot?.length > 0 && (
              <>
                {res?.data?.Snapshot.length === 2 && (
                  <>
                    <li>
                      <span>differentiation</span>
                      <br />
                      <span>{res?.data?.diff}%</span>
                    </li>
                    <li>
                      <button
                        aria-busy={isLoading}
                        onClick={() => approval(true)}
                      >
                        approve
                      </button>
                    </li>
                    <li>
                      <button
                        className="secondary"
                        aria-busy={isLoading}
                        onClick={() => approval(false)}
                      >
                        reject
                      </button>
                    </li>
                  </>
                )}
                <li>
                  <button
                    className="contrast"
                    aria-busy={isLoading}
                    onClick={() => router.push(router.asPath + "/masking")}
                  >
                    masking
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

        {res && res?.data?.Snapshot?.length === 0 && <pre>no snapshot</pre>}

        {res && res?.data?.Snapshot?.length === 1 && (
          <div className="grid">
            <img
              src={`/api/img/snapshots/${res?.data?.Snapshot?.[0]?.filename}`}
              alt="approved ss"
            />
            <pre>all good!</pre>
          </div>
        )}

        {res && res?.data?.Snapshot?.length === 2 && (
          <div className="grid">
            <ReactCompareImage
              leftImage={`/api/img/snapshots/${res?.data?.Snapshot?.[0]?.filename}`}
              rightImage={`/api/img/snapshots/${res?.data?.Snapshot?.[1]?.filename}`}
              leftImageLabel={
                res?.data?.Snapshot?.[0]?.approval === 1
                  ? "expectation"
                  : "error"
              }
              rightImageLabel={
                res?.data?.Snapshot?.[1]?.approval === 0 ? "actual" : "error"
              }
            />
            <img
              src={`/api/img/snapshots/diff/${res?.data?.id}.png`}
              alt="diff"
            />
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
