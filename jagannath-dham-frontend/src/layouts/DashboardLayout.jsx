
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import "./DashboardLayout.css";

function DashboardLayout({ role }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar
                role={role}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <button
                        className="mobile-menu-button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle menu"
                    >
                        <Menu />
                    </button>

                    <span className="topbar-title">
                        Jagannath Dham
                    </span>
                </header>

                <section className="dashboard-content">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}

export default DashboardLayout;
