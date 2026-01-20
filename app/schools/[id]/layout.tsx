import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Marketplace - Thryft",
  description: "Browse listings from students at this school. Connect with your campus community on Thryft.",
};

export default function SchoolDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
