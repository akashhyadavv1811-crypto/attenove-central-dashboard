import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer
      className={cn(
        "mt-auto border-t text-white",
        isDark ? "border-white/10 bg-[hsl(222,32%,8%)]" : "border-white/10 bg-primary"
      )}
    >
      <div className="px-4 md:px-6 py-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand + Copyright */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold text-lg tracking-tight text-white">Atten</span>
            <span className="font-bold text-lg tracking-tight text-[hsl(199,89%,48%)]">ova</span>
          </div>
          <p className="text-xs text-white/60">
            © {currentYear} Workforce Attendance & Biometric Systems
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
          <Link to="/" className="text-white/70 hover:text-white transition-colors uppercase tracking-wide">
            Dashboard
          </Link>
          <a href="#" className="text-white/70 hover:text-white transition-colors uppercase tracking-wide" onClick={(e) => e.preventDefault()}>
            Security
          </a>
          <a href="#" className="text-white/70 hover:text-white transition-colors uppercase tracking-wide" onClick={(e) => e.preventDefault()}>
            API
          </a>
          <Link to="/reports" className="text-white/70 hover:text-white transition-colors uppercase tracking-wide">
            Reports
          </Link>
          <a href="#" className="text-white/70 hover:text-white transition-colors uppercase tracking-wide" onClick={(e) => e.preventDefault()}>
            Privacy
          </a>
        </nav>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/80">API</span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/80">Sync</span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(199,89%,48%)] text-xs font-semibold text-white">✓</span>
          <span className="text-xs font-medium text-white/70 uppercase tracking-wide ml-1">System status</span>
        </div>
      </div>
    </footer>
  );
}
