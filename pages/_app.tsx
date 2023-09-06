// Prime react style
// import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
// import "primereact/resources/primereact.min.css"; //core css
// import "primeicons/primeicons.css"; //icons

// Global style
// import "@picocss/pico";
import "../styles/globals.css";
import styles from "./_app.module.css";

// External
import { QueryClient, QueryClientProvider } from "react-query";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import axios from "axios";

// Next deps
import type { AppProps } from "next/app";
import { Avatar, Dropdown, Layout, MenuProps, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

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

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <a onClick={() => {}}>My Team</a>,
    },
    {
      key: "2",
      label: <a onClick={() => signOut()}>Log Out</a>,
    },
  ];

  return (
    <>
      <Layout>
        <QueryClientProvider client={queryClient}>
          <SessionProvider session={session}>
            <Layout.Header className={styles.header}>
              <Typography.Text>Viverra - Visual Test</Typography.Text>
              <Dropdown
                menu={{ items }}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
              >
                <Avatar
                  style={{
                    backgroundColor: "#aaa",
                    cursor: "pointer",
                  }}
                  icon={<UserOutlined rev={undefined} />}
                />
              </Dropdown>
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
