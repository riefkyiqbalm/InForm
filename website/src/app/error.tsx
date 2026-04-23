"use client";

import { useEffect } from "react";
import NorFoundPage from "@/components/NotFoundPage";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <NorFoundPage errorcode="500" type="INTERNAL_SERVER_ERROR" />;
}
