import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aling Maria's Sari-Sari Store",
  description: "Simple Inventory & Sales App for MSMEs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
