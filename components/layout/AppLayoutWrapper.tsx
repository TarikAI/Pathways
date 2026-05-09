"use client";

import { ReactNode } from "react";
import { SidebarProvider } from "./SidebarContext";

export default function AppLayoutWrapper({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
