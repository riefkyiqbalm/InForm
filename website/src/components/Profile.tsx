"use-client";

import Icon from "@sharedUI/components/IconStyles";
import Link from "next/link";
import { buttonStyles as S } from "@sharedUI/lib/styles/buttons";

export default function IconNav() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {/* <Link href="/dashboard" style={S.iconNav} title="Dashboard">
        <Icon name="white-dashboard" size={20} />
      </Link> */}
      <Link href="/profile" style={S.iconNav} title="Profile">
        <Icon name="white-user" size={20} />
      </Link>
    </div>
  );
}
