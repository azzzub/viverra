/* eslint-disable require-jsdoc */
import React from "react";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "primereact/menu";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRef } from "react";

export default function NavHeader({ props, hideSession }: any) {
  const { data: session } = useSession();
  const menu = useRef<any>(null);

  return (
    <nav>
      <ul>
        <li>
          <strong
            style={{
              fontSize: "32px",
            }}
          >
            <Image
              src={"/viverra-mascot.png"}
              width={80}
              height={40}
              alt="viverra"
            ></Image>
            <Link href="/">viverra - visual verifier</Link>
          </strong>
        </li>
      </ul>
      <ul>
        {props}
        {!hideSession && (
          <>
            <Menu
              model={[
                { label: "my team", icon: "pi pi-users", url: "/team" },
                {
                  label: "sign out",
                  icon: "pi pi-lock",
                  command() {
                    signOut();
                  },
                },
              ]}
              popup
              ref={menu}
              id="popup_menu"
              className="menu-no-bullet"
            />
            {!session && (
              <li>
                <button onClick={() => signIn()}>sign in</button>
              </li>
            )}
            {session && (
              <li>
                <button onClick={(event) => menu.current.toggle(event)}>
                  your account
                </button>
              </li>
            )}
          </>
        )}
      </ul>
      {session?.user?.role === 2 && (
        <Link href={"/admin"} className="admin-badge">
          ADMIN
        </Link>
      )}
    </nav>
  );
}
