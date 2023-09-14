/* eslint-disable require-jsdoc */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import axios from "axios";
import NavHeader from "components/NavHeader";
// import { GetServerSidePropsContext } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ReactCompareImage from "react-compare-image";
import toast from "react-hot-toast";
import { useQuery } from "react-query";

export default function SnapshotDetail() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data, status } = useSession();

  // Get the snapshot detail
  const snapshotDetailQuery = useQuery(
    "snapshotDetail",
    async () => {
      return await axios.get("/api/page", {
        params: {
          id: router.query["id"],
        },
      });
    },
    {
      onError(err: any) {
        if (err?.response?.status !== 401) {
          toast.error(err?.response?.data?.error || err.message);
        }
      },
      retry: false,
      enabled: false,
    }
  );

  useEffect(() => {
    if (router.query["id"]) {
      snapshotDetailQuery.refetch();
    }
  }, [router]);

  async function approval(status: boolean) {
    try {
      setIsLoading(true);
      const approvalRes = await axios.post("/api/approval", {
        snapshotID: snapshotDetailQuery.data?.data?.data?.Snapshot?.[1]?.id,
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
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn();
    }
  }, [status]);

  if (status === "loading" || snapshotDetailQuery.isLoading) {
    return <div>loading...</div>;
  }

  if (!snapshotDetailQuery.data?.data?.data) {
    return <pre>no data</pre>;
  }

  return (
    <>
      <Head>
        <title>snapshot - viverra</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"
        ></link>
      </Head>
      <main className="container">
        <NavHeader
          props={
            snapshotDetailQuery.data?.data?.data?.Snapshot?.length > 0 && (
              <>
                {snapshotDetailQuery.data?.data?.data?.Snapshot.length ===
                  2 && (
                  <>
                    <li>
                      <span>differentiation</span>
                      <br />
                      <span>{snapshotDetailQuery.data?.data?.data?.diff}%</span>
                    </li>
                    {data &&
                      data.user?.role > 0 &&
                      snapshotDetailQuery.data.data?.isEligible && (
                        <>
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
              <Link
                href={`/collection/${snapshotDetailQuery.data?.data?.data?.Collection?.id}`}
              >
                {snapshotDetailQuery.data?.data?.data?.Collection?.name}
              </Link>
            </li>
            <li>
              <Link href="#">{snapshotDetailQuery.data?.data?.data?.name}</Link>
            </li>
          </ul>
        </nav>

        {snapshotDetailQuery.data?.data?.data?.Snapshot?.length === 0 && (
          <pre>no snapshot</pre>
        )}

        {snapshotDetailQuery.data?.data?.data?.Snapshot?.length === 1 && (
          <div className="grid">
            <img
              src={`/api/img/snapshots/${snapshotDetailQuery.data?.data?.data?.Snapshot?.[0]?.filename}`}
              alt="approved ss"
            />
            <pre>all good!</pre>
          </div>
        )}

        {snapshotDetailQuery.data?.data?.data?.Snapshot?.length === 2 && (
          <div className="grid">
            <ReactCompareImage
              leftImage={`/api/img/snapshots/${snapshotDetailQuery.data?.data?.data?.Snapshot?.[0]?.filename}`}
              rightImage={`/api/img/snapshots/${snapshotDetailQuery.data?.data?.data?.Snapshot?.[1]?.filename}`}
              leftImageLabel={
                snapshotDetailQuery.data?.data?.data?.Snapshot?.[0]
                  ?.approval === 1
                  ? "expectation"
                  : "error"
              }
              rightImageLabel={
                snapshotDetailQuery.data?.data?.data?.Snapshot?.[1]
                  ?.approval === 0
                  ? "actual"
                  : "error"
              }
            />
            {snapshotDetailQuery.data?.data?.data?.diff < 0 ? (
              <>
                <pre>
                  COMPARISON ERROR! <br />
                  <br />
                  message:{" "}
                  {
                    snapshotDetailQuery.data?.data?.data?.Snapshot?.[1]?.note
                  }{" "}
                  <br />
                  <br />
                  <a
                    href={`/api/img/snapshots/${snapshotDetailQuery.data?.data?.data?.Snapshot?.[0]?.filename}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    expectation image
                  </a>
                  <br />
                  <a
                    href={`/api/img/snapshots/${snapshotDetailQuery.data?.data?.data?.Snapshot?.[1]?.filename}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    actual image
                  </a>
                </pre>
              </>
            ) : (
              <img
                src={`/api/img/snapshots/diff/${snapshotDetailQuery.data?.data?.data?.id}.png`}
                alt="diff"
              />
            )}
          </div>
        )}
        <br />
      </main>
    </>
  );
}

// export async function getServerSideProps(ctx: GetServerSidePropsContext) {
//   try {
//     const res = await axios.get("/api/page", {
//       params: {
//         id: ctx.query["id"],
//       },
//     });

//     return {
//       props: { res: res.data, error: null },
//     };
//   } catch (error: any) {
//     return {
//       props: {
//         res: null,
//         error: error?.response?.data?.error || error.message,
//       },
//     };
//   }
// }
