import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { LoginModal } from "@/components/auth/LoginModal";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html suppressHydrationWarning lang="en"
      className={clsx(
        "min-h-screen font-sans antialiased text-foreground",
        "bg-gradient-to-br from-white to-zinc-100",
        "dark:from-zinc-950 dark:to-black",
        fontSans.variable
      )}
    >
      <head />
      <body
        className={clsx(
          "min-h-screen font-sans antialiased text-foreground",
          "bg-gradient-to-br from-white to-zinc-100",
          "dark:from-zinc-950 dark:to-black",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="pt-8 px-6 flex-grow  bg-gradient-to-br from-white to-zinc-100
          
          dark:from-zinc-950 dark:to-black">
              {children}
            </main>
          </div>
          <LoginModal />
        </Providers>
      </body>
    </html>
  );
}
