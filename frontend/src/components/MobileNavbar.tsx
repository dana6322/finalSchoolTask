import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function MobileNavbar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { to: "/", icon: "fa-solid fa-house", label: "Feed" },
    { to: "/search", icon: "fa-solid fa-robot", label: "Search" },
    { to: "/profile", icon: "fa-solid fa-user", label: "Profile" },
  ];

  return (
    <nav
      className="mobile-navbar"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#fff",
        borderTop: "1px solid #e3e6f0",
        zIndex: 1000,
        padding: "6px 0",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textDecoration: "none",
            fontSize: "0.7rem",
            color:
              location.pathname === item.to
                ? "var(--primary)"
                : "var(--text-secondary)",
            fontWeight: location.pathname === item.to ? 600 : 400,
            gap: "2px",
          }}
        >
          <i className={item.icon} style={{ fontSize: "1.1rem" }}></i>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
