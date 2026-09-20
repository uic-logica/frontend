import { notFound } from "next/navigation";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { sections, type Section } from "@/components/dashboard/types";
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!sections.includes(section as Section)) notFound();
  return <Dashboard section={section as Section} />;
}
