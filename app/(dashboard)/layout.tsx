import Sidebar from "@/components/dashboard/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Sidebar>{children}</Sidebar>
    </ToastProvider>
  );
}
