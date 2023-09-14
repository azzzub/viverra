/* eslint-disable require-jsdoc */
// React deps
import React from "react";

// Global style
import "../styles/globals.css";

// External
import { QueryClient, QueryClientProvider } from "react-query";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import axios from "axios";

// Next deps
import type { AppProps } from "next/app";
import { Layout } from "antd";

// Local deps
import Header from "components/Header";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL;
axios.defaults.withCredentials = true;

// Create a client for react-query
const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const contentStyle: React.CSSProperties = {
    minHeight: "calc(100vh - 120px)",
    lineHeight: "120px",
    color: "#fff",
    padding: "32px",
    float: "none",
  };

  return (
    <>
      <Layout>
        <QueryClientProvider client={queryClient}>
          <SessionProvider session={session}>
            <Layout.Header>
              <Header />
            </Layout.Header>
            <Layout.Content style={contentStyle}>
              <Toaster />
              <Component {...pageProps} />
            </Layout.Content>
            <Layout.Footer></Layout.Footer>
          </SessionProvider>
        </QueryClientProvider>
      </Layout>
    </>
  );
}
