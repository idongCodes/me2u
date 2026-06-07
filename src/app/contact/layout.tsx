import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Have questions about an item or a reservation? Contact Me2U for inquiries about our Worcester-based shop.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
