/* eslint-disable require-jsdoc */
import React from "react";
import axios from "axios";
import NavHeader from "components/NavHeader";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
// import { GetServerSidePropsContext } from "next";

export default function NewUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function signUp() {
    setIsLoading(true);
    try {
      await axios.post("/api/auth/register", {
        username,
        password,
      });
      toast.success("register success!");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>register - vivirra</title>
      </Head>
      <main className="container">
        <NavHeader hideSession={true} />
        <h3>register</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signUp();
          }}
        >
          <label>
            username
            <input
              name="username"
              type="text"
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            password
            <input
              name="password"
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" aria-busy={isLoading}>
            sign up
          </button>
        </form>
        <Link href={"/auth/login"}>already have an account?</Link>
      </main>
    </>
  );
}
