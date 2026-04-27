import * as React from "react";
import { AccountTopbar } from "@/components/nav/account-topbar";
import { AccountSidebar } from "@/components/nav/account-sidebar";

export default function AccountShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AccountTopbar />
      <div className="flex flex-1">
        <AccountSidebar />
        <div className="flex flex-1 flex-col lg:pl-56">{children}</div>
      </div>
    </div>
  );
}
