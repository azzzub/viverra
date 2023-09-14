/* eslint-disable @next/next/no-img-element */

// React deps
import React, { useEffect, useState } from "react";

// Next deps
import Head from "next/head";

// External
import axios from "axios";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";

// Local
import { useMutation, useQuery } from "react-query";
import { Alert, Button, Form, Input, Popconfirm, Space } from "antd";
import styles from "./team.module.css";
import {
  EditOutlined,
  FileDoneOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import copy from "copy-to-clipboard";

const getMyTeam = async () => await axios.get("/api/team");

const updateMyTeam = async (v: any) => await axios.post("/api/team", v);

const MyTeamPage = () => {
  const { status } = useSession();

  const [isEdit, setIsEdit] = useState(false);
  const [webhookTemp, setWebhookTemp] = useState("");
  const [value, setValue] = useState({
    name: "",
    slackMention: "",
    note: "",
    webhook: "",
    metadata: "",
    id: "",
    token: "",
  });

  // Get the teams
  const myTeamQuery = useQuery("my_team", getMyTeam, {
    onError(err: any) {
      if (err?.response?.status === 401) {
        // router.push("/auth/login");
      } else {
        toast.error(err?.response?.data?.error || err.message);
      }
    },
  });

  const myTeamMutation = useMutation("my_team", updateMyTeam, {
    onSuccess() {
      toast.success("update team success");
      setIsEdit(false);
      myTeamQuery.refetch();
    },
    onError(error: any) {
      toast.error(error?.response?.data?.error || error.message);
    },
  });

  const generateTokenMutation = useMutation(
    "token",
    async () => await axios.post("/api/v2/team/token"),
    {
      onSuccess(v) {
        toast.success(
          `New token generated!\nCopied to your clipboard!\n\nYour token: ${v.data?.data?.token}`,
          {
            duration: 30000,
          }
        );
        setValue({ ...value, token: v.data?.data?.token });
        copy(v.data?.data?.token);
      },
      onError(error: any) {
        toast.error(error?.response?.data?.error || error.message);
      },
    }
  );

  // Unauthenticated user redirect to sign in
  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn();
    }
  }, [status]);

  useEffect(() => {
    if (myTeamQuery.data?.data?.data?.Team) {
      const data = myTeamQuery.data?.data?.data?.Team;
      if (!isEdit) {
        setValue({
          id: data.id,
          slackMention: data.slackMention,
          name: data.name,
          note: data.note,
          metadata: data.metadata,
          webhook: data.webhook,
          token: data.token,
        });
      }
      setWebhookTemp(data.webhook);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myTeamQuery.data]);

  if (status === "loading") {
    return <div>loading...</div>;
  }

  return (
    <>
      <Head>
        <title>My Team - Viverra</title>
      </Head>
      <main className={styles.container}>
        {myTeamQuery.data?.data?.data?.Team && (
          <Form labelCol={{ span: 3 }}>
            <Form.Item label="Team ID">
              <Input value={value.id} disabled />
            </Form.Item>
            <Form.Item label="Team Name">
              <Input
                type="text"
                value={value.name}
                required
                disabled={!isEdit}
                onChange={(e) => setValue({ ...value, name: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Team Note">
              <Input
                type="text"
                value={value.note}
                disabled={!isEdit}
                onChange={(e) => setValue({ ...value, note: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Team Slack Mention">
              <Input
                type="text"
                value={value.slackMention}
                disabled={!isEdit}
                onChange={(e) =>
                  setValue({ ...value, slackMention: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item label="Team Slack Webhook">
              <Input
                type="text"
                value={value.webhook}
                disabled={!isEdit}
                onChange={(e) =>
                  setValue({ ...value, webhook: e.target.value })
                }
              />
            </Form.Item>
            <Alert
              message="The team slack webhook is masked, leave empty while editing if you don&#39;t
              want to update the webhook"
              type="info"
              showIcon
            />
            <br />
            <Form.Item label="Team Token">
              <Space.Compact style={{ width: "100%" }}>
                <Input disabled value={value.token} />
                <Popconfirm
                  placement="left"
                  title="Generate New Token"
                  description="Are you sure to generate new token? The existing token will be replaced!"
                  onConfirm={() => {
                    generateTokenMutation.mutate();
                  }}
                  okText="Acknowledge"
                  cancelText="Cancel"
                >
                  <Button
                    type="primary"
                    danger
                    loading={generateTokenMutation.isLoading}
                  >
                    Generate New Token
                  </Button>
                </Popconfirm>
              </Space.Compact>
            </Form.Item>
            <Alert
              message="Your new generated token would only appears once after you generated and automatically copied to your clipboard, save it nicely before it's gone! Or... contact admin!"
              type="warning"
              showIcon
            />
            <br />
            <Form.Item>
              <div className={styles.footer__container}>
                <Button
                  icon={
                    isEdit ? (
                      <FileDoneOutlined rev={undefined} />
                    ) : (
                      <EditOutlined rev={undefined} />
                    )
                  }
                  onClick={() => {
                    if (!isEdit) {
                      setValue({ ...value, webhook: "" });
                    } else {
                      setValue({ ...value, webhook: webhookTemp });
                    }
                    setIsEdit(!isEdit);
                  }}
                  disabled={myTeamMutation.isLoading || myTeamQuery.isLoading}
                >
                  {isEdit ? "Cancel" : "Edit"}
                </Button>
                {isEdit && (
                  <Button
                    type="primary"
                    icon={<SaveOutlined rev={undefined} />}
                    loading={myTeamMutation.isLoading || myTeamQuery.isLoading}
                    onClick={() => myTeamMutation.mutate(value)}
                  >
                    Save
                  </Button>
                )}
              </div>
            </Form.Item>
          </Form>
        )}
        {!myTeamQuery.data?.data?.data?.Team && (
          <Alert
            message="Contact admin to map you to some team!"
            type="warning"
            showIcon
          />
        )}
      </main>
    </>
  );
};

export default MyTeamPage;
