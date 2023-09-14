/* eslint-disable react-hooks/exhaustive-deps */

// React/Next deps
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

// Vendor deps
import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useMutation, useQuery } from "react-query";
import {
  Table,
  Input,
  Space,
  message,
  Button,
  Modal,
  Tag,
  Card,
  Typography,
  Statistic,
  Popconfirm,
  Alert,
} from "antd";

// Local deps
import styles from "./index.module.css";
import PopupContextMenu from "components/PopupContextMenu";
import { BookOutlined, HomeOutlined, SendOutlined } from "@ant-design/icons";

const CollectionsPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] =
    useState(false);
  const [isEditCollectionModalOpen, setIsEditCollectionModalOpen] =
    useState(false);
  const [tempSearchTags, setTempSearchTags] = useState("");
  const [isReport, setIsReport] = useState(false);

  const [search, setSearch] = useState({
    searchName: "",
    searchCode: "",
    searchTags: "",
  });

  const [newCollection, setNewCollection] = useState({
    collectionID: "",
    name: "",
    tags: "",
  });

  const [editCollection, setEditCollection] = useState({
    collectionID: "",
    name: "",
    tags: "",
  });

  const [popupValue, setPopupValue] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  // Unauthenticated user redirect to sign in
  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn();
    }
  }, [status]);

  useEffect(() => {
    if (router.isReady) {
      const tags = (router.query?.tags as string) || undefined;

      if (tags) {
        setTempSearchTags(tags);
      } else {
        collectionsQuery.refetch();
      }

      const display = (router.query?.display as string) || undefined;
      if (display === "report") {
        setIsReport(true);
      }
    }
  }, [router]);

  // Get the all collection
  const collectionsQuery = useQuery(
    ["collections", tempSearchTags],
    async (e) => {
      return await axios.get("/api/v2/collection", {
        params: {
          mtcm: search.searchCode,
          name: search.searchName,
          tags: search.searchTags === "" ? tempSearchTags : search.searchTags,
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
      enabled: tempSearchTags !== "",
    }
  );

  // ========================================
  // New Collection Modal Controller
  // ========================================
  const newCollectionMutation = useMutation(
    "collections",
    async () => {
      return await axios.post("/api/v2/collection", newCollection);
    },
    {
      onSuccess() {
        setIsNewCollectionModalOpen(false);
        messageApi.open({
          type: "success",
          content: "New collection successfuly created!",
        });
        setNewCollection({
          collectionID: "",
          name: "",
          tags: "",
        });
        collectionsQuery.refetch();
      },
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

  /**
   * Edit collection mutation
   */
  const editCollectionMutation = useMutation(
    "collections",
    async () => {
      return await axios.put("/api/v2/collection", editCollection);
    },
    {
      onSuccess() {
        setIsEditCollectionModalOpen(false);
        messageApi.open({
          type: "success",
          content: "Collection edit successfully!",
        });
        setEditCollection({
          collectionID: "",
          name: "",
          tags: "",
        });
        collectionsQuery.refetch();
      },
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

  /**
   * Send report mutation
   */
  const sendReport = useMutation(
    "report",
    async () => {
      return await axios.post("/api/v2/report", {
        tags: tempSearchTags,
      });
    },
    {
      onError(err: any) {
        messageApi.open({
          type: "error",
          content: err?.response?.data?.error || err.message,
        });
      },
      retry: false,
    }
  );

  const CollectionTableColumns = [
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
      width: "10%",
      render: (item: any) => <Tag>MTCM-{item}</Tag>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (item: any) => (
        <span style={{ textTransform: "capitalize" }}>{item}</span>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: "15%",
      render: (item: any) => {
        const _item = item?.split(",");
        return !_item
          ? "-"
          : _item?.map((v: any, id: any) => (
              <Tag
                style={{
                  marginInlineEnd: "2px",
                  marginBottom: "2px",
                }}
                key={id}
              >
                {v}
              </Tag>
            ));
      },
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
        {isReport ? (
          <title>Report - Viverra</title>
        ) : (
          <title>Dashboard - Viverra</title>
        )}
      </Head>
      <main className={styles.main}>
        {!isReport && (
          <div className={styles.action__container}>
            <Space.Compact className={styles.search__container}>
              <Input
                allowClear
                className={styles.input__mtcm}
                placeholder="Search MTCM"
                onChange={(e) =>
                  setSearch({ ...search, searchCode: e.target.value })
                }
                value={search.searchCode}
                onPressEnter={() => collectionsQuery.refetch()}
              />
              <Input
                allowClear
                className={styles.input__mtcm__long}
                placeholder="Search collection name"
                onChange={(e) =>
                  setSearch({ ...search, searchName: e.target.value })
                }
                value={search.searchName}
                onPressEnter={() => collectionsQuery.refetch()}
              />
              <Input.Search
                allowClear
                enterButton
                placeholder="Search tags"
                onChange={(e) =>
                  setSearch({ ...search, searchTags: e.target.value })
                }
                value={search.searchTags}
                onSearch={() => collectionsQuery.refetch()}
              />
            </Space.Compact>
            <div className={styles.button__dashboard__container}>
              <Button
                type="link"
                href={`/v2?display=report&tags=${search.searchTags}`}
                icon={<BookOutlined rev={undefined} />}
              >
                See as a report
              </Button>
              <Button
                type="primary"
                onClick={() => setIsNewCollectionModalOpen(true)}
              >
                + Create New Collection
              </Button>
            </div>
          </div>
        )}
        {isReport && (
          <>
            <Card size="small" style={{ marginBottom: "16px" }}>
              <div className={styles.title__container}>
                <div className={styles.desc__container}>
                  <Typography.Text
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    📝 Viverra Visual Test Report
                  </Typography.Text>
                  <Typography.Text>
                    Team Name:{" "}
                    <b>{collectionsQuery?.data?.data?.highlight?.teamName}</b>
                  </Typography.Text>
                  <Typography.Text>
                    Report Tags:{" "}
                    {collectionsQuery?.data?.data?.highlight?.tags?.map(
                      (v: string, i: number) => (
                        <Tag key={i} style={{ fontWeight: "bold" }}>
                          {v}
                        </Tag>
                      )
                    )}
                  </Typography.Text>
                  <Typography.Text>
                    Latest Check at:{" "}
                    <b>
                      {collectionsQuery?.data?.data?.highlight?.lastCheckAt}
                    </b>
                  </Typography.Text>
                </div>
                <div className={styles.stats}>
                  <Statistic
                    title="Passed"
                    value={collectionsQuery.data?.data?.highlight?.passed}
                    suffix={
                      <Typography.Text style={{ color: "green" }}>
                        SS
                      </Typography.Text>
                    }
                    valueStyle={{ color: "green" }}
                  />
                  <Statistic
                    title="Unmatch"
                    value={collectionsQuery.data?.data?.highlight?.failed}
                    suffix={<Typography.Text>SS</Typography.Text>}
                  />
                  <Statistic
                    title="Error"
                    value={collectionsQuery.data?.data?.highlight?.error}
                    suffix={<Typography.Text>SS</Typography.Text>}
                  />
                  <Statistic
                    title="Approved"
                    value={collectionsQuery.data?.data?.highlight?.tc?.approved}
                    suffix={
                      <Typography.Text style={{ color: "green" }}>
                        Coll
                      </Typography.Text>
                    }
                    valueStyle={{ color: "green" }}
                  />
                  <Statistic
                    title="Unreviewed"
                    value={
                      collectionsQuery.data?.data?.highlight?.tc?.unreviewed
                    }
                    suffix={<Typography.Text>Coll</Typography.Text>}
                  />
                </div>
              </div>
            </Card>
            <div className={styles.button__action__container}>
              <Button
                type="primary"
                icon={<HomeOutlined rev={undefined} />}
                href="/v2"
              >
                Dashboard
              </Button>
              <Popconfirm
                title="Send Report"
                description="Are you sure to send this report to your webhook?"
                onConfirm={() => sendReport.mutate()}
                okText="Yes"
                cancelText="No"
                placement="left"
              >
                <Button icon={<SendOutlined rev={undefined} />}>
                  Send Report
                </Button>
              </Popconfirm>
            </div>
          </>
        )}
        <Table
          dataSource={collectionsQuery?.data?.data?.data}
          rowKey="id"
          columns={CollectionTableColumns}
          rowClassName={styles.row}
          onRow={(record: any) => {
            return {
              onClick: () => {
                router.push("v2/collection/" + record.id);
              },
              onContextMenu: (e) => {
                e.preventDefault();
                setEditCollection({
                  collectionID: record.id,
                  name: record.name,
                  tags: record.tags,
                });
                if (!popupValue.visible) {
                  document.addEventListener("click", function onClickOutside() {
                    setPopupValue({ ...popupValue, visible: false });
                    document.removeEventListener("click", onClickOutside);
                  });
                }
                setPopupValue({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                });
              },
            };
          }}
        />
        <Alert
          message="You can edit the collection by right clicking on the collection that you want to edit and click 'Edit Collection'!"
          type="info"
          showIcon
        />
        <PopupContextMenu
          {...popupValue}
          items={[
            {
              key: "edit_collection",
              title: "✏️ ‎ Edit Collection",
              onClick: () => {
                setIsEditCollectionModalOpen(true);
              },
            },
          ]}
        />
        <Modal
          title="Create New Collection"
          open={isNewCollectionModalOpen}
          onOk={() => newCollectionMutation.mutate()}
          onCancel={() => setIsNewCollectionModalOpen(false)}
        >
          <div className={styles.modal__container}>
            <Input
              addonBefore="MTCM-"
              placeholder="000000"
              required
              value={newCollection.collectionID}
              onChange={(e) =>
                setNewCollection({
                  ...newCollection,
                  collectionID: e.target.value,
                })
              }
            />
            <Input
              placeholder="Your collection name"
              required
              value={newCollection.name}
              onChange={(e) =>
                setNewCollection({ ...newCollection, name: e.target.value })
              }
            />
            <Input
              placeholder="Your collection tags"
              value={newCollection.tags}
              onChange={(e) =>
                setNewCollection({
                  ...newCollection,
                  tags: e.target.value.replace(/\s/g, ""),
                })
              }
            />
            <Alert
              message="Separated the tag by comma if you want to add multiple tags (example: desktop,homepage,testing)"
              type="info"
              showIcon
            />
          </div>
        </Modal>
        <Modal
          title="Edit Collection"
          open={isEditCollectionModalOpen}
          onOk={() => {
            editCollectionMutation.mutate();
          }}
          onCancel={() => setIsEditCollectionModalOpen(false)}
        >
          <div className={styles.modal__container}>
            <Input
              addonBefore="MTCM-"
              placeholder="000000"
              required
              disabled
              value={editCollection.collectionID}
            />
            <Input
              placeholder="Your collection name"
              required
              value={editCollection.name}
              onChange={(e) =>
                setEditCollection({ ...editCollection, name: e.target.value })
              }
            />
            <Input
              placeholder="Your collection tags"
              value={editCollection.tags || ""}
              onChange={(e) =>
                setEditCollection({
                  ...editCollection,
                  tags: e.target.value.replace(/\s/g, ""),
                })
              }
            />
            <Alert
              message="Separated the tag by comma if you want to add multiple tags (example: desktop,homepage,testing)"
              type="info"
              showIcon
            />
          </div>
        </Modal>
      </main>
    </>
  );
};

export default CollectionsPage;
