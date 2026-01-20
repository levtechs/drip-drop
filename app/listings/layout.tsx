import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Listings - Thryft",
  description: "Explore clothes, textbooks, electronics, and more from students at your school. Find great deals on Thryft.",
};

export default function ListingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
