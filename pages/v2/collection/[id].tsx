/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

import { signIn, useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { Table, Input, Space, Tag, Typography, message } from "antd";

import styles from "./[id].module.css";

export default function Home() {
  const router = useRouter();
  const { data, status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();

  const [search, setSearch] = useState({
    searchName: "",
    searchCode: "",
  });

  // Unauthenticated user redirect to sign in
  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn();
    }
  }, [status]);

  // Get the all collection
  const collectionQuery = useQuery(
    "collection",
    async () => {
      return await axios.get("/api/v2/collection", {
        params: {
          id: router.query["id"],
        },
      });
    },
    {
      enabled: false,
      onError(err: any) {
        if (err?.response?.status !== 401) {
          messageApi.open({
            type: "error",
            content: err?.response?.data?.error || err.message,
          });
        }
      },
      retry: false,
    }
  );

  // Refetch query if the router finish getting the id query
  useEffect(() => {
    if (router.query["id"]) {
      collectionQuery.refetch();
    }
  }, [router]);

  // Table column fields
  const columns = [
    {
      title: "Last Check",
      dataIndex: "lastCheckAtEasy",
      key: "lastCheckAt",
      width: "15%",
    },
    {
      title: "Snapshot",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Unmatch",
      dataIndex: "diffEasy",
      key: "diff",
    },
    {
      title: "Last Reviewed",
      dataIndex: "lastReviewed",
      key: "lastReviewed",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (item: any) => <Tag color={item?.color}>{item?.message}</Tag>,
    },
  ];

  return (
    <>
      {contextHolder}
      <Head>
        <title>Dashboard - Viverra</title>
      </Head>
      <main className={styles.main}>
        <Table
          dataSource={collectionQuery?.data?.data?.data?.Page}
          rowKey="id"
          columns={columns}
          rowClassName={styles.row}
          onRow={(record) => {
            return {
              onClick: () => {
                router.replace("/snapshot/" + record.id);
              },
            };
          }}
        />
      </main>
    </>
  );
}
