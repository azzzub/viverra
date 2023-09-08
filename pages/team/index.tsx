/* eslint-disable require-jsdoc */
/* eslint-disable @next/next/no-img-element */

// React deps
import React, { useEffect, useState } from "react";

// Next deps
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

// External
import axios from "axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

// Local
import NavHeader from "components/NavHeader";
import { useMutation, useQuery } from "react-query";

const getMyTeam = async () => await axios.get("/api/team");

const updateMyTeam = async (v: any) => await axios.post("/api/team", v);

export default function MyTeam() {
  const router = useRouter();

  const { data, status } = useSession();

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
        router.push("/auth/login");
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

  if (data?.user.role === 0 || status === "unauthenticated") {
    return (
      <>
        <pre>unauthorized!</pre>
        <Link href={"/"}>back</Link>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>my team - viverra</title>
      </Head>
      <main className="container">
        <NavHeader
          props={
            <>
              {isEdit && (
                <li>
                  <button
                    aria-busy={myTeamMutation.isLoading}
                    onClick={() => {
                      myTeamMutation.mutate(value);
                    }}
                  >
                    save
                  </button>
                </li>
              )}
              <li>
                <button
                  className="secondary"
                  onClick={() => {
                    if (!isEdit) {
                      setValue({ ...value, webhook: "" });
                    } else {
                      setValue({ ...value, webhook: webhookTemp });
                    }
                    setIsEdit(!isEdit);
                  }}
                >
                  {isEdit ? "cancel" : "edit"}
                </button>
              </li>
            </>
          }
        />
        <nav aria-label="breadcrumb">
          <ul>
            <li>
              <Link href="/">home</Link>
            </li>
            <li>
              <Link href="#">team</Link>
            </li>
          </ul>
        </nav>
        {!myTeamQuery.data?.data?.data?.Team && (
          <div>contact admin to map you to some team!</div>
        )}
        {myTeamQuery.data?.data?.data?.Team && (
          <div>
            <label>team id</label>
            <input type="text" value={value.id} disabled />
            <label>team name</label>
            <input
              type="text"
              value={value.name}
              required
              disabled={!isEdit}
              onChange={(e) => setValue({ ...value, name: e.target.value })}
            />
            <label>team note</label>
            <input
              type="text"
              value={value.note}
              disabled={!isEdit}
              onChange={(e) => setValue({ ...value, note: e.target.value })}
            />
            <label>team slackMention</label>
            <input
              type="text"
              value={value.slackMention}
              disabled={!isEdit}
              onChange={(e) =>
                setValue({ ...value, slackMention: e.target.value })
              }
            />
            <label>team webhook</label>
            <input
              type="text"
              value={value.webhook}
              disabled={!isEdit}
              onChange={(e) => setValue({ ...value, webhook: e.target.value })}
            />
            <small>
              the webhook is masked, leave empty while editing if you don&#39;t
              want to update the webhook
            </small>
          </div>
        )}
      </main>
    </>
  );
}
