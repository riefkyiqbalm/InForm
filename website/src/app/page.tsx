"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@sharedUI/context/SharedAuthContext";
import { Card } from "@sharedUI/components/Cards";
import Loading from "./loading";
import BackButton from "@sharedUI/components/buttons/BackButton";

export default function RootPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (loading) {
      timer = setTimeout(() => {
        setIsTimeout(true);
      }, 5000);
    } else {
      if (isAuthenticated && user?.id) {
        router.replace(`/chat/${user.id}`);
      } else if (!isAuthenticated) {
        router.replace("/login");
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthenticated, user, loading, router]);

  if (isTimeout && loading) {
    return (
      <div style={S.root}>
        <div style={S.container}>
          <Card>
            <BackButton href="/login" />
            <div style={S.title}>Maaf Auntenikasi Gagal..</div>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  return null;
}
const S: Record<string, React.CSSProperties> = {
  root: {
    background: "var(--bg)",
    color: "var(--text)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "440px",
    padding: "20px",
    position: "relative",
    zIndex: 10,
    animation: "fadeUp 0.6s ease-out",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#ffffff",
  },
};
