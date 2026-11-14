
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    UserCircle,
    TrendingUp,
    CalendarCheck,
    IndianRupee,
    Activity,
    Users,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";

import api from "../../services/api";
import NotificationBell from "../../components/NotificationBell";
import "./AdminDashboard.css";

const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/admin/dashboard");
                setStats(response.data);
            } catch (error) {
                console.error("Admin dashboard error:", error);
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        const fetchProfile = async () => {
            try {
                const response = await api.get("/users/profile");
                setProfile(response.data);
            } catch (error) {
                console.error("Admin profile error:", error);
            }
        };

        fetchStats();
        fetchProfile();
    }, []);

    const cards = [
        { title: "Total Users", value: stats?.totalUsers ?? 0 },
        { title: "Total Staff", value: stats?.totalStaff ?? 0 },
        { title: "Total Bookings", value: stats?.totalBookings ?? 0 },
        { title: "Confirmed Bookings", value: stats?.confirmedBookings ?? 0 },
        { title: "Cancelled Bookings", value: stats?.cancelledBookings ?? 0 },
        {
            title: "Total Revenue",
            value: formatCurrency(stats?.totalRevenue)
        },
        { title: "Successful Scans", value: stats?.successfulScans ?? 0 },
        { title: "Rejected Scans", value: stats?.rejectedScans ?? 0 }
    ];

    const trends = stats?.trends || [];
    const recentBookings = stats?.recentBookings || [];
    const recentScans = stats?.recentScans || [];

    const maxBookings = Math.max(
        ...trends.map((item) => item.bookings || 0),
        1
    );

    const maxRevenue = Math.max(
        ...trends.map((item) => Number(item.revenue || 0)),
        1
    );

    const otherBookings = Math.max(
        0,
        (stats?.totalBookings || 0) -
        (stats?.confirmedBookings || 0) -
        (stats?.cancelledBookings || 0)
    );

    const bookingStatuses = [
        {
            label: "Confirmed",
            value: stats?.confirmedBookings || 0,
            icon: CheckCircle,
            className: "confirmed"
        },
        {
            label: "Cancelled",
            value: stats?.cancelledBookings || 0,
            icon: XCircle,
            className: "cancelled"
        },
        {
            label: "Other",
            value: otherBookings,
            icon: Clock,
            className: "other"
        }
    ];

    if (loading) {
        return (
            <div className="admin-dashboard">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="admin-dashboard">

            {/* Welcome Header */}
            <header className="welcome-header">
                <div>
                    <h1>
                        Welcome, {profile?.fullName || "Admin"} 👋
                    </h1>
                    <p>
                        Welcome to Jagannath Dham Administration.
                    </p>
                </div>

                <div className="header-actions">
                    <NotificationBell />

                    <button
                        className="header-profile-button"
                        title="My Profile"
                        aria-label="Open Admin Profile"
                        onClick={() =>
                            navigate("/admin/settings#admin-profile-section")
                        }
                    >
                        {profile?.profileImageUrl ? (
                            <img
                                src={profile.profileImageUrl}
                                alt="Admin Profile"
                                className="header-profile-image"
                            />
                        ) : (
                            <UserCircle size={23} />
                        )}
                    </button>
                </div>
            </header>

            {error && (
                <p className="admin-error">{error}</p>
            )}

            {/* Statistics Cards */}
            <section className="admin-stats-grid">
                {cards.map((card) => (
                    <div
                        className="admin-stat-card"
                        key={card.title}
                    >
                        <h3>{card.title}</h3>
                        <h2>{card.value}</h2>
                    </div>
                ))}
            </section>

            {/* Analytics Overview */}
            <section className="analytics-section">
                <div className="analytics-heading">
                    <div>
                        <h2>Analytics Overview</h2>
                        <p>Booking and revenue performance over the last 7 days.</p>
                    </div>
                </div>

                <div className="analytics-grid">

                    {/* Booking Trends */}
                    <div className="analytics-card">
                        <div className="analytics-card-heading">
                            <div>
                                <CalendarCheck size={20} />
                                <h3>Booking Trends</h3>
                            </div>
                            <span>Last 7 days</span>
                        </div>

                        {trends.length === 0 ? (
                            <p className="analytics-empty">
                                No booking data available.
                            </p>
                        ) : (
                            <div className="trend-chart">
                                {trends.map((item) => (
                                    <div
                                        className="trend-column"
                                        key={item.date}
                                    >
                                        <strong>{item.bookings}</strong>

                                        <div className="trend-bar-area">
                                            <div
                                                className="trend-bar booking-bar"
                                                style={{
                                                    height: `${Math.max(
                                                        0,
                                                        (item.bookings / maxBookings) * 100
                                                    )}%`
                                                }}
                                            />
                                        </div>

                                        <span>{formatDate(item.date).split(" ")[0]}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Revenue Trends */}
                    <div className="analytics-card">
                        <div className="analytics-card-heading">
                            <div>
                                <IndianRupee size={20} />
                                <h3>Revenue Trends</h3>
                            </div>
                            <span>Last 7 days</span>
                        </div>

                        {trends.length === 0 ? (
                            <p className="analytics-empty">
                                No revenue data available.
                            </p>
                        ) : (
                            <div className="trend-chart">
                                {trends.map((item) => {
                                    const amount = Number(item.revenue || 0);

                                    return (
                                        <div
                                            className="trend-column"
                                            key={item.date}
                                        >
                                            <strong>
                                                {amount > 0
                                                    ? `₹${amount.toLocaleString("en-IN")}`
                                                    : "₹0"}
                                            </strong>

                                            <div className="trend-bar-area">
                                                <div
                                                    className="trend-bar revenue-bar"
                                                    style={{
                                                        height: `${(amount / maxRevenue) * 100}%`
                                                    }}
                                                />
                                            </div>

                                            <span>
                                                {formatDate(item.date).split(" ")[0]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Booking Status */}
                    <div className="analytics-card status-card">
                        <div className="analytics-card-heading">
                            <div>
                                <Activity size={20} />
                                <h3>Booking Status</h3>
                            </div>
                        </div>

                        <div className="status-list">
                            {bookingStatuses.map((status) => {
                                const Icon = status.icon;

                                return (
                                    <div
                                        className="status-item"
                                        key={status.label}
                                    >
                                        <div className="status-item-left">
                                            <span className={`status-icon ${status.className}`}>
                                                <Icon size={18} />
                                            </span>
                                            <span>{status.label}</span>
                                        </div>

                                        <strong>{status.value}</strong>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </section>

            {/* Recent Bookings */}
            <section className="activity-section">
                <div className="activity-heading">
                    <div>
                        <h2>Recent Bookings</h2>
                        <p>Latest 10 booking records.</p>
                    </div>
                    <button
                        className="activity-view-button"
                        onClick={() => navigate("/admin/bookings")}
                    >
                        View All
                    </button>
                </div>

                <div className="activity-table-wrapper">
                    {recentBookings.length === 0 ? (
                        <p className="analytics-empty">
                            No recent bookings found.
                        </p>
                    ) : (
                        <table className="activity-table">
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Customer</th>
                                    <th>Visitors</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Booked At</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>{booking.bookingReference}</td>
                                        <td>{booking.customerName}</td>
                                        <td>{booking.visitorCount}</td>
                                        <td>{formatCurrency(booking.amount)}</td>
                                        <td>
                                            <span
                                                className={`activity-status ${booking.bookingStatus?.toLowerCase()
                                                    }`}
                                            >
                                                {booking.bookingStatus}
                                            </span>
                                        </td>
                                        <td>{formatDateTime(booking.bookedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Recent Gate Activity */}
            <section className="activity-section">
                <div className="activity-heading">
                    <div>
                        <h2>Recent Gate Activity</h2>
                        <p>Latest 10 QR ticket scans across all gates.</p>
                    </div>
                </div>

                <div className="gate-activity-list">
                    {recentScans.length === 0 ? (
                        <p className="analytics-empty">
                            No recent gate activity found.
                        </p>
                    ) : (
                        recentScans.map((scan) => (
                            <div
                                className="gate-activity-item"
                                key={scan.id}
                            >
                                <div className="gate-activity-icon">
                                    {scan.scanResult === "SUCCESS" ? (
                                        <CheckCircle size={20} />
                                    ) : scan.scanResult === "ALREADY_USED" ? (
                                        <Clock size={20} />
                                    ) : (
                                        <XCircle size={20} />
                                    )}
                                </div>

                                <div className="gate-activity-details">
                                    <strong>{scan.staffName}</strong>
                                    <p>
                                        Gate: {scan.gateCode} · {scan.message || scan.scanResult}
                                    </p>
                                    <span>{formatDateTime(scan.scannedAt)}</span>
                                </div>

                                <span
                                    className={`activity-status ${scan.scanResult?.toLowerCase()
                                        }`}
                                >
                                    {scan.scanResult}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </section>

        </div>
    );
};

export default AdminDashboard;
