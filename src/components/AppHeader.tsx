import { Link, useLocation } from "react-router-dom";
import { Activity, Upload, BarChart3, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Trang chủ", icon: Activity },
  { path: "/upload", label: "Phân tích Video", icon: Upload },
  { path: "/history", label: "Lịch sử", icon: History },
];

export function AppHeader() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold leading-tight">AI Motion</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">Phân tích Chuyển động</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
