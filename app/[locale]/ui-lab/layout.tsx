import { notFound } from "next/navigation";
import { getAdminUser } from "@/utils/session";

export default async function UiLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  await getAdminUser();
  return children;
}
