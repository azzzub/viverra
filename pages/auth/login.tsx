import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input } from "antd";
import NavHeader from "components/NavHeader";
import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEventHandler, useState } from "react";
import { toast } from "react-hot-toast";
import styles from "./login.module.css";

export default function SignIn() {
  const router = useRouter();
  const [userSession, setUserSession] = useState({
    username: "",
    password: "",
  });

  const submitHandler: FormEventHandler<HTMLFormElement> = async (e) => {
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
        <title>Login - Viverra</title>
      </Head>
      <main className={styles.container}>
        <Card title="Login" bordered={false} className={styles.card}>
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{
              remember: true,
            }}
            onFinish={submitHandler}
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your Username!",
                },
              ]}
            >
              <Input
                prefix={
                  <UserOutlined
                    rev={undefined}
                    className="site-form-item-icon"
                  />
                }
                placeholder="Username"
                value={userSession.username}
                onChange={(e) =>
                  setUserSession({ ...userSession, username: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your Password!",
                },
              ]}
            >
              <Input
                prefix={
                  <LockOutlined
                    className="site-form-item-icon"
                    rev={undefined}
                  />
                }
                type="password"
                placeholder="Password"
                value={userSession.password}
                onChange={(e) =>
                  setUserSession({ ...userSession, password: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Log in
              </Button>{" "}
              Or <Link href="/auth/new-user">register now!</Link>
            </Form.Item>
          </Form>
        </Card>
      </main>
    </>
  );
}
