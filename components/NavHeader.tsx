import Link from "next/link";

export default function NavHeader({ props }: any) {
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
      <ul>{props}</ul>
    </nav>
  );
}
