import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Item Details - Thryft",
  description: "View item details, price, and condition. Contact the seller to buy this item on Thryft.",
};

export default function ListingDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
