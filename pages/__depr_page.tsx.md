/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { formatDistance } from "date-fns";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

import NewPage from "components/NewPage";
import NavHeader from "components/NavHeader";

export default function Home({ res, error }: any) {
  const [menu, setMenu] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (menu === "success_fetch") {
      router.replace(router.asPath);
    }
  }, [menu]);

  return (
    <>
      <Head>
        <title>vrex</title>
      </Head>
      <main className="container">
        <NavHeader
          props={
            <li>
              <a
                href="#"
                onClick={() => {
                  setMenu("new_page");
                }}
              >
                create new page
              </a>
            </li>
          }
        />
        {menu === "new_page" && (
          <NewPage
            cb={(value: any) => setMenu(value === "cancel" ? "" : value)}
          />
        )}
        <h4>page</h4>
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>result</th>
              <th>update</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {res?.data &&
              res?.data.map((value: any) => {
                return (
                  <tr key={value?.id}>
                    <td>{value?.id}</td>
                    <td>{value?.name}</td>
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
                            value?.Snapshot[value?.Snapshot.length - 1]
                              ?.updatedAt
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

export async function getServerSideProps() {
  try {
    const res = await axios.get("/api/page");

    return { props: { res: res.data, error: null } };
  } catch (error: any) {
    return { props: { res: null, error: error.message } };
  }
}
