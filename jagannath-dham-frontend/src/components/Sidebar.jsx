
import { NavLink, useNavigate } from "react-router-dom";
import {
    Home,
    Ticket,
    MapPin,
    CalendarDays,
    CalendarHeart,
    Users,
    Settings,
    LayoutDashboard,
    ScanLine,
    LogOut,
    X,
    User,
    Tags,
    ClipboardList,
    CircleHelp
} from "lucide-react";

import authService from "../services/authService";
import { useNotifications } from "../context/NotificationContext";
import "./Sidebar.css";

const menuItems = {
    USER: [
        { label: "Dashboard", path: "/devotee", icon: Home },
        { label: "My Bookings", path: "/devotee/bookings", icon: Ticket },
        { label: "Destinations", path: "/devotee/destinations", icon: MapPin },
        { label: "Festivals of Odisha", path: "/devotee/festivals", icon: CalendarHeart },
        { label: "Help & Support", path: "/devotee/support", icon: CircleHelp },
        { label: "My Profile", path: "/devotee/profile", icon: User }
    ],
    STAFF: [
        { label: "Dashboard", path: "/staff", icon: LayoutDashboard },
        { label: "QR Scanner", path: "/staff/scanner", icon: ScanLine },
        { label: "Scan History", path: "/staff/history", icon: ClipboardList },
        { label: "My Profile", path: "/staff/profile", icon: User },
    ],
    ADMIN: [
        { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { label: "Bookings", path: "/admin/bookings", icon: Ticket },
        { label: "Users & Staff", path: "/admin/users", icon: Users },
        { label: "Categories", path: "/admin/categories", icon: Tags },
        { label: "Darshan Slots", path: "/admin/slots", icon: CalendarDays },
        { label: "Destinations", path: "/admin/destinations", icon: MapPin },
        { label: "Festivals", path: "/admin/festivals", icon: CalendarHeart },
        { label: "Settings", path: "/admin/settings", icon: Settings }
    ]
};

function Sidebar({ role = "USER", open = false, onClose }) {
    const items = menuItems[role] || menuItems.USER;
    const navigate = useNavigate();

    const { clearNotifications } = useNotifications();

    const handleLogout = () => {
        clearNotifications();
        authService.logout();

        // Replace the current history entry instead of adding another one.
        window.location.replace("/login");
    };

    return (
        <>
            {open && (
                <div className="sidebar-overlay" onClick={onClose}></div>
            )}

            <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="brand-icon">🛕</div>
                        <div>
                            <h2>Jagannath Dham</h2>
                            <span>Darshan & Tourism</span>
                        </div>
                    </div>

                    <button className="sidebar-close" onClick={onClose}>
                        <X size={22} />
                    </button>
                </div>

                <div className="sidebar-section">MAIN MENU</div>

                <nav className="sidebar-nav">
                    {items.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={
                                    item.path === "/devotee" ||
                                    item.path === "/staff" ||
                                    item.path === "/admin"
                                }
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                                onClick={onClose}
                            >
                                <Icon size={19} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-bottom">
                    <button
                        className="sidebar-link logout-link"
                        onClick={handleLogout}
                    >
                        <LogOut size={19} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
