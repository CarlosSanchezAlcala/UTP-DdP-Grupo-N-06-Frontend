import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Municipalidad Distrital de Cerro Azul",
  description: "Municipalidad Distrital de Cerro Azul, provincia de Cañete, departamento de Lima, Perú.",
  icons: {
    icon: '/muni-cerro-azul.avif',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
