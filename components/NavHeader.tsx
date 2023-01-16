import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function NavHeader({ props, hideSession }: any) {
  const { data: session } = useSession();

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
            {!session && (
              <li>
                <button onClick={() => signIn()}>sign in</button>
              </li>
            )}
            {session && (
              <li>
                <button onClick={() => signOut()}>sign out</button>
              </li>
            )}
          </>
        )}
      </ul>
    </nav>
  );
}
