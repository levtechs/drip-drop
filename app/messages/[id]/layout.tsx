import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conversation - Thryft",
  description: "Chat with this user about a listing on Thryft. Keep your conversation safe and secure.",
};

export default function MessageDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
