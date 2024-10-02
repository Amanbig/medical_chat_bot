import { ThemeProvider } from "@/components/theme_provider";

export const metadata = {
  title: "Enterprise | MedBot",
  description: "Discover enterprise solutions with MedBot.",
};

export default function EnterpriseLayout({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <div className="p-10">{children}</div> {/* This will render the page content */}
    </ThemeProvider>
  );
}
