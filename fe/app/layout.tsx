import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIMAE TB",
  description: "Skrining Mandiri Tuberculosis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
