import { ThemeProvider } from "@/components/theme_provider";

export const metadata = {
  title: "Pricing | MedBot",
  description: "Explore our pricing plans for MedBot.",
};

export default function PricingLayout({ children }) {
  return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="p-10">{children}</div> {/* This will render the page content */}
        </ThemeProvider>
  );
}
