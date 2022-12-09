import Link from "next/link";

export default function NavHeader({ props }: any) {
  return (
    <nav>
      <ul>
        <li>
          <strong>
            <Link href="/">vrex</Link>
          </strong>
        </li>
      </ul>
      <ul>{props}</ul>
    </nav>
  );
}
