import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Thryft",
  description: "Sign in to your Thryft account to start buying and selling with students on your campus.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
