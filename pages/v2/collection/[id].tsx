/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

import { signIn, useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { Table, Tag, Typography, message, Card, Statistic } from "antd";

import styles from "./[id].module.css";

const CollectionDetailPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();

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
        <title>Collection - Viverra</title>
      </Head>
      <main className={styles.main}>
        <Card size="small">
          <div className={styles.title__container}>
            <div className={styles.desc__container}>
              <Typography.Text>
                Collection ID:
                <Typography.Text code>
                  MTCM-{collectionQuery.data?.data?.data?.id}
                </Typography.Text>
              </Typography.Text>

              <Typography.Text>
                Collection Tags:{" "}
                {!collectionQuery.data?.data?.data?.tags
                  ? "-"
                  : collectionQuery.data?.data?.data?.tags
                      .split(",")
                      .map((v: any, id: any) => (
                        <Tag
                          style={{
                            fontSize: "small",
                            textTransform: "none",
                          }}
                          key={id}
                        >
                          {v}
                        </Tag>
                      ))}
              </Typography.Text>
              <Typography.Text>
                Collection Name:{" "}
                <b> {collectionQuery.data?.data?.data?.name}</b>
              </Typography.Text>
            </div>
            <div className={styles.stats}>
              <Statistic
                title="Avg Matching Rate"
                value={collectionQuery.data?.data?.data?.matchingRate || 0}
                suffix="%"
              />
              <Statistic
                title="Reviewed Snapshot"
                value={collectionQuery.data?.data?.data?.reviewedSnapshot}
              />
            </div>
          </div>
        </Card>
        <Table
          dataSource={collectionQuery?.data?.data?.data?.Page}
          rowKey="id"
          columns={columns}
          rowClassName={styles.row}
          className={styles.table}
          onRow={(record) => {
            return {
              onClick: () => {
                router.push("/v2/snapshot/" + record.id);
              },
            };
          }}
        />
      </main>
    </>
  );
};

export default CollectionDetailPage;
