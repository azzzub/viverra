import { UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu, MenuProps, Typography } from "antd";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "./Header.module.css";

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

      <Typography.Text className={styles.title} >
        Viverra - Visual Test
      </Typography.Text>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={router.pathname === "/v2" ? ["collection"]: [""]}
        items={[
          {
            key: "collection",
            label: "Collection",
            onClick: ()=> router.push('/v2')
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
