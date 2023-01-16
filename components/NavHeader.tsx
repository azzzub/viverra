import Image from "next/image";
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
      <ul>{props}</ul>
    </nav>
  );
}
