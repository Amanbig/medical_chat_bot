import localFont from "next/font/local";
import "../globals.css";  // Import global styles for the team layout
import { ThemeProvider } from "@/components/theme_provider";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Our Team - MedBot",
  description: "Meet the dedicated team behind MedBot and learn about their roles.",
  openGraph: {
    title: "Our Team - MedBot",
    description: "Meet the MedBot team.",
    images: "/team/og-image.png",  // For Open Graph SEO
  },
};

export default function TeamLayout({ children }) {
  return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          {children}
          <div className="p-10"></div>
        </ThemeProvider>
  );
}
