import { Dashboard } from "@/components/dashboard/Dashboard";

// The shell lives in the layout so it survives navigation between sections —
// see Dashboard.tsx. `children` is the matched page, which renders nothing:
// the shell reads the section from the pathname itself.
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Dashboard />
      {children}
    </>
  );
}
