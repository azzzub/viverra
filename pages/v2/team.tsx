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
import { Alert, Button, Form, Input } from "antd";
import styles from "./team.module.css";
import {
  EditOutlined,
  FileDoneOutlined,
  SaveOutlined,
} from "@ant-design/icons";

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

  // Unauthenticated user redirect to sign in
  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn();
    }
  }, [status]);

  useEffect(() => {
    if (myTeamQuery.data?.data?.data?.Team) {
      const data = myTeamQuery.data?.data?.data?.Team;
      setValue({
        id: data.id,
        slackMention: data.slackMention,
        name: data.name,
        note: data.note,
        metadata: data.metadata,
        webhook: data.webhook,
      });
      setWebhookTemp(data.webhook);
    }
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
                  {isEdit ? "Finish" : "Edit"}
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined rev={undefined} />}
                  loading={myTeamMutation.isLoading || myTeamQuery.isLoading}
                  onClick={() => myTeamMutation.mutate(value)}
                >
                  Save
                </Button>
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
