import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game Portal",
  description: "Tournament and event registration portal",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
