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
            <Link href="/">🦖 vrex - visual regression test</Link>
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
