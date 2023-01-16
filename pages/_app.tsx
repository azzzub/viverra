// Global style
import "@picocss/pico";
import "../styles/globals.css";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import axios from "axios";

import type { AppProps } from "next/app";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <>
      <SessionProvider session={session}>
        <Toaster />
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}
