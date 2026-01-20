import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Profile - Thryft",
  description: "View this user's profile and active listings on Thryft.",
};

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
