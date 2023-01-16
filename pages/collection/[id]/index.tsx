/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable react-hooks/exhaustive-deps */

import { formatDistance } from "date-fns";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

import NavHeader from "components/NavHeader";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function Home({ res, error }: any) {
  const router = useRouter();
  const { data, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  if (status === "loading") {
    return <div>loading...</div>;
  }

  const sendReport = async () => {
    try {
      setIsLoading(true);
      await axios.get("/api/report", {
        params: {
          collectionID: router.query["id"] as string,
        },
      });
      toast.success("report sent successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!res?.data) {
    return <pre>no data</pre>;
  }

  return (
    <>
      <Head>
        <title>collection - viverra</title>
      </Head>
      <main className="container">
        <NavHeader
          props={
            res?.data?.Page.length > 0 &&
            data?.user?.role === 1 && (
              <>
                <li>
                  <button
                    className="secondary"
                    onClick={() => {
                      sendReport();
                    }}
                  >
                    send report
                  </button>
                </li>
                <li>
                  <button
                    className="contrast"
                    onClick={() => {
                      unsecuredCopyToClipboard(router.query["id"] as string);
                      // navigator.clipboard.writeText(router.query["id"] as string);
                      toast.success("collection id copied to clipboard");
                    }}
                  >
                    copy collection id
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
              <Link href="#">{res?.data?.name}</Link>
            </li>
          </ul>
        </nav>
        <table>
          <thead>
            <tr>
              <th>name</th>
              <th>diff (%)</th>
              <th>result</th>
              <th>update</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {res?.data?.Page?.map((value: any) => {
              return (
                <tr key={value?.id}>
                  <td>{value?.name}</td>
                  <td>{value?.diff || "0.0"}</td>
                  {value?.Snapshot.length === 0 && (
                    <td className="no-data">no snapshot</td>
                  )}
                  {value?.Snapshot.length === 1 && (
                    <td className="passed">passed</td>
                  )}
                  {value?.Snapshot.length === 2 && (
                    <td className="failed">failed</td>
                  )}
                  {value?.Snapshot.length === 0 && (
                    <td>
                      {formatDistance(
                        Date.parse(value?.updatedAt),
                        new Date(),
                        {
                          addSuffix: true,
                        }
                      )}
                    </td>
                  )}
                  {value?.Snapshot.length > 0 && (
                    <td>
                      {formatDistance(
                        Date.parse(
                          value?.Snapshot[value?.Snapshot.length - 1]?.updatedAt
                        ),
                        new Date(),
                        {
                          addSuffix: true,
                        }
                      )}
                    </td>
                  )}
                  <td>
                    <button
                      onClick={() => router.push(`/snapshot/${value?.id}`)}
                    >
                      detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {error && (
          <pre>
            got error fetching pages data!
            <br />
            message: {error}
          </pre>
        )}
      </main>
    </>
  );
}

function unsecuredCopyToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Unable to copy to clipboard", err);
  }
  document.body.removeChild(textArea);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  try {
    const res = await axios.get("/api/collection", {
      params: {
        id: ctx.query["id"],
      },
    });

    return { props: { res: res.data, error: null } };
  } catch (error: any) {
    return { props: { res: null, error: error.message } };
  }
}
