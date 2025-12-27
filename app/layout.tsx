import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cultural-map-lagarto.vercel.app"),
  title: {
    default: "Mapa Cultural de Lagarto-SE | Pontos Turísticos e Culturais",
    template: "%s | Mapa Cultural Lagarto",
  },
  description:
    "Descubra os pontos turísticos, culturais e gastronômicos de Lagarto-SE. Explore restaurantes, bares, monumentos históricos e locais de interesse cultural no mapa interativo da cidade.",
  keywords: [
    "Lagarto",
    "Sergipe",
    "turismo",
    "cultura",
    "mapa cultural",
    "pontos turísticos",
    "gastronomia",
    "patrimônio histórico",
    "Lagarto-SE",
    "turismo em Sergipe",
  ],
  authors: [{ name: "Prefeitura de Lagarto" }],
  creator: "Mapa Cultural Lagarto",
  publisher: "Prefeitura de Lagarto",
  applicationName: "Mapa Cultural Lagarto",
  icons: {
    icon: [
      { url: "/assets/lagarto-brasao.png" },
      { url: "/assets/lagarto-brasao.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/lagarto-brasao.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/assets/lagarto-brasao.png" },
      {
        url: "/assets/lagarto-brasao.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/assets/lagarto-brasao.png",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c4a6e" },
  ],
  colorScheme: "light dark",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Mapa Cultural de Lagarto-SE | Pontos Turísticos e Culturais",
    description:
      "Descubra os pontos turísticos, culturais e gastronômicos de Lagarto-SE. Explore restaurantes, bares, monumentos históricos e locais de interesse cultural no mapa interativo da cidade.",
    siteName: "Mapa Cultural de Lagarto",
    images: [
      {
        url: "/assets/lagarto-brasao.png",
        width: 1200,
        height: 630,
        alt: "Brasão de Lagarto - Mapa Cultural",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mapa Cultural de Lagarto-SE | Pontos Turísticos e Culturais",
    description:
      "Descubra os pontos turísticos, culturais e gastronômicos de Lagarto-SE. Explore restaurantes, bares e monumentos históricos no mapa interativo.",
    images: ["/assets/lagarto-brasao.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${roboto.variable} ${robotoMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
