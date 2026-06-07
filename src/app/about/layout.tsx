import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Learn how Me2U started from a mom of two looking to pass on gently used baby items to neighbors in the Worcester community.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
