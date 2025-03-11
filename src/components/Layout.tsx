
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HospitalSidebar } from "./HospitalSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-hospital-light">
        <HospitalSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
