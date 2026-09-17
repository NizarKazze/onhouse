"use client";

import { useEffect } from "react";
import { StatusScreen } from "@/components/ui/StatusScreen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <StatusScreen variant="error" onRetry={reset} />;
}
