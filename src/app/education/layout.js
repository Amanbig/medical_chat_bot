import { ThemeProvider } from "@/components/theme_provider";

export const metadata = {
  title: "Education | MedBot",
  description: "Explore educational resources with MedBot.",
};

export default function EducationLayout({ children }) {
  return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="p-10">{children}</div> {/* This will render the page content */}
        </ThemeProvider>
  );
}
