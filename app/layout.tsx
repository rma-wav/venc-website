import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VENC — One touch, wider waves.",
  description:
    "VENC adalah media edukasi independen yang berfokus pada Artificial Intelligence, Data, Bisnis, dan produktivitas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black font-body text-white antialiased">
        {children}
      </body>
    </html>
  );
}
