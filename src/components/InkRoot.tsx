"use client";

import { ReactNode } from "react";
import { InkProvider } from "@/lib/ink/react";

export function InkRoot({ children }: { children: ReactNode }) {
  return <InkProvider>{children}</InkProvider>;
}
