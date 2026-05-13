import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Catholizare OS",
  description: "Plataforma SaaS de salud mental para profesionales y pacientes."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
