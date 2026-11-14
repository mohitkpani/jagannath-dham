
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    RefreshCw,
    ClipboardList,
    CheckCircle,
    XCircle,
    CalendarDays,
    MapPin,
    Users,
    Clock,
    Filter,
    AlertCircle
} from "lucide-react";

import api from "../../services/api";
import "./StaffScanHistory.css";

const StaffScanHistory = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const getTodayDate = () => {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const [dateFilter, setDateFilter] = useState(getTodayDate());

    const fetchScanHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/staff/scan-history");

            setScans(response.data || []);
        } catch (err) {
            console.error("Scan history error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load scan history. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScanHistory();
    }, []);



    const filteredScans = useMemo(() => {
        return scans.filter((scan) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                !searchText ||
                scan.bookingReference?.toLowerCase().includes(searchText) ||
                scan.gateCode?.toLowerCase().includes(searchText) ||
                scan.category?.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "ALL" ||
                scan.scanResult === statusFilter;

            const matchesDate =
                !dateFilter ||
                scan.scannedAt?.startsWith(dateFilter);

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [scans, search, statusFilter, dateFilter]);

    const statistics = useMemo(() => ({
        total: filteredScans.length,
        successful: filteredScans.filter(
            (scan) => scan.scanResult === "SUCCESS"
        ).length,
        rejected: filteredScans.filter(
            (scan) => scan.scanResult !== "SUCCESS"
        ).length
    }), [filteredScans]);

    const formatDateTime = (dateTime) => {
        if (!dateTime) return "—";

        return new Date(dateTime).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusClass = (status) => {
        if (status === "SUCCESS") return "success";
        if (status === "ALREADY_USED") return "duplicate";

        return "rejected";
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setDateFilter("");
    };

    return (
        <div className="staff-history-page">

            {/* Page Header */}
            <div className="staff-history-header">
                <div>
                    <span className="staff-history-eyebrow">
                        STAFF MANAGEMENT
                    </span>

                    <h1>Scan History</h1>

                    <p>
                        View and track your QR ticket verification activity.
                    </p>
                </div>

                <button
                    className="staff-history-refresh"
                    onClick={fetchScanHistory}
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? "spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="staff-history-stats">

                <div className="staff-history-stat-card">
                    <div className="history-stat-icon total">
                        <ClipboardList size={21} />
                    </div>

                    <div>
                        <span>Total Scans</span>
                        <h2>{statistics.total}</h2>
                    </div>
                </div>

                <div className="staff-history-stat-card">
                    <div className="history-stat-icon approved">
                        <CheckCircle size={21} />
                    </div>

                    <div>
                        <span>Successful</span>
                        <h2>{statistics.successful}</h2>
                    </div>
                </div>

                <div className="staff-history-stat-card">
                    <div className="history-stat-icon rejected">
                        <XCircle size={21} />
                    </div>

                    <div>
                        <span>Rejected</span>
                        <h2>{statistics.rejected}</h2>
                    </div>
                </div>

            </div>

            {/* Filters */}
            <div className="staff-history-filter-card">

                <div className="staff-history-filter-heading">
                    <div>
                        <Filter size={18} />
                        <h3>Filter Scan Records</h3>
                    </div>

                    <button
                        className="history-clear-btn"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </div>

                <div className="staff-history-filters">

                    <div className="history-search-box">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search booking reference, gate..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="SUCCESS">Success</option>
                        <option value="NOT_YET_VALID">Not Yet Valid</option>
                        <option value="ALREADY_USED">Already Used</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="INVALID_TOKEN">Invalid Token</option>
                        <option value="REJECTED">Rejected</option>
                    </select>

                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />

                </div>
            </div>

            {/* Scan History Table */}
            <div className="staff-history-table-card">

                <div className="staff-history-table-heading">
                    <div>
                        <h3>All Scan Records</h3>
                        <p>
                            Showing {filteredScans.length} of {scans.length} records
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="staff-history-state">
                        <RefreshCw className="spin" size={25} />
                        <p>Loading scan history...</p>
                    </div>
                ) : error ? (
                    <div className="staff-history-state error">
                        <AlertCircle size={28} />
                        <p>{error}</p>

                        <button onClick={fetchScanHistory}>
                            Try Again
                        </button>
                    </div>
                ) : filteredScans.length === 0 ? (
                    <div className="staff-history-state">
                        <ClipboardList size={35} />
                        <h3>No scan records found</h3>
                        <p>Try changing your search or filters.</p>
                    </div>
                ) : (
                    <div className="staff-history-table-wrapper">
                        <table className="staff-history-table">

                            <thead>
                                <tr>
                                    <th>Booking Reference</th>
                                    <th>Category</th>
                                    <th>Darshan Date</th>
                                    <th>Visitors</th>
                                    <th>Gate</th>
                                    <th>Scan Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredScans.map((scan, index) => (
                                    <tr key={`${scan.bookingReference}-${scan.scannedAt}-${index}`}>

                                        <td>
                                            <strong className="history-booking-reference">
                                                {scan.bookingReference || "—"}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className="history-category">
                                                {scan.category || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="history-date">
                                                <CalendarDays size={14} />
                                                {scan.darshanDate || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="history-visitors">
                                                <Users size={14} />
                                                {scan.visitorCount ?? "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="history-gate">
                                                <MapPin size={14} />
                                                {scan.gateCode || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="history-time">
                                                <Clock size={14} />
                                                {formatDateTime(scan.scannedAt)}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`history-status ${getStatusClass(scan.scanResult)}`}
                                            >
                                                {scan.scanResult?.replaceAll("_", " ") || "UNKNOWN"}
                                            </span>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

            </div>

        </div>
    );
};

export default StaffScanHistory;
