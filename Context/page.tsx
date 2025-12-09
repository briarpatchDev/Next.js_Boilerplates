import Image from "next/image";
import Link from "next/link";
import { User, useUser } from "./userContext";

export default function Page() {
  const user: User = useUser();
  return <div className={styles.page}>{user.avatar}</div>;
}
