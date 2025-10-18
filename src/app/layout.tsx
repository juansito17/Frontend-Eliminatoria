import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import { ConfirmProvider } from "./components/ConfirmModal";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgroTech - Sistema Inteligente de Agricultura de Precisión | Hackathon 2.0",
  description: "Sistema inteligente de monitoreo y gestión agrícola desarrollado para el Hackathon 2.0. Revoluciona la industria agrícola con tecnología avanzada de análisis en tiempo real, dashboard interactivo y reportes automáticos.",
  keywords: "agricultura de precisión, hackathon, sistema agrícola, monitoreo, análisis de datos, agroindustria, transformación digital",
  authors: [{ name: "Politécnico Colombiano Jaime Isaza Cadavid" }],
  openGraph: {
    title: "AgroTech - Sistema Inteligente de Agricultura de Precisión",
    description: "Sistema inteligente desarrollado para el Hackathon 2.0 que revoluciona la gestión agrícola mediante tecnología avanzada.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ConfirmProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
