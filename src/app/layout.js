import "./globals.css";
import { ThemeProvider } from "@/components/theme_provider";
import Footer from "@/components/parts/Footer";
import Menu from "@/components/parts/menu";

export const metadata = {
  title: "JAC Bot",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* <Menu/> */}
          {children}
          <div className="p-10"></div>
          <Footer/>
          </ThemeProvider>
      </body>
    </html>
  );
}
