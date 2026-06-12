import "@/app/globals.css";
import DashboardHeader from "@/components/dashboardHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboardSidebar";
import { ModernToastProvider } from "@/app/components/customToastProvider";

export const metadata = {
  title: "Admin Dashboard",
  description: "This is dashboard for admin to manage website",
};

export default function AdminLayout({ children }) {
  return (
    <ModernToastProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-6 bg-zinc-50">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ModernToastProvider>
  );
}
