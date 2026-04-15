import { Home, Layers3, Activity, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

const items = [
  { label: "Home", to: "/", icon: Home },
  { label: "Plan", to: "/plan", icon: Layers3 },
  { label: "Activity", to: "/activity", icon: Activity },
  { label: "Safety", to: "/plan/active", icon: Shield },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) => cn("bottom-nav__item", isActive && "is-active")}
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
