/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactCompareImage from "react-compare-image";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import styles from "./[id].module.css";
import {
  Button,
  Card,
  Input,
  Modal,
  Statistic,
  Typography,
  message,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  ExclamationOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import copy from "copy-to-clipboard";

const Masking = dynamic(() => import("components/Masking"), {
  ssr: false,
});

export default function SnapshotDetail() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data, status } = useSession();
  const [isModalMaskingOpen, setIsModalMaskingOpen] = useState(false);
  const [newMasking, setNewMasking] = useState(0);
  const [masking, setMasking] = useState([]);
  const [isModalExportOpen, setIsModalExportOpen] = useState(false);
  const [exportedMasking, setExportedMasking] = useState("");

  // Get the snapshot detail
  const snapshotDetailQuery = useQuery(
    "snapshotDetail",
    async () => {
      return await axios.get("/api/v2/page", {
        params: {
          id: router.query["id"],
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
      enabled: false,
    }
  );

  useEffect(() => {
    if (router.query["id"]) {
      snapshotDetailQuery.refetch();
    }
  }, [router]);

  async function approval(status: boolean) {
    try {
      setIsLoading(true);
      const approvalRes = await axios.post("/api/approval", {
        snapshotID: snapshotDetailQuery.data?.data?.data?.Snapshot?.[1]?.id,
        status,
      });

      if (approvalRes) {
        if (status) {
          toast.success("snapshot approved!");
        } else {
          toast.success("snapshot rejected!");
        }
        router.replace(router.asPath);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
      snapshotDetailQuery.refetch();
    }
  }

  async function updateMasking() {
    try {
      setIsLoading(true);

      const res = await axios.post("/api/masking", {
        pageID: router.query?.id,
        masking: JSON.stringify(masking),
      });
      if (res) {
        toast.success("success update masking");
      }
      setIsModalMaskingOpen(false);
      setNewMasking(0);
      setMasking([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn();
    }
  }, [status]);

  if (status === "loading" || snapshotDetailQuery.isLoading) {
    return <div>loading...</div>;
  }

  if (!snapshotDetailQuery.data?.data?.data) {
    return <pre>no data</pre>;
  }

  return (
    <>
      <Head>
        <title>Snapshot - Viverra</title>
      </Head>
      <main className={styles.container}>
        <Card size="small">
          <div className={styles.title__container}>
            <div className={styles.desc__container}>
              <Typography.Text>
                Collection:
                <Typography.Text code>
                  MTCM-{snapshotDetailQuery.data?.data?.data?.Collection?.id}
                </Typography.Text>
                <b> {snapshotDetailQuery.data?.data?.data?.Collection?.name}</b>
              </Typography.Text>
              <Typography.Text>
                Snapshot Name:{" "}
                <b>{snapshotDetailQuery.data?.data?.data?.name}</b>
              </Typography.Text>
            </div>
            <Statistic
              title="Unmatch Rate"
              value={snapshotDetailQuery.data?.data?.data?.diff || 0}
              suffix="%"
            />
          </div>
        </Card>
        <div className={styles.header__container}>
          <Button
            icon={<EyeInvisibleOutlined rev={undefined} />}
            disabled={!snapshotDetailQuery.data?.data?.isEligible}
            onClick={() => setIsModalMaskingOpen(true)}
          >
            Masking
          </Button>
          <div>
            <Button
              type="primary"
              icon={<CheckOutlined rev={undefined} />}
              disabled={
                !snapshotDetailQuery.data?.data?.isEligible ||
                snapshotDetailQuery.data?.data?.data?.Snapshot?.length === 1
              }
              onClick={() => {
                approval(true);
              }}
              loading={isLoading}
            >
              Approve
            </Button>
            <Button
              danger
              type="primary"
              icon={<CloseOutlined rev={undefined} />}
              disabled={
                !snapshotDetailQuery.data?.data?.isEligible ||
                snapshotDetailQuery.data?.data?.data?.Snapshot?.length === 1
              }
              onClick={() => {
                approval(false);
              }}
              loading={isLoading}
            >
              Reject
            </Button>
          </div>
        </div>
        {snapshotDetailQuery.data?.data?.data?.Snapshot?.length === 1 && (
          <>
            <div className={styles.side__by__side}>
              <Typography.Text>
                Captured:{" "}
                <b>
                  {
                    snapshotDetailQuery.data?.data?.data?.Snapshot?.[0]
                      ?.capturedAt
                  }
                </b>
              </Typography.Text>
            </div>
            <div className={styles.side__by__side}>
              <img
                src={`/api/img/snapshots/${snapshotDetailQuery.data?.data?.data?.Snapshot?.[0]?.filename}`}
                alt="Approved Snapshot"
              />
              <div className={styles.new__snapshot}>
                <Typography.Title level={2}>👍 👍</Typography.Title>
                <Typography.Title level={4}>Approved Snapshot</Typography.Title>
                <Typography.Text>
                  This snapshot already approved!
                </Typography.Text>
              </div>
            </div>
          </>
        )}

        {snapshotDetailQuery.data?.data?.data?.Snapshot?.length === 2 && (
          <>
            <div className={styles.side__by__side}>
              <Typography.Text>
                Approved:{" "}
                <b>
                  {
                    snapshotDetailQuery.data?.data?.data?.Snapshot?.[0]
                      ?.capturedAt
                  }
                </b>
              </Typography.Text>
              <Typography.Text>
                Captured:{" "}
                <b>
                  {
                    snapshotDetailQuery.data?.data?.data?.Snapshot?.[1]
                      ?.capturedAt
                  }
                </b>
              </Typography.Text>
            </div>
            <div className={styles.side__by__side}>
              <ReactCompareImage
                leftImage={`/api/img/snapshots/${snapshotDetailQuery.data?.data?.data?.Snapshot?.[0]?.filename}`}
                rightImage={`/api/img/snapshots/${snapshotDetailQuery.data?.data?.data?.Snapshot?.[1]?.filename}`}
                leftImageLabel={
                  snapshotDetailQuery.data?.data?.data?.Snapshot?.[0]
                    ?.approval === 1
                    ? "expectation"
                    : "error"
                }
                rightImageLabel={
                  snapshotDetailQuery.data?.data?.data?.Snapshot?.[1]
                    ?.approval === 0
                    ? "actual"
                    : "error"
                }
              />
              {snapshotDetailQuery.data?.data?.data?.diff > 0 ? (
                <img
                  src={`/api/img/snapshots/diff/${snapshotDetailQuery.data?.data?.data?.id}.png`}
                  alt="diff"
                />
              ) : (
                <div className={styles.new__snapshot}>
                  <Typography.Title level={2}>❗ ❗</Typography.Title>
                  <Typography.Title level={4}>Error Snapshot</Typography.Title>
                  <Typography.Text>
                    The snapshot size is different!
                    <br />
                    Here is the
                    <Typography.Link
                      href={`/api/img/snapshots/${snapshotDetailQuery.data?.data?.data?.Snapshot?.[1]?.filename}`}
                    >
                      {" "}
                      actual snapshot
                    </Typography.Link>{" "}
                    and here is the
                    <br />
                    <Typography.Link
                      href={`/api/img/snapshots/${snapshotDetailQuery.data?.data?.data?.Snapshot?.[0]?.filename}`}
                    >
                      expectation snapshot
                    </Typography.Link>
                  </Typography.Text>
                </div>
              )}
            </div>
          </>
        )}
        <br />
      </main>
      <Modal
        title="Import Masking Data"
        open={isModalExportOpen}
        onCancel={() => setIsModalExportOpen(false)}
        onOk={async ()=>{
          try {
            const parsing = JSON.parse(exportedMasking)
            setMasking(parsing)
            setExportedMasking("")
            setIsModalExportOpen(false)
          } catch (error) {
            message.error("Your masking data is invalid JSON object!")
          } finally {
            updateMasking()
          }
        }}
      >
        <div className={styles.modal__container}>
          <Input
            placeholder="Paste your exported masking here..."
            required
            value={exportedMasking}
            onChange={(e) => setExportedMasking(e.target.value)}
          />
        </div>
      </Modal>
      <Modal
        title={"Masking - " + snapshotDetailQuery.data?.data?.data?.name}
        open={isModalMaskingOpen}
        style={{
          top:30
        }}
        width="85%"
        onCancel={() => setIsModalMaskingOpen(false)}
        footer={[
          <Button
            key="add"
            onClick={() => setNewMasking(newMasking + 1)}
            icon={<PlusOutlined rev={undefined} />}
            disabled={!snapshotDetailQuery?.data?.data?.isEligible}
          >
            Mask
          </Button>,
          <Button
            key="export"
            onClick={() => {
              copy(JSON.stringify(masking));
              message.success("Masking data copied to clipboard!");
            }}
            icon={<DownloadOutlined rev={undefined} />}
            disabled
          >
            Export
          </Button>,
          <Button
            key="import"
            onClick={() => setIsModalExportOpen(true)}
            icon={<UploadOutlined rev={undefined} />}
            disabled
          >
            Import
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined rev={undefined} />}
            onClick={updateMasking}
            loading={isLoading}
            disabled={!snapshotDetailQuery?.data?.data?.isEligible}
          >
            Save
          </Button>,
        ]}
      >
        {snapshotDetailQuery.data?.data?.data?.Snapshot?.length > 0  && (
          <Masking
            res={snapshotDetailQuery.data?.data}
            cbNewRect={newMasking}
            cb={(val: any) => setMasking(val)}
            disable={
              data?.user.role === 0 ||
              !snapshotDetailQuery.data?.data?.isEligible
            }
          />
        )}
      </Modal>
    </>
  );
}
