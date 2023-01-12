import NavHeader from "components/NavHeader";
import { GetServerSidePropsContext } from "next";
import { getCsrfToken } from "next-auth/react";
import Link from "next/link";

export default function SignIn({ csrfToken }: any) {
  return (
    <main className="container">
      <NavHeader hideSession={true} />
      <form method="post" action="/api/auth/callback/credentials">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <label>
          Username
          <input name="username" type="text" />
        </label>
        <label>
          Password
          <input name="password" type="password" />
        </label>
        <button type="submit">Sign in</button>
      </form>
      <Link href={"/auth/new-user"}>Create an account</Link>
    </main>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
