import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pronósticos Deportivos",
  description: "Sistema de pronósticos para la fase de grupos del torneo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
