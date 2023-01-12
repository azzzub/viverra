import NavHeader from "components/NavHeader";
// import { GetServerSidePropsContext } from "next";

export default function NewUser({ csrfToken }: any) {
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
        <button type="submit">Sign Up</button>
      </form>
    </main>
  );
}
