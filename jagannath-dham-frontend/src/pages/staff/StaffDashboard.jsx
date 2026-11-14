
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
    ScanLine,
    CheckCircle,
    XCircle,
    ClipboardList,
    RefreshCw,
    Clock,
    MapPin,
    ShieldCheck,
    Bell,
    User,
    Check,
    CheckCheck,
    X
} from "lucide-react";

import api from "../../services/api";
import { useNotifications } from "../../context/NotificationContext";
import "./StaffDashboard.css";

function StaffDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);

    const notificationRef = useRef(null);

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    } = useNotifications();

    // Fetch dashboard data
    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/staff/dashboard");

            setDashboard(response.data);

        } catch (err) {
            console.error("Staff dashboard error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load dashboard information."
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch staff profile
    const fetchProfile = async () => {
        try {
            const response = await api.get("/users/profile");

            setProfile(response.data);

        } catch (err) {
            console.error("Staff profile loading error:", err);
        }
    };

    useEffect(() => {
        fetchDashboard();
        fetchProfile();
    }, []);

    // Close notification panel when clicking outside
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    // Format scan date and time
    const formatDateTime = (dateTime) => {
        if (!dateTime) return "Not available";

        return new Date(dateTime).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Format notification date
    const formatNotificationTime = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Scan status styling
    const getScanStatusClass = (result) => {
        if (result === "SUCCESS") return "success";

        if (result === "ALREADY_USED") return "duplicate";

        return "rejected";
    };

    const getScanStatusLabel = (result) => {
        return result
            ? result.replaceAll("_", " ")
            : "UNKNOWN";
    };

    // Loading state
    if (loading) {
        return (
            <div className="staff-dashboard-state">
                <RefreshCw
                    size={25}
                    className="loading-icon"
                />

                <p>Loading staff dashboard...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="staff-dashboard-state">
                <XCircle size={30} />

                <h3>Something went wrong</h3>

                <p>{error}</p>

                <button onClick={fetchDashboard}>
                    <RefreshCw size={16} />
                    Try Again
                </button>
            </div>
        );
    }

    // Dashboard statistics
    const stats = [
        {
            title: "Total Scans",
            value: dashboard?.totalScans ?? 0,
            icon: ScanLine,
            color: "purple"
        },
        {
            title: "Successful Scans",
            value: dashboard?.successfulScans ?? 0,
            icon: CheckCircle,
            color: "green"
        },
        {
            title: "Rejected Scans",
            value: dashboard?.rejectedScans ?? 0,
            icon: XCircle,
            color: "red"
        }
    ];

    // Show maximum 10 recent scans
    const recentScans = dashboard?.recentScans?.slice(0, 10) || [];

    return (
        <div className="staff-dashboard">

            {/* Dashboard Header */}
            <div className="staff-dashboard-header">

                <div className="staff-dashboard-heading">

                    <span className="staff-header-label">
                        STAFF PANEL
                    </span>

                    <h1>Staff Dashboard</h1>

                    <p>
                        Monitor your QR verification activity and gate entries.
                    </p>

                </div>

                {/* Header Actions */}
                <div className="staff-dashboard-header-actions">

                    {/* Notification Bell */}
                    <div
                        className="staff-notification-wrapper"
                        ref={notificationRef}
                    >

                        <button
                            type="button"
                            className={`staff-notification-btn ${showNotifications ? "active" : ""
                                }`}
                            onClick={() =>
                                setShowNotifications(prev => !prev)
                            }
                            aria-label="Notifications"
                        >
                            <Bell size={20} />

                            {unreadCount > 0 && (
                                <span className="staff-notification-badge">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (

                            <div className="staff-notification-panel">

                                <div className="staff-notification-panel-header">

                                    <div>
                                        <h3>Notifications</h3>

                                        <p>
                                            {unreadCount} unread notifications
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="staff-notification-close"
                                        onClick={() =>
                                            setShowNotifications(false)
                                        }
                                        aria-label="Close notifications"
                                    >
                                        <X size={18} />
                                    </button>

                                </div>

                                {notifications.length > 0 && (

                                    <div className="staff-notification-actions">

                                        <button
                                            type="button"
                                            onClick={markAllAsRead}
                                            disabled={unreadCount === 0}
                                        >
                                            <CheckCheck size={14} />
                                            Mark all as read
                                        </button>

                                    </div>
                                )}

                                <div className="staff-notification-list">

                                    {notifications.length > 0 ? (

                                        notifications.map((notification) => (

                                            <div
                                                key={notification.id}
                                                className={`staff-notification-item ${!notification.isRead
                                                        ? "unread"
                                                        : ""
                                                    }`}
                                            >

                                                <div className="staff-notification-item-icon">
                                                    <Bell size={17} />
                                                </div>

                                                <div className="staff-notification-item-content">

                                                    <strong>
                                                        {notification.title}
                                                    </strong>

                                                    <p>
                                                        {notification.message}
                                                    </p>

                                                    <span>
                                                        {formatNotificationTime(
                                                            notification.createdAt
                                                        )}
                                                    </span>

                                                </div>

                                                {!notification.isRead && (

                                                    <button
                                                        type="button"
                                                        className="staff-mark-read-btn"
                                                        title="Mark as read"
                                                        onClick={() =>
                                                            markAsRead(
                                                                notification.id
                                                            )
                                                        }
                                                    >
                                                        <Check size={16} />
                                                    </button>

                                                )}

                                            </div>

                                        ))

                                    ) : (

                                        <div className="staff-notification-empty">
                                            <Bell size={27} />

                                            <p>No notifications yet</p>
                                        </div>

                                    )}

                                </div>

                            </div>

                        )}

                    </div>

                    {/* Staff Profile Photo */}
                    <Link
                        to="/staff/profile"
                        className="staff-header-profile"
                        title="My Profile"
                    >

                        {profile?.profileImageUrl ? (

                            <img
                                src={profile.profileImageUrl}
                                alt="Staff profile"
                            />

                        ) : (

                            <User size={21} />

                        )}

                    </Link>

                    {/* Refresh Dashboard */}
                    <button
                        className="staff-refresh-btn"
                        onClick={fetchDashboard}
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                </div>

            </div>

            {/* Statistics Cards */}
            <div className="staff-stats-grid">

                {stats.map((stat) => {

                    const Icon = stat.icon;

                    return (

                        <div
                            className="staff-stat-card"
                            key={stat.title}
                        >

                            <div className={`staff-stat-icon ${stat.color}`}>
                                <Icon size={23} />
                            </div>

                            <div className="staff-stat-info">

                                <p>{stat.title}</p>

                                <h2>{stat.value}</h2>

                            </div>

                        </div>

                    );

                })}

            </div>

            {/* Quick QR Scanner Card */}
            <div className="staff-quick-scanner-card">

                <div className="staff-quick-scanner-icon">
                    <ScanLine size={28} />
                </div>

                <div className="staff-quick-scanner-content">

                    <h2>QR Ticket Scanner</h2>

                    <p>
                        Scan devotee tickets and verify their Darshan entry
                        directly from your camera.
                    </p>

                </div>

                <Link
                    to="/staff/scanner"
                    className="staff-quick-scanner-btn"
                >
                    <ScanLine size={17} />
                    Start Scanning
                </Link>

            </div>

            {/* Recent Scan Activity */}
            <div className="staff-recent-scans">

                <div className="staff-section-header">

                    <div>

                        <h2>
                            <ClipboardList size={21} />
                            Recent Scan Activity
                        </h2>

                        <p>
                            Your latest QR verification records
                        </p>

                    </div>

                    <div className="staff-activity-count">

                        <ShieldCheck size={16} />

                        {recentScans.length} Records

                    </div>

                </div>

                {recentScans.length > 0 ? (

                    <div className="staff-table-wrapper">

                        <table className="staff-scan-table">

                            <thead>

                                <tr>
                                    <th>Booking Reference</th>
                                    <th>Category</th>
                                    <th>Visitors</th>
                                    <th>Gate</th>
                                    <th>Scan Result</th>
                                    <th>Date & Time</th>
                                </tr>

                            </thead>

                            <tbody>

                                {recentScans.map((scan, index) => (

                                    <tr
                                        key={`${scan.bookingReference || "invalid"}-${scan.scannedAt}-${index}`}
                                    >

                                        <td>
                                            <span className="staff-booking-reference">
                                                {scan.bookingReference || "Unavailable"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="staff-category">
                                                {scan.category || "N/A"}
                                            </span>
                                        </td>

                                        <td>
                                            {scan.visitorCount ?? "N/A"}
                                        </td>

                                        <td>
                                            <span className="staff-gate-label">
                                                <MapPin size={14} />

                                                {scan.gateCode || "N/A"}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`staff-scan-status ${getScanStatusClass(
                                                    scan.scanResult
                                                )}`}
                                            >
                                                {getScanStatusLabel(
                                                    scan.scanResult
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="staff-scan-time">
                                                <Clock size={14} />

                                                {formatDateTime(
                                                    scan.scannedAt
                                                )}
                                            </span>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="staff-empty-state">

                        <ScanLine size={38} />

                        <h3>No Scan Activity Yet</h3>

                        <p>
                            Your QR verification records will appear here
                            after scanning tickets.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
}

export default StaffDashboard;
