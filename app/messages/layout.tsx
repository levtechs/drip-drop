import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages - Thryft",
  description: "Chat securely with buyers and sellers on Thryft. Coordinate meetups and negotiate prices safely.",
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
