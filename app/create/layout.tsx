import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Item - Thryft",
  description: "List your clothes, textbooks, and tech for sale on Thryft. Quick, easy, and safe student-to-student marketplace.",
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
