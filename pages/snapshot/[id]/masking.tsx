/* eslint-disable require-jsdoc */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import axios from "axios";
import NavHeader from "components/NavHeader";
// import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

import dynamic from "next/dynamic";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";

const Masking = dynamic(() => import("components/Masking"), {
  ssr: false,
});

export default function SnapshotDetail() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [masking, setMasking] = useState([]);
  const [newMasking, setNewMasking] = useState(0);
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
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "loading") {
    return <div>loading...</div>;
  }

  if (!snapshotDetailQuery.data?.data?.data) {
    return <pre>no data</pre>;
  }

  return (
    <>
      <Head>
        <title>masking snapshot - viverra</title>
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
                {data &&
                  data.user?.role > 0 &&
                  snapshotDetailQuery.data?.data?.isEligible && (
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

        {snapshotDetailQuery.data?.data?.data?.Snapshot?.length > 0 && (
          <div className="grid">
            <Masking
              res={snapshotDetailQuery.data?.data}
              cbNewRect={newMasking}
              cb={(val: any) => setMasking(val)}
              disable={
                data?.user.role === 0 ||
                !snapshotDetailQuery.data?.data?.isEligible
              }
            />
            <pre>
              {data && data.user?.role > 0
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
