import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "Infera",
  description: "AI Interviews. Real Market Data. Unstoppable Preparation.",
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${playfair.className} antialiased`}
        >
          <ConvexClientProvider>
            {children}
            <Toaster/>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
