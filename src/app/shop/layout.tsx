import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Gently Used Items",
  description: "Browse our current inventory of gently used baby gear, toddler clothes, and home goods. All items from a single, verified smoke-free and pet-free home in Worcester.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
