import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Your Reservation",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ManageReservationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
