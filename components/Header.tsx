import React from "react";

import { UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu, MenuProps, Typography } from "antd";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "./Header.module.css";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  const router = useRouter();
  const { status } = useSession();

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <a onClick={() => router.push("/v2/team")}>My Team</a>,
    },
    {
      key: "2",
      label: <a onClick={() => signOut()}>Log Out</a>,
    },
  ];

  return (
    <div className={styles.header__container}>
      <div>
        <Link href="/v2" className={styles.left__container}>
          <Image
            alt="Viverra Mascot"
            src="/viverra-mascot.png"
            width={48}
            height={48}
            className={styles.mascot}
          />
          <Typography.Text className={styles.title}>
            Viverra - Visual Test
          </Typography.Text>
        </Link>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={router.pathname === "/v2" ? ["collection"] : [""]}
          items={[
            {
              key: "collection",
              label: "Collection",
              onClick: () => router.push("/v2"),
            },
          ]}
        />
      </div>
      {status === "authenticated" && (
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
      )}
    </div>
  );
};

export default Header;
