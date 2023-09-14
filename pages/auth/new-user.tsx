/* eslint-disable require-jsdoc */
import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input } from "antd";
import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import styles from "./login.module.css";

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
        <title>Register - Vivirra</title>
      </Head>
      <main className={styles.container}>
        <Card
          title="Register New Account"
          bordered={false}
          className={styles.card}
        >
          <Form
            name="normal_register"
            initialValues={{
              remember: true,
            }}
            onFinish={signUp}
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
                prefix={<UserOutlined rev={undefined} />}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                prefix={<LockOutlined rev={undefined} />}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Register
              </Button>{" "}
              Or <Link href="/auth/login">login now!</Link>
            </Form.Item>
          </Form>
        </Card>
      </main>
    </>
  );
}
