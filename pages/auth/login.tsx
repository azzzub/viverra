import NavHeader from "components/NavHeader";
import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEventHandler, useState } from "react";
import { toast } from "react-hot-toast";

export default function SignIn() {
  const router = useRouter();
  const [userSession, setUserSession] = useState({
    username: "",
    password: "",
  });

  const submitHandler: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        username: userSession.username,
        password: userSession.password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      if (res?.ok) {
        if (router.query["callbackUrl"]) {
          router.push(decodeURI(router.query["callbackUrl"] as string));
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  return (
    <>
      <Head>
        <title>login - viverra</title>
      </Head>
      <main className="container">
        <NavHeader hideSession={true} />
        <h3>login</h3>
        <form onSubmit={submitHandler}>
          <label>
            username
            <input
              name="username"
              type="text"
              required
              onChange={(e) =>
                setUserSession({ ...userSession, username: e.target.value })
              }
            />
          </label>
          <label>
            password
            <input
              name="password"
              type="password"
              required
              onChange={(e) =>
                setUserSession({ ...userSession, password: e.target.value })
              }
            />
          </label>
          <button type="submit">sign in</button>
        </form>
        <Link href={"/auth/new-user"}>create an account</Link>
      </main>
    </>
  );
}
