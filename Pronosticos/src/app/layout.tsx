import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mundial 2026 — Predicciones",
  description: "Sistema de predicciones para el Mundial de Fútbol 2026. Pronostica resultados y compite con otros usuarios.",
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
