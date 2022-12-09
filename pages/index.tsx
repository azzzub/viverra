/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

import NavHeader from "components/NavHeader";
import NewCollection from "components/NewCollection";

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
                  setMenu("new_collection");
                }}
              >
                create new collection
              </a>
            </li>
          }
        />
        {menu === "new_collection" && (
          <NewCollection
            cb={(value: any) => setMenu(value === "cancel" ? "" : value)}
          />
        )}
        <h4>collection</h4>
        <table>
          <thead>
            <tr>
              <th>name</th>
              <th>desc</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {res?.data &&
              res?.data.map((value: any) => {
                return (
                  <tr key={value?.id}>
                    <td>{value?.name}</td>
                    <td>{value?.desc}</td>
                    <td>
                      <button
                        onClick={() => router.push(`/collection/${value?.id}`)}
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
    const res = await axios.get("/api/collection");

    return { props: { res: res.data, error: null } };
  } catch (error: any) {
    return { props: { res: null, error: error.message } };
  }
}
