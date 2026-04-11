import * as React from "react";
import { AppTopbar } from "@/components/nav/app-topbar";
import { HelpFab } from "@/components/nav/help-fab";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppTopbar />
      <div className="flex flex-1 flex-col">{children}</div>
      <HelpFab />
    </div>
  );
}
