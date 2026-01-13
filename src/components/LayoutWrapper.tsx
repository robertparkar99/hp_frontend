"use client";

import { Suspense } from "react";
import Loading from "./utils/loading";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  );
}