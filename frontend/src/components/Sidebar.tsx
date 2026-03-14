import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { to: "/", icon: "fa-solid fa-house", label: "Feed" },
    { to: "/search", icon: "fa-solid fa-robot", label: "AI Search" },
    { to: "/profile", icon: "fa-solid fa-user", label: "Profile" },
  ];

  return (
    <aside className="app-sidebar">
      <Link to="/" className="sidebar-brand">
        <div className="sidebar-brand-icon">S</div>
        SocialHub
      </Link>

      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={`sidebar-link ${location.pathname === item.to ? "active" : ""}`}
            >
              <i className={item.icon}></i>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="sidebar-user">
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.userName}
            className="sidebar-user-avatar"
          />
        ) : (
          <div className="sidebar-user-avatar-placeholder">
            {(user.userName || user.email || "U").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user.userName || "User"}</div>
          <div className="sidebar-user-email">{user.email}</div>
        </div>
      </div>
    </aside>
  );
}
