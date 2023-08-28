/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

import { signIn, useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { Table, Input, Space, Tag, Typography, message } from "antd";

import styles from "./index.module.css";

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
  const collectionsQuery = useQuery(
    "collections",
    async () => {
      return await axios.get("/api/v2/collections", {
        params: {
          mtcm: search.searchCode,
          name: search.searchName,
        },
      });
    },
    {
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

  // Table column fields
  const columns = [
    {
      title: "Last Check",
      dataIndex: "lastCheckAt",
      key: "lastCheckAt",
      width: "15%",
    },
    {
      title: "MTCM",
      dataIndex: "id",
      key: "id",
      width: "15%",
      render: (item: any) => <Tag>MTCM-{item}</Tag>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
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
          rowKey="id"
          columns={columns}
          rowClassName={styles.row}
          onRow={(record) => {
            return {
              onClick: () => {
                router.push("v2/collection/" + record.id);
              },
            };
          }}
        />
      </main>
    </>
  );
}
