/* eslint-disable react-hooks/exhaustive-deps */

// React deps
import { useEffect, useState } from "react";

// Next deps
import Head from "next/head";
import Link from "next/link";

// External
import axios from "axios";
import { useQuery } from "react-query";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

// Local
import NavHeader from "components/NavHeader";
import NewTeam from "components/admin/NewTeam";
import UpdateTeam from "components/admin/UpdateTeam";
import NewTeamMember from "components/admin/NewTeamMember";
import CollectionMapping from "components/admin/CollectionMapping";

const getTeam = () => {
  return axios.get("/api/admin/team");
};

export default function AdminHome() {
  const router = useRouter();

  const [menu, setMenu] = useState("");

  const { data, status } = useSession();

  // Get the teams
  const teamQuery = useQuery("team", getTeam, {
    onError(err: any) {
      if (err?.response?.status === 401) {
        router.push("/");
      } else {
        toast.error(err.message);
      }
    },
  });

  useEffect(() => {
    if (menu === "success_fetch") {
      teamQuery.refetch();
    }
  }, [menu]);

  if (status === "loading") {
    return <div>loading...</div>;
  }

  if (data?.user.role !== 2) {
    return (
      <div>
        <pre>unauthorized!</pre>
        <Link href={"/"}>back</Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>admin viverra - visual verifier</title>
      </Head>
      <main className="container">
        <NavHeader
          props={
            <li>
              {data?.user?.role === 2 && (
                <button
                  className="contrast"
                  onClick={async () => {
                    setMenu("new_team");
                  }}
                >
                  create new team
                </button>
              )}
            </li>
          }
        />
        <nav aria-label="breadcrumb">
          <ul>
            <li>
              <Link href="/admin">admin</Link>
            </li>
            <li>
              <Link href="/admin/user">user</Link>
            </li>
          </ul>
        </nav>
        {menu === "new_team" && (
          <NewTeam
            cb={(value: any) => setMenu(value === "cancel" ? "" : value)}
          />
        )}
        {teamQuery.isLoading && <div>loading...</div>}
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>slack</th>
              <th>webhook</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {teamQuery?.data?.data?.data?.map((value: any) => {
              return (
                <>
                  <tr key={value?.id}>
                    <td style={{ fontSize: 8 }}>{value?.id}</td>
                    <td>{value?.name}</td>
                    <td>{value?.slackMention}</td>
                    <td style={{ fontSize: 8 }}>{value?.webhook}</td>
                    <td className="admin-action-container">
                      <button
                        onClick={() => {
                          setMenu("edit_team" + value.id);
                        }}
                      >
                        edit
                      </button>
                      <button
                        onClick={() => {
                          setMenu("collection_mapping" + value.id);
                        }}
                      >
                        collection mapping
                      </button>
                      <button
                        onClick={() => {
                          setMenu("add_new_member" + value.id);
                        }}
                      >
                        add member
                      </button>
                    </td>
                  </tr>
                  {value?.Collection?.length > 0 && (
                    <tr>
                      <td></td>
                      <td>collection:</td>
                      <td colSpan={3}>
                        <ul>
                          {value?.Collection?.map((v: any) => (
                            <li key={v.name}>
                              <Link
                                href={`${process.env.NEXT_PUBLIC_BASE_URL}/collection/${v.id}`}
                              >
                                {v.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                  {value?.User?.length > 0 && (
                    <tr>
                      <td></td>
                      <td>member:</td>
                      <td colSpan={3}>
                        <ul>
                          {value?.User?.map((v: any) => (
                            <li key={v.username}>{v.username}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                  {menu === "edit_team" + value.id && (
                    <UpdateTeam
                      cb={(value: any) =>
                        setMenu(value === "cancel" ? "" : value)
                      }
                      teamDetail={value}
                    />
                  )}
                  {menu === "add_new_member" + value.id && (
                    <NewTeamMember
                      cb={(value: any) =>
                        setMenu(value === "cancel" ? "" : value)
                      }
                      teamID={value?.id}
                    />
                  )}
                  {menu === "collection_mapping" + value.id && (
                    <CollectionMapping
                      cb={(value: any) =>
                        setMenu(value === "cancel" ? "" : value)
                      }
                      teamID={value?.id}
                    />
                  )}
                </>
              );
            })}
          </tbody>
        </table>
        {teamQuery.isError && (
          <pre>
            got error fetching pages data!
            <br />
            message: {teamQuery.error?.message}
          </pre>
        )}
      </main>
    </>
  );
}
