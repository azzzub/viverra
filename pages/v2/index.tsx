/* eslint-disable react-hooks/exhaustive-deps */

// React/Next deps
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

// Vendor deps
import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useMutation, useQuery } from "react-query";
import { Table, Input, Space, message, Button, Modal, Tag } from "antd";

// Local deps
import styles from "./index.module.css";
import PopupContextMenu from "components/PopupContextMenu";

export default function Home() {
  const router = useRouter();
  const { data, status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] =
    useState(false);
  const [isEditCollectionModalOpen, setIsEditCollectionModalOpen] =
    useState(false);

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

  // Get the all collection
  const collectionsQuery = useQuery(
    "collections",
    async () => {
      return await axios.get("/api/v2/collection", {
        params: {
          mtcm: search.searchCode,
          name: search.searchName,
          tags: search.searchTags
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

  function handleNewCollectionModalOk() {
    newCollectionMutation.mutate();
  }

  function handleNewCollectionModalCancel() {
    setIsNewCollectionModalOpen(false);
  }

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
          : _item?.map((v: any, id: any) => <Tag style={{textTransform:"none", marginInlineEnd: "2px", marginBottom:"2px"}} key={id}>{v}</Tag>);
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
        <title>Dashboard - Viverra</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.action__container}>
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
            <Input
              allowClear
              className={styles.input__mtcm__long}
              placeholder="Search collection name"
              onChange={(e) =>
                setSearch({ ...search, searchName: e.target.value })
              }
              onPressEnter={() => collectionsQuery.refetch()}
            />
            <Input.Search
              allowClear
              enterButton
              placeholder="Search tags"
              onChange={(e) =>
                setSearch({ ...search, searchTags: e.target.value })
              }
              onSearch={() => collectionsQuery.refetch()}
            />
          </Space.Compact>
          <Button
            type="primary"
            onClick={() => setIsNewCollectionModalOpen(true)}
          >
            + Create New Collection
          </Button>
        </div>
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
          onOk={handleNewCollectionModalOk}
          onCancel={handleNewCollectionModalCancel}
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
                setNewCollection({ ...newCollection, tags: e.target.value.replace(/\s/g, '') })
              }
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
                setEditCollection({ ...editCollection, tags: e.target.value.replace(/\s/g, '') })
              }
            />
          </div>
        </Modal>
      </main>
    </>
  );
}
