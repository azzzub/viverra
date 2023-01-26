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
import EditRole from "components/admin/EditRole";

const getUser = () => {
  return axios.get("/api/admin/user");
};

export default function AdminUser() {
  const [menu, setMenu] = useState("");
  const { data, status } = useSession();
  const router = useRouter();

  // Get the teams
  const userQuery = useQuery("user", getUser, {
    onError(err: any) {
      if (err?.response?.status === 401) {
        router.push("/");
      } else {
        toast.error(err?.response?.data?.error || err.message);
      }
    },
  });

  useEffect(() => {
    if (menu === "success_fetch") {
      userQuery.refetch();
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
        <NavHeader />
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
        {userQuery.isLoading && <div>loading...</div>}
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>role</th>
              <th>updated at</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {userQuery?.data?.data?.data?.map((value: any) => {
              return (
                <>
                  <tr key={value?.id}>
                    <td>{value?.id}</td>
                    <td>{value?.username}</td>
                    <td>{value?.role}</td>
                    <td>{value?.updatedAt}</td>
                    <td>
                      <button
                        onClick={() => {
                          setMenu("edit_role" + value.id);
                        }}
                      >
                        edit role
                      </button>
                    </td>
                  </tr>

                  {menu === "edit_role" + value.id && (
                    <EditRole
                      cb={(value: any) =>
                        setMenu(value === "cancel" ? "" : value)
                      }
                      userDetail={value}
                    />
                  )}
                </>
              );
            })}
          </tbody>
        </table>
        {userQuery.isError && (
          <pre>
            got error fetching pages data!
            <br />
            message: {userQuery.error?.message}
          </pre>
        )}
      </main>
    </>
  );
}
