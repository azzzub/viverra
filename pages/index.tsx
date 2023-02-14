/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

import NavHeader from "components/NavHeader";
import NewCollection from "components/NewCollection";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { toast } from "react-hot-toast";

export default function Home() {
  const [menu, setMenu] = useState("");
  const router = useRouter();
  const { data, status } = useSession();

  const [search, setSearch] = useState({
    searchName: "",
    searchCode: "",
  });

  // Get the all collection
  const collectionsQuery = useQuery(
    "collections",
    async () => {
      return await axios.get("/api/collection", {
        params: {
          mtcm: search.searchCode,
          name: search.searchName,
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
    }
  );

  useEffect(() => {
    if (menu === "success_fetch") {
      collectionsQuery.refetch();
    }
  }, [menu]);

  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn();
    }
  }, [status]);

  if (status === "loading" || collectionsQuery.isLoading) {
    return <div>loading...</div>;
  }

  return (
    <>
      <Head>
        <title>viverra - visual verifier</title>
      </Head>
      <main className="container">
        <NavHeader
          props={
            <li>
              {data && data.user?.role > 0 && (
                <button
                  className="contrast"
                  onClick={() => {
                    setMenu("new_collection");
                  }}
                >
                  create new collection
                </button>
              )}
            </li>
          }
        />
        <nav aria-label="breadcrumb">
          <ul>
            <li>
              <Link href="/">collections</Link>
            </li>
          </ul>
        </nav>
        {menu === "new_collection" && (
          <NewCollection
            cb={(value: any) => setMenu(value === "cancel" ? "" : value)}
          />
        )}
        <details>
          <summary>
            <i>toggle search</i>
          </summary>
          <form
            className="grid col"
            onSubmit={(e) => {
              e.preventDefault();
              collectionsQuery.refetch();
            }}
          >
            <input
              type="search"
              placeholder="mtcm code"
              value={search.searchCode}
              onChange={(e) => {
                setSearch({ ...search, searchCode: e.target.value });
              }}
            />
            <input
              type="search"
              placeholder="collection name"
              value={search.searchName}
              onChange={(e) => {
                setSearch({ ...search, searchName: e.target.value });
              }}
            />
            <button type="submit" aria-busy={collectionsQuery.isFetching}>
              search
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setSearch({
                  searchCode: "",
                  searchName: "",
                });
              }}
            >
              reset
            </button>
          </form>
        </details>
        <table>
          <thead>
            <tr>
              <th>test code</th>
              <th>name</th>
              <th>notes</th>
              <th>team name</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {collectionsQuery?.data?.data?.data?.map((value: any) => {
              return (
                <tr key={value?.id}>
                  <td>MTCM-{value?.id}</td>
                  <td>{value?.name}</td>
                  <td>{value?.desc}</td>
                  <td>{value?.Team ? value.Team.name : "-"}</td>
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
        {collectionsQuery.isError && (
          <pre>
            got error fetching pages data!
            <br />
            message: {collectionsQuery.error.message}
          </pre>
        )}
      </main>
    </>
  );
}
