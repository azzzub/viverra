/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

import NavVHeader from "components/NavHeader";
import NewCollection from "components/NewCollection";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { toast } from "react-hot-toast";
import { Table, Input, Space } from "antd";

import styles from "./index.module.css";

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
      return await axios.get("/api/v2/collection", {
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

  const columns = [
    {
      title: "MTCM",
      dataIndex: "id",
      key: "id",
      width: "15%",
      render: (item: any) => <a href={"/collection/" + item}>{item}</a>,
    },
    {
      title: "Team Name",
      dataIndex: "Team",
      key: "team_name",
      render: (item: any) => item?.name,
      width: "20%",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
  ];

  return (
    <>
      <Head>
        <title>Dashboard - Viverra</title>
      </Head>
      <main className={styles.main}>
        <Space.Compact className={styles.search__container}>
          <Input
            allowClear
            className={styles.input__mtcm}
            placeholder="Search MTCM"
            onChange={(e) =>
              setSearch({ ...search, searchCode: e.target.value })
            }
            onPressEnter={() => collectionsQuery.refetch()}
          />
          <Input.Search
            allowClear
            enterButton
            placeholder="Search collection name"
            onChange={(e) =>
              setSearch({ ...search, searchName: e.target.value })
            }
            onSearch={() => collectionsQuery.refetch()}
          />
        </Space.Compact>
        <Table
          dataSource={collectionsQuery?.data?.data?.data}
          columns={columns}
        />
      </main>
    </>
  );
}
